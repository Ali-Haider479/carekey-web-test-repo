export type PersonalDetailsFormDataType = {
  firstName: string
  middleName: string
  lastName: string
  role: string
  caregiverUMPI: number | null
  dateOfBirth: Date | null
  caregiverLevel: string
  address: string
  city: string
  state: string
  zipCode: number | null
  ssn: string
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
