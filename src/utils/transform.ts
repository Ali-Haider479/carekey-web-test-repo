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

interface TimeEntry {
  id: number
  dateOfService: string
  manualEntry: boolean
  clockIn: string
  clockOut: string
  notes: string
  tsApprovalStatus: string
  serviceName: string
  startLocation: Location
  endLocation: Location
  payPeriodHistory: PayPeriodHistory
  signature: Signature
  caregiver: Caregiver
  client: Client
  checkedActivity: { id: number }
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
}

export function transformTimesheetDataTwo(entries: TimeEntry[]): GroupedTimeEntry[] {
  if (!Array.isArray(entries) || !entries.length) {
    throw new Error('No entries provided')
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

  // Transform each group into a GroupedTimeEntry
  return Object.entries(groupedByPair).map(([key, groupEntries]) => {
    const { caregiver, client } = groupEntries[0]

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
        tsApprovalStatus: entry.tsApprovalStatus,
        serviceName: entry.serviceName,
        clockIn: entry.clockIn, // Added clockIn for single entry
        startLocation: entry.startLocation, // Added startLocation for single entry
        endLocation: entry.endLocation, // Added endLocation for single entry
        clockOut: entry.clockOut, // Added clockOut for single entry
        signature: entry.signature // Existing signature for single entry
      }
    }

    // For multiple entries, sort and group as before
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

    // For multiple entries, we'll use the earliest clockIn and latest clockOut
    // const earliestClockIn = sortedEntries[0].clockIn
    // const latestClockOut = sortedEntries[sortedEntries.length - 1].clockOut
    const latestendLocation = sortedEntries[sortedEntries.length - 1].endLocation
    const lateststartLocation = sortedEntries[sortedEntries.length - 1].startLocation

    const mostRecentSignature = sortedEntries[sortedEntries.length - 1].signature

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
      // clockIn: earliestClockIn, // Added earliest clockIn for grouped entries
      // clockOut: latestClockOut, // Added latest clockOut for grouped entries
      signature: mostRecentSignature, // Existing signature for grouped entries
      subRows: sortedEntries, // subRows already includes full TimeEntry with clockIn/clockOut
      startLocation: lateststartLocation, // Added latest startLocation for grouped entries
      endLocation: latestendLocation // Added latest endLocation for grouped entries
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
