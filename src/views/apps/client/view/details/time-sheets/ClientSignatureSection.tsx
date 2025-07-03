import React, { useEffect, useState } from 'react'
import { TextField, Divider, Card } from '@mui/material'
import Image from 'next/image'
import moment from 'moment'

const AcknowledgeSignature = ({ data }: any) => {
  const [signatureImage, setSignatureImage] = useState('') // State for Base64 image src
  const [signatureText, setSignatureText] = useState('') // State for plain text signature

  // Helper function to calculate duration in minutes
  const calculateDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 0
    const start = moment.parseZone(clockIn)
    const end = moment.parseZone(clockOut)
    const duration = end.diff(start, 'minutes')
    return Math.max(0, duration) // Ensure no negative durations
  }

  // Helper function to format duration as HH:MM
  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes < 0) return '0:00'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours} HOURS ${mins} MINUTES`
  }

  // Helper function to determine the week number for a given date
  const getWeekNumber = (dateStr: string, startDate: string, numberOfWeeks: number): number => {
    const date = moment(dateStr)
    const start = moment(startDate).startOf('day')
    const diffDays = date.diff(start, 'days')
    const weekNumber = Math.floor(diffDays / 7) + 1
    return Math.min(weekNumber, numberOfWeeks) // Cap at numberOfWeeks
  }

  useEffect(() => {
    // Assuming data is an array of objects with a signature object and a timestamp
    const signature =
      data?.length > 0
        ? data
            .filter((item: any) => item?.signature?.clientSignature) // Filter out items without a valid clientSignature
            .sort(
              (a: any, b: any) => new Date(b.signature.createdAt).getTime() - new Date(a.signature.createdAt).getTime()
            )[0]?.signature?.clientSignature
        : null

    if (signature) {
      const isBase64Image = signature.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(signature)
      if (isBase64Image) {
        const imageSrc = signature.startsWith('data:image') ? signature : `data:image/png;base64,${signature}`
        setSignatureImage(imageSrc)
        setSignatureText('')
      } else {
        setSignatureText(signature)
        setSignatureImage('')
      }
    } else {
      setSignatureImage('')
      setSignatureText('')
    }
  }, [data])

  // Calculate total minutes per week
  const weekTotals: { [key: number]: number } = {}
  const numberOfWeeks = data[0]?.payPeriodHistory?.numberOfWeeks || 1
  data.forEach((entry: any) => {
    const duration = calculateDuration(entry.clockIn, entry.clockOut)
    const weekNum = getWeekNumber(entry.dateOfService, data[0].payPeriodHistory.startDate, numberOfWeeks)
    weekTotals[weekNum] = (weekTotals[weekNum] || 0) + duration
  })

  // Calculate total bi-weekly minutes
  const totalMinutes = Object.values(weekTotals).reduce((sum, minutes) => sum + minutes, 0)

  // Helper function to format date
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card className='shadow-md rounded-lg p-6 w-[99%] mt-3 ml-2 border-solid border-2'>
      <h2 className='text-xl font-semibold mb-6'>Acknowledge and Required Signature for Client</h2>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium mb-1'>Recipient Name</label>
          <TextField
            value={`${data?.[0]?.client?.firstName || ''} ${data?.[0]?.client?.lastName || ''}`}
            variant='outlined'
            size='small'
            fullWidth
            disabled
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>PMI Number</label>
          <TextField value={data?.[0]?.client?.pmiNumber || ''} variant='outlined' size='small' fullWidth disabled />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Recipient/Responsible Party Signature</label>
          {signatureImage ? (
            <Image
              src={signatureImage}
              width={150}
              height={100}
              alt='Client Signature'
              quality={100}
              style={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: '4px',
                padding: '2px',
                backgroundColor: 'white'
              }}
            />
          ) : signatureText ? (
            <TextField value={signatureText} variant='outlined' size='small' fullWidth disabled />
          ) : (
            <TextField value='No signature available' variant='outlined' size='small' fullWidth disabled />
          )}
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Date</label>
          <TextField
            value={formatDateTime(data?.[0]?.signature?.createdAt)}
            variant='outlined'
            size='small'
            fullWidth
            disabled
          />
        </div>
      </div>

      <Divider className='my-6' />

      <div className='grid grid-cols-3 text-center'>
        {numberOfWeeks >= 1 && (
          <div>
            <span className='block text-sm font-medium mb-2'>WEEK 1</span>
            <span className='text-lg font-bold'>{formatDuration(weekTotals[1] || 0)}</span>
          </div>
        )}
        {numberOfWeeks >= 2 && (
          <div>
            <span className='block text-sm font-medium mb-2'>WEEK 2</span>
            <span className='text-lg font-bold'>{formatDuration(weekTotals[2] || 0)}</span>
          </div>
        )}
        {/* Add more weeks dynamically if numberOfWeeks > 2 */}
        {numberOfWeeks > 2 &&
          Array.from({ length: numberOfWeeks - 2 }, (_, i) => i + 3).map(weekNum => (
            <div key={weekNum}>
              <span className='block text-sm font-medium mb-2'>WEEK {weekNum}</span>
              <span className='text-lg font-bold'>{formatDuration(weekTotals[weekNum] || 0)}</span>
            </div>
          ))}
        <div>
          <span className='block text-sm font-medium mb-2'>TOTAL BI-WEEKLY HOURS</span>
          <span className='text-lg font-bold'>{formatDuration(totalMinutes)}</span>
        </div>
      </div>
    </Card>
  )
}

export default AcknowledgeSignature
