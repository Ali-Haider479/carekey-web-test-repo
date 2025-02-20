'use client'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import DataTable from '@/@core/components/mui/DataTable'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { MoreVert } from '@mui/icons-material'
import { Button, Card, Dialog, Grid2 as Grid, IconButton, TextField, Typography } from '@mui/material'
import { dark } from '@mui/material/styles/createPalette'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { set, useForm } from 'react-hook-form'

type UserManagement = {
  id: number
  adminName: string
  emailAddress: string
  role: string
  privileges: string[]
  status: string
}

const UserManagementList = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isModalShow, setIsModalShow] = useState(false)

  const onSubmit = (data: any) => {
    console.log(data)
    handleModalClose()
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<any>()

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const sampleData: UserManagement[] = [
    {
      id: 1,
      adminName: 'Cody Fisher',
      emailAddress: 'john@gmail.com',
      role: 'Super Admin',
      privileges: ['Billing', 'Reports', '+4'],
      status: 'Active'
    },
    {
      id: 2,
      adminName: 'Robert Fox',
      emailAddress: 'john@gmail.com',
      role: 'Billing Admin',
      privileges: ['Reports'],
      status: 'Active'
    },
    {
      id: 3,
      adminName: 'Esther Howard',
      emailAddress: 'john@gmail.com',
      role: 'Super Admin',
      privileges: ['Billing', 'Reports', '+1'],
      status: 'Active'
    },
    {
      id: 4,
      adminName: 'Jenny Wilson',
      emailAddress: 'john@gmail.com',
      role: 'Super Admin',
      privileges: ['Reports'],
      status: 'Inactive'
    },
    {
      id: 5,
      adminName: 'Theressa Webb',
      emailAddress: 'john@gmail.com',
      role: 'Billing Admin',
      privileges: ['Billing', 'Reports', '+2'],
      status: 'Inactive'
    },
    {
      id: 6,
      adminName: 'Brooklin Simmons',
      emailAddress: 'john@gmail.com',
      role: 'Billing Admin',
      privileges: ['Billing', 'Reports', '+4'],
      status: 'Active'
    }
  ]

  const newColumns: GridColDef[] = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      field: 'adminName',
      headerName: 'ADMIN NAME',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Typography
            className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'} text-sm font-normal cursor-pointer mt-3`}
          >
            {params.row.adminName}
          </Typography>
        )
      }
    },
    {
      field: 'emailAddress',
      headerName: 'EMAIL ADDRESS',
      flex: 0.5
    },
    {
      field: 'role',
      headerName: 'ROLE',
      flex: 0.5
    },
    {
      field: 'privileges',
      headerName: 'PRIVILEGES',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Grid key={`privileges-${params.row.id}`} className='flex flex-row gap-2 mt-2'>
            {params.row.privileges.map((privilege: any, index: any) => (
              <div
                key={`privilege-${index}-${privilege}`}
                className='px-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'
              >
                <Typography className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}>{privilege}</Typography>
              </div>
            ))}
          </Grid>
        )
      }
    },
    {
      field: 'status',
      headerName: 'STATUS',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Typography
            className={`${params.row.status === 'Active' ? 'bg-[#72E1281F] text-[#67C932]' : 'bg-[#FF4D491F] text-[#E8381A]'} rounded-2xl px-2 mt-3 w-[fit-content]`}
          >
            {params.row.status}
          </Typography>
        )
      }
    },
    {
      field: 'action',
      headerName: 'ACTION',
      flex: 0.2,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <IconButton>
            <MoreVert />
          </IconButton>
        )
      }
    }
  ]

  return (
    <div>
      <Card>
        <Grid container spacing={2} alignItems='center' sx={{ mb: 2, p: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder='Search name, email address'
              variant='outlined'
              size='small'
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <span style={{ color: '#757575', marginLeft: '8px', marginTop: 8 }}>
                    <i className='bx-search' />
                  </span>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={() => setIsModalShow(true)}
              variant='contained'
              sx={{ backgroundColor: '#4B0082', color: '#fff', fontWeight: 'bold' }}
            >
              ADD ADMIN
            </Button>
          </Grid>
        </Grid>
        <div style={{ overflowX: 'auto' }}>
          <DataTable columns={newColumns} data={sampleData} />
        </div>
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
                <h2 className='text-xl font-semibold mt-10 mb-6'>Add Admin</h2>
              </div>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <TextField
                    fullWidth
                    label='Admin Name'
                    variant='outlined'
                    size='small'
                    placeholder='Enter Admin Name'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    variant='outlined'
                    size='small'
                    placeholder='Enter Email Address'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomDropDown
                    label='Role'
                    optionList={[
                      { key: '1', value: 'Super Admin', optionString: 'Super Admin' },
                      { key: '2', value: 'Billing Admin', optionString: 'Billing Admin' }
                    ]}
                    name='role'
                    control={control}
                    error={errors.role}
                    defaultValue=''
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomDropDown
                    label='Previleges'
                    optionList={[
                      { key: '1', value: 'Billing', optionString: 'Billing' },
                      { key: '2', value: 'Reports', optionString: 'Reports' }
                    ]}
                    name='previleges'
                    control={control}
                    error={errors.previleges}
                    defaultValue=''
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
    </div>
  )
}

export default UserManagementList
