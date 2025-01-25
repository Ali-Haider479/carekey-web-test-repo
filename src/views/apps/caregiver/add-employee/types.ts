export type PersonalDetailsFormDataType = {
  firstName: string
  middleName: string
  lastName: string
  role: string
  caregiverUMPI: string | null
  dateOfBirth: Date | null
  caregiverLevel: string
  address: string
  city: string
  state: string
  zip: number | null
  SSN: string
  payRate: number | null
  dateOfHire: Date | null
  terminationDate: Date | null
  gender: string
  primaryPhoneNumber: string
  secondaryPhoneNumber: string
  emergencyContactNumber: string
  emergencyEmailId: string
  overtimeAgreement: boolean
  isLicensed245d: boolean
  allergies: string
  specialRequests: string
  comments: string
}
