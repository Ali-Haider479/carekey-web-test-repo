import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { serviceStatuses } from './constants'

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

export const formatToLocalTime = (gmtDate: any) => {
  if (!gmtDate) return null
  const date = parseISO(gmtDate) // Parse GMT/UTC date
  const localDate = toZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone) // Convert to local
  console.log('LOCAL DATE', localDate)
  return format(localDate, 'MM/dd/yyyy hh:mm a')
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

export const generateOptions = (
  documents: { id: number; fileName: string; fileKey: string; uploadDate: string; fileSize: number }[]
) => {
  return documents.map(doc => ({
    key: doc.id,
    value: doc.fileKey,
    displayValue: doc.fileName.replace('.pdf', '')
  }))
}

export const calculateStartAndEndDate = (range: any) => {
  const [year, month, day] = range?.startDate?.split('-')
  const startDate = new Date(Date.UTC(year, month - 1, day))
  const endDate = new Date(startDate)
  endDate.setUTCDate(startDate.getUTCDate() + range.numberOfWeeks * 7)
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

export const getStatusColors = (status: string) => {
  const statusObj = serviceStatuses.find(s => s.id === status)
  return statusObj || serviceStatuses[0] // Default to 'scheduled' if not found
}

export const getShortStatusName = (status: string) => {
  const shortNames: { [key: string]: string } = {
    scheduled: 'Sched',
    worked: 'Worked',
    missed: 'Missed',
    billed: 'Billed',
    approved: 'Approved'
  }
  return shortNames[status] || status
}

export const formatTimeTo12hr = (timeString: string) => {
  const [hours] = timeString.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${timeString.substring(3, 5)} ${ampm}`
}
export const areObjectsEqual = (obj1: any, obj2: any) => {
  if (obj1 === obj2) return true
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return false
  }
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  for (const key of keys1) {
    if (!keys2.includes(key) || !areObjectsEqual(obj1[key], obj2[key])) {
      return false
    }
  }
  return true
}

export const isEmpty = (value: any): boolean => {
  if (value == null) return true // Handles null and undefined
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
