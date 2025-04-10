interface Location {
  latitude: number
  longitude: number
}

interface Caregiver {
  id: number
  gender: string
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  caregiverUMPI: string
  payRate: number
  additionalPayRate: number
  dateOfHire: string
  terminationDate: string | null
  ssn: string
  primaryPhoneNumber: string
  secondaryPhoneNumber: string
  emergencyContactNumber: string
  emergencyEmailId: string
  caregiverLevel: string
  isLicensed245d: boolean
  overtimeAgreement: boolean
}

interface ServiceAuth {
  id: number
  payer: string
  memberId: number
  serviceAuthNumber: number
  procedureCode: string
  modifierCode: string
  startDate: string
  endDate: string
  serviceRate: number
  units: number
  diagnosisCode: number
  umpiNumber: number
  reimbursementType: string
  taxonomy: number
  frequency: string
}

interface Client {
  id: number
  gender: string
  firstName: string
  middleName: string
  lastName: string
  admissionDate: string
  dischargeDate: string
  dateOfBirth: string
  pmiNumber: string
  primaryPhoneNumber: string
  primaryCellNumber: string
  additionalPhoneNumber: string
  emergencyContactName: string
  emergencyContactNumber: string
  emergencyEmailId: string
  insuranceCode: string
  clientCode: string
  medicalSpendDown: string
  amount: number
  sharedCare: string | null
  pcaChoice: string | null
  isClient: boolean
  isSignatureDraw: boolean
  profileImgUrl: string | null
  serviceAuth: ServiceAuth[]
}

interface Timelog {
  id: number
  dateOfService: string
  manualEntry: boolean
  clockIn: string
  clockOut: string
  notes: string
  reason: string | null
  tsApprovalStatus: string
  serviceName: string
  startLocation: Location
  endLocation: Location
  caregiver: Caregiver
  client: Client
}

interface BillingData {
  id: number | string
  claimDate: string | null
  billedAmount: string
  receivedAmount: string
  claimStatus: string
  billedStatus: string
  serviceDateRange?: string | null
  scheduledHrs?: string | null
  timelog?: Timelog[]
  subRows?: BillingData[]
}

export const transformBillingData = (payload: BillingData[]): BillingData[] => {
  // Format date to MM/DD/YY
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
      .getDate()
      .toString()
      .padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`
  }

  // Format amount to $XX.XX or $XX
  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount)
    return num % 1 === 0 ? `$${num}` : `$${num.toFixed(2)}`
  }

  // Calculate hours between clockIn and clockOut
  const calculateScheduledHours = (clockIn: string, clockOut: string): string => {
    const start = new Date(clockIn)
    const end = new Date(clockOut)
    const diffMs = end.getTime() - start.getTime()
    const hours = diffMs / (1000 * 60 * 60)
    return hours.toFixed(1) // Single decimal place for cleaner output (e.g., 12.5)
  }

  // Group entries by caregiver and client combination
  const groupedData: { [key: string]: BillingData[] } = {}

  payload.forEach(item => {
    const timelog = item.timelog![0]
    const key = `${timelog.caregiver.id}-${timelog.client.id}`
    groupedData[key] = groupedData[key] || []
    groupedData[key].push(item)
  })

  return Object.values(groupedData).map(group => {
    // If only one entry, return as is with formatted amounts and new fields
    if (group.length === 1) {
      const timelog = group[0].timelog![0]
      return {
        ...group[0],
        billedAmount: formatAmount(group[0].billedAmount),
        receivedAmount: formatAmount(group[0].receivedAmount),
        serviceDateRange: formatDate(timelog?.dateOfService),
        scheduledHrs: `${calculateScheduledHours(timelog?.clockIn, timelog?.clockOut)} Hrs`
      }
    }

    // For multiple entries, create parent row with subRows
    return {
      id: group.map(item => item.timelog![0].id).join('-'),
      claimDate: (() => {
        const dates = group
          .map(item => item.timelog![0].dateOfService)
          .filter(date => date)
          .sort()
        return dates.length ? `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}` : null
      })(),
      billedAmount: formatAmount(group.reduce((sum, item) => sum + parseFloat(item.billedAmount), 0).toString()),
      receivedAmount: formatAmount(group.reduce((sum, item) => sum + parseFloat(item.receivedAmount), 0).toString()),
      claimStatus: (() => {
        const statuses = [...new Set(group.map(item => item.claimStatus))]
        return statuses.length > 1 ? 'Mixed' : statuses[0]
      })(),
      billedStatus: (() => {
        const statuses = [...new Set(group.map(item => item.billedStatus))]
        return statuses.length > 1 ? 'Mixed' : statuses[0]
      })(),
      serviceDateRange: (() => {
        const dates = group
          .map(item => item.timelog![0]?.dateOfService)
          .filter(date => date)
          .sort()
        return dates.length ? `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}` : null
      })(),
      scheduledHrs: (() => {
        const totalHours = group.reduce((sum, item) => {
          const timelog = item.timelog![0]
          return sum + parseFloat(calculateScheduledHours(timelog?.clockIn, timelog?.clockOut))
        }, 0)
        return `${totalHours.toFixed(1)} Hrs`
      })(),
      subRows: group.map(item => {
        const timelog = item.timelog![0]
        return {
          ...item,
          billedAmount: formatAmount(item.billedAmount),
          receivedAmount: formatAmount(item.receivedAmount),
          serviceDateRange: formatDate(timelog?.dateOfService),
          scheduledHrs: `${calculateScheduledHours(timelog?.clockIn, timelog?.clockOut)} Hrs`,
          timelog: [...item.timelog!]
        }
      })
    }
  })
}
