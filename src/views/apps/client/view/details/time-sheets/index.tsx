'use client'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import { Button, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import AcknowledgeSignature from './ClientSignatureSection'
import AcknowledgeSignatureCaregiver from './CaregiverSignatureSection'
import { useParams } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import './TimesheetPdf.css'
import './table.css'
import { jsPDF } from 'jspdf'
import api from '@/utils/api'

// Define interfaces for type safety
interface Signature {
  clientSignature?: string
  caregiverSignature?: string
  createdAt?: string
}

interface Caregiver {
  id: number
  firstName: string
  lastName: string
  caregiverUMPI?: string
  [key: string]: any
}

interface Client {
  id: number
  firstName: string
  lastName: string
  clientCode?: string
  pmiNumber?: string
  [key: string]: any
}

interface PayPeriodHistory {
  id: number
  startDate: string
  endDate: string | null
  numberOfWeeks: number
}

interface Activity {
  id: number
  title: string
}

interface CheckedActivity {
  id: number
  activities: Activity[]
}

interface ServiceEntry {
  id: number
  dateOfService: string
  manualEntry: boolean
  clockIn: string
  clockOut: string
  notes: string
  serviceName: string
  caregiver: Caregiver
  client: Client
  checkedActivity: CheckedActivity
  payPeriodHistory: PayPeriodHistory
  locApproved: any
  startLocation: any
  signature?: Signature
}

interface DetailItemProps {
  label: string
  value: string | number
}

interface Column {
  id: string
  label: string
  minWidth: number
  align?: 'center' | 'right' | 'left'
  render?: (params: any) => JSX.Element
}

interface SignatureState {
  image: string
  text: string
  date: string
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className='flex justify-between text-sm'>
    <Typography className='text-base font-bold'>{label}</Typography>
    <Typography className='text-base font-bold'>{value}</Typography>
  </div>
)

const TimeSheets = () => {
  const { id } = useParams()
  const [timelogData, setTimelogData] = useState<ServiceEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [clientSignature, setClientSignature] = useState<SignatureState>({ image: '', text: '', date: '' })
  const [caregiverSignature, setCaregiverSignature] = useState<SignatureState>({ image: '', text: '', date: '' })
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  // Helper function to get the latest signature
  const getLatestSignature = (data: ServiceEntry[], signatureType: 'clientSignature' | 'caregiverSignature') => {
    const latestEntry = data
      ?.filter(item => item?.signature?.[signatureType])
      .sort((a, b) => new Date(b.signature!.createdAt!).getTime() - new Date(a.signature!.createdAt!).getTime())[0]

    if (!latestEntry?.signature?.[signatureType]) {
      return { image: '', text: '', date: '' }
    }

    const signature = latestEntry.signature[signatureType]!
    const isBase64Image = signature.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(signature)
    const date = latestEntry.signature.createdAt || ''

    return {
      image: isBase64Image
        ? signature.startsWith('data:image')
          ? signature
          : `data:image/png;base64,${signature}`
        : '',
      text: isBase64Image ? '' : signature,
      date: date ? moment(date).format('MM/DD/YYYY') : 'N/A'
    }
  }

  const fetchTimeLog = async () => {
    try {
      const fetchedTimeLog = await api.get(`/time-log/client/${id}`)
      const data = fetchedTimeLog.data
      setTimelogData(data)
      setClientSignature(getLatestSignature(data, 'clientSignature'))
      setCaregiverSignature(getLatestSignature(data, 'caregiverSignature'))
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const columns: Column[] = [
    {
      id: 'payPeriod',
      label: 'DATE',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
        return (
          <Typography className='font-normal text-base my-3'>
            {startTime
              ? new Date(startTime).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : 'N/A'}
          </Typography>
        )
      }
    },
    {
      id: 'radio',
      label: 'RADIO',
      minWidth: 170,
      align: 'center',
      render: () => <Typography className='font-normal text-base my-3'>1:1</Typography>
    },
    {
      id: 'locationShared',
      label: 'SHARED LOCATION',
      minWidth: 170,
      align: 'center',
      render: (params: any) => (
        <Typography className='font-normal text-base my-3'>{params?.startLocation ? 'Yes' : 'No'}</Typography>
      )
    },
    {
      id: 'locApproved',
      label: 'LOC APPROVED',
      minWidth: 170,
      align: 'center',
      render: (params: any) => (
        <>
          {params.locApproved ? (
            <CheckOutlined className='text-[#71DD37]' />
          ) : (
            <CloseOutlined className='text-[#FF3E1D]' />
          )}
        </>
      )
    },
    {
      id: 'stayFacility',
      label: 'FACILITY STAY',
      minWidth: 170,
      align: 'center',
      render: () => <Typography className='font-normal text-base my-3'>NO</Typography>
    },
    {
      id: 'timeIn',
      label: 'TIME IN',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
        return (
          <Typography className='font-normal text-base my-3'>
            {startTime
              ? new Date(startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })
              : 'N/A'}
          </Typography>
        )
      }
    },
    {
      id: 'timeOut',
      label: 'TIME-OUT',
      minWidth: 170,
      render: (params: any) => {
        const endTime = params?.clockOut
        return (
          <Typography className='font-normal text-base my-3'>
            {endTime
              ? new Date(endTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })
              : 'N/A'}
          </Typography>
        )
      }
    },
    {
      id: 'activities',
      label: 'ACTIVITIES',
      minWidth: 170,
      render: (params: any) =>
        params.checkedActivity ? (
          <Typography className='font-normal text-base my-3'>
            {params?.checkedActivity?.activities.map((activity: any) => activity.title).join(', ')}
          </Typography>
        ) : (
          <CloseOutlined className='text-[#FF3E1D]' />
        )
    }
  ]

  const generateWeekDates = (startDate: string, numberOfWeeks: number): moment.Moment[] => {
    if (!startDate) return []
    const dates: moment.Moment[] = []
    const start = moment(startDate).startOf('day')
    const end = moment(start).add(numberOfWeeks * 7 - 1, 'days')
    let current = moment(start)
    while (current.isSameOrBefore(end)) {
      dates.push(moment(current))
      current.add(1, 'days')
    }
    return dates
  }

  const calculateDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 0
    const start = moment.parseZone(clockIn)
    const end = moment.parseZone(clockOut)
    const duration = end.diff(start, 'minutes')
    return Math.max(0, duration)
  }

  const processDurationsByDate = (serviceData: ServiceEntry[], weekDates: moment.Moment[]) => {
    const durationsByDate: { [key: string]: number } = {}
    weekDates.forEach(date => {
      durationsByDate[date.format('YYYY-MM-DD')] = 0
    })
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      const duration = calculateDuration(entry.clockIn, entry.clockOut)
      durationsByDate[serviceDate] = (durationsByDate[serviceDate] || 0) + duration
    })
    return durationsByDate
  }

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes < 0) return '0:00'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const weekDates = generateWeekDates(
    timelogData[0]?.payPeriodHistory?.startDate,
    timelogData[0]?.payPeriodHistory?.numberOfWeeks
  )

  const durationsByDate = processDurationsByDate(timelogData, weekDates)

  const tableData = [
    {
      id: '1',
      ...weekDates.reduce((acc: { [key: string]: string }, date) => {
        const dateStr = date.format('YYYY-MM-DD')
        const duration = durationsByDate[dateStr] || 0
        acc[dateStr] = formatDuration(duration)
        return acc
      }, {})
    }
  ]

  const tableColumns = weekDates.map(date => {
    const dayName = date.format('ddd').toUpperCase()
    const dateStr = date.format('D MMMM')
    const label = `${dayName}\n${dateStr}`
    const columnId = date.format('YYYY-MM-DD')
    return {
      id: columnId,
      minWidth: 170,
      label,
      render: (params: any) => <Typography>{params[columnId] || '0:00'}</Typography>
    }
  })

  const exportToPDF = async () => {
    setIsLoading(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.width
      const margin = 10
      const contentWidth = pageWidth - margin * 2

      doc.setFont('helvetica', 'normal')

      // Header Section
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      const titleText = authUser.tenant.companyName
      const titleWidth = doc.getStringUnitWidth(titleText) * 16 * 0.352778
      doc.text(titleText, (pageWidth - titleWidth) / 2, 15)

      const subTitleText = 'Caregiver Time and Activity Documentation'
      const subTitleWidth = doc.getStringUnitWidth(subTitleText) * 16 * 0.352778
      doc.text(subTitleText, (pageWidth - subTitleWidth) / 2, 22)

      doc.setFontSize(10)
      const addressText = `Address: ${authUser.tenant.address}  Contact: ${authUser.tenant.contactNumber}`
      const addressWidth = doc.getStringUnitWidth(addressText) * 10 * 0.352778
      doc.text(addressText, (pageWidth - addressWidth) / 2, 29)

      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.line(margin, 32, pageWidth - margin, 32)

      // Checkout Notes Section
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Checkout Notes', margin, 40)
      doc.setFont('helvetica', 'normal')

      let yPosition = 50
      const sortedTimelogDataWithNotes = [...timelogData]
        .filter(item => item.notes !== '')
        .sort((a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime())

      sortedTimelogDataWithNotes.forEach(entry => {
        const dateStr = moment(entry.dateOfService).format('MM/DD/YYYY')
        const timeIn = moment(entry.clockIn).format('hh:mm A')
        const timeOut = moment(entry.clockOut).format('hh:mm A')
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`${dateStr} ${timeIn} - ${timeOut}`, margin, yPosition)
        doc.setFont('helvetica', 'normal')

        const notesText = `- ${entry.notes}`
        const splitNotes = doc.splitTextToSize(notesText, contentWidth)
        doc.setFontSize(10)
        doc.text(splitNotes, margin, yPosition + 5)

        const noteBlockHeight = 5 + splitNotes.length * 5
        yPosition += noteBlockHeight + 5

        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
      })

      // New Page for Table
      doc.addPage()
      yPosition = 15

      // Client and Caregiver Info Section
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `RECIPIENT NAME - ${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''} (${timelogData[0]?.client?.clientCode || ''})`,
        margin,
        yPosition
      )
      const icsText = `${timelogData[0]?.serviceName}`
      const icsWidth = doc.getStringUnitWidth(icsText) * 11 * 0.352778
      doc.text(icsText, pageWidth - margin - icsWidth, yPosition)

      yPosition += 5
      doc.text(
        `CAREGIVER NAME - ${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`,
        margin,
        yPosition
      )
      const startDate = moment(timelogData[0]?.payPeriodHistory.startDate).format('MMMM DD, YYYY')
      const endDate = moment(weekDates[weekDates.length - 1]).format('MMMM DD, YYYY')
      const weekDurationText = `Week Duration: ${startDate} To ${endDate}`
      const weekDurationWidth = doc.getStringUnitWidth(weekDurationText) * 11 * 0.352778
      doc.text(weekDurationText, pageWidth - margin - weekDurationWidth, yPosition)

      yPosition += 5
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)

      // First Table Section (Service Entries)
      yPosition += 10
      const tableHeaders = [
        { label: 'DATE', width: 20 },
        { label: 'RADIO', width: 16 },
        { label: 'LOCATION', width: 24 },
        { label: 'LOC APPROVED', width: 32 },
        { label: 'FACILITY STAY', width: 30 },
        { label: 'TIME IN', width: 23 },
        { label: 'TIME OUT', width: 23 },
        { label: 'ACTIVITIES', width: 23 }
      ]

      const drawCell = (
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        isHeader = false,
        align = 'center'
      ) => {
        doc.rect(x, y, width, height)
        doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
        doc.setFontSize(isHeader ? 10 : 9)
        let textX = x
        const textY = y + height / 2 + 1
        if (align === 'center') {
          const textWidth = doc.getStringUnitWidth(text) * (isHeader ? 10 : 9) * 0.352778
          textX = x + (width - textWidth) / 2
        } else if (align === 'left') {
          textX = x + 2
        } else if (align === 'right') {
          const textWidth = doc.getStringUnitWidth(text) * (isHeader ? 10 : 9) * 0.352778
          textX = x + width - textWidth - 2
        }
        doc.text(text, textX, textY)
      }

      let startX = margin
      const tableHeight = 10
      const rowHeight = 8
      let currentX = startX

      tableHeaders.forEach(header => {
        drawCell(header.label, currentX, yPosition, header.width, tableHeight, true)
        currentX += header.width
      })

      yPosition += tableHeight

      const sortedTimelogData = [...timelogData].sort(
        (a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
      )

      sortedTimelogData.forEach(entry => {
        currentX = startX
        const dateStr = moment(entry.dateOfService).format('DD/MM/YYYY')
        const checkedActivities =
          entry?.checkedActivity?.activities?.map((activity: any) => activity.title)?.join(', ') ?? 'X'
        const cellData = [
          dateStr,
          '1:1',
          entry.startLocation ? 'Yes' : 'No',
          entry.locApproved ? '✓' : 'X',
          'NO',
          moment(entry.clockIn).format('hh:mm:ss A'),
          moment(entry.clockOut).format('hh:mm:ss A'),
          checkedActivities
        ]

        cellData.forEach((data, index) => {
          doc.setTextColor(data === 'X' ? 'red' : 'black')
          drawCell(data, currentX, yPosition, tableHeaders[index].width, rowHeight)
          currentX += tableHeaders[index].width
        })

        doc.setTextColor('black')
        yPosition += rowHeight
      })

      yPosition += 10

      // Total Hours Summary
      const totalMinutes = Object.values(durationsByDate).reduce((sum, duration) => sum + (duration || 0), 0)
      const totalHours = Math.floor(totalMinutes / 60)
      const totalMins = Math.round(totalMinutes % 60)

      doc.setFont('helvetica', 'bold')
      doc.text(`Week One - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition)
      doc.text(`Total Hours - ${totalHours} Hrs ${totalMins} Min`, 100, yPosition)
      doc.text(`Ratio(1:1) - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition + 5)

      yPosition += 10
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.2)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Client Acknowledgement Section
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Acknowledge and Required Signature for Client', margin, yPosition)
      doc.setFont('helvetica', 'normal')

      const clientAcknowledgement =
        'After the Caregiver has documented his/her time and activity, the recipient must draw a line through any dates/times he/she did not receive service from the Caregiver. Review the completed time sheet for accuracy before signing. It is a crime to provide false information on Caregiver billings for Medical Assistance payment. By signing below you swear and verify the time and services entered above are accurate and that the services were performed by the Caregiver listed below as specified in the PCA Care Plan.'
      const clientAckLines = doc.splitTextToSize(clientAcknowledgement, contentWidth)
      doc.text(clientAckLines, margin, yPosition + 5)
      yPosition += 15 + clientAckLines.length * 3

      doc.setFont('helvetica', 'bold')
      doc.text('RECIPIENT NAME', margin, yPosition)
      doc.text('PMI NUMBER', 60, yPosition)
      doc.text('RECIPIENT SIGNATURE', 100, yPosition)
      doc.text('DATE', 160, yPosition)

      doc.setFont('helvetica', 'normal')
      doc.text(
        `${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''}`,
        margin,
        yPosition + 5
      )
      doc.text(`${timelogData[0]?.client?.pmiNumber || ''}`, 60, yPosition + 5)
      if (clientSignature.image) {
        doc.addImage(clientSignature.image, 'JPEG', 100, yPosition - 2, 30, 20)
      } else {
        doc.text(clientSignature.text || 'No signature available', 100, yPosition + 5)
      }
      doc.text(clientSignature.date, 160, yPosition + 5)

      yPosition += 15

      // Caregiver Acknowledgement Section
      doc.setFont('helvetica', 'bold')
      doc.text('Acknowledgement and Required Signatures for Caregiver', margin, yPosition)
      doc.setFont('helvetica', 'normal')

      const caregiverAcknowledgement =
        'I certify and swear under penalty of law that I have accurately reported on this time sheet the hours I actually worked, the service I provided, and the dates and times worked. I understand that misreporting my hours is fraud for which I could face criminal prosecution and civil proceedings.'
      const caregiverAckLines = doc.splitTextToSize(caregiverAcknowledgement, contentWidth)
      doc.text(caregiverAckLines, margin, yPosition + 5)
      yPosition += 15 + caregiverAckLines.length * 3

      doc.setFont('helvetica', 'bold')
      doc.text('CAREGIVER NAME', margin, yPosition)
      doc.text('CAREGIVER NPI/UMPI', 60, yPosition)
      doc.text('CAREGIVER SIGNATURE', 100, yPosition)
      doc.text('DATE', 160, yPosition)

      doc.setFont('helvetica', 'normal')
      doc.text(
        `${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`,
        margin,
        yPosition + 5
      )
      doc.text(`${timelogData[0]?.caregiver?.caregiverUMPI || ''}`, 60, yPosition + 5)
      if (caregiverSignature.image) {
        doc.addImage(caregiverSignature.image, 'JPEG', 100, yPosition - 2, 30, 20)
      } else {
        doc.text(caregiverSignature.text || 'No signature available', 100, yPosition + 5)
      }
      doc.text(caregiverSignature.date, 160, yPosition + 5)

      doc.save(
        `Timesheet_${timelogData[0]?.client?.firstName || 'Client'}_${timelogData[0]?.caregiver?.firstName || 'Caregiver'}.pdf`
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div id='timesheet-content'>
        <Card className='h-fit w-[99%] m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2'>
          <div className='grid grid-cols-2 m-4 gap-3'>
            <DetailItem
              label='Recipient Name:'
              value={`${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''}`}
            />
            <DetailItem
              label='Week Duration:'
              value={`${weekDates[0]?.format('DD MMMM YYYY') || ''} - ${weekDates[weekDates.length - 1]?.format('DD MMMM YYYY') || ''}`}
            />
            <DetailItem
              label='Caregiver Name:'
              value={`${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`}
            />
          </div>
          <ReactTable
            columns={columns}
            data={timelogData}
            keyExtractor={user => user.id.toString()}
            enableRowSelect={false}
            enablePagination={false}
            pageSize={5}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </Card>
        <Card className='h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3 border-solid border-2'>
          <h2 className='text-xl pt-4 ml-4 mb-4'>Total Hours</h2>
          <ReactTable
            columns={tableColumns}
            data={tableData}
            keyExtractor={row => row.id.toString()}
            enableRowSelect={false}
            enablePagination={false}
            pageSize={5}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </Card>
        <AcknowledgeSignature data={timelogData} />
        <AcknowledgeSignatureCaregiver data={timelogData} />
      </div>
      <CardContent className='mt-4 mb-4 flex justify-between'>
        <div className='w-1/2 flex justify-start space-x-6'>
          <Button className='mr-6' variant='contained' onClick={() => {}}>
            Accept Timesheets
          </Button>
          <Button className='bg-red-600' variant='contained' onClick={() => {}}>
            Reject Timesheets
          </Button>
        </div>
        <div className='w-1/2 flex justify-end space-x-6'>
          <Button className='bg-[#E89C00] mr-6' variant='contained' onClick={() => {}}>
            Export to CSV
          </Button>
          <Button
            className='bg-[#67C932]'
            variant='contained'
            onClick={exportToPDF}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
          >
            Export PDF
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default TimeSheets
