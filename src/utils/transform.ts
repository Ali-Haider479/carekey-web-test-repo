interface Location {
  latitude: number
  longitude: number
}

interface Signature {
  id: number
  signatureStatus: string
  duration: string
  caregiverSignature: string
  clientSignature: string
}

interface PayPeriodHistory {
  id: number
  startDate: string
  endDate: string | null
  numberOfWeeks: number
}

interface Caregiver {
  id: number
  firstName: string
  middleName: string
  lastName: string
  [key: string]: any
}

interface Client {
  id: number
  firstName: string
  middleName: string
  lastName: string
  serviceAuth: any
  [key: string]: any
}

interface Service {
  evv: boolean
  id: number
  name: string
  procedureCode: string
  modifierCode: string
}

interface ClientService {
  evvEnforce: boolean
  id: number
  note: string
  service: Service
  serviceAuthService: Service
}

interface TimeEntry {
  id: number
  dateOfService: string
  manualEntry: boolean
  clockIn: string
  clockOut: string
  notes: string
  tsApprovalStatus: string
  serviceName: string
  updatedAt: any
  updatedBy: any
  startLocation: Location
  endLocation: Location
  payPeriodHistory: PayPeriodHistory
  signature: Signature
  caregiver: Caregiver
  client: Client
  checkedActivity: any
  billing: any
  clientService: ClientService
}

interface GroupedTimeEntry {
  id: number | string
  dateOfService: string
  caregiver: Pick<Caregiver, 'id' | 'firstName' | 'middleName' | 'lastName'>
  client: Pick<Client, 'id' | 'firstName' | 'middleName' | 'lastName'>
  tsApprovalStatus: string
  serviceName: string
  signature: Signature // Added signature to main object
  subRows?: TimeEntry[] // Includes full TimeEntry with signature
  clientService: Pick<ClientService, 'id' | 'evvEnforce' | 'note' | 'service' | 'serviceAuthService'>
}

