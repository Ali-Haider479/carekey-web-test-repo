'use client'
import DataTable from '@/@core/components/mui/DataTable'
import ReactTable from '@/@core/components/mui/ReactTable'
import api from '@/utils/api'
import { Avatar, Card, Dialog, Typography, Grid2 as Grid } from '@mui/material'
import type { ClientTypes } from '@/types/apps/clientTypes'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import axios from 'axios'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Visibility } from '@mui/icons-material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const IncidentsTab = () => {
  const { id } = useParams()
  const [incidentsData, setIncidentsData] = useState<any>()
  const [dataWithProfileImg, setDataWithProfileImg] = useState<ClientTypes[]>([])
  const [incidentModalOpen, setIncidentModalOpen] = useState(false)
  const [incidentModalData, setIncidentModalData] = useState<any>(null)

  const handleModalClose = () => setIncidentModalOpen(false)
  const handleModalOpen = () => setIncidentModalOpen(true)

  const fetchClientIncidents = async () => {
    const clientIncidentsRes = await api.get(`/client/${id}/incident-report`)
    console.log('clientIncidentsRes', clientIncidentsRes)
    setIncidentsData(clientIncidentsRes.data)
  }

  useEffect(() => {
    fetchClientIncidents()
  }, [])

  const getProfileImage = async (key: string) => {
    try {
      const res = await api.get(`/caregivers/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      throw Error(`Error in fetching profile image url, ${err}`)
    }
  }

  const fetchProfileImages = async () => {
    if (incidentsData) {
      const dataWithPhotoUrls = await Promise.all(
        incidentsData?.map(async (item: any) => {
          const profileImageUrl =
            item?.caregiver?.user?.profileImageUrl !== null
              ? await getProfileImage(item?.caregiver?.user?.profileImageUrl)
              : item?.caregiver?.user?.profileImageUrl
          return {
            ...item,
            profileImageUrl: profileImageUrl
          }
        })
      )
      setDataWithProfileImg(dataWithPhotoUrls)
      setIncidentsData(dataWithPhotoUrls)
    }
  }

  useEffect(() => {
    if (incidentsData?.length > 0) {
      fetchProfileImages()
    }
  }, [incidentsData?.length > 0])

  const getInitials = (fullName: string): string => {
    const names = fullName?.trim().split(' ').filter(Boolean) // Split and remove extra spaces

    if (names?.length === 1) {
      return names[0][0].toUpperCase() // Only one name, return its initial
    }

    if (names?.length >= 2) {
      return `${names[0][0].toUpperCase()}${names[names.length - 1][0].toUpperCase()}` // First and last name initials
    }

    return '' // Return empty string if no valid names
  }

  const newCol = [
    {
      id: 'caregiver',
      label: 'CAREGIVER',
      minWidth: 170,
      render: (item: any) => (
        <div className='flex flex-row'>
          {item?.caregiver?.user?.profileImageUrl !== null ? (
            <div className='rounded-md flex items-center justify-center h-10 w-10 p-2'>
              <Avatar
                className='rounded-md h-11 w-11'
                alt={`${item?.caregiver?.firstName} ${item?.caregiver?.lastName}`}
                src={item?.profileImageUrl}
              />
            </div>
          ) : (
            <div className='bg-[#BDBDBD] rounded-md flex items-center justify-center h-10 w-10 p-2'>
              <Typography className='text-lg font-semibold text-white'>
                {getInitials(`${item?.caregiver?.firstName} ${item?.caregiver?.lastName}`)}
              </Typography>
            </div>
          )}
          <div className='ml-2'>
            <Typography className={`font-semibold text-sm`} color='primary'>
              {`${item?.caregiver?.firstName} ${item?.caregiver?.lastName}`}
            </Typography>
          </div>
        </div>
      )
    },
    {
      id: 'employeeInvolved',
      label: 'EMPLOYEE INVOLVED',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.employeeInvolved}</Typography>
    },
    {
      id: 'incidentType',
      label: 'INCIDENT TYPE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.incidentType}</Typography>
    },
    {
      id: 'incidentLocation',
      label: 'INCIDENT LOCATION',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.incidentLocation}</Typography>
    },
    {
      id: 'incidentDate',
      label: 'INCIDENT DATE',
      minWidth: 170,
      render: (item: any) => <Typography>{new Date(item?.incidentDate).toLocaleDateString()}</Typography>
    },
    {
      id: 'reportedToClientFamily',
      label: 'FAMILY INFORMED',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.reportedToClientFamily === true ? 'Yes' : 'No'}</Typography>
    },
    {
      id: 'patientRefuseMedicalAttention',
      label: 'MEDICAL REFUSED',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.patientRefuseMedicalAttention === true ? 'Yes' : 'No'}</Typography>
    },
    {
      id: 'reportedToPhysician',
      label: 'PHYSICIAN REPORTED',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.reportedToPhysician === true ? 'Yes' : 'No'}</Typography>
    },
    {
      id: 'reportedToStaff',
      label: 'STAFF REPORTED',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.reportedToStaff === true ? 'Yes' : 'No'}</Typography>
    },
    {
      id: 'incidentDetails',
      label: 'DETAILS',
      minWidth: 170,
      render: (item: any) => (
        <Visibility
          onClick={() => {
            setIncidentModalData(item)
            handleModalOpen()
          }}
        />
      )
    }
  ]
  console.log('incidentsData', incidentModalData)

  // const columns: GridColDef[] = [
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`CAREGIVER `}</Typography>
  //     ),
  //     field: 'caregiver',
  //     flex: 0.65,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
  //         <div className='h-8 w-8 p-[3px] pl-[6px] bg-[#BDBDBD] text-white border-2 rounded justify-center text-base'>
  //           {getInitials(`${params.row.caregiver?.firstName} ${params.row.caregiver?.lastName}`)}
  //         </div>
  //         <div style={{ display: 'flex', flexDirection: 'column' }}>
  //           <strong className='h-4'>{`${params.row.caregiver?.firstName} ${params.row.caregiver?.lastName}`}</strong>
  //           <span>{params.row?.caregiver?.emergencyEmailId}</span>
  //         </div>
  //       </div>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`EMPLOYEE INVOLVED`}</Typography>
  //     ),
  //     field: 'employeeInvolved',
  //     flex: 0.35
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`INCIDENT `}</Typography>
  //     ),
  //     field: 'incidentType',
  //     flex: 0.35
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`INCIDENT LOCATION`}</Typography>
  //     ),
  //     field: 'incidentLocation',
  //     flex: 0.5,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm'>
  //         {params.row.incidentLocation}
  //       </Typography>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`INCIDENT DATE`}</Typography>
  //     ),
  //     field: 'incidentDate',
  //     flex: 0.4,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>
  //         {new Date(params.row.incidentDate).toLocaleString()}
  //       </Typography>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`FAMILY INFORMED`}</Typography>
  //     ),
  //     field: 'reportedToClientFamily',
  //     flex: 0.35,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
  //         {params.row.reportedToClientFamily === true ? 'Yes' : 'No'}
  //       </Typography>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`MEDICAL REFUSED`}</Typography>
  //     ),
  //     field: 'patientRefuseMedicalAttention',
  //     flex: 0.35,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
  //         {params.row.patientRefuseMedicalAttention === true ? 'Yes' : 'No'}
  //       </Typography>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`PHYSICIAN REPORTED`}</Typography>
  //     ),
  //     field: 'reportedToPhysician',
  //     flex: 0.35,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
  //         {params.row.reportedToPhysician === true ? 'Yes' : 'No'}
  //       </Typography>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`STAFF REPORTED`}</Typography>
  //     ),
  //     field: 'reportedToStaff',
  //     flex: 0.35,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
  //         {params.row.reportedToStaff === true ? 'Yes' : 'No'}
  //       </Typography>
  //     )
  //   },
  //   {
  //     renderHeader: () => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`DESCRIPTION`}</Typography>
  //     ),
  //     field: 'incidentDescription',
  //     flex: 0.85,
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>
  //         {params.row.incidentDescription}
  //       </Typography>
  //     )
  //   }
  //   // {
  //   //   headerName: 'Action',
  //   //   flex: 0.75,
  //   //   renderCell: (params: GridRenderCellParams) => (
  //   //     <div style={{ display: 'flex', gap: '8px' }}>
  //   //       <button onClick={() => handleEdit(params.row)}>Edit</button>
  //   //       <button onClick={() => handleDelete(params.row)}>Delete</button>
  //   //     </div>
  //   //   ),
  // ]

  return (
    <>
      <Card>
        <Typography className='text-xl p-6'>Incident Reports</Typography>
        {!incidentsData?.length ? (
          <Typography className='flex justify-center pb-5'>No Data Available</Typography>
        ) : (
          <ReactTable
            columns={newCol}
            data={incidentsData}
            keyExtractor={row => row.id.toString()}
            enablePagination
            pageSize={25}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        )}
      </Card>
      <div>
        <Dialog
          open={incidentModalOpen}
          onClose={handleModalClose}
          closeAfterTransition={false}
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: '87vh', // Adjust as needed
              maxHeight: '85vh', // Limit modal height to 80% of viewport height
              overflow: 'visible',
              borderRadius: '8px',
              padding: '3px'
            }
          }}
        >
          <DialogCloseButton onClick={handleModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center pt-[10px] pb-[5px] w-full px-5'>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-6'>Incident Details</h2>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <Grid container spacing={4} sx={{ marginLeft: 5, marginRight: 0, marginBottom: 2 }}>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Caregiver Involved: </Typography>
                  <Typography className='text-md font-normal'>
                    {`${incidentModalData?.caregiver?.firstName} ${incidentModalData?.caregiver?.lastName}`}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Employee Involved: </Typography>
                  <Typography className='text-md font-normal'>{incidentModalData?.employeeInvolved}</Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Date: </Typography>
                  <Typography className='text-md font-normal'>
                    {incidentModalData?.incidentDate.split('T')[0]}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Location: </Typography>
                  <Typography className='text-md font-normal'>{incidentModalData?.incidentLocation}</Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Type: </Typography>
                  <Typography className='text-md font-normal'>{incidentModalData?.incidentType}</Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Patient Refused Medical Attention: </Typography>
                  <Typography className='text-md font-normal'>
                    {incidentModalData?.patientRefuseMedicalAttention === true ? 'Yes' : 'No'}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Reported to Client Family: </Typography>
                  <Typography className='text-md font-normal'>
                    {incidentModalData?.reportedToClientFaamily === true ? 'Yes' : 'No'}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Reported to Physician: </Typography>
                  <Typography className='text-md font-normal'>
                    {incidentModalData?.reportedToPhysician === true ? 'Yes' : 'No'}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Reported to Staff: </Typography>
                  <Typography className='text-md font-normal'>
                    {incidentModalData?.reportedToStaff === true ? 'Yes' : 'No'}
                  </Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 6, md: 6 }}>
                <div>
                  <Typography className='text-md font-semibold'>Reporter Signature: </Typography>
                  <Typography className='text-md font-normal'>{incidentModalData?.reporterSign}</Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 12 }} sx={{ marginTop: 0 }}>
                <div>
                  <Typography className='text-md font-semibold'>Incident Description: </Typography>
                  <Typography className='text-md font-normal'>{incidentModalData?.incidentDescription}</Typography>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 12 }}></Grid>
            </Grid>
          </div>
        </Dialog>
      </div>
    </>
  )
}

export default IncidentsTab
