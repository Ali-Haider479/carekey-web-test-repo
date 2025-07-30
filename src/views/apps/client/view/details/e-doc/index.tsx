'use client'
import { Button, Card, CardContent, CircularProgress, Dialog, Tab, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { useEffect, useState } from 'react'
import InfoCard from '../../../components/InfoCard'
import CustomTabList from '@/@core/components/mui/TabList'
import AllFilesTab from './AllFilesTab'
import SentFilesTab from './SentFilesTab'
import RecievedFilesTab from './RecievedFilesTab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { PDFDocument, PDFTextField, PDFRadioGroup, PDFCheckBox, PDFDropdown, PDFOptionList, PDFButton } from 'pdf-lib'
import axios from 'axios'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import api from '@/utils/api'
import { generateOptions } from '@/utils/helperFunctions'
import Dropdown from '@/@core/components/mui/DropDown'
import { useParams } from 'next/navigation'
import CustomAlert from '@/@core/components/mui/Alter'

// Define PDF field type
type PdfField = {
  name: string
  type: string
}

type DeepValueType<T, P extends string> = P extends `${infer Key}[${infer Index}].${infer Rest}`
  ? Key extends keyof T
    ? T[Key] extends (infer U)[]
      ? DeepValueType<U, `${Rest}`>
      : never
    : never
  : P extends `${infer Key}[${infer Index}]`
    ? Key extends keyof T
      ? T[Key] extends (infer U)[]
        ? U
        : never
      : never
    : P extends keyof T
      ? T[P]
      : never

// Define form sections
const formSections: { [key: string]: string } = {
  'date-of-referral': 'Referral Dates',
  'date-SA-ends': 'Referral Dates',
  'date-of-assesessment': 'Referral Dates',
  'recip-info': 'Recipient Information',
  physician: 'Physician Information',
  'PCA-provider1': 'PCA Provider 1 Information',
  'PCA-provider2': 'PCA Provider 2 Information',
  language: 'Language',
  'direct-own-care': 'Direct Own Care/Responsible Party',
  diagnosis: 'Diagnosis and Living Arrangement',
  'living-arrangement': 'Diagnosis and Living Arrangement',
  'other-comments': 'Diagnosis and Living Arrangement',
  OtherPerson: 'Other Person Detail',
  Responsible: 'Responsible Party Details',
  PWD: 'Basic Details',
  Signed: 'Signature Section'
}

// Define options for radio groups and dropdowns
const fieldOptions: { [key: string]: { key: string; value: string; optionString: string }[] } = {
  '5recip-info-gender': [
    { key: '1', value: 'Male', optionString: 'Male' },
    { key: '2', value: 'Female', optionString: 'Female' }
  ],
  '16recip-info-PCAmodel': [
    { key: '1', value: 'Agency', optionString: 'Agency' },
    { key: '2', value: 'Consumer', optionString: 'Consumer' }
  ],
  '26recip-info-prepaid-health-plan': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '27recip-info-medicare-number': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '28recip-info-3rd-party-insurance': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '29recip-info-waiverAC': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '54language-interpreter': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '55language-ASL': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '56direct-own-care': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  '57direct-own-care-responsible-party-lives-with': [
    { key: '1', value: 'Yes', optionString: 'Yes' },
    { key: '2', value: 'No', optionString: 'No' }
  ],
  'major-program': [
    { key: '1', value: 'EH', optionString: 'Emergency MA' },
    { key: '2', value: 'IM', optionString: 'Institute for Mental Disease' },
    { key: '3', value: 'KK', optionString: 'MinnesotaCare KK' },
    { key: '4', value: 'LL', optionString: 'MinnesotaCare LL' },
    { key: '5', value: 'MA', optionString: 'Medical Assistance' },
    { key: '6', value: 'NM', optionString: 'Non-citizen Medical' },
    { key: '7', value: 'RM', optionString: 'Refugee Medical' },
    { key: '8', value: 'Other', optionString: 'Other' }
  ]
}

// Define mapping for field labels
const fieldLabels: { [key: string]: string } = {
  '1date-of-referral 2': 'Date of Referral',
  '2date-SA-ends 2': 'Service Agreement End Date',
  '3date-of-assesessment 2': 'Date of Assessment',
  '4recip-info-name 2': 'Recipient Name',
  '5recip-info-gender': 'Gender',
  '6recip-info-DOB 2': 'Date of Birth',
  '7recip-info-PMI 2': 'PMI Number',
  '8recip-info-phone 2': 'Phone',
  '9recip-info-address 2': 'Address',
  '10recip-info-city 2': 'City',
  '11recip-info-county 2': 'County',
  '12recip-info-state 2': 'State',
  '13recip-info-zip 2': 'Zip Code',
  '14recip-info-primary-contact 2': 'Primary Contact',
  '15recip-info-primary-contact-phone 2': 'Primary Contact Phone',
  '16recip-info-PCAmodel': 'PCA Model',
  '17recip-info-EVS-verification-date 2': 'EVS Verification Date',
  '18recip-info-major-program 2': 'Major Program EH',
  '19recip-info-major-program 2': 'Major Program IM',
  '20recip-info-major-program 2': 'Major Program KK',
  '21recip-info-major-program 2': 'Major Program LL',
  '22recip-info-major-program 2': 'Major Program MA',
  '23recip-info-major-program 2': 'Major Program NM',
  '24recip-info-major-program 2': 'Major Program RM',
  '25recip-info-major-program 2': 'Major Program Other',
  '26recip-info-prepaid-health-plan': 'Prepaid Health Plan',
  '26recip-info-prepaid-health-plan-name 2': 'Prepaid Health Plan Name',
  '27recip-info-medicare-number': 'Medicare Number',
  '27recip-info-medicare 2': 'Medicare',
  '28recip-info-3rd-party-insurance': 'Third Party Insurance',
  '28recip-info-3rd-party-insurance-name 2': 'Third Party Insurance Name',
  '29recip-info-waiverAC': 'Waiver/AC',
  '29recip-info-waiverAC-type 2': 'Waiver/AC Type',
  '30physician-name 2': 'Physician Name',
  '31physician-clinic-name 2': 'Clinic Name',
  '32physician-phone-number 2': 'Physician Phone',
  '33physician-street-address 2': 'Physician Address',
  '34physician-city 2': 'Physician City',
  '35physician-state 2': 'Physician State',
  '36physician-zip 2': 'Physician Zip',
  '37PCA-provider1-name 2': 'PCA Provider Name',
  '38PCA-provider1-taxonomy-code 2': 'Taxonomy Code',
  '39PCA-provider1-NPI 2': 'Provider NPI',
  '40PCA-provider1-street-address 2': 'Provider Address',
  '41PCA-provider1-city 2': 'Provider City',
  '42PCA-provider1-state 2': 'Provider State',
  '43PCA-provider1-zip-code 2': 'Provider Zip',
  '44PCA-provider1-phone 2': 'Provider Phone',
  '45PCA-provider1-fax 2': 'Provider Fax',
  '46PCA-provider2-name 2': 'PCA Provider Name',
  '47PCA-provider2-taxonomy-code 2': 'Taxonomy Code',
  '48PCA-provider2-NPI 2': 'Provider NPI',
  '49PCA-provider2-street-address 2': 'Provider Address',
  '50PCA-provider2-city 2': 'Provider City',
  '51PCA-provider2-state 2': 'Provider State',
  '52PCA-provider2-zip 2': 'Provider Zip',
  '53PCA-provider2-phone 2': 'Provider Phone',
  '53PCA-provider2-fax 2': 'Provider Fax',
  '54language-interpreter': 'Interpreter Needed',
  '54language-spoken 2': 'Language Spoken',
  '55language-ASL': 'ASL Needed',
  '56direct-own-care': 'Direct Own Care',
  '57direct-own-care-responsible-party 2': 'Responsible Party',
  '57direct-own-care-responsible-party-lives-with': 'Responsible Party Lives With',
  '59direct-own-care-responsible-party-phone 2': 'Responsible Party Phone',
  '60diagnosis2': 'Diagnosis 1',
  '61diagnosis1-onset-date 2': 'Diagnosis 1 Onset Date',
  '61diagnosis1-ICDcode 2': 'Diagnosis 1 ICD Code',
  '63diagnosis3': 'Diagnosis 2',
  '64diagnosis2-onset-date 2': 'Diagnosis 2 Onset Date',
  '65diagnosis2-ICDcode 2': 'Diagnosis 2 ICD Code',
  '66diagnosis4': 'Diagnosis 3',
  '67diagnosis3-onset-date 2': 'Diagnosis 3 Onset Date',
  '68diagnosis3-ICDcode 2': 'Diagnosis 3 ICD Code',
  '69living-arrangement 2': 'Living Arrangement',
  '70other-comments 2': 'Other Comments',
  'form1[0].#pageSet[0].Pages[0].PWDNameLast[0]': 'Page 0 Last Name',
  'form1[0].#pageSet[0].Pages[0].PWDmhcpIDnumber[0]': 'Page 0 MHCP ID Number',
  'form1[0].#pageSet[0].Pages[1].PWDNameLast[0]': 'Page 1 Last Name',
  'form1[0].#pageSet[0].Pages[1].PWDmhcpIDnumber[0]': 'Page 1 MHCP ID Number',
  'form1[0].#pageSet[0].Pages[2].PWDNameLast[0]': 'Page 2 Last Name',
  'form1[0].#pageSet[0].Pages[2].PWDmhcpIDnumber[0]': 'Page 2 MHCP ID Number',
  'form1[0].#pageSet[0].Pages[3].PWDNameLast[0]': 'Page 3 Last Name',
  'form1[0].#pageSet[0].Pages[3].PWDmhcpIDnumber[0]': 'Page 3 MHCP ID Number',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameFirst[0]': 'Person First Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameMI[0]': 'Person MI',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameLast[0]': 'Person Last Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDmhcpIDnumber[0]': 'Person MHCP ID Number',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameFirstResponsible[0]': 'First Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameLastResponsible[0]': 'Last Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].ProviderName[0]': 'Provider Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NPIUMPI[0]': 'Provider NPI or UMPI',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameFirstRep[0]': 'Provider Rep First Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameLastRep[0]': 'Provider Rep Last Name',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].FirstOtherPerson[0].NameFirst[0]': ' First Name 0',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].FirstOtherPerson[0].NameMI[0]': ' MI 0',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].FirstOtherPerson[0].NameLast[0]': 'Last Name 0',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].FirstOtherPerson[0].MHCPidNumber[0]': 'MHCP ID Number 0',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].SecondtOtherPerson[0].NameFirst[0]': ' First Name 1',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].SecondtOtherPerson[0].NameMI[0]': ' MI 1',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].SecondtOtherPerson[0].NameLast[0]': 'Last Name 1',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].SecondtOtherPerson[0].MHCPidNumber[0]':
    'Other People MHCP ID Number 1',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].sfSignatures[0].PWDSignatureField[0]': 'Person Signature',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].sfSignatures[0].PWDDateSigned[0]': 'Person Date Signed',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].sfSignatures[0].RepSignatureField[0]': 'Responsible Party Signature',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].sfSignatures[0].RepDateSigned[0]': 'Responsible Party Date Signed',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].sfSignatures[0].ProviderSignatureField[0]': 'Provider Signature',
  'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfAgree[0].sfSignatures[0].ProviderDateSigned[0]': 'Provider Signature Date'
}

