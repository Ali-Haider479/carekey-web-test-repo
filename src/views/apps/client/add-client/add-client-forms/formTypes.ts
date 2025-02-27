export type PersonalDetailsFormDataType = {
  firstName: string
  middleName: string
  lastName: string
  admissionDate: Date | null
  dateOfDischarge: Date | null
  dateOfBirth: Date | null
  pmiNumber: number | null
  gender: string
  socialSecurity: number | null
  emailId: string
  primaryPhoneNumber: string
  additionalPhoneNumber: string
  emergencyContactName: string
  emergencyContactNumber: number
  emergencyEmail: string
  sharedCare: string
  insuranceCode: number
  clientCode: number
  medicalSpendDown: string
  medicalSpendDown2: string
  amount: number
  pcaChoice: string
  primaryResidentialAddress: string
  primaryResidentialCity: string
  primaryResidentialState: string
  primaryResidentialZipCode: number
  mailingAddress: string
  mailingCity: string
  mailingState: string
  mailingZipCode: number
  secondaryResidentialAddress: string
  secondaryResidentialCity: string
  secondaryResidentialState: number
  secondaryResidentialZipCode: number
  clientResponsibilityPartyName: string
  clientResponsibilityPartyEmailAddress: string
  clientResponsibilityPartyPhoneNumber: number
  clientResponsibilityPartyFaxNumber: number
  clientResponsibilityPartyCaseManagerExtension: number
  clientResponsibilityPartyNote: string
}

export type PhysicianAndCaseMangerFormDataType = {
  physicianName: string
  clinicName: string
  phoneNumber: number
  faxNumber: number
  physicalAddress: string
  physicianCity: string
  physicianState: string
  physicianZipCode: number
  primaryPhoneNumber: number
  caseManagerName: string
  caseMangerEmail: string
  caseMangerPhoneNumber: number
  caseManagerFaxNumber: number
  caseManagerExtension: number
  caseMangerNote: string
}

export type clientServiceFormDataType = {
  caregiver: string
  service: string
  serviceNotes: string
  serviceActivities: string
  lastCompletedDate: Date | null
  dueDate: Date | null
  qpAssigned: string
  notes: string
  caregiverId?: number
  assignmentDate?: Date | null
  unassignmentDate?: Date | null
  assignmentNotes?: string
  scheduleHours?: number
  enableAssignCaregiver: boolean
}
