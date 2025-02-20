interface TimeEntry {
  id: number
  dateOfService: string
  caregiver: {
    id: number
    [key: string]: any
  }
  client: {
    id: number
    [key: string]: any
  }
  payPeriodHistory: {
    id: number
    [key: string]: any
  }
  [key: string]: any
}

const transformToExpandableFormat = (data: TimeEntry[]) => {
  // Create a map to store grouped entries
  const groupMap = new Map()

  // Sort data by dateOfService to maintain consistency
  const sortedData = [...data].sort((a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime())

  sortedData.forEach(entry => {
    // Create a unique key for each group based on caregiver, client, and payPeriodHistory IDs
    const groupKey = `${entry.caregiver.id}-${entry.client.id}-${entry.payPeriodHistory.id}`

    if (!groupMap.has(groupKey)) {
      // If this is the first entry for this combination, create a new parent entry
      groupMap.set(groupKey, {
        ...entry, // Spread all properties from the first entry
        subRows: [] // Initialize empty subRows array
      })
    } else {
      // If we already have an entry for this combination, add this entry to subRows
      const existingEntry = groupMap.get(groupKey)
      existingEntry.subRows.push(entry)
    }
  })

  // Convert the map values to an array and sort by dateOfService
  return Array.from(groupMap.values())
}

export default transformToExpandableFormat
