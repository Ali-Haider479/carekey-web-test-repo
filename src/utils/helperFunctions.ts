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