const E_Document = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState('allFilesTab')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [clientDocsLoading, setClientDocsLoading] = useState<boolean>(false)
  const [pdfObj, setPdfObj] = useState<any>()
  const [selectedForm, setSelectedForm] = useState<any>('')
  const [caseManagerEmail, setCaseManagerEmail] = useState<any>('')
  const [pdfBlob, setPdfBlob] = useState<any>()
  const [tenantDocuments, setTenantDocuments] = useState<any>([])
  const [clientDocuments, setClientDocuments] = useState<any>([])
  const [pdfFields, setPdfFields] = useState<PdfField[]>([])
  const [clientData, setClientData] = useState<any>(null)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const { id } = useParams()
  const [docTitle, setDocTitle] = useState<string>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get(`/client/detail/${id}`)
      console.log('CLIENT RES', response.data)
      setClientData(response.data)
    } catch (error) {
      console.error('Error fetching data', error)
    }
  }
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  // Initialize form
  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = methods

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/tenant/tenant-documents/${authUser?.tenant?.id}`)
      const options = generateOptions(response.data)
      setTenantDocuments(options)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const fetchClientsForm = async () => {
    try {
      setClientDocsLoading(true)
      setLoading(true)
      const clientDocs = await api.get(`/client/client-documents/${id}`)
      const clientData = await api.get(`/client/case-manager/${id}`)
      setCaseManagerEmail(clientData?.data?.clientCaseManager?.caseManagerEmail)
      setClientDocuments(clientDocs?.data)
      setClientDocsLoading(false)
      setLoading(false)
    } catch (error) {
      setClientDocsLoading(false)
      setLoading(false)
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
    fetchClientsForm()
  }, [])

  // Load and extract PDF fields

  const GetPrePopulatedPdf = async (key: any) => {
    try {
      setLoading(true)
      const { data: existingPdf } = await axios.get(`https://carekey-docs-dev.s3.us-east-1.amazonaws.com/${key}`, {
        responseType: 'arraybuffer'
      })

      const pdfDoc = await PDFDocument.load(existingPdf, { ignoreEncryption: true })
      const docTitle = pdfDoc.getTitle()
      setDocTitle(docTitle)

      const form = pdfDoc.getForm()
      const fields = form.getFields()

      const extractedFields: PdfField[] = fields.map(field => {
        let type = 'unknown'
        if (field instanceof PDFTextField) {
          type = 'PDFTextField'
        } else if (field instanceof PDFRadioGroup) {
          type = 'PDFRadioGroup'
        } else if (field instanceof PDFCheckBox) {
          type = 'PDFCheckBox'
        } else if (field instanceof PDFDropdown) {
          type = 'PDFDropdown'
        } else if (field instanceof PDFOptionList) {
          type = 'PDFOptionList'
        } else if (field instanceof PDFButton) {
          type = 'PDFButton'
        }
        return {
          name: field.getName(),
          type
        }
      })

      setPdfFields(extractedFields)

      // Pre-populate fields with client data
      if (docTitle?.includes('DHS-3244P')) {
        const nameField = form.getTextField('4recip-info-name 2')
        const pmiField = form.getTextField('7recip-info-PMI 2')
        const genderField = form.getRadioGroup('5recip-info-gender')
        const dobField = form.getTextField('6recip-info-DOB 2')
        const phoneField = form.getTextField('8recip-info-phone 2')
        const addressField = form.getTextField('9recip-info-address 2')
        const cityField = form.getTextField('10recip-info-city 2')
        const stateField = form.getTextField('12recip-info-state 2')
        const zipField = form.getTextField('13recip-info-zip 2')
        const primaryContactField = form.getTextField('14recip-info-primary-contact 2')
        const primaryContactPhoneField = form.getTextField('15recip-info-primary-contact-phone 2')
        const physicianNameField = form.getTextField('30physician-name 2')
        const physicianClinicField = form.getTextField('31physician-clinic-name 2')
        const physicianPhoneField = form.getTextField('32physician-phone-number 2')
        const physicianAddressField = form.getTextField('33physician-street-address 2')
        const physicianCityField = form.getTextField('34physician-city 2')
        const physicianStateField = form.getTextField('35physician-state 2')
        const physicianZipField = form.getTextField('36physician-zip 2')

        // Set client name
        nameField.setText(`${clientData?.firstName} ${clientData?.lastName}`)
        nameField.setFontSize(8)
        // nameField.setTextColor(rgb(0, 0, 0))

        // Set PMI number
        pmiField.setText(clientData?.pmiNumber || 'PMI-3010')
        pmiField.setFontSize(8)
        // pmiField.setTextColor(rgb(0, 0, 0))

        // Set date of birth
        dobField.setText(clientData?.dateOfBirth || '26 Feb,2025')
        dobField.setFontSize(8)
        // dobField.setTextColor(rgb(0, 0, 0))

        // Set gender
        const genderValue = clientData?.gender?.toLowerCase() === 'female' ? 'Female' : 'Male'
        genderField.select(genderValue)

        // Set phone number
        phoneField.setText(clientData?.primaryPhoneNumber || '')
        phoneField.setFontSize(8)
        // phoneField.setTextColor(rgb(0, 0, 0))

        // Set address (prefer Residential address)
        const residentialAddress = clientData?.addresses?.find(
          (addr: any) => addr.address.addressType === 'Residential'
        )?.address
        addressField.setText(residentialAddress?.address || clientData?.addresses?.[0]?.address?.address || '')
        addressField.setFontSize(8)
        // addressField.setTextColor(rgb(0, 0, 0))

        cityField.setText(residentialAddress?.city || clientData?.addresses?.[0]?.address?.city || '')
        cityField.setFontSize(8)
        // cityField.setTextColor(rgb(0, 0, 0))

        stateField.setText(residentialAddress?.state || clientData?.addresses?.[0]?.address?.state || '')
        stateField.setFontSize(8)
        // stateField.setTextColor(rgb(0, 0, 0))

        zipField.setText(residentialAddress?.zipCode || clientData?.addresses?.[0]?.address?.zipCode || '')
        zipField.setFontSize(8)
        // zipField.setTextColor(rgb(0, 0, 0))

        // Set primary contact (emergency contact)
        primaryContactField.setText(clientData?.emergencyContactName || '')
        primaryContactField.setFontSize(8)
        // primaryContactField.setTextColor(rgb(0, 0, 0))

        primaryContactPhoneField.setText(clientData?.emergencyContactNumber || '')
        primaryContactPhoneField.setFontSize(8)
        // primaryContactPhoneField.setTextColor(rgb(0, 0, 0))

        // Set physician details
        physicianNameField.setText(clientData?.clientPhysician?.name || '')
        physicianNameField.setFontSize(8)
        // physicianNameField.setTextColor(rgb(0, 0, 0))

        physicianClinicField.setText(clientData?.clientPhysician?.clinicName || '')
        physicianClinicField.setFontSize(8)
        // physicianClinicField.setTextColor(rgb(0, 0, 0))

        physicianPhoneField.setText(
          clientData?.clientPhysician?.phoneNumber || clientData?.clientPhysician?.primaryPhoneNumber || ''
        )
        physicianPhoneField.setFontSize(8)
        // physicianPhoneField.setTextColor(rgb(0, 0, 0))

        physicianAddressField.setText(clientData?.clientPhysician?.address || '')
        physicianAddressField.setFontSize(8)
        // physicianAddressField.setTextColor(rgb(0, 0, 0))

        physicianCityField.setText(clientData?.clientPhysician?.city || '')
        physicianCityField.setFontSize(8)
        // physicianCityField.setTextColor(rgb(0, 0, 0))

        physicianStateField.setText(clientData?.clientPhysician?.state || '')
        physicianStateField.setFontSize(8)
        // physicianStateField.setTextColor(rgb(0, 0, 0))

        physicianZipField.setText(clientData?.clientPhysician?.zipCode || '')
        physicianZipField.setFontSize(8)
        // physicianZipField.setTextColor(rgb(0, 0, 0))
      } else if (docTitle?.includes('DHS-6893E')) {
        const firstNameField = form.getTextField('form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameFirst[0]')
        const lastNameField = form.getTextField('form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameLast[0]')
        const npiUmpiNumber = form.getTextField('form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NPIUMPI[0]')
        const resPartyFirstName = form.getTextField(
          'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameFirstResponsible[0]'
        )
        const resPartyLastName = form.getTextField(
          'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameLastResponsible[0]'
        )

        firstNameField.setText(clientData?.firstName || '')
        firstNameField.setFontSize(8)

        lastNameField.setText(clientData?.lastName || '')
        lastNameField.setFontSize(8)

        npiUmpiNumber.setText(clientData?.pmiNumber || '')
        npiUmpiNumber.setFontSize(8)

        resPartyFirstName.setText(clientData?.clientResponsibilityParty?.name?.split(' ')[0] || '')
        resPartyFirstName.setFontSize(8)

        resPartyLastName.setText(clientData?.clientResponsibilityParty?.name?.split(' ')[1] || '')
        resPartyLastName.setFontSize(8)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      setPdfObj(pdfBytes)
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)
    } catch (error) {
      console.error('Error modifying PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDeepValue<T extends Record<string, any>, P extends string>(
    obj: T | null | undefined,
    path: P
  ): DeepValueType<T, P> | undefined {
    return path.split('.').reduce((o: any, p: string) => {
      if (o === null || o === undefined) return undefined

      const arrayMatch = p.match(/(\w+)\[(\d+)\]/)
      if (arrayMatch) {
        const prop = arrayMatch[1]
        const index = parseInt(arrayMatch[2], 10)
        return o[prop]?.[index]
      }
      return o[p]
    }, obj)
  }

  // Handle form save (for preview)
  const handleSave = async (data: any) => {
    try {
      console.log('Form Data:', data)
      const pdfDoc = await PDFDocument.load(pdfObj)
      const form = pdfDoc.getForm()
      console.log('EDOCS EXTRACTED FIELDS DURING SAVE', pdfFields)

      // Update PDF fields based on form data
      pdfFields.forEach(field => {
        try {
          if ((field.type === 'PDFTextField' && data[field.name]) || getDeepValue(data, field.name)) {
            const textField = form.getTextField(field.name)
            textField.setText(data[field.name] || getDeepValue(data, field.name))
            textField.setFontSize(8)
            // textField.setTextColor(rgb(0, 0, 0))
          } else if (field.type === 'PDFRadioGroup' && data[field.name]) {
            form.getRadioGroup(field.name).select(data[field.name])
          } else if (field.type === 'PDFCheckBox' && data[field.name]) {
            form.getCheckBox(field.name).check()
          }
        } catch (e) {
          console.error(`Error setting field ${field.name}:`, e)
        }
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)
      setPdfObj(pdfBytes)
      console.log('PDF saved successfully, new blob URL:', blobUrl)
    } catch (error) {
      console.error('Error saving PDF:', error)
    }
  }

  // Handle upload to S3
  const handleUpload = async () => {
    if (!pdfObj) {
      console.error('No PDF data available to upload')
      return
    }

    try {
      // Create a File object from pdfObj
      const pdfFile = new File([pdfObj], `filled_form_${Date.now()}.pdf`, { type: 'application/pdf' })
      // const email = 'usamamanghat917@gmail.com'
      // Create FormData and append the File
      const formData = new FormData()
      formData.append('file', pdfFile)

      // Make API call to upload to S3
      await api.post(`/client/upload-e-docs/${id}/${caseManagerEmail}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await fetchClientsForm()
      setAlertOpen(true)
      setAlertProps({
        message: 'The form is saved successfully.',
        severity: 'success'
      })
      setOpenModal(false)
      console.log('PDF uploaded successfully to S3')
    } catch (error) {
      console.error('Error uploading PDF to S3:', error)
    }
  }

  // Handle form selection
  const onFormChange = (e: any) => {
    setSelectedForm(e.target.value)
    GetPrePopulatedPdf(e.target.value)
  }

  // Handle dialog close
  const onClose = () => {
    setOpenModal(false)
    setSelectedForm('')
    setPdfBlob(null)
    setPdfFields([])
    reset()
  }

  const handleFillReferenceButton = () => {
    if (!caseManagerEmail) {
      setAlertOpen(true)
      setAlertProps({
        message: 'Create case manager to proceed further.',
        severity: 'error'
      })
      return
    }
    setOpenModal(true)
  }

  // Group fields by section
  const groupedFields: { [key: string]: PdfField[] } = {}
  pdfFields.forEach(field => {
    if (field.name === 'clear_button 2' || field.name.includes('Clear')) return // Skip buttons
    const sectionKey = Object.keys(formSections).find(key => field.name.includes(key))
    const section = sectionKey ? formSections[sectionKey] : 'Other'
    if (!groupedFields[section]) {
      groupedFields[section] = []
    }
    groupedFields[section].push(field)
  })

  // Render form field
  // const renderFormField = (field: PdfField) => {
  //   console.log("FIELDS--------",field);
  //   const label = fieldLabels[field.name] || field.name
  //   const error = errors[field.name]

  //   if (field.type === 'PDFTextField') {
  //     let maxLength: number | undefined
  //     // if (field.name.includes('state') || field.name.includes('State')) {
  //     //   maxLength = 2
  //     // }
  //     return (
  //       <Grid
  //         size={{ xs: 12, sm: field.name.includes('state') || field.name.includes('zip') ? 3 : 6 }}
  //         key={field.name}
  //       >
  //         <CustomTextField
  //           label={label}
  //           placeHolder={label}
  //           name={field.name}
  //           defaultValue=''
  //           type='text'
  //           maxLength={maxLength}
  //           error={error}
  //           control={control}
  //           isRequired={true}
  //         />
  //       </Grid>
  //     )
  //   } else if (field.type === 'PDFRadioGroup' || field.name.includes('major-program')) {
  //     const options = fieldOptions[field.name] || fieldOptions['major-program'] || []
  //     return (
  //       <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
  //         <CustomDropDown
  //           name={field.name}
  //           control={control}
  //           error={error}
  //           label={label}
  //           optionList={options}
  //           defaultValue=''
  //           isRequired={false}
  //         />
  //       </Grid>
  //     )
  //   } else if (field.type === 'PDFCheckBox') {
  //     // Checkboxes are handled via dropdown for major-program
  //     return null // Skip individual checkboxes as they are grouped in dropdown
  //   }
  //   return null
  // }

  const renderFormField = (field: PdfField) => {
    if (field.name.includes('Pages')) return
    const label = fieldLabels[field.name] || field.name
    const error = errors[field.name]

    // Determine default value based on clientData
    let defaultValue = ''
    const residentialAddress = clientData?.addresses?.find(
      (addr: any) => addr.address.addressType === 'Residential'
    )?.address

    if (docTitle?.includes('DHS-3244P')) {
      if (field.name === '4recip-info-name 2') {
        defaultValue = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`
      } else if (field.name === '7recip-info-PMI 2') {
        defaultValue = clientData?.pmiNumber || 'PMI-3010'
      } else if (field.name === '6recip-info-DOB 2') {
        defaultValue = clientData?.dateOfBirth || '26 Feb,2025'
      } else if (field.name === '8recip-info-phone 2') {
        defaultValue = clientData?.primaryPhoneNumber || ''
      } else if (field.name === '9recip-info-address 2') {
        defaultValue = residentialAddress?.address || clientData?.addresses?.[0]?.address?.address || ''
      } else if (field.name === '10recip-info-city 2') {
        defaultValue = residentialAddress?.city || clientData?.addresses?.[0]?.address?.city || ''
      } else if (field.name === '12recip-info-state 2') {
        defaultValue = residentialAddress?.state || clientData?.addresses?.[0]?.address?.state || ''
      } else if (field.name === '13recip-info-zip 2') {
        defaultValue = residentialAddress?.zipCode || clientData?.addresses?.[0]?.address?.zipCode || ''
      } else if (field.name === '14recip-info-primary-contact 2') {
        defaultValue = clientData?.emergencyContactName || ''
      } else if (field.name === '15recip-info-primary-contact-phone 2') {
        defaultValue = clientData?.emergencyContactNumber || ''
      } else if (field.name === '30physician-name 2') {
        defaultValue = clientData?.clientPhysician?.name || ''
      } else if (field.name === '31physician-clinic-name 2') {
        defaultValue = clientData?.clientPhysician?.clinicName || ''
      } else if (field.name === '32physician-phone-number 2') {
        defaultValue = clientData?.clientPhysician?.phoneNumber || clientData?.clientPhysician?.primaryPhoneNumber || ''
      } else if (field.name === '33physician-street-address 2') {
        defaultValue = clientData?.clientPhysician?.address || ''
      } else if (field.name === '34physician-city 2') {
        defaultValue = clientData?.clientPhysician?.city || ''
      } else if (field.name === '35physician-state 2') {
        defaultValue = clientData?.clientPhysician?.state || ''
      } else if (field.name === '36physician-zip 2') {
        defaultValue = clientData?.clientPhysician?.zipCode || ''
      } else if (field.name === '5recip-info-gender') {
        defaultValue = clientData?.gender?.toLowerCase() === 'female' ? 'Female' : 'Male'
      }
    } else if (docTitle?.includes('DHS-6893E')) {
      if (field.name === 'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameFirst[0]') {
        defaultValue = `${clientData?.firstName || ''}`
      } else if (field.name === 'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].PWDNameLast[0]') {
        defaultValue = `${clientData?.lastName || ''}`
      } else if (field.name === 'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NPIUMPI[0]') {
        defaultValue = clientData?.pmiNumber || 'PMI-3010'
      } else if (field.name === 'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameFirstResponsible[0]') {
        defaultValue = clientData?.clientResponsibilityParty?.name?.split(' ')[0] || ''
      } else if (field.name === 'form1[0].P1[0].sfIntro[0].sfPWDs[0].sfInfo[0].NameLastResponsible[0]') {
        defaultValue = clientData?.clientResponsibilityParty?.name?.split(' ')[1] || ''
      }
    }

    if (field.type === 'PDFTextField') {
      let maxLength: number | undefined
      if (field.name.includes('state') || field.name.includes('State')) {
        maxLength = 2
      } else if (field.name.includes('MI')) {
        maxLength = 1
      } else if (field.name.includes('NPIUMPI')) {
        maxLength = 10
      }
      return (
        <Grid
          size={{ xs: 12, sm: field.name.includes('state') || field.name.includes('zip') ? 3 : 6 }}
          key={field.name}
        >
          <CustomTextField
            label={label}
            placeHolder={label}
            name={field.name}
            defaultValue={defaultValue}
            type='text'
            maxLength={maxLength}
            error={error}
            control={control}
            isRequired={false}
          />
        </Grid>
      )
    } else if (field.type === 'PDFRadioGroup' || field.name.includes('major-program')) {
      const options = fieldOptions[field.name] || fieldOptions['major-program'] || []
      return (
        <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
          <CustomDropDown
            name={field.name}
            control={control}
            error={error}
            label={label}
            optionList={options}
            defaultValue={defaultValue}
            isRequired={false}
          />
        </Grid>
      )
    } else if (field.type === 'PDFCheckBox') {
      // Checkboxes are handled via dropdown for major-program
      return null // Skip individual checkboxes as they are grouped in dropdown
    }
    return null
  }

  return (
    <>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      <TabContext value={activeTab}>
        <Dialog
          open={openModal}
          onClose={onClose}
          closeAfterTransition={false}
          sx={{
            '& .MuiDialog-paper': {
              overflow: 'visible',
              width: '90vw',
              height: '90vh',
              maxWidth: '1600px',
              maxHeight: '1000px',
              position: 'relative'
            }
          }}
        >
          <DialogCloseButton onClick={onClose} disableRipple>
            <i className='text-red-500 bx-x' />
          </DialogCloseButton>

          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <CircularProgress />
            </div>
          )}
          <div className='flex justify-between p-3'>
            <div className='flex gap-2 items-center justify-center'>
              <Typography className='text-base font-thin'>Select Form:</Typography>
              <Dropdown
                className='w-80'
                placeholder='Select Form'
                value={selectedForm}
                setValue={(e: string) => setSelectedForm(e)}
                options={tenantDocuments}
                onChange={onFormChange}
              />
            </div>

            {selectedForm && pdfBlob && !loading && (
              <Button variant='contained' onClick={handleUpload} disabled={!isDirty}>
                Save
              </Button>
            )}
          </div>

          {selectedForm && pdfBlob && !loading && (
            <Grid className='w-full h-full flex flex-row'>
              <Card className='w-[50%] h-[100%] overflow-y-auto'>
                <Typography className='font-semibold text-2xl m-4'>
                  {docTitle || 'Referral for Reassessment for PCA Services Form'}
                </Typography>
                <CardContent>
                  <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleSave)} autoComplete='off'>
                      {Object.entries(groupedFields).map(([section, fields]) => (
                        <div key={section}>
                          <Typography className='text-xl mb-2 mt-6'>{section}</Typography>
                          <Grid container spacing={4}>
                            {fields.map(field => renderFormField(field))}
                          </Grid>
                        </div>
                      ))}
                      <div className='flex gap-4 justify-end mt-5 mb-20'>
                        <Button variant='outlined' color='secondary' onClick={onClose}>
                          CANCEL
                        </Button>
                        <Button type='submit' variant='contained'>
                          View
                        </Button>
                      </div>
                    </form>
                  </FormProvider>
                </CardContent>
              </Card>
              <iframe key={pdfBlob} className='w-[50%] h-[100%]' src={pdfBlob} title='PDF Preview' />
            </Grid>
          )}
        </Dialog>
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <InfoCard />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <Card className='rounded-lg shadow-md'>
              <div className='flex justify-center'>
                <div className='w-full px-4'>
                  <CardContent className='flex justify-between items-center mb-1'>
                    <h2 className='text-xl font-semibold'>Electronic Documentation</h2>
                    <Button
                      variant='contained'
                      onClick={handleFillReferenceButton}
                      startIcon={loading ? <CircularProgress size={20} color='inherit' /> : null}
                      disabled={loading}
                    >
                      Fill Reference Form
                    </Button>
                  </CardContent>
                  <CustomTabList onChange={handleTabChange} className='w-full' pill='true'>
                    <Tab value={'allFilesTab'} label={'ALL FILES'} className='w-1/3' />
                    <Tab value={'sentFilesTab'} label={'SENT FILES'} className='w-1/3' />
                    <Tab value={'recievedFilesTab'} label={'RECIEVED FILES'} className='w-1/3' />
                  </CustomTabList>
                </div>
              </div>
              <CardContent>
                <div>
                  <TabPanel value='allFilesTab'>
                    <AllFilesTab
                      clientDocuments={clientDocuments}
                      clientDocsLoading={clientDocsLoading}
                      onDocumentDeleted={fetchClientsForm}
                    />
                  </TabPanel>
                  <TabPanel value='sentFilesTab'>
                    <SentFilesTab
                      clientDocuments={clientDocuments}
                      clientDocsLoading={clientDocsLoading}
                      onDocumentDeleted={fetchClientsForm}
                    />
                  </TabPanel>
                  <TabPanel value='recievedFilesTab'>
                    <RecievedFilesTab
                      clientDocuments={clientDocuments}
                      clientDocsLoading={clientDocsLoading}
                      onDocumentDeleted={fetchClientsForm}
                    />
                  </TabPanel>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default E_Document
