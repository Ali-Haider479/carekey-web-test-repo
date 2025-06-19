import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Dialog,
  CircularProgress
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import { payerOptions, USStates } from '@/utils/constants'
import { Add, DeleteOutline, Edit, EditOutlined, Save, SaveOutlined } from '@mui/icons-material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import api from '@/utils/api'
import { useTheme } from '@emotion/react'
import ReactTable from '@/@core/components/mui/ReactTable'
import { useParams } from 'next/navigation'

type Props = {
  onFinish: (data: any) => void
  defaultValues?: any
  caregiverDocuments?: any
}

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}

const CaregiverDocuments = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  // Certificates States
  const [caregiverDocuments, setCaregiverDocuments] = useState<any>()
  const [caregiverDocumentsLoading, setCaregiverDocumentsLoading] = useState<boolean>(true)
  const [trainingCertificates, setTrainingCertificates] = useState<any>([])
  const [deleteButtonLoading, setDeleteButtonLoading] = useState<boolean>(false)
  const [drivingCertificates, setDrivingCertificates] = useState<any>([])
  const [TrainingCertificateEditModalShow, setTrainingCertificateEditModalShow] = useState<boolean>(false)
  const [trainingDocumentToEdit, setTrainingDocumentToEdit] = useState<any>()
  const [isTrainingCertificateEdit, setIsTrainingCertificateEdit] = useState<boolean>(false)
  const [trainingCertificateDeleteModalShow, setTrainingCertificateDeleteModalShow] = useState<boolean>(false)
  const [newTrainingCertificateModalShow, setNewTrainingCertificateModalShow] = useState<boolean>(false)
  const [newTrainingCertificateSaveButtonLoading, setNewTrainingCertificateSaveButtonLoading] = useState<boolean>(false)

  const [documentsEditModalShow, setDocumentsEditModalShow] = useState<boolean>(false)
  const [newDocumentsModalShow, setNewDocumentsModalShow] = useState<boolean>(false)
  const [newDocumentsSaveButtonLoading, setNewDocumentsSaveButtonLoading] = useState<boolean>(false)
  const [documentToEdit, setDocumentToEdit] = useState<any>()

  const [newDrivingLicenseModalShow, setNewDrivingLicenseModalShow] = useState<boolean>(false)
  const [drivingLicenseEditModalShow, setDrivingLicenseEditModalShow] = useState<boolean>(false)
  const [drivingLicenseSaveButtonLoading, setDrivingLicenseSaveButtonLoading] = useState<boolean>(false)
  const [drivingLicenseToEdit, setDrivingLicenseToEdit] = useState<any>()

  const [newUmpiDocModalShow, setNewUmpiDocModalShow] = useState<boolean>(false)
  const [umpiDocEditModalShow, setUmpiEditModalShow] = useState<boolean>(false)
  const [umpiDocSaveButtonLoading, setUmpiDocSaveButtonLoading] = useState<boolean>(false)
  const [umpiDocToEdit, setUmpiDocToEdit] = useState<any>()

  const { id } = useParams()

  const theme: any = useTheme()

  const lightTheme = theme.palette.mode === 'light'
  const darkTheme = theme.palette.mode === 'dark'

  const handleTrainingEditModalOpen = (doc: any) => {
    setTrainingCertificateEditModalShow(true)
    setTrainingDocumentToEdit(doc)
  }

  const handlDocumentEditModalOpen = (doc: any) => {
    setDocumentsEditModalShow(true)
    setDocumentToEdit(doc)
  }

  const handleDrivingLicenseEditModalOpen = (doc: any) => {
    setDrivingLicenseEditModalShow(true)
    setDrivingLicenseToEdit(doc)
  }

  const handleTrainingCertificatesEditModalClose = () => {
    setTrainingCertificateEditModalShow(false)
    setTrainingCertificates([])
  }
  const handleDocumentsEditModalCLose = () => {
    setDocumentsEditModalShow(false)
    setSsnFile([])
    setAdultFile([])
    setClearanceFile([])
  }
  const handleDrivingLicenseEditModalClose = () => {
    setDrivingLicenseEditModalShow(false)
    setDrivingCertificates([])
  }
  const handleNewDrivingLicenseModalClose = () => {
    setNewDrivingLicenseModalShow(false)
    setDrivingCertificates([])
  }
  const handleUmpiDocumentEditModalOpen = (doc: any) => {
    setUmpiEditModalShow(true)
    setUmpiDocToEdit(doc)
  }

  const handleUmpiDocEditModalClose = () => {
    setUmpiEditModalShow(false)
    setUmpiFile([])
  }

  const handleNewUmpiDocModalClose = () => {
    setNewUmpiDocModalShow(false)
  }
  const handleTrainingCertificateDeleteModalShow = () => setTrainingCertificateDeleteModalShow(false)
  const handleNewTrainingCertificatesModalClose = () => setNewTrainingCertificateModalShow(false)
  const handleNewDocumentsModalClose = () => setNewDocumentsModalShow(false)

  console.log('Caregiver Docs in child ------>> ', caregiverDocuments)

  // Documents Section States
  const [ssnFile, setSsnFile] = useState<any>([])
  const [adultFile, setAdultFile] = useState<any>([])
  const [umpiFile, setUmpiFile] = useState<any>([])
  const [clearanceFile, setClearanceFile] = useState<any>([])

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      trainingCertificateFiles: [],
      trainingCertificateName: trainingDocumentToEdit?.uploadedDocument?.metaData?.documentName,
      newTrainingCertificateName: '',
      newTainingCertificateExpiryDate: null,
      trainingCertificateExpiryDate: trainingDocumentToEdit?.uploadedDocument?.expiryDate,
      drivingCertificateFiles: [],
      drivingLicenseNumber: drivingLicenseToEdit?.uploadedDocument?.metaData?.drivingLicenseNumber,
      drivingLicenseExpiryDate: drivingLicenseToEdit?.uploadedDocument?.expiryDate,
      drivingLicenseState: drivingLicenseToEdit?.uploadedDocument?.metaData?.drivingLicenseState,
      ssnFileObject: [],
      adultFileObject: [],
      umpiFileObject: [],
      clearanceFileObject: [],
      employeeNumber: '',
      additionalPayRate: '',
      serviceType: '',
      payor: umpiDocToEdit?.uploadedDocument?.metaData?.payer,
      umpiNumber: umpiDocToEdit?.uploadedDocument?.metaData?.umpiNumber,
      activationdate: umpiDocToEdit?.uploadedDocument?.metaData?.activationDate,
      expiryDate: umpiDocToEdit?.uploadedDocument?.expiryDate,
      newPayor: '',
      newUmpiNumber: '',
      newActivationDate: null,
      newExpiryDate: null
    },
    ...defaultValues
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    setError,
    clearErrors,
    watch,
    reset
  } = methods

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: any) => void) => handleSubmit(onValid)
  }))

  // Update form values when files are selected
  useEffect(() => {
    setValue('trainingCertificateFiles', trainingCertificates)
    setValue('drivingCertificateFiles', drivingCertificates)
    setValue('ssnFileObject', ssnFile)
    setValue('adultFileObject', adultFile)
    setValue('umpiFileObject', umpiFile)
    setValue('clearanceFileObject', clearanceFile)
  }, [trainingCertificates, drivingCertificates, ssnFile, adultFile, umpiFile, clearanceFile, setValue])

  const newTrainingCertificateName = watch('newTrainingCertificateName')
  const newTrainingCertificateExpiryDate = watch('newTrainingCertificateExpiryDate')
  const trainingCertificateName = watch('trainingCertificateName')
  const trainingCertificateExpiryDate = watch('trainingCertificateExpiryDate')
  const newDrivingLicenseNumber = watch('newDrivingLicenseNumber')
  const newDrivingLicenseExpiryDate = watch('newDrivingLicenseExpiryDate')
  const newDrivingLicenseState = watch('newDrivingLicenseState')
  const drivingLicenseNumber = watch('drivingLicenseNumber')
  const drivingLicenseExpiryDate = watch('drivingLicenseExpiryDate')
  const drivingLicenseState = watch('drivingLicenseState')

  const payor = watch('payor')
  const umpiNumber = watch('umpiNumber')
  const activationDate = watch('activationdate')
  const expiryDate = watch('expiryDate')

  const newPayor = watch('newPayor')
  const newUmpiNumber = watch('newUmpiNumber')
  const newActivationDate = watch('newActivationDate')
  const newExpiryDate = watch('newExpiryDate')

  console.log(
    'New Driving License Details: ',
    newDrivingLicenseNumber,
    newDrivingLicenseExpiryDate,
    newDrivingLicenseState
  )

  const trainingCertificateDocuments = caregiverDocuments?.filter(
    (doc: any) => doc?.uploadedDocument?.documentType === 'trainingCertificate'
  )

  const drivingLicenseDocument = caregiverDocuments?.filter(
    (doc: any) => doc?.uploadedDocument?.documentType === 'drivingLicense'
  )

  const umpiDocument = caregiverDocuments?.filter((doc: any) => doc?.uploadedDocument?.documentType === 'umpiDocument')

  console.log('Driving License Document: ', drivingLicenseDocument)

  const otherDocuments = caregiverDocuments?.filter(
    (doc: any) =>
      doc?.uploadedDocument?.documentType !== 'drivingLicense' &&
      doc?.uploadedDocument?.documentType !== 'trainingCertificate' &&
      doc?.uploadedDocument?.documentType !== 'umpiDocument'
  )

  console.log('Other documents =====>> ', otherDocuments)

  console.log('New Training Certificate Name ---->> ', newTrainingCertificateExpiryDate?.toISOString().split('T')[0])

  const fetchCaregiverDocuments = async () => {
    try {
      setCaregiverDocumentsLoading(true)
      const response = await api.get(`/caregivers/document/${id}`)
      console.log('Caregiver documents response ----->> ', response.data)
      setCaregiverDocuments(response.data)
    } catch (error) {
      console.error('Error in fetching caregiver documents: ', error)
    } finally {
      setCaregiverDocumentsLoading(false)
    }
  }

  useEffect(() => {
    fetchCaregiverDocuments()
  }, [])

  const getPdf = async (key: string, fileName: string) => {
    const pdfRes = await api.get(`/caregivers/getPdf/${key}`)
    console.log('PDF RESPONSE --->> ', pdfRes)
    if (pdfRes && pdfRes.status === 200) {
      openPdfInNewTab(pdfRes.data, fileName)
    }
  }

  const openPdfInNewTab = (pdfUrl: string, itemName: string) => {
    if (/iPhone/i.test(navigator.userAgent) || !pdfUrl.includes('data')) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.target = '_blank'
      a.click()
    } else {
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob)
          const win = window.open(objectUrl, '_blank')
          if (!win) {
            console.error('Unable to open a new tab. Please check your browser settings.')
          } else {
            win.document.title = itemName
          }
        })
        .catch(error => {
          console.error('Error loading PDF:', error)
        })
    }
  }

  const onSubmit = (data: any) => {
    const formData = {
      trainingCertificates: {
        files: data.trainingCertificateFiles || [],
        trainingCertificateName: data.trainingCertificateName,
        trainingCertificateExpiryDate: newTrainingCertificateExpiryDate?.toISOString().split('T')[0]
      },
      drivingCertificates: {
        files: data.drivingCertificateFiles || [],
        drivingLicenseExpiryDate: data.drivingLicenseExpiryDate,
        drivingLicenseNumber: data.drivingLicenseNumber,
        dlState: data.dlState
      },
      caregiverDocuments: {
        ssnFile: data.ssnFileObject || [],
        adultFile: data.adultFileObject || [],
        umpiFile: data.umpiFileObject || [],
        clearanceFile: data.clearanceFileObject || [],
        employeeNumber: data.employeeNumber,
        additionalPayRate: data.additionalPayRate,
        serviceType: data.serviceType
      }
    }
    console.log('Combined Form Data:', formData)
    onFinish(formData)
  }

  const uploadDocuments = async (
    files: { path: string }[],
    documentType: string,
    caregiverId: string,
    expiryDate?: string,
    metaData?: Record<string, any>
  ) => {
    // Skip upload if no files exist
    if (!files || files.length === 0) {
      console.log(`No files found for ${documentType}. Skipping upload.`)
      return null
    }

    // Create a FormData object
    const formData = new FormData()

    // Append files
    files.forEach((file: { path: string }) => {
      // Use File object instead of Blob for better compatibility
      const fileObject = new File([file.path], file.path, {
        type: file.path.endsWith('.pdf')
          ? 'application/pdf'
          : file.path.endsWith('.jpg') || file.path.endsWith('.png')
            ? 'image/jpeg'
            : 'application/octet-stream'
      })
      formData.append('file', fileObject, file.path)
    })

    // Append common parameters
    formData.append('documentType', documentType)
    formData.append('caregiverId', caregiverId)

    // Handle expiry date
    const finalExpiryDate = expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()

    formData.append('expiryDays', '365')
    formData.append('expiryDate', finalExpiryDate)

    // Append additional metadata if exists
    if (metaData) {
      formData.append('metaData', JSON.stringify(metaData))
    }

    // Make the API call
    try {
      return await api.post(`/caregivers/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error(`Error uploading ${documentType} documents:`, error)
      return null
    }
  }

  const handleEditTrainingCertificates = async (data: any) => {
    try {
      setNewTrainingCertificateSaveButtonLoading(true)
      if (!trainingDocumentToEdit?.id) {
        console.error('No document ID found for editing')
        return
      }

      const formData = new FormData()
      const metaData = {
        documentName: data.trainingCertificateName || trainingDocumentToEdit?.uploadedDocument?.metaData?.documentName
      }

      // Append metadata
      formData.append('metaData', JSON.stringify(metaData))

      // Calculate expiry days if a new expiry date is provided
      if (data.trainingCertificateExpiryDate) {
        formData.append('expiryDate', trainingCertificateExpiryDate.toISOString().split('T')[0])
      }

      // Append document type
      formData.append('documentType', 'trainingCertificate')

      // Append new file if provided
      if (trainingCertificates.length > 0) {
        trainingCertificates.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      // Make the PATCH API call
      const response = await api.patch(`/upload-document/${trainingDocumentToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Edit Training Certificate Response:', response.data)

      // Close the modal and reset state
      fetchCaregiverDocuments()
      setTrainingCertificateEditModalShow(false)
      setTrainingCertificates([])
      reset({
        trainingCertificateName: '',
        trainingCertificateExpiryDate: null,
        trainingCertificateFiles: []
      })

      // Optionally refresh the caregiverDocuments list
      // You may need to fetch updated documents or update the local state
    } catch (error) {
      console.error('Error editing training certificate:', error)
    } finally {
      setNewTrainingCertificateSaveButtonLoading(false)
    }
  }

  const handleEditDocuments = async (data: any) => {
    try {
      setNewTrainingCertificateSaveButtonLoading(true)
      if (!documentToEdit?.id) {
        console.error('No document ID found for editing')
        return
      }

      const formData = new FormData()
      let metaData

      if (ssnFile.length > 0) {
        metaData = {
          documentName: 'SSN Document'
        }
      }

      if (adultFile.length > 0) {
        metaData = {
          documentName: 'Adult Mandated Document'
        }
      }

      if (clearanceFile.length > 0) {
        metaData = {
          documentName: 'Clearance Document'
        }
      }

      // Append metadata
      formData.append('metaData', JSON.stringify(metaData))

      // Calculate expiry days if a new expiry date is provided
      if (data.trainingCertificateExpiryDate) {
        formData.append('expiryDate', trainingCertificateExpiryDate.toISOString().split('T')[0])
      }

      // Append document type
      if (ssnFile.length > 0) {
        formData.append('documentType', 'ssnDocument')
      }

      if (adultFile.length > 0) {
        formData.append('documentType', 'adultMandatedDocument')
      }

      if (clearanceFile.length > 0) {
        formData.append('documentType', 'clearanceDocument')
      }

      // Append new file if provided
      if (ssnFile.length > 0) {
        ssnFile.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      if (adultFile.length > 0) {
        adultFile.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      if (clearanceFile.length > 0) {
        clearanceFile.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      // Make the PATCH API call
      const response = await api.patch(`/upload-document/${documentToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Edit Document Response:', response.data)

      // Close the modal and reset state
      fetchCaregiverDocuments()
      setDocumentsEditModalShow(false)
      setSsnFile([])
      setAdultFile([])
      setClearanceFile([])

      // Optionally refresh the caregiverDocuments list
      // You may need to fetch updated documents or update the local state
    } catch (error) {
      console.error('Error editing training certificate:', error)
    } finally {
      setNewTrainingCertificateSaveButtonLoading(false)
    }
  }

  const handleEditDrivingLicense = async (data: any) => {
    try {
      setDrivingLicenseSaveButtonLoading(true)
      if (!drivingLicenseToEdit?.id) {
        console.error('No document ID found for editing')
        return
      }

      const formData = new FormData()
      const metaData = {
        documentName: 'Driving License',
        drivingLicenseNumber: drivingLicenseNumber,
        drivingLicenseState: drivingLicenseState
      }

      // Append metadata
      formData.append('metaData', JSON.stringify(metaData))

      // Calculate expiry days if a new expiry date is provided
      if (data.drivingLicenseExpiryDate) {
        formData.append('expiryDate', drivingLicenseExpiryDate.toISOString().split('T')[0])
      }

      // Append document type
      formData.append('documentType', 'drivingLicense')

      // Append new file if provided
      if (drivingCertificates.length > 0) {
        drivingCertificates.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      // Make the PATCH API call
      const response = await api.patch(`/upload-document/${drivingLicenseToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Edit Driving License Response:', response.data)

      // Close the modal and reset state
      fetchCaregiverDocuments()
      setDrivingLicenseEditModalShow(false)
      setDrivingCertificates([])
      reset({
        drivingLicenseNumber: '',
        drivingLicenseExpiryDate: null,
        drivingLicenseState: ''
      })

      // Optionally refresh the caregiverDocuments list
      // You may need to fetch updated documents or update the local state
    } catch (error) {
      console.error('Error editing driving license:', error)
    } finally {
      setDrivingLicenseSaveButtonLoading(false)
    }
  }

  const handleAddNewTrainingCertificate = async () => {
    try {
      setNewTrainingCertificateSaveButtonLoading(true)
      const metaData = {
        documentName: newTrainingCertificateName || 'default-certificate'
        // Add other metadata fields if needed
      }
      const documentUploads = [
        uploadDocuments(
          trainingCertificates,
          'trainingCertificate',
          String(id),
          newTrainingCertificateExpiryDate?.toISOString().split('T')[0] || new Date(),
          metaData
        )
      ]
      const uploadResponses = await Promise.all(documentUploads)
      const successfulUploads = uploadResponses.filter(response => response !== null)
      console.log('Successful document uploads:', successfulUploads)
      fetchCaregiverDocuments()
      setNewTrainingCertificateModalShow(false)
    } catch (error) {
      console.error('Error in adding training certificate: ', error)
    } finally {
      setNewTrainingCertificateSaveButtonLoading(false)
    }
  }

  const handleAddNewDocuments = async () => {
    try {
      setNewDocumentsSaveButtonLoading(true)
      // let metaData
      // if(ssnFile.l)
      //  metaData = {
      //   documentName: 'New Document'
      //   // Add other metadata fields if needed
      // }
      const documentUploads = [
        uploadDocuments(ssnFile, 'ssnDocument', String(id), new Date().toISOString().split('T')[0], {
          documentName: 'SSN Document'
        }),
        uploadDocuments(adultFile, 'adultMandatedDocument', String(id), new Date().toISOString().split('T')[0], {
          documentName: 'Adult Mandated Document'
        }),
        uploadDocuments(clearanceFile, 'clearanceDocument', String(id), new Date().toISOString().split('T')[0], {
          documentName: 'Clearance Document'
        })
      ]
      const uploadResponses = await Promise.all(documentUploads)
      const successfulUploads = uploadResponses.filter(response => response !== null)
      console.log('Successful document uploads:', successfulUploads)
      fetchCaregiverDocuments()
      setNewDocumentsModalShow(false)
      setSsnFile([])
      setClearanceFile([])
      setAdultFile([])
    } catch (error) {
      console.error('error Uploading documents: ', error)
    } finally {
      setNewDocumentsSaveButtonLoading(false)
    }
  }

  const handleAddNewDrivingLicense = async () => {
    try {
      setDrivingLicenseSaveButtonLoading(true)
      const metaData = {
        documentName: 'Driving License',
        drivingLicenseNumber: newDrivingLicenseNumber,
        drivingLicenseState: newDrivingLicenseState
        // Add other metadata fields if needed
      }
      const documentUploads = [
        uploadDocuments(
          drivingCertificates,
          'drivingLicense',
          String(id),
          newDrivingLicenseExpiryDate?.toISOString().split('T')[0],
          metaData
        )
      ]
      const uploadResponses = await Promise.all(documentUploads)
      const successfulUploads = uploadResponses.filter(response => response !== null)
      console.log('Successful document uploads:', successfulUploads)
      fetchCaregiverDocuments()
      setNewDrivingLicenseModalShow(false)
    } catch (error) {
      console.error('Error in adding training certificate: ', error)
    } finally {
      setDrivingLicenseSaveButtonLoading(false)
    }
  }

  const handleAddNewUmpiDoc = async () => {
    try {
      setUmpiDocSaveButtonLoading(true)
      const metaData = {
        documentName: 'UMPI Letter',
        payer: newPayor,
        activationDate: newActivationDate?.toISOString().split('T')[0]
      }
      const documentUploads = [
        uploadDocuments(umpiFile, 'umpiDocument', String(id), newExpiryDate?.toISOString().split('T')[0], metaData)
      ]
      const uploadResponses = await Promise.all(documentUploads)
      const successfulUploads = uploadResponses.filter(response => response !== null)
      console.log('Successful document uploads:', successfulUploads)
      fetchCaregiverDocuments()
      setNewUmpiDocModalShow(false)
    } catch (error) {
      console.error('Error in adding training certificate: ', error)
    } finally {
      setUmpiDocSaveButtonLoading(false)
    }
  }

  const handleEditUmpiDoc = async (data: any) => {
    try {
      setUmpiDocSaveButtonLoading(true)
      if (!umpiDocToEdit?.id) {
        console.error('No document ID found for editing')
        return
      }

      const formData = new FormData()
      const metaData = {
        documentName: 'UMPI Letter',
        payer: payor,
        activationDate: activationDate instanceof Date ? activationDate?.toISOString().split('T')[0] : null
      }

      // Append metadata
      formData.append('metaData', JSON.stringify(metaData))

      // Calculate expiry days if a new expiry date is provided
      if (expiryDate && expiryDate instanceof Date) {
        formData.append('expiryDate', expiryDate?.toISOString().split('T')[0])
      }

      // Append document type
      formData.append('documentType', 'umpiDocument')

      // Append new file if provided
      if (umpiFile.length > 0) {
        umpiFile.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      // Make the PATCH API call
      const response = await api.patch(`/upload-document/${umpiDocToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Edit Driving License Response:', response.data)

      // Close the modal and reset state
      fetchCaregiverDocuments()
      setUmpiEditModalShow(false)
      setUmpiFile([])
      reset({
        umpiNumber,
        expiryDate
      })

      // Optionally refresh the caregiverDocuments list
      // You may need to fetch updated documents or update the local state
    } catch (error) {
      console.error('Error editing driving license:', error)
    } finally {
      setUmpiDocSaveButtonLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteButtonLoading(true)
      const docToDelete = documentToEdit
        ? documentToEdit?.id
        : drivingLicenseToEdit
          ? drivingLicenseToEdit?.id
          : umpiDocToEdit
            ? umpiDocToEdit?.id
            : trainingDocumentToEdit?.id
      const deleteResponse = await api.delete(`/caregivers/document/${docToDelete}`)
      console.log('DELETE RESPONSE ---->> ', deleteResponse)
      fetchCaregiverDocuments()
      setTrainingCertificateDeleteModalShow(false)
    } catch (error) {
      console.error('Error in deleting document: ', error)
    } finally {
      setDeleteButtonLoading(false)
    }
  }

  // Helper function to render file list with progress
  const renderFileProgress = (files: File[]) => {
    return files.map((file: File, index: number) => (
      <div key={index} className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center gap-10'>
            <div className='flex items-center gap-2'>
              <PictureAsPdfIcon />
              <Typography className='font-semibold text-green-600 text-sm'>
                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name} (100%)
              </Typography>
            </div>
            <div>
              <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
            </div>
          </div>
        </div>
        <LinearProgress variant='determinate' value={100} color={'success'} />
      </div>
    ))
  }

  // Helper function to render simple file list
  const renderFileList = (files: File[], title: string) =>
    files.length > 0 && (
      <div className='p-4 rounded-lg border border-[#32475C] border-opacity-[22%]'>
        <Typography className='text-md font-semibold mb-2'>{title}</Typography>
        <Typography className='font-semibold text-green-600 text-sm'>
          {title.length > 20 ? `${title.substring(0, 20)}...` : title}
        </Typography>
        {files.map((file, index) => (
          <div key={index} className='flex items-center gap-2 mb-2'>
            <PictureAsPdfIcon />
            <span className='font-semibold text-green-600'>
              {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
            </span>
          </div>
        ))}
      </div>
    )

  // Helper function to render uploaded documents
  const renderUploadedDocuments = (doc: any) =>
    caregiverDocuments?.length > 0 && (
      <>
        <div className='cursor-pointer px-4 py-2 rounded-lg border border-[#32475C] border-opacity-[22%]'>
          <div className='flex flex-row justify-between items-center'>
            <div className='flex items-center gap-2 mb-0'>
              <PictureAsPdfIcon />
              <div>
                <Typography className='font-semibold text-green-600 text-sm'>
                  {doc?.uploadedDocument?.fileName?.length > 25
                    ? `${doc?.uploadedDocument?.fileName?.substring(0, 25)}...`
                    : doc?.uploadedDocument?.fileName}
                </Typography>
                <Typography className='text-sm text-gray-600'>{doc?.uploadedDocument?.documentType}</Typography>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </>
    )

  const trainingCertificateColumns: Column[] = [
    {
      id: 'certificateName',
      label: 'NAME',
      minWidth: 170,
      render: item => (
        <Typography className='font-light text-sm my-3'>{item?.uploadedDocument?.metaData?.documentName}</Typography>
      )
    },
    {
      id: 'expiryDate',
      label: 'EXPIRY DATE',
      minWidth: 170,
      render: item => <Typography className='font-light text-sm my-3'>{item.uploadedDocument.expiryDate}</Typography>
    },
    {
      id: 'fileName',
      label: 'FILE NAME',
      minWidth: 170,
      render: item => {
        return (
          <div
            className='cursor-pointer w-1/2'
            onClick={() => getPdf(item?.uploadedDocument?.fileKey, item.uploadedDocument.fileName)}
          >
            <Typography className='font-light text-sm my-3'>
              {item.uploadedDocument.fileName.length > 15
                ? `${item.uploadedDocument.fileName.substring(0, 15)}...`
                : item.uploadedDocument.fileName}
            </Typography>
          </div>
        )
      }
    },
    {
      id: 'actions',
      label: 'ACTION',
      minWidth: 170,
      render: item => (
        <div className='flex flex-row gap-4'>
          <EditOutlined className='cursor-pointer' onClick={() => handleTrainingEditModalOpen(item)} />
          <DeleteOutline
            color='error'
            className='cursor-pointer'
            onClick={() => {
              setTrainingCertificateDeleteModalShow(true)
              setTrainingDocumentToEdit(item)
            }}
          />
        </div>
      )
    }
  ]

  const otherDocColumns: Column[] = [
    {
      id: 'certificateName',
      label: 'NAME',
      minWidth: 170,
      render: item => (
        <Typography className='font-light text-sm my-3'>{item?.uploadedDocument?.metaData?.documentName}</Typography>
      )
    },
    {
      id: 'expiryDate',
      label: 'EXPIRY DATE',
      minWidth: 170,
      render: item => <Typography className='font-light text-sm my-3'>{item.uploadedDocument.expiryDate}</Typography>
    },
    {
      id: 'fileName',
      label: 'FILE NAME',
      minWidth: 170,
      render: item => (
        <div
          className='cursor-pointer w-1/2'
          onClick={() => getPdf(item?.uploadedDocument?.fileKey, item.uploadedDocument.fileName)}
        >
          <Typography className='font-light text-sm my-3'>
            {item.uploadedDocument.fileName.length > 15
              ? `${item.uploadedDocument.fileName.substring(0, 15)}...`
              : item.uploadedDocument.fileName}
          </Typography>
        </div>
      )
    },
    {
      id: 'actions',
      label: 'ACTION',
      minWidth: 170,
      render: item => (
        <div className='flex flex-row gap-4'>
          <EditOutlined className='cursor-pointer' onClick={() => handlDocumentEditModalOpen(item)} />
          <DeleteOutline
            color='error'
            className='cursor-pointer'
            onClick={() => {
              setTrainingCertificateDeleteModalShow(true)
              setDocumentToEdit(item)
            }}
          />
        </div>
      )
    }
  ]

  console.log('Document to delete: ', drivingLicenseToEdit)

  console.log(
    'OTHER DOCUMENTS FILTER',
    otherDocuments?.filter((doc: any) => doc?.uploadedDocument?.documentType === 'ssnDocument')
  )

  console.log('FILES', trainingCertificates, drivingCertificates, ssnFile, adultFile, umpiFile, clearanceFile)
  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
          <Card className='mt-5 px-0'>
            <CardContent className='px-0'>
              <div className='flex flex-row justify-between'>
                <Typography className='text-xl font-semibold mb-4 ml-5'>Training Certificates</Typography>
                <Button
                  variant='contained'
                  onClick={() => setNewTrainingCertificateModalShow(true)}
                  className={`mr-5 mb-4 cursor-pointer ${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </div>
              <div>
                {caregiverDocumentsLoading ? (
                  <div className='flex justify-center itmes-center'>
                    <CircularProgress />
                  </div>
                ) : caregiverDocuments?.length ? (
                  <ReactTable
                    data={trainingCertificateDocuments}
                    columns={trainingCertificateColumns}
                    keyExtractor={user => user.id.toString()}
                    // enablePagination
                    pageSize={20}
                    stickyHeader
                    maxHeight={600}
                    containerStyle={{ borderRadius: 2 }}
                  />
                ) : (
                  <div className='flex items-center justify-center'>
                    <Typography className='text-base font-semibold'>No Training Certificate uploaded yet</Typography>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className='mt-5'>
            <CardContent>
              <div className='flex flex-row justify-between'>
                <Typography className='text-xl font-semibold mb-4'>Driving License</Typography>
                {drivingLicenseDocument?.length ? (
                  <div className='flex flex-row'>
                    <Button
                      variant='contained'
                      className='mr-5 mb-4 cursor-pointer'
                      color='error'
                      startIcon={<DeleteOutline />}
                      onClick={() => {
                        setTrainingCertificateDeleteModalShow(true)
                        setDrivingLicenseToEdit(drivingLicenseDocument?.[0])
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant='contained'
                      onClick={() => {
                        drivingLicenseDocument?.length
                          ? handleDrivingLicenseEditModalOpen(drivingLicenseDocument?.[0])
                          : setNewDrivingLicenseModalShow(true)
                      }}
                      className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'} mr-0 mb-4 cursor-pointer`}
                      startIcon={drivingLicenseDocument?.length ? <Edit /> : <Add />}
                    >
                      {drivingLicenseDocument?.length ? 'Update' : 'Add'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant='contained'
                    onClick={() => {
                      drivingLicenseDocument?.length
                        ? handleDrivingLicenseEditModalOpen(drivingLicenseDocument?.[0])
                        : setNewDrivingLicenseModalShow(true)
                    }}
                    className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'} mr-5 mb-4 cursor-pointer`}
                    startIcon={drivingLicenseDocument?.length ? <Edit /> : <Add />}
                  >
                    {drivingLicenseDocument?.length ? 'Update' : 'Add'}
                  </Button>
                )}
              </div>
              {caregiverDocumentsLoading ? (
                <div className='flex justify-center itmes-center'>
                  <CircularProgress />
                </div>
              ) : (
                <div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>Driving License Number: </Typography>
                    <Typography>
                      {drivingLicenseDocument?.[0]?.uploadedDocument?.metaData?.drivingLicenseNumber
                        ? drivingLicenseDocument?.[0]?.uploadedDocument?.metaData?.drivingLicenseNumber
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>Driving License State: </Typography>
                    <Typography>
                      {drivingLicenseDocument?.[0]?.uploadedDocument?.metaData?.drivingLicenseState
                        ? drivingLicenseDocument?.[0]?.uploadedDocument?.metaData?.drivingLicenseState
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>Expiry Date: </Typography>
                    <Typography>
                      {drivingLicenseDocument?.[0]?.uploadedDocument?.expiryDate
                        ? drivingLicenseDocument?.[0]?.uploadedDocument?.expiryDate
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row items-center gap-2 mb-2'>
                    <Typography className='font-semibold'>Uploaded File: </Typography>
                    {drivingLicenseDocument?.length ? (
                      <div
                        onClick={() =>
                          getPdf(
                            drivingLicenseDocument?.[0]?.uploadedDocument?.fileKey,
                            drivingLicenseDocument?.[0]?.uploadedDocument?.fileName
                          )
                        }
                      >
                        {renderUploadedDocuments(drivingLicenseDocument?.[0])}
                      </div>
                    ) : (
                      <Typography>N/A</Typography>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='mt-5 w-full ml-0 shadow-md rounded-lg p-6'>
            <div className='flex flex-row justify-between'>
              <Typography className='text-xl font-semibold mb-4'>PCA-UMPI INFO</Typography>
              {umpiDocument?.length ? (
                <div className='flex flex-row'>
                  <Button
                    variant='contained'
                    className='mr-5 mb-4 cursor-pointer'
                    color='error'
                    startIcon={<DeleteOutline />}
                    onClick={() => {
                      setTrainingCertificateDeleteModalShow(true)
                      setUmpiDocToEdit(umpiDocument?.[0])
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => {
                      umpiDocument?.length
                        ? handleUmpiDocumentEditModalOpen(umpiDocument?.[0])
                        : setNewUmpiDocModalShow(true)
                    }}
                    className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'} mr-0 mb-4 cursor-pointer`}
                    startIcon={umpiDocument?.length ? <Edit /> : <Add />}
                  >
                    {umpiDocument?.length ? 'Update' : 'Add'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant='contained'
                  onClick={() => {
                    umpiDocument?.length
                      ? handleUmpiDocumentEditModalOpen(umpiDocument?.[0])
                      : setNewUmpiDocModalShow(true)
                  }}
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'} mr-0 mb-4 cursor-pointer`}
                  startIcon={umpiDocument?.length ? <Edit /> : <Add />}
                >
                  {umpiDocument?.length ? 'Update' : 'Add'}
                </Button>
              )}
            </div>

            {caregiverDocumentsLoading ? (
              <div className='flex justify-center itmes-center'>
                <CircularProgress />
              </div>
            ) : (
              <div>
                <div className='flex flex-row gap-2 mb-2'>
                  <Typography className='font-semibold'>Payor: </Typography>
                  <Typography>
                    {umpiDocument?.[0]?.uploadedDocument?.metaData?.payer
                      ? umpiDocument?.[0]?.uploadedDocument?.metaData?.payer
                      : 'N/A'}
                  </Typography>
                </div>
                <div className='flex flex-row gap-2 mb-2'>
                  <Typography className='font-semibold'>Affiliation Date: </Typography>
                  <Typography>
                    {umpiDocument?.[0]?.uploadedDocument?.metaData?.activationDate
                      ? umpiDocument?.[0]?.uploadedDocument?.metaData?.activationDate
                      : 'N/A'}
                  </Typography>
                </div>
                <div className='flex flex-row gap-2 mb-2'>
                  <Typography className='font-semibold'>Expiry Date: </Typography>
                  <Typography>
                    {umpiDocument?.[0]?.uploadedDocument?.expiryDate
                      ? umpiDocument?.[0]?.uploadedDocument?.expiryDate
                      : 'N/A'}
                  </Typography>
                </div>
                <div className='flex flex-row items-center gap-2 mb-2'>
                  <Typography className='font-semibold'>Uploaded File: </Typography>
                  {umpiDocument?.length ? (
                    <div
                      onClick={() =>
                        getPdf(
                          umpiDocument?.[0]?.uploadedDocument?.fileKey,
                          umpiDocument?.[0]?.uploadedDocument?.fileName
                        )
                      }
                    >
                      {renderUploadedDocuments(umpiDocument?.[0])}
                    </div>
                  ) : (
                    <Typography>N/A</Typography>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className='mt-5 px-0'>
            <CardContent className='px-0'>
              <div className='flex flex-row justify-between'>
                <Typography className='text-xl font-semibold mb-4 ml-5'>Documents</Typography>
                <Button
                  variant='contained'
                  onClick={() => setNewDocumentsModalShow(true)}
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'} mr-5 mb-4 cursor-pointer`}
                  startIcon={<Add />}
                  disabled={otherDocuments?.length === 3}
                >
                  Add
                </Button>
              </div>
              <div>
                {caregiverDocumentsLoading ? (
                  <div className='flex justify-center itmes-center'>
                    <CircularProgress />
                  </div>
                ) : otherDocuments?.length ? (
                  <ReactTable
                    data={otherDocuments}
                    columns={otherDocColumns}
                    keyExtractor={user => user.id.toString()}
                    // enablePagination
                    pageSize={20}
                    stickyHeader
                    maxHeight={600}
                    containerStyle={{ borderRadius: 2 }}
                  />
                ) : (
                  <div className='flex items-center justify-center'>
                    <Typography className='text-base font-semibold'>No Documents uploaded yet</Typography>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
        <Dialog
          open={newDocumentsModalShow}
          onClose={handleNewDocumentsModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleNewDocumentsModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleAddNewDocuments)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Add Documents</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-3'>
                  {otherDocuments?.filter((doc: any) => doc?.uploadedDocument?.documentType === 'ssnDocument')
                    .length === 0 && (
                    <div className='p-4 rounded-lg border'>
                      <FileUploaderRestrictions
                        onFilesSelected={(selectedFiles: any) => {
                          setSsnFile(selectedFiles)
                        }}
                        mimeType={['application/pdf']}
                        fileCount={1}
                        fileSize={25 * 1024 * 1024}
                        title='Upload SSN'
                      />
                    </div>
                  )}
                  {otherDocuments?.filter((doc: any) => doc?.uploadedDocument?.documentType === 'adultMandatedDocument')
                    .length === 0 && (
                    <div className='p-4 rounded-lg border'>
                      <FileUploaderRestrictions
                        onFilesSelected={(selectedFiles: any) => {
                          setAdultFile(selectedFiles)
                        }}
                        mimeType={['application/pdf']}
                        fileCount={1}
                        fileSize={25 * 1024 * 1024}
                        title='Vulnerable Adult Mandated Certificate'
                      />
                    </div>
                  )}
                  {/* <div className='p-4 rounded-lg border'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setUmpiFile(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                      title='UMPI Letter'
                    />
                  </div> */}
                  {otherDocuments?.filter((doc: any) => doc?.uploadedDocument?.documentType === 'clearanceDocument')
                    .length === 0 && (
                    <div className='p-4 rounded-lg border'>
                      <FileUploaderRestrictions
                        onFilesSelected={(selectedFiles: any) => {
                          setClearanceFile(selectedFiles)
                        }}
                        mimeType={['application/pdf']}
                        fileCount={1}
                        fileSize={25 * 1024 * 1024}
                        title='Background Check Clearance'
                      />
                    </div>
                  )}
                  <div className='col-span-2'>
                    <h2 className='text-base font-semibold mb-3'>Uploading Files</h2>
                    <div className='grid grid-cols-2 gap-6 mb-6'>
                      {renderFileList(ssnFile, 'SSN Document')}
                      {renderFileList(adultFile, 'Vulnerable Adult Certificate')}
                      {renderFileList(clearanceFile, 'Background Check Clearance')}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleNewDocumentsModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={newDocumentsSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={newDocumentsSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
        <Dialog
          open={TrainingCertificateEditModalShow}
          onClose={handleTrainingCertificatesEditModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleTrainingCertificatesEditModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleEditTrainingCertificates)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Edit Certificate</h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='col-span-1 p-3 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={setTrainingCertificates}
                    mimeType={['application/pdf']}
                    fileCount={3}
                    fileSize={25 * 1024 * 1024}
                    title='Choose Files'
                  />
                </div>
                <div className='col-span-2'>
                  <h3 className='text-lg font-semibold mb-4'>Uploaded Files</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {renderUploadedDocuments(trainingDocumentToEdit)}
                  </div>
                  <h3 className='text-lg font-semibold mb-4 mt-3'>Uploading Files</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {renderFileProgress(trainingCertificates)}
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                <CustomTextField
                  label={'Certificate Name'}
                  placeHolder={'123ABC'}
                  name={'trainingCertificateName'}
                  defaultValue={trainingDocumentToEdit?.uploadedDocument?.metaData?.documentName}
                  type={'text'}
                  error={!!errors?.trainingCertificateName}
                  isRequired={false}
                  control={control}
                />
                <ControlledDatePicker
                  name={'trainingCertificateExpiryDate'}
                  control={control}
                  label={'Expiry Date'}
                  defaultValue={trainingDocumentToEdit?.uploadedDocument?.expiryDate}
                  error={errors.trainingCertificateExpiryDate}
                  isRequired={false}
                />
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleTrainingCertificatesEditModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={
                    newTrainingCertificateSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null
                  }
                  disabled={newTrainingCertificateSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
        <Dialog
          open={documentsEditModalShow}
          onClose={handleDocumentsEditModalCLose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleDocumentsEditModalCLose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleEditDocuments)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Edit Document</h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='col-span-1 p-3 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={
                      documentToEdit?.uploadedDocument?.documentType === 'ssnDocument'
                        ? setSsnFile
                        : documentToEdit?.uploadedDocument?.documentType === 'adultMandatedDocument'
                          ? setAdultFile
                          : setClearanceFile
                    }
                    mimeType={['application/pdf']}
                    fileCount={3}
                    fileSize={25 * 1024 * 1024}
                    title='Choose Files'
                  />
                </div>
                <div className='col-span-2'>
                  <h3 className='text-lg font-semibold mb-4'>Uploaded File</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderUploadedDocuments(documentToEdit)}</div>
                  <h3 className='text-lg font-semibold mb-4 mt-3'>Uploading Files</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(ssnFile)}</div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(adultFile)}</div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(clearanceFile)}</div>
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleDocumentsEditModalCLose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={
                    newTrainingCertificateSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null
                  }
                  disabled={newTrainingCertificateSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={newTrainingCertificateModalShow}
          onClose={handleNewTrainingCertificatesModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleNewTrainingCertificatesModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleAddNewTrainingCertificate)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Add Certificate</h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='col-span-1 p-3 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={setTrainingCertificates}
                    mimeType={['application/pdf']}
                    fileCount={3}
                    fileSize={25 * 1024 * 1024}
                    title='Choose Files'
                  />
                </div>
                <div className='col-span-2'>
                  {/* <h3 className='text-lg font-semibold mb-4'>Uploaded Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderUploadedDocuments()}</div> */}
                  <h3 className='text-lg font-semibold mb-4 mt-3'>Uploading Files</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {renderFileProgress(trainingCertificates)}
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                <CustomTextField
                  label={'Certificate Name'}
                  placeHolder={'123ABC'}
                  name={'newTrainingCertificateName'}
                  defaultValue={'123ABC'}
                  type={'text'}
                  error={!!errors?.trainingCertificateName}
                  isRequired={false}
                  control={control}
                />
                <ControlledDatePicker
                  name={'newTrainingCertificateExpiryDate'}
                  control={control}
                  label={'Expiry Date'}
                  defaultValue={undefined}
                  error={errors.trainingCertificateExpiryDate}
                  isRequired={false}
                />
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleNewTrainingCertificatesModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={
                    newTrainingCertificateSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null
                  }
                  disabled={newTrainingCertificateSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={newDrivingLicenseModalShow}
          onClose={handleNewDrivingLicenseModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleNewDrivingLicenseModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleAddNewDrivingLicense)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Add Driving License</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='col-span-1 p-3 border rounded-lg'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setDrivingCertificates(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                    />
                  </div>
                  <div className='col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {renderFileProgress(drivingCertificates)}
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                  <CustomTextField
                    label={'Driving License Number'}
                    placeHolder={'123ABC'}
                    name={'newDrivingLicenseNumber'}
                    defaultValue={''}
                    type={'text'}
                    error={!!errors?.drivingLicenseNumber}
                    isRequired={false}
                    control={control}
                  />
                  <CustomDropDown
                    name='newDrivingLicenseState'
                    control={control}
                    error={errors.dlState}
                    label='DL State'
                    isRequired={false}
                    optionList={USStates.map((state: any) => ({
                      key: state.key,
                      value: state.value,
                      optionString: state.optionString
                    }))}
                    defaultValue={''}
                  />
                  <ControlledDatePicker
                    name={'newDrivingLicenseExpiryDate'}
                    control={control}
                    label={'Expiry Date'}
                    defaultValue={undefined}
                    error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleNewDrivingLicenseModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={drivingLicenseSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={drivingLicenseSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={drivingLicenseEditModalShow}
          onClose={handleDrivingLicenseEditModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleDrivingLicenseEditModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleEditDrivingLicense)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Edit Driving License</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='col-span-1 p-3 border rounded-lg'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setDrivingCertificates(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                    />
                  </div>
                  <div className='col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {renderFileProgress(drivingCertificates)}
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                  <CustomTextField
                    label={'Driving License Number'}
                    placeHolder={'123ABC'}
                    name={'drivingLicenseNumber'}
                    defaultValue={drivingLicenseToEdit?.uploadedDocument?.metaData?.drivingLicenseNumber}
                    type={'text'}
                    error={!!errors?.drivingLicenseNumber}
                    isRequired={false}
                    control={control}
                  />
                  <CustomDropDown
                    name='drivingLicenseState'
                    control={control}
                    error={errors.dlState}
                    label='DL State'
                    isRequired={false}
                    optionList={USStates.map((state: any) => ({
                      key: state.key,
                      value: state.value,
                      optionString: state.optionString
                    }))}
                    defaultValue={drivingLicenseToEdit?.uploadedDocument?.metaData?.drivingLicenseState}
                  />
                  <ControlledDatePicker
                    name={'drivingLicenseExpiryDate'}
                    control={control}
                    label={'Expiry Date'}
                    defaultValue={drivingLicenseToEdit?.uploadedDocument?.expiryDate}
                    error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleDrivingLicenseEditModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={drivingLicenseSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={drivingLicenseSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={umpiDocEditModalShow}
          onClose={handleUmpiDocEditModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleUmpiDocEditModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleEditUmpiDoc)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Edit UMPI Document</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='col-span-1 p-3 border rounded-lg'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setUmpiFile(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                    />
                  </div>
                  <div className='col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(umpiFile)}</div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                  <CustomDropDown
                    name='payor'
                    control={control}
                    error={errors.dlState}
                    label='Payor'
                    isRequired={false}
                    optionList={payerOptions.map((state: any) => ({
                      key: state.key,
                      value: state.value,
                      optionString: state.optionString
                    }))}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.metaData?.payer}
                  />
                  <ControlledDatePicker
                    name={'activationDate'}
                    control={control}
                    label={'Affiliation Date'}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.metaData?.activationDate}
                    // error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                  <ControlledDatePicker
                    name={'expiryDate'}
                    control={control}
                    label={'Expiry Date'}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.expiryDate}
                    // error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleUmpiDocEditModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={umpiDocSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={umpiDocSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={newUmpiDocModalShow}
          onClose={handleNewUmpiDocModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleNewUmpiDocModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleAddNewUmpiDoc)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Add New UMPI Document</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='col-span-1 p-3 border rounded-lg'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setUmpiFile(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                    />
                  </div>
                  <div className='col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(umpiFile)}</div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                  <CustomDropDown
                    name='newPayor'
                    control={control}
                    error={errors.dlState}
                    label='Payor'
                    isRequired={false}
                    optionList={payerOptions.map((state: any) => ({
                      key: state.key,
                      value: state.value,
                      optionString: state.optionString
                    }))}
                    defaultValue={''}
                  />
                  <ControlledDatePicker
                    name={'newActivationDate'}
                    control={control}
                    label={'Affiliation Date'}
                    defaultValue={null}
                    error={errors.newActivationDate}
                    isRequired={false}
                  />
                  <ControlledDatePicker
                    name={'newExpiryDate'}
                    control={control}
                    label={'Expiry Date'}
                    defaultValue={''}
                    // error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleNewUmpiDocModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={umpiDocSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={umpiDocSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={trainingCertificateDeleteModalShow}
          onClose={handleTrainingCertificateDeleteModalShow}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleTrainingCertificateDeleteModalShow} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            {/* <form onSubmit={handleDelete}> */}
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>Delete document</h2>
            </div>
            <div>
              <Typography className='mb-7'>Are you sure you want to delete this document?</Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleTrainingCertificateDeleteModalShow}>
                NO
              </Button>
              <Button
                startIcon={deleteButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                disabled={deleteButtonLoading}
                // type='submit'
                onClick={handleDelete}
                variant='contained'
                className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
              >
                YES
              </Button>
            </div>
            {/* </form> */}
          </div>
        </Dialog>
      </FormProvider>
    </>
  )
})

export default CaregiverDocuments
