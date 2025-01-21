'use client'
// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'

// Component Imports
import { useState } from 'react'
import { UsersType } from '@/types/apps/userTypes'
import { TenantType } from '@/types/apps/tenantTypes'
import CustomTextField from '@core/components/mui/TextField'
import { MenuItem, TextField } from '@mui/material'
import Button from '@mui/material/Button'

type Props = {
    open: boolean
    handleClose: () => void
    userData?: TenantType[]
    setData: (data: TenantType[]) => void
}

type FormValidateType = {
    firstName: string
    lastName: string
    emailAddress: string
    password: string
    companyName: string
    billingEmail: string
    contactNumber: string
    country: string
    vatNumber: string
    address: string
    npiUmpiNumber: string
    taxonomyNumber: string
    einNumber: string
    faxNumber: string
}

type FormNonValidateType = {
    subscriptionStartDate: Date
    subscriptionRenewalDate: Date
    status: string
}

interface PickerProps {
    label?: string
    error?: boolean
    className?: string
    id?: string
    registername?: string
}

// Vars
const initialData = {
    subscriptionStartDate: new Date(),
    subscriptionRenewalDate: new Date(),
    status: ''
}

const CreateTenant = (props: Props) => {
    const [formData, setFormData] = useState<FormNonValidateType>(initialData)
    const { userData, setData } = props

    // Hooks
    const {
        control,
        reset: resetForm,
        handleSubmit,
        formState: { errors }
    } = useForm<FormValidateType>({
        defaultValues: {
            firstName: '',
            lastName: '',
            emailAddress: '',
            password: '',
            companyName: '',
            billingEmail: '',
            contactNumber: '',
            address: '',
            npiUmpiNumber: '',
            taxonomyNumber: '',
            einNumber: '',
            faxNumber: ''
        }
    })

    const onSubmit = async (data: FormValidateType) => {
        // try {
        //     const newTenant: TenantType = {
        //         // id: (userData?.length && userData?.length + 1) || 1,
        //         // avatar: `/images/avatars/${Math.floor(Math.random() * 20) + 1}.png`,
        //         companyName: data.companyName,
        //         billingEmail: data.billingEmail,
        //         contactNumber: data.contactNumber,
        //         address: data.address,
        //         faxNumber: data.faxNumber,
        //         einNumber: data.einNumber,
        //         taxonomyNumber: data.taxonomyNumber,
        //         npiUmpiNumber: data.npiUmpiNumber,
        //         status: 'ACTIVE'
        //         // subscriptionStartDate: formData.subscriptionStartDate,
        //         // subscriptionRenewalDate: formData.subscriptionRenewalDate
        //         // active_subscription: 2, // Dummy values
        //         // billingDetail: 1 // Dummy values
        //     }
        //     const tenantResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tenant`, newTenant)
        //     console.log('TENANT CREATE RESPONSE', tenantResponse.data)

        //     const newUser = {
        //         emailAddress: data.emailAddress,
        //         password: data.password,
        //         userName: `${data.firstName} ${data.lastName}`,
        //         tenantId: tenantResponse.data.id,
        //         joinDate: new Date(),
        //         scheduleHours: 0,
        //         accountStatus: 'Inactive'
        //     }

        //     const userResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user`, newUser)
        //     console.log('USER CREATE RESPONSE', userResponse.data)

        //     setData([...(userData ?? []), newTenant])
        //     setFormData(initialData)
        //     resetForm({
        //         companyName: '',
        //         billingEmail: '',
        //         contactNumber: '',
        //         address: '',
        //         vatNumber: '',
        //         faxNumber: '',
        //         einNumber: '',
        //         taxonomyNumber: '',
        //         npiUmpiNumber: ''
        //         // status: '',
        //         // subscriptionStartDate: new Date(),
        //         // subscriptionRenewalDate: new Date()
        //     })
        // } catch (error: any) {
        //     console.log('Error', error.message)
        // }
    }

    return (
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6'>
            <Card>
                <CardHeader title='Tenant/Accounts' titleTypographyProps={{ sx: { fontSize: "24px" } }} />
                <CardContent>
                    <div className='pb-24 p-0'>
                        <Grid container spacing={5}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='firstName'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            label="Admin First Name"
                                            placeholder='john'
                                            variant='outlined'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Admin First Name'
                                        //     placeholder='John'
                                        //     {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='lastName'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            label="Admin Last Name"
                                            placeholder='Doe'
                                            variant='outlined'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Admin Last Name'
                                        //     placeholder='Doe'
                                        //     {...(errors.lastName && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='emailAddress'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            type='email'
                                            label='Admin Email Address'
                                            placeholder='admin@example.com'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     type='email'
                                        //     label='Admin Email Address'
                                        //     placeholder='admin@example.com'
                                        //     {...(errors.emailAddress && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='password'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Password'
                                            placeholder='test123'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Password'
                                        //     placeholder='test123'
                                        //     {...(errors.password && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='companyName'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Company Name'
                                            placeholder='Tenant'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Company Name'
                                        //     placeholder='Tenant'
                                        //     {...(errors.companyName && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='address'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Company Address'
                                            placeholder='123 innovation, suite 20'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Company Address'
                                        //     placeholder='123 innovation, suite 20'
                                        //     {...(errors.address && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='npiUmpiNumber'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='NPI/UMPI Number'
                                            placeholder='123456789'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='NPI/UMPI Number'
                                        //     placeholder='123456789'
                                        //     {...(errors.npiUmpiNumber && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='taxonomyNumber'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Taxonomy'
                                            placeholder='123456789'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Taxonomy'
                                        //     placeholder='123456789'
                                        //     {...(errors.taxonomyNumber && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='einNumber'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='EIN'
                                            placeholder='123456789'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='EIN'
                                        //     placeholder='123456789'
                                        //     {...(errors.einNumber && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='billingEmail'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Company Email Address'
                                            placeholder='user@company.com'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     type='email'
                                        //     label='Email Address'
                                        //     placeholder='admin@tenant.com'
                                        //     {...(errors.billingEmail && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='contactNumber'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Company Phone Number'
                                            placeholder='+1 202 555 0111'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='Phone Number'
                                        //     placeholder='+1 202 555 0111'
                                        //     {...(errors.contactNumber && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name='faxNumber'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            variant='outlined'
                                            label='Company FAX Number'
                                            placeholder='+1 555 0111'
                                            {...field}
                                            {...(errors.firstName && { error: true, helperText: 'This field is required.' })}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#A081D6", // Update border color when focused
                                                    },
                                                },
                                                "& .MuiInputLabel-root": {
                                                    "&.Mui-focused": {
                                                        color: "#5C2AAE", // Update label color when focused
                                                    },
                                                },
                                            }}
                                        />
                                        // <CustomTextField
                                        //     {...field}
                                        //     fullWidth
                                        //     label='FAX'
                                        //     placeholder='+1 555 0111'
                                        //     {...(errors.faxNumber && { error: true, helperText: 'This field is required.' })}
                                        // />
                                    )}
                                />
                            </Grid>
                            {/* <Grid size={{ xs: 12, md: 4 }}>
                                <CustomTextField
                                    select
                                    fullWidth
                                    id='status'
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    label='Status'
                                    placeholder='Select Status'
                                >
                                    <MenuItem value='Active'>Active</MenuItem>
                                    <MenuItem value='Suspended'>Suspended</MenuItem>
                                    <MenuItem value='Canceled'>Canceled</MenuItem>
                                </CustomTextField>
                            </Grid> */}

                            {/* <div className='flex items-center gap-4 mt-2'> */}
                            {/* <Grid size={{ xs: 24, md: 12 }}>
                                <Button variant='contained' type='submit'>
                                    Submit
                                </Button>
                            </Grid> */}
                        </Grid>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Button variant="outlined" color="secondary" type="reset" onClick={() => { }}>
                            Cancel
                        </Button>
                        <Button variant="contained" type="submit" sx={{ backgroundColor: "#4B0082" }}>
                            Submit
                        </Button>
                    </Grid>
                </CardContent>
            </Card>
        </form>
    )
}

export default CreateTenant
