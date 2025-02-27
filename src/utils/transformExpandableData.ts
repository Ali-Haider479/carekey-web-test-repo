export function transformTimesheetData(rawData: any) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    throw new Error('Input must be a non-empty array')
  }

  // Sort data by date of service
  const sortedData: any = [...rawData].sort(
    (a: any, b: any) => new Date(a?.dateOfService).getTime() - new Date(b?.dateOfService).getTime()
  )

  // Extract caregiver and client information (assuming consistent across entries)
  const caregiver = sortedData[0].caregiver
    ? {
        name: `${sortedData[0].caregiver.firstName} ${sortedData[0].caregiver.lastName}`,
        gender: sortedData[0].caregiver.gender,
        dateOfBirth: sortedData[0].caregiver.dateOfBirth,
        dateOfHire: sortedData[0].caregiver.dateOfHire,
        payRate: sortedData[0].caregiver.payRate,
        caregiverUMPI: sortedData[0].caregiver.caregiverUMPI,
        contactNumber: sortedData[0].caregiver.primaryPhoneNumber
      }
    : null

  const client = sortedData[0].client
    ? {
        name: `${sortedData[0].client.firstName} ${sortedData[0].client.lastName}`,
        gender: sortedData[0].client.gender,
        dateOfBirth: sortedData[0].client.dateOfBirth,
        admissionDate: sortedData[0].client.admissionDate,
        dischargeDate: sortedData[0].client.dischargeDate,
        clientCode: sortedData[0].client.clientCode,
        contactNumber: sortedData[0].client.primaryPhoneNumber
      }
    : null

  // Transform service records
  const serviceRecords = sortedData.map((entry: any) => {
    // Calculate duration in minutes
    let durationMinutes = null
    let durationFormatted = 'Ongoing'
    let flags = []

    if (entry.clockIn && entry.clockOut) {
      const clockInTime = new Date(entry.clockIn)
      const clockOutTime = new Date(entry.clockOut)

      // Calculate duration in milliseconds and convert to minutes
      durationMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60)

      // Format duration as hours and minutes
      const hours = Math.floor(durationMinutes / 60)
      const minutes = Math.floor(durationMinutes % 60)
      durationFormatted = `${hours}h ${minutes}m`

      // Add flags for unusual patterns
      if (durationMinutes < 1) {
        flags.push('VERY_SHORT_DURATION')
      }
      if (durationMinutes > 1440) {
        // More than 24 hours
        flags.push('EXTENDED_DURATION')
      }
    } else {
      flags.push('NO_CLOCK_OUT')
    }

    // Create date objects for easy formatting
    const serviceDate = new Date(entry.dateOfService)
    const clockInDate = entry.clockIn ? new Date(entry.clockIn) : null
    const clockOutDate = entry.clockOut ? new Date(entry.clockOut) : null

    // Format dates
    const formatDate = (date: any) => {
      if (!date) return null
      return date.toISOString().split('T')[0]
    }

    // Format times
    const formatTime = (date: any) => {
      if (!date) return null
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return {
      id: entry.id,
      serviceDate: formatDate(serviceDate),
      clockInTime: formatTime(clockInDate),
      clockOutTime: formatTime(clockOutDate),
      serviceName: entry.serviceName,
      durationMinutes: durationMinutes,
      durationFormatted: durationFormatted,
      activityId: entry.checkedActivity ? entry.checkedActivity.id : null,
      notes: entry.notes || '',
      approvalStatus: entry.tsApprovalStatus,
      flags: flags
    }
  })

  // Calculate summary statistics
  const totalEntries = serviceRecords.length
  const completedEntries = serviceRecords.filter((record: any) => record.clockOutTime !== null).length
  const totalMinutes = serviceRecords.reduce((sum: any, record: any) => sum + (record.durationMinutes || 0), 0)

  // Calculate total hours and remaining minutes
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = Math.floor(totalMinutes % 60)

  // Get pay period information
  const payPeriod = sortedData[0].payPeriodHistory
    ? {
        id: sortedData[0].payPeriodHistory.id,
        startDate: sortedData[0].payPeriodHistory.startDate,
        endDate: sortedData[0].payPeriodHistory.endDate || 'Ongoing',
        numberOfWeeks: sortedData[0].payPeriodHistory.numberOfWeeks
      }
    : null

  // Data validation issues
  const dataIssues = []

  // Check if client's DOB makes sense (should be older than a few weeks)
  if (client && client.dateOfBirth) {
    const clientDOB = new Date(client.dateOfBirth)
    const today = new Date()
    const ageInDays = (today.getTime() - clientDOB.getTime()) / (1000 * 60 * 60 * 24)

    if (ageInDays < 30) {
      dataIssues.push({
        type: 'SUSPICIOUS_CLIENT_AGE',
        message: `Client's date of birth (${client.dateOfBirth}) indicates they are only ${Math.round(ageInDays)} days old`
      })
    }
  }

  // Check if service dates are after discharge date
  if (client && client.dischargeDate) {
    const dischargeDate = new Date(client.dischargeDate)

    for (const record of serviceRecords) {
      const serviceDate = new Date(record.serviceDate)
      if (serviceDate > dischargeDate) {
        dataIssues.push({
          type: 'SERVICE_AFTER_DISCHARGE',
          message: `Service on ${record.serviceDate} occurs after client discharge date (${client.dischargeDate})`,
          recordId: record.id
        })
      }
    }
  }

  return {
    summary: {
      caregiverName: caregiver ? caregiver.name : 'Unknown',
      clientName: client ? client.name : 'Unknown',
      payPeriod: payPeriod,
      totalEntries: totalEntries,
      completedEntries: completedEntries,
      ongoingEntries: totalEntries - completedEntries,
      totalServiceTime: `${totalHours}h ${remainingMinutes}m`,
      totalServiceMinutes: totalMinutes,
      dataIssues: dataIssues
    },
    caregiver: caregiver,
    client: client,
    serviceRecords: serviceRecords
  }
}