export function transformTimesheetDataTwo(entries: TimeEntry[]): GroupedTimeEntry[] {
  if (!Array.isArray(entries) || !entries.length) {
    return []
  }
  console.log('ENTRIES', entries)

  // Group entries by caregiver.id and client.id
  const groupedByPair: { [key: string]: TimeEntry[] } = {}

  entries.forEach(entry => {
    const key = `${entry.caregiver.id}-${entry.client.id}`
    if (!groupedByPair[key]) {
      groupedByPair[key] = []
    }
    groupedByPair[key].push(entry)
  })

  // Function to calculate hours worked between clockIn and clockOut
  const calculateHoursWorked = (clockIn: string, clockOut: string): string => {
    const start = new Date(clockIn).getTime()
    const end = new Date(clockOut).getTime()
    const diffInMs = end - start
    if (diffInMs <= 0) return '---'
    const hours = (diffInMs / (1000 * 60 * 60)).toFixed(2)
    return hours === '0.00' ? '---' : hours
  }

  // Function to get activities as comma-separated string for a single entry
  const getActivities = (entry: TimeEntry): string => {
    const activities = entry.checkedActivity?.activities?.map((act: any) => act.title) || []
    return activities.length > 0 ? activities.join(', ') : '---'
  }

  // Function to get unique activities across all entries as comma-separated string
  const getUniqueActivities = (entries: TimeEntry[]): string => {
    const allActivities = entries.flatMap(
      entry => entry.checkedActivity?.activities?.map((act: any) => act.title) || []
    )
    const uniqueActivities = [...new Set(allActivities)]
    return uniqueActivities.length > 0 ? uniqueActivities.join(', ') : '---'
  }

  // Transform each group into a GroupedTimeEntry
  return Object.entries(groupedByPair).map(([key, groupEntries]) => {
    const { caregiver, client, clientService } = groupEntries[0]

    // Ensure clientService is properly structured
    const formattedClientService: Pick<ClientService, 'id' | 'evvEnforce' | 'note' | 'service' | 'serviceAuthService'> =
      {
        id: clientService?.id ?? 0, // Provide fallback if undefined
        evvEnforce: clientService?.evvEnforce ?? true,
        note: clientService?.note ?? '',
        service: clientService?.service,
        serviceAuthService: clientService?.serviceAuthService
      }

    // Find billing data where claimStatus is 'Approved'
    const approvedBilling = groupEntries.find(entry => entry.billing?.claimStatus === 'Approved')?.billing || {}

    // If only one entry, return it directly without subRows
    if (groupEntries.length === 1) {
      const entry = groupEntries[0]
      return {
        id: entry.id,
        dateOfService: new Date(entry.dateOfService).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }),
        caregiver: {
          id: caregiver.id,
          firstName: caregiver.firstName,
          middleName: caregiver.middleName,
          lastName: caregiver.lastName
        },
        client: {
          id: client.id,
          firstName: client.firstName,
          middleName: client.middleName,
          lastName: client.lastName,
          serviceAuth: client.serviceAuth
        },
        clientService: formattedClientService, // Always include clientService
        tsApprovalStatus: entry.tsApprovalStatus,
        serviceName: entry.serviceName,
        updatedBy: entry.updatedBy,
        updatedAt: entry.updatedAt,
        clockIn: entry.clockIn,
        startLocation: entry.startLocation,
        endLocation: entry.endLocation,
        clockOut: entry.clockOut,
        signature: entry.signature,
        hrsWorked: calculateHoursWorked(entry.clockIn, entry.clockOut),
        activities: getActivities(entry),
        billing: entry.billing
      }
    }

    // For multiple entries, sort and group
    const sortedEntries = [...groupEntries].sort(
      (a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
    )

    const uniqueServices = [...new Set(sortedEntries.map(entry => entry.serviceName))]
    const startDate = new Date(sortedEntries[0].dateOfService)
    const endDate = new Date(sortedEntries[sortedEntries.length - 1].dateOfService)

    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

    const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`
    const hasAllSameStatus = sortedEntries.every(entry => entry.tsApprovalStatus === sortedEntries[0].tsApprovalStatus)
    const hasAllSameSignatureStatus = sortedEntries.every(
      entry => entry.signature.signatureStatus === sortedEntries[0].signature.signatureStatus
    )
    const latestEndLocation = sortedEntries[sortedEntries.length - 1].endLocation
    const latestStartLocation = sortedEntries[sortedEntries.length - 1].startLocation
    const mostRecentSignature = sortedEntries[sortedEntries.length - 1].signature

    // Calculate total hours worked for all entries
    const totalHours = sortedEntries.reduce((sum, entry) => {
      const hours = parseFloat(calculateHoursWorked(entry.clockIn, entry.clockOut))
      return isNaN(hours) ? sum : sum + hours
    }, 0)
    const hrsWorked = totalHours > 0 ? totalHours.toFixed(2) : '---'

    // Get unique activities for the parent row
    const parentActivities = getUniqueActivities(sortedEntries)

    // Add activities to each subRow entry
    const subRowsWithActivities = sortedEntries.map(entry => ({
      ...entry,
      activities: getActivities(entry) // Add activities specific to this entry
    }))

    return {
      id: key,
      dateOfService: dateRange,
      caregiver: {
        id: caregiver.id,
        firstName: caregiver.firstName,
        middleName: caregiver.middleName,
        lastName: caregiver.lastName
      },
      client: {
        id: client.id,
        firstName: client.firstName,
        middleName: client.middleName,
        lastName: client.lastName,
        serviceAuth: client.serviceAuth
      },
      tsApprovalStatus: hasAllSameStatus ? sortedEntries[0].tsApprovalStatus : 'Mixed',
      serviceName: uniqueServices.join(', '),
      clockIn: '',
      clockOut: '',
      hrsWorked,
      activities: parentActivities,
      signature: {
        ...mostRecentSignature,
        signatureStatus: hasAllSameSignatureStatus ? sortedEntries[0].signature.signatureStatus : 'Mixed'
      },
      subRows: subRowsWithActivities,
      startLocation: latestStartLocation,
      endLocation: latestEndLocation,
      billing: Object.keys(approvedBilling).length > 0 ? { dummyRow: true, ...approvedBilling } : approvedBilling,
      clientService: formattedClientService // Always include clientService
    }
  })
}

// interface Location {
//   latitude: number
//   longitude: number
// }

// interface Signature {
//   id: number
//   signatureStatus: string
//   duration: string
//   caregiverSignature: string
//   clientSignature: string
// }

// interface PayPeriodHistory {
//   id: number
//   startDate: string
//   endDate: string | null
//   numberOfWeeks: number
// }

// interface Caregiver {
//   id: number
//   firstName: string
//   middleName: string
//   lastName: string
//   [key: string]: any
// }

// interface Client {
//   id: number
//   firstName: string
//   middleName: string
//   lastName: string
//   [key: string]: any
// }

// interface TimeEntry {
//   id: number
//   dateOfService: string
//   manualEntry: boolean
//   clockIn: string
//   clockOut: string
//   notes: string
//   tsApprovalStatus: string
//   serviceName: string
//   startLocation: Location
//   endLocation: Location
//   payPeriodHistory: PayPeriodHistory
//   signature: Signature
//   caregiver: Caregiver
//   client: Client
//   checkedActivity: { id: number }
// }

// interface GroupedTimeEntry {
//   id: number | string
//   dateOfService: string
//   caregiver: Pick<Caregiver, 'id' | 'firstName' | 'middleName' | 'lastName'>
//   client: Pick<Client, 'id' | 'firstName' | 'middleName' | 'lastName'>
//   tsApprovalStatus: string
//   serviceName: string
//   subRows?: TimeEntry[] // Optional, only present if multiple entries
// }

// export function transformTimesheetDataTwo(entries: TimeEntry[]): GroupedTimeEntry[] {
//   if (!Array.isArray(entries) || !entries.length) {
//     throw new Error('No entries provided')
//   }

//   // Group entries by caregiver.id and client.id
//   const groupedByPair: { [key: string]: TimeEntry[] } = {}

//   entries.forEach(entry => {
//     const key = `${entry.caregiver.id}-${entry.client.id}`
//     if (!groupedByPair[key]) {
//       groupedByPair[key] = []
//     }
//     groupedByPair[key].push(entry)
//   })

//   // Transform each group into a GroupedTimeEntry
//   return Object.entries(groupedByPair).map(([key, groupEntries]) => {
//     const { caregiver, client } = groupEntries[0]

//     // If only one entry, return it directly without subRows
//     if (groupEntries.length === 1) {
//       const entry = groupEntries[0]
//       const date = new Date(entry.dateOfService)
//       return {
//         id: entry.id,
//         dateOfService: date.toLocaleDateString('en-US', {
//           month: '2-digit',
//           day: '2-digit',
//           year: '2-digit'
//         }), // Format as mm/dd/yy
//         caregiver: {
//           id: caregiver.id,
//           firstName: caregiver.firstName,
//           middleName: caregiver.middleName,
//           lastName: caregiver.lastName
//         },
//         client: {
//           id: client.id,
//           firstName: client.firstName,
//           middleName: client.middleName,
//           lastName: client.lastName
//         },
//         tsApprovalStatus: entry.tsApprovalStatus,
//         serviceName: entry.serviceName
//         // No subRows for single entry
//       }
//     }

//     // For multiple entries, sort and group as before
//     const sortedEntries = [...groupEntries].sort(
//       (a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
//     )

//     const uniqueServices = [...new Set(sortedEntries.map(entry => entry.serviceName))]
//     const startDate = new Date(sortedEntries[0].dateOfService)
//     const endDate = new Date(sortedEntries[sortedEntries.length - 1].dateOfService)

//     const formatDate = (date: Date) =>
//       date.toLocaleDateString('en-US', {
//         month: '2-digit',
//         day: '2-digit',
//         year: '2-digit'
//       }) // Format as mm/dd/yy

//     const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`

//     const hasAllSameStatus = sortedEntries.every(entry => entry.tsApprovalStatus === sortedEntries[0].tsApprovalStatus)

//     return {
//       id: key,
//       dateOfService: dateRange,
//       caregiver: {
//         id: caregiver.id,
//         firstName: caregiver.firstName,
//         middleName: caregiver.middleName,
//         lastName: caregiver.lastName
//       },
//       client: {
//         id: client.id,
//         firstName: client.firstName,
//         middleName: client.middleName,
//         lastName: client.lastName
//       },
//       tsApprovalStatus: hasAllSameStatus ? sortedEntries[0].tsApprovalStatus : 'Mixed',
//       serviceName: uniqueServices.join(', '),
//       subRows: sortedEntries
//     }
//   })
// }
