'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { Add } from '@mui/icons-material'
import { Autocomplete, Button, Card, Grid2 as Grid, TextField, Dialog, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, set, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { GridRenderCellParams } from '@mui/x-data-grid'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ReactTable from '@/@core/components/mui/ReactTable'

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' }
]

interface ServiceAuthPayload {
  payer: string
  memberId: number
  serviceAuthNumber: number
  procedureCode: string
  modifierCode: string
  startDate: Date
  endDate: Date
  serviceRate: number
  units: number
  diagnosisCode: number
  umpiNumber: number
  reimbursementType: string
  taxonomy: number
  frequency: string
  clientId: number
}

const ServiceAuthorization = () => {
  const { id } = useParams()
  const [selectedOption, setSelectedOption] = useState(null)
  const [isModalShow, setIsModalShow] = useState(false)
  const [serviceAuthData, setServiceAuthData] = useState<any[]>([])
  const clientId = Number(id)

  const handleModalClose = () => {
    reset({
      payer: '',
      memberId: '',
      serviceAuthNumber: '',
      procedureAndModifier: '',
      startDate: undefined,
      endDate: undefined,
      serviceRate: '',
      units: ''
    })
    setIsModalShow(false)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search query:', event.target.value)
  }

  const handleChange = (event: any, newValue: any) => {
    setSelectedOption(newValue)
    console.log('Selected:', newValue)
  }

  const methods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = methods
  const onSubmit = async (data: any) => {
    console.log(data)
    try {
      const serviceAuthPayload: ServiceAuthPayload = {
        payer: data.payer,
        memberId: Number(data.memberId),
        serviceAuthNumber: Number(data.serviceAuthNumber),
        procedureCode: data.procedureCode,
        modifierCode: data.modifierCode,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        serviceRate: Number(data.serviceRate),
        units: Number(data.units),
        diagnosisCode: Number(data.diagnosisCode),
        umpiNumber: Number(data.umpiNumber),
        reimbursementType: data.reimbursementType,
        taxonomy: Number(data.taxonomy),
        frequency: data.frequency,
        clientId: clientId
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/client/service-auth`, serviceAuthPayload)
      console.log('Client Service Auth created successfully --> ', response)
      setServiceAuthData([...serviceAuthData, response.data])
      handleModalClose()
    } catch (error) {
      console.error('Error posting data: ', error)
    }
  }

  const fetchClientServiceAuthData = async () => {
    try {
      const fetchedData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/${clientId}/service-auth`)
      console.log('Fetched Service auth data --> ', fetchedData)
      setServiceAuthData(fetchedData?.data.length > 0 ? fetchedData?.data : [])
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchClientServiceAuthData()
  }, [])

  console.log(' Service Auth Data in state --> ', serviceAuthData)

  const data = [
    {
      id: 1,
      payor: 'MA',
      promod: 'H2014 (UC U3)',
      saNumber: '32069012220',
      startDate: '08/01/2023',
      endDate: '11/27/2023',
      unitRate: 'Hours',
      totalUnits: '320'
    },
    {
      id: 2,
      payor: 'MA',
      promod: 'H2014 (UC U3)',
      saNumber: '32069012220',
      startDate: '08/01/2023',
      endDate: '11/27/2023',
      unitRate: 'Hours',
      totalUnits: '320'
    }
  ]

  const newColumns = [
    {
      id: 'payer',
      label: 'PAYER',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.payer}</Typography>
    },
    {
      id: 'memberId',
      label: 'MEMBER ID',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.memberId}</Typography>
    },
    {
      id: 'serviceAuthNumber',
      label: 'SERVICE AUTH NO.',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceAuthNumber}</Typography>
    },
    {
      id: 'procedureAndModifier',
      label: 'PRO & MOD',
      minWidth: 170,
      render: (item: any) => (
        <Typography>
          {item?.procedureCode}, {item?.modifierCode}
        </Typography>
      )
    },
    {
      id: 'startDate',
      label: 'START DATE',
      minWidth: 170,
      render: (item: any) => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          })
        }

        const startDate = formatDate(item?.startDate)

        return <Typography>{startDate}</Typography>
      }
    },
    {
      id: 'endDate',
      label: 'END DATE',
      minWidth: 170,
      render: (item: any) => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          })
        }

        const endDate = formatDate(item?.endDate)

        return <Typography>{endDate}</Typography>
      }
    },
    {
      id: 'serviceRate',
      label: 'SERVICE RATE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceRate}</Typography>
    },
    {
      id: 'units',
      label: 'UNITS',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.units}</Typography>
    }
  ]

  // const columns = [
  //   {
  //     headerName: 'PAYER',
  //     field: 'payer',
  //     flex: 0.75
  //   },
  //   {
  //     headerName: 'MEMBER ID',
  //     field: 'memberId',
  //     flex: 0.75
  //   },
  //   {
  //     headerName: 'SERVICE AUTH',
  //     field: 'serviceAuthNumber',
  //     flex: 0.75
  //   },
  //   {
  //     headerName: 'PRO & MOD',
  //     field: 'procedureAndModifier',
  //     flex: 0.75,
  //     renderCell: (params: GridRenderCellParams) => {
  //       return (
  //         <div className='flex h-full items-center'>
  //           <Typography className='text-xs text-gray-800'>
  //             {params?.row?.procedureCode}, {params?.row?.modifierCode}
  //           </Typography>
  //         </div>
  //       )
  //     }
  //   },
  //   {
  //     headerName: 'START DATE',
  //     field: 'startDate',
  //     flex: 0.75,
  //     renderCell: (params: GridRenderCellParams) => {
  //       const formatDate = (dateString: string) => {
  //         const date = new Date(dateString)
  //         return date.toLocaleDateString('en-US', {
  //           month: '2-digit',
  //           day: '2-digit',
  //           year: 'numeric'
  //         })
  //       }

  //       const startDate = formatDate(params?.row?.startDate)
  //       const endDate = formatDate(params?.row?.endDate)
  //       return <span className=''>{startDate}</span>
  //     }
  //   },
  //   {
  //     headerName: 'END DATE',
  //     field: 'endDate',
  //     flex: 0.75,
  //     renderCell: (params: GridRenderCellParams) => {
  //       const formatDate = (dateString: string) => {
  //         const date = new Date(dateString)
  //         return date.toLocaleDateString('en-US', {
  //           month: '2-digit',
  //           day: '2-digit',
  //           year: 'numeric'
  //         })
  //       }

  //       const startDate = formatDate(params?.row?.startDate)
  //       const endDate = formatDate(params?.row?.endDate)
  //       return <span className=''>{endDate}</span>
  //     }
  //   },
  //   {
  //     headerName: 'SERVICE RATE',
  //     field: 'serviceRate',
  //     flex: 0.75
  //   },
  //   {
  //     headerName: 'UNITS',
  //     field: 'units',
  //     flex: 0.75
  //   }
  // ]
  return (
    <>
      <FormProvider {...methods}>
        <Card className=' w-full flex flex-col h-36 p-4 shadow-md rounded-lg'>
          <span className='ml-2 text-2xl font-bold '>Filters</span>
          <div className='flex justify-between'>
            <div className='w-[530px] mt-4'>
              <Autocomplete
                options={options}
                getOptionLabel={option => option.label}
                onInputChange={() => handleSearch}
                onChange={handleChange}
                renderInput={params => (
                  <TextField {...params} placeholder='Show All' variant='outlined' size='small' className='h-[56px]' />
                )}
                filterOptions={x => x} // Keep all options (you can adjust filtering logic)
              />
            </div>
            <div className='flex justify-end'>
              {/* <Button startIcon={<Add />} className='w-[160px] bg-[#4B0082] text-white mt-4 h-10'>
              ADD SA LIST
            </Button> */}
              <Button
                startIcon={<Add />}
                className='bg-[#4B0082] text-white mt-4 ml-4 h-10'
                onClick={() => setIsModalShow(true)}
              >
                ADD SERVICE AUTHORIZATION
              </Button>
            </div>
          </div>
        </Card>
        <Card className=' w-full  flex flex-col h-auto mt-5 shadow-md rounded-lg'>
          {/* <DataTable columns={columns} data={serviceAuthData} /> */}
          {!serviceAuthData?.length ? (
            <Typography className='p-5 flex items-center justify-center'>No Data Available</Typography>
          ) : (
            <ReactTable
              columns={newColumns}
              data={serviceAuthData}
              keyExtractor={item => item.id.toString()}
              enablePagination
              pageSize={5}
              stickyHeader
              maxHeight={600}
              containerStyle={{ borderRadius: 2 }}
            />
          )}
        </Card>
        <div>
          <Dialog
            open={isModalShow}
            onClose={handleModalClose}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          >
            <DialogCloseButton onClick={() => setIsModalShow(false)} disableRipple>
              <i className='bx-x' />
            </DialogCloseButton>
            <div className='flex items-center justify-center pt-[10px] pb-[5px] w-full px-5'>
              <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
                <div>
                  <Typography className='text-xl font-semibold mt-10 mb-6'>Add Service Authorization</Typography>
                </div>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Payer'}
                      placeHolder={'Payer'}
                      name={'payer'}
                      defaultValue={''}
                      type={'text'}
                      error={errors.payer}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Member Id'}
                      placeHolder={'Member Id'}
                      name={'memberId'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.memberId}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Service Auth Number'}
                      placeHolder={'Service Auth Number'}
                      name={'serviceAuthNumber'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.serviceAuthNumber}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Service Rate'}
                      placeHolder={'Service Rate'}
                      name={'serviceRate'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.serviceRate}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ControlledDatePicker
                      name={'startDate'}
                      control={control}
                      error={errors.startDate}
                      label={'Start Date'}
                      defaultValue={undefined}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ControlledDatePicker
                      name={'endDate'}
                      control={control}
                      error={errors.endDate}
                      label={'End Date'}
                      defaultValue={undefined}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Procedure Code'}
                      placeHolder={'Procedure Code'}
                      name={'procedureCode'}
                      defaultValue={''}
                      type={'text'}
                      error={errors.procedureCode}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Modifier Code'}
                      placeHolder={'Modifier Code'}
                      name={'modifierCode'}
                      defaultValue={''}
                      type={'text'}
                      error={errors.modifierCode}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Units'}
                      placeHolder={'Units'}
                      name={'units'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.units}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Diagnosis Code'}
                      placeHolder={'Diagnosis Code'}
                      name={'diagnosisCode'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.diagnosisCode}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'NPI/UMPI'}
                      placeHolder={'NPI/UMPI'}
                      name={'umpiNumber'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.umpiNumber}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomDropDown
                      name={'reimbursementType'}
                      control={control}
                      label={'Reimburrsement Type'}
                      error={errors.reimbursementType}
                      optionList={[
                        { key: 1, value: 'per unit', optionString: 'Per Unit' },
                        { key: 2, value: 'per diem', optionString: 'Per Diem' }
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label={'Taxonomy'}
                      placeHolder={'Taxonomy'}
                      name={'taxonomy'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.taxonomy}
                      control={control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomDropDown
                      name={'frequency'}
                      control={control}
                      label={'Frequency'}
                      error={errors.frequency}
                      optionList={[
                        { key: 1, value: 'daily', optionString: 'Daily' },
                        { key: 2, value: 'weekly', optionString: 'Weekly' },
                        { key: 3, value: 'monthly', optionString: 'Monthly' }
                      ]}
                    />
                  </Grid>
                </Grid>
                <div className='flex gap-4 justify-end mt-4 mb-4'>
                  <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                    CANCEL
                  </Button>
                  <Button type='submit' variant='contained' className='bg-[#4B0082]'>
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        </div>
      </FormProvider>
    </>
  )
}

export default ServiceAuthorization
