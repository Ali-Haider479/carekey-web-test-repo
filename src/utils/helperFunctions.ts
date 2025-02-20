import { format, parseISO } from 'date-fns'

export const calculateHoursWorked = (clockIn: string, clockOut: string) => {
  // Parse the clock-in and clock-out times
  const clockInTime = new Date(clockIn)
  const clockOutTime = new Date(clockOut)

  if (!clockOut || !clockIn) {
    return 'N/A'
  }

  // Calculate the difference in milliseconds
  const differenceMs = clockOutTime.getTime() - clockInTime.getTime()

  // Convert milliseconds to hours
  const hours = differenceMs / (1000 * 60 * 60)

  // Round to two decimal places
  return hours.toFixed(2)
}

export const formattedDate = (dateString: string) => {
  console.log('DATE STRING', dateString)
  try {
    if (!dateString) {
      return 'N/A'
    }
    const date = parseISO(dateString)
    return format(date, 'MM/dd/yyyy hh:mm a')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export const formatDate = (dateString: Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export function combineDateAndTime(dateOfService: any, clockIn: any) {
  // Check if the date strings are valid
  const serviceDate = new Date(dateOfService)
  const clockInTime = new Date(clockIn)

  // Check if either date is invalid
  if (isNaN(serviceDate.getTime()) || isNaN(clockInTime.getTime())) {
    throw new Error('Invalid date value(s) provided')
  }

  // Set the time from clockIn into the serviceDate
  serviceDate.setHours(clockInTime.getHours())
  serviceDate.setMinutes(clockInTime.getMinutes())
  serviceDate.setSeconds(clockInTime.getSeconds())
  serviceDate.setMilliseconds(clockInTime.getMilliseconds())

  // Return the combined date and time in ISO 8601 format
  return serviceDate.toISOString()
}
