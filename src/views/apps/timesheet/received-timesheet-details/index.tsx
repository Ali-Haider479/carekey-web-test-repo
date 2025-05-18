'use client'

import Grid from '@mui/material/Grid2'
import ReceivedTimesheetTable from './ReceivedTimesheetTable'
import ReceivedTimesheetFilters from './ReceivedTimesheetFilters'
import { useState, useEffect } from 'react'
import api from '@/utils/api'
import { transformTimesheetDataTwo } from '@/utils/transform'
import CustomAlert from '@/@core/components/mui/Alter'
import { calculateHoursWorked } from '@/utils/helperFunctions'

const ReceivedTimesheetDetails = () => {
  const [timeLogData, setTimeLogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [payPeriod, setPayPeriod] = useState<[] | any>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([]) // Track selected rows
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await Promise.all([api.get(`/time-log`), api.get(`/pay-period/tenant/${authUser?.tenant?.id}`)])
      setTimeLogData(
        response[0]?.data?.length > 0
          ? transformTimesheetDataTwo(response[0]?.data.filter((item: any) => item.clockOut != null))
          : []
      )
      setPayPeriod(response[1].data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  const handleFilteredData = (filteredData: any) => {
    if (filteredData.length === 0) {
      setAlertOpen(true)
      setAlertProps({
        message: 'User not found in the data.',
        severity: 'error'
      })
      return
    }
    setTimeLogData(transformTimesheetDataTwo(filteredData))
  }

  // Handler to update approval status for multiple rows
  const handleBulkStatusUpdate = async (status: 'Approved' | 'Rejected') => {
    if (selectedRows.length === 0) {
      setAlertOpen(true)
      setAlertProps({
        message: 'Please select at least one timesheet to update.',
        severity: 'warning'
      })
      return
    }

    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    const userId = authUser?.id

    const findUser = (data: any[], targetId: string | number): { user: any; isDummyRow: boolean } => {
      let currentUser = data.find((item: any) => item.id === targetId)
      if (currentUser) {
        return { user: currentUser, isDummyRow: !!currentUser.subRows }
      }

      for (const item of data) {
        if (item.subRows && Array.isArray(item.subRows)) {
          currentUser = item.subRows.find((subItem: any) => subItem.id === targetId)
          if (currentUser) {
            return { user: currentUser, isDummyRow: false }
          }
        }
      }
      return { user: null, isDummyRow: false }
    }

    try {
      let updatePromises: Promise<any>[] = []
      let rowsToUpdate: any[] = []

      for (const row of selectedRows) {
        const { user: currentUser, isDummyRow } = findUser(timeLogData, row.id)

        if (!currentUser) {
          setAlertOpen(true)
          setAlertProps({
            message: `Timesheet with ID ${row.id} not found in the data.`,
            severity: 'error'
          })
          return
        }

        if (currentUser?.signature?.signatureStatus === 'Pending' || currentUser?.client?.serviceAuth?.length === 0) {
          setAlertOpen(true)
          setAlertProps({
            message:
              currentUser?.signature?.signatureStatus === 'Pending'
                ? 'Please approve the signature before editing.'
                : 'Please complete the service authorization before editing.',
            severity: 'error'
          })
          return
        }

        if (
          currentUser?.client?.serviceAuth?.length > 0 &&
          new Date(currentUser.client.serviceAuth[0].endDate) < new Date()
        ) {
          setAlertOpen(true)
          setAlertProps({
            message: 'The service authorization has expired. Please update the end date before editing.',
            severity: 'error'
          })
          return
        }

        if (currentUser?.billing && Object.keys(currentUser.billing).length > 0) {
          if (currentUser?.billing?.claimStatus?.includes('Approved')) {
            setAlertOpen(true)
            if (currentUser?.subRows?.length > 0 && currentUser?.billing?.dummyRow) {
              setAlertProps({
                message: 'Please update timelogs manually.',
                severity: 'error'
              })
            } else {
              setAlertProps({
                message: 'Cannot update timelog because billing has already been approved.',
                severity: 'error'
              })
            }
            return
          }
        }

        const basePayload = {
          tsApprovalStatus: status,
          userId
        }

        if (isDummyRow) {
          const selectedSubRowIds = selectedRows
            .filter(
              (selectedRow: any) =>
                selectedRow.id !== currentUser.id &&
                currentUser.subRows.some((subRow: any) => subRow.id === selectedRow.id)
            )
            .map((selectedRow: any) => selectedRow.id)

          if (selectedSubRowIds.length === 0) {
            setAlertOpen(true)
            setAlertProps({
              message: 'Please select at least one sub-row to update.',
              severity: 'warning'
            })
            return
          }

          rowsToUpdate = currentUser.subRows.filter((subRow: any) => selectedSubRowIds.includes(subRow.id))

          const subRowUpdates = rowsToUpdate.map((subRow: any) => ({
            id: subRow.id,
            ...basePayload
          }))

          updatePromises = updatePromises.concat(
            subRowUpdates.map((payload: any) => api.patch(`/time-log/update-ts-approval`, payload))
          )
        } else {
          rowsToUpdate.push(currentUser)
          updatePromises.push(
            api.patch(`/time-log/update-ts-approval`, {
              id: currentUser.id,
              ...basePayload
            })
          )
        }
      }

      const updateResponses = await Promise.all(updatePromises)

      // Handle billing creation or removal based on tsApprovalStatus
      if (status === 'Approved') {
        const billingPromises = []

        for (const row of rowsToUpdate) {
          const hrs = calculateHoursWorked(row.clockIn, row.clockOut)
          const billedAmount = parseFloat(hrs) * row.client.serviceAuth[0].serviceRate

          billingPromises.push(
            api.post(`/time-log/billing`, {
              timeLogId: row.id,
              claimDate: null,
              billedAmount: Number(billedAmount.toFixed(2)),
              receivedAmount: 0,
              claimStatus: 'Pending',
              billedStatus: 'Pending'
            })
          )
        }

        const billingResponses = await Promise.all(billingPromises)
      } else {
        const billingDeletePromises = []

        for (const row of rowsToUpdate) {
          if (row?.billing?.id) {
            billingDeletePromises.push(api.delete(`/time-log/remove-billing/${row.billing.id}`))
          }
        }

        if (billingDeletePromises.length > 0) {
          const billingDeleteResponses = await Promise.all(billingDeletePromises)
          console.log('Billing delete responses:', billingDeleteResponses)
        } else {
          console.log('No billing to delete')
        }
      }

      await fetchInitialData()
      setSelectedRows([]) // Clear selection after update
      setAlertOpen(true)
      setAlertProps({
        message: `Timesheets successfully ${status.toLowerCase()}.`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Error updating timesheets:', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to update timesheets. Please try again.',
        severity: 'error'
      })
    }
  }

  return (
    <Grid>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} style={{ padding: 0 }} />
      <Grid size={{ xs: 12 }}>
        <ReceivedTimesheetFilters
          onFilterApplied={handleFilteredData}
          selectedRows={selectedRows}
          onBulkStatusUpdate={handleBulkStatusUpdate}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReceivedTimesheetTable
          data={timeLogData}
          isLoading={isLoading}
          fetchInitialData={fetchInitialData}
          setSelectedRows={setSelectedRows}
          selectedRows={selectedRows}
          payPeriod={payPeriod}
        />
      </Grid>
    </Grid>
  )
}

export default ReceivedTimesheetDetails
