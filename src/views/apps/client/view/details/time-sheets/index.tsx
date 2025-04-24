'use client'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import { Button, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import AcknowledgeSignature from './ClientSignatureSection'
import AcknowledgeSignatureCaregiver from './CaregiverSignatureSection'
import { useParams } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import './TimesheetPdf.css'
import './table.css'
import { jsPDF } from 'jspdf'
import api from '@/utils/api'

interface DetailItemProps {
  label: string
  value: string | number // Adjust the type based on your requirements
}

interface Activity {
  id: number
  title: string
}

interface CheckedActivity {
  id: number
  activities: Activity[]
}

interface Caregiver {
  id: number
  firstName: string
  lastName: string
  [key: string]: any // for other caregiver properties
}

interface Client {
  id: number
  firstName: string
  lastName: string
  [key: string]: any // for other client properties
}

interface PayPeriodHistory {
  id: number
  startDate: string
  endDate: string | null
  numberOfWeeks: number
}

interface ServiceEntry {
  id: number
  dateOfService: string
  manualEntry: boolean
  clockIn: string
  clockOut: string
  notes: string
  serviceName: string
  caregiver: Caregiver
  client: Client
  checkedActivity: CheckedActivity
  payPeriodHistory: PayPeriodHistory
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className='flex justify-between text-sm'>
    <Typography className='text-base font-bold'>{label}</Typography>
    <Typography className='text-base font-bold'>{value}</Typography>
  </div>
)

interface Column {
  id: string
  label: string
  minWidth: number
  align?: 'center' | 'right' | 'left'
  render?: (params: any) => JSX.Element
}

const TimeSheets = () => {
  const { id } = useParams()
  const [timelogData, setTimelogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  console.log(timelogData.filter((item: any) => item.notes !== ""))

  const fetchTimeLog = async () => {
    try {
      const fetchedTimeLog = await api.get(`/time-log/client/${id}`)
      console.log('fetchedTimeLog.data', fetchedTimeLog.data)
      setTimelogData(fetchedTimeLog.data)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const columns: Column[] = [
    {
      id: 'payPeriod',
      label: 'DATE',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
        if (startTime) {
          // Parse the date string into a Date object
          const date = new Date(startTime)
          // Format the date as "14/06/2025"
          const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })

          return <Typography className='font-normal text-base my-3'>{formattedDate}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'radio',
      label: 'RADIO',
      minWidth: 170,
      align: 'center',
      render: (params: any) => <Typography className='font-normal text-base my-3'>1:1</Typography>
    },
    {
      id: 'locationShared',
      label: 'SHARED LOCATION',
      minWidth: 170,
      align: 'center',
      render: (params: any) => <Typography className='font-normal text-base my-3'>{params?.startLocation ? 'Yes' : 'No'}</Typography>
    },
    {
      id: 'locApproved',
      label: 'LOC APPROVED',
      minWidth: 170,
      align: 'center',
      render: (params: any) => (
        <>
          {params.value === 'YES' ? (
            <CheckOutlined className='text-[#71DD37]' />
          ) : (
            <CloseOutlined className='text-[#FF3E1D]' />
          )}
        </>
      )
    },
    {
      id: 'stayFacility',
      label: 'FACILITY STAY',
      minWidth: 170,
      align: 'center',
      render: (params: any) => <Typography className='font-normal text-base my-3'>NO</Typography>
    },
    {
      id: 'timeIn',
      label: 'TIME IN',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
        if (startTime) {
          // Parse the date string into a Date object
          const date = new Date(startTime)
          // Format the time as "03:00:08 PM"
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          return <Typography className='font-normal text-base my-3'>{formattedTime}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'timeOut',
      label: 'TIME-OUT',
      minWidth: 170,
      render: (params: any) => {
        const endTime = params?.clockOut
        if (endTime) {
          // Parse the date string into a Date object
          const date = new Date(endTime)
          // Format the time as "03:00:08 PM"
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          return <Typography className='font-normal text-base my-3'>{formattedTime}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'activities',
      label: 'ACTIVITIES',
      minWidth: 170,
      render: (params: any) =>
        params.checkedActivity ? (
          <Typography className='font-normal text-base my-3'>
            {params?.checkedActivity?.activities.map((activity: any) => activity.title).join(', ')}
          </Typography>
        ) : (
          <CloseOutlined className='text-[#FF3E1D]' />
        )
    }
  ]

  const generateWeekDates = (startDate: string, numberOfWeeks: number): moment.Moment[] => {
    if (!startDate) return []
    const dates: moment.Moment[] = []
    const start = moment(startDate).startOf('day')
    const end = moment(start).add(numberOfWeeks * 7 - 1, 'days')
    let current = moment(start)
    while (current.isSameOrBefore(end)) {
      dates.push(moment(current))
      current.add(1, 'days')
    }
    return dates
  }

  const processDurationsByDate = (
    serviceData: ServiceEntry[],
    weekDates: moment.Moment[]
  ): { [key: string]: number } => {
    const durationsByDate: { [key: string]: number } = {}
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      if (!durationsByDate[serviceDate]) {
        durationsByDate[serviceDate] = 0
      }
    })
    weekDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD')
      if (!durationsByDate[dateStr]) {
        durationsByDate[dateStr] = 0
      }
    })
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      const duration = calculateDuration(entry.clockIn, entry.clockOut)
      durationsByDate[serviceDate] = (durationsByDate[serviceDate] || 0) + duration
    })
    return durationsByDate
  }

  const calculateDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 0
    const start = moment.parseZone(clockIn)
    const end = moment.parseZone(clockOut)
    const duration = end.diff(start, 'minutes')
    return Math.max(0, duration)
  }

  const weekDates = generateWeekDates(
    timelogData[0]?.payPeriodHistory.startDate,
    timelogData[0]?.payPeriodHistory.numberOfWeeks
  )

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes < 0) return '0:00'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const durationsByDate = processDurationsByDate(timelogData, weekDates)

  // Update tableData to use date-based keys
  const tableData = [
    {
      id: '1',
      ...weekDates.reduce((acc: { [key: string]: string }, date) => {
        const dateStr = date.format('YYYY-MM-DD') // Unique key per date
        const duration = durationsByDate[dateStr] || 0
        acc[dateStr] = formatDuration(duration) // Use date as key
        return acc
      }, {})
    }
  ]

  // Update tableColumns to use date-based ids
  const tableColumns = weekDates.map(date => {
    const dayName = date.format('ddd').toUpperCase()
    const dateStr = date.format('D MMMM')
    const label = `${dayName}\n${dateStr}`
    const columnId = date.format('YYYY-MM-DD') // Use full date as id

    return {
      id: columnId, // Match the key in tableData
      minWidth: 170,
      label: label,
      render: (params: any) => <Typography>{params[columnId] || '0:00'}</Typography> // Render the duration
    }
  })

  const exportToPDF = async () => {
    setIsLoading(true)
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Set page margins
      const pageWidth = doc.internal.pageSize.width
      const margin = 10
      const contentWidth = pageWidth - margin * 2

      // Set default font
      doc.setFont('helvetica', 'normal')

      // ---- HEADER SECTION ----
      // Center-aligned title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      const titleText = authUser.tenant.companyName;
      const titleWidth = doc.getStringUnitWidth(titleText) * 16 * 0.352778
      const titleX = (pageWidth - titleWidth) / 2
      doc.text(titleText, titleX, 15)

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      const subTitleText = `Caregiver Time and Activity Documentation`;
      const subTitleWidth = doc.getStringUnitWidth(subTitleText) * 16 * 0.352778
      const subTitleX = (pageWidth - subTitleWidth) / 2
      doc.text(subTitleText, subTitleX, 22)

      // Center-aligned address
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const addressText = `Address: ${authUser.tenant.address}  Contact: ${authUser.tenant.contactNumber}`
      const addressWidth = doc.getStringUnitWidth(addressText) * 10 * 0.352778
      const addressX = (pageWidth - addressWidth) / 2
      doc.text(addressText, addressX, 29)

      // Add separator line below header
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.line(margin, 32, pageWidth - margin, 32)

      // ---- CHECKOUT NOTES SECTION ----
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Checkout Notes', margin, 40)
      doc.setFont('helvetica', 'normal')

      let yPosition = 50

      const timeLogsWithNotes = timelogData.filter((item: any) => item.notes !== "")

      // Sort timelogData by date
      const sortedTimelogDataWithNotes = [...timeLogsWithNotes].sort(
        (a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
      )

      // Add notes for each timelog entry
      sortedTimelogDataWithNotes.forEach(entry => {
        // Format date as in sample: MM/DD/YYYY
        const dateStr = moment(entry.dateOfService).format('MM/DD/YYYY')

        // Format time as in sample: hh:mm AM/PM - hh:mm AM/PM
        const timeIn = moment(entry.clockIn).format('hh:mm A')
        const timeOut = moment(entry.clockOut).format('hh:mm A')

        // Date and time header for each note
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`${dateStr} ${timeIn} - ${timeOut}`, margin, yPosition)
        doc.setFont('helvetica', 'normal')

        // Format notes with a dash prefix as in sample
        const notesText = `- ${entry.notes}`

        // Split long notes into multiple lines with proper indentation
        doc.setFontSize(10)
        const splitNotes = doc.splitTextToSize(notesText, contentWidth)
        doc.text(splitNotes, margin, yPosition + 5)

        // Calculate space needed for this note block
        // Base height + number of text lines * line height
        const noteBlockHeight = 5 + splitNotes.length * 5
        yPosition += noteBlockHeight + 5 // Add some padding between notes

        // Check if we need to add a new page
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
      })

      // ---- NEW PAGE FOR TABLE ----
      doc.addPage()

      // ---- CLIENT AND CAREGIVER INFO SECTION ----
      yPosition = 15

      // Left side: Client name with client code in parentheses
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `RECIPIENT NAME - ${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''} (${timelogData[0]?.client?.clientCode || ''})`,
        margin,
        yPosition
      )

      // Right side: ICS Daily in parentheses
      const icsText = `${timelogData[0]?.serviceName}`
      const icsWidth = doc.getStringUnitWidth(icsText) * 11 * 0.352778
      doc.text(icsText, pageWidth - margin - icsWidth, yPosition)

      // Next row
      yPosition += 5

      // Left side: Caregiver name
      doc.text(
        `CAREGIVER NAME - ${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`,
        margin,
        yPosition
      )

      // Right side: Week duration with formatted dates
      const startDate = moment(timelogData[0]?.payPeriodHistory.startDate).format('MMMM DD, YYYY')
      const endDate = moment(weekDates[weekDates.length - 1]).format('MMMM DD, YYYY')
      const weekDurationText = `Week Duration: ${startDate} To ${endDate}`
      const weekDurationWidth = doc.getStringUnitWidth(weekDurationText) * 11 * 0.352778
      doc.text(weekDurationText, pageWidth - margin - weekDurationWidth, yPosition)

      // Add separator line below client/caregiver info
      yPosition += 5
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)

      // ---- FIRST TABLE SECTION (SERVICE ENTRIES) ----
      yPosition += 10 // Space before table

      // Define column headers and widths based on the attached image
      const tableHeaders = [
        { label: 'DATE', width: 20 },
        { label: 'RADIO', width: 16 },
        { label: 'LOCATION', width: 24 },
        { label: 'LOC APPROVED', width: 32 },
        { label: 'FACILITY STAY', width: 30 },
        { label: 'TIME IN', width: 23 },
        { label: 'TIME OUT', width: 23 },
        { label: 'ACTIVITIES', width: 23 }
      ]

      // Calculate total table width
      const tableWidth = tableHeaders.reduce((sum, header) => sum + header.width, 0)

      // Function to draw table cell with borders
      const drawCell = (text: any, x: any, y: any, width: any, height: any, isHeader = false, align = 'center') => {
        // Draw cell borders
        doc.rect(x, y, width, height)

        // Draw text
        doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
        doc.setFontSize(isHeader ? 10 : 9)

        let textX = x
        const textY = y + height / 2 + 1 // Center vertically

        // Center or align text
        if (align === 'center') {
          const textWidth = doc.getStringUnitWidth(text) * (isHeader ? 10 : 9) * 0.352778
          textX = x + (width - textWidth) / 2
        } else if (align === 'left') {
          textX = x + 2 // Left margin
        } else if (align === 'right') {
          const textWidth = doc.getStringUnitWidth(text) * (isHeader ? 10 : 9) * 0.352778
          textX = x + width - textWidth - 2 // Right margin
        }

        doc.text(text, textX, textY)
      }

      // Calculate starting X position to center the table
      let startX = margin
      const tableHeight = 10 // Header height
      const rowHeight = 8 // Row height

      // Draw header row
      let currentX = startX
      doc.setFillColor(240, 240, 240) // Light gray for header

      tableHeaders.forEach(header => {
        drawCell(header.label, currentX, yPosition, header.width, tableHeight, true)
        currentX += header.width
      })

      yPosition += tableHeight

      const sortedTimelogData = [...timelogData].sort(
        (a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
      )
      // Draw data rows
      sortedTimelogData.forEach(entry => {
        currentX = startX

        // Format date (DD/MM/YYYY)
        const dateStr = moment(entry.dateOfService).format('DD/MM/YYYY')
        const checkedActivities = entry?.checkedActivity?.activities
          ?.map((activity: any) => activity.title)
          ?.join(', ') ?? 'X';

        console.log(entry, checkedActivities);

        // Prepare cell data
        const cellData = [
          dateStr,
          '1:1',
          entry.startLocation ? 'Yes' : 'No',
          entry.locApproved ? '✓' : 'X',
          'NO',
          moment(entry.clockIn).format('hh:mm:ss A'),
          moment(entry.clockOut).format('hh:mm:ss A'),
          checkedActivities
        ]

        // Draw each cell in the row
        cellData.forEach((data, index) => {
          const cellWidth = tableHeaders[index].width
          // Use red text for X marks
          const currentFontColor = data === '✗' ? 'red' : 'black'
          doc.setTextColor(currentFontColor)

          drawCell(data, currentX, yPosition, cellWidth, rowHeight)
          currentX += cellWidth
        })

        // Reset text color
        doc.setTextColor('black')
        yPosition += rowHeight
      })

      // Add some space between tables
      yPosition += 10

      // // ---- SECOND TABLE SECTION (TOTAL HOURS) ----
      // // Section header
      // doc.setFontSize(14)
      // doc.setFont('helvetica', 'bold')
      // doc.text('Total Hours', margin, yPosition)
      // yPosition += 8

      // // Generate day columns for the week
      // const dayHeaders = weekDates.map(date => {
      //   return {
      //     day: date.format('ddd').toUpperCase(),
      //     date: date.format('D MMMM'),
      //     fullDate: date.format('YYYY-MM-DD')
      //   }
      // })

      // // Calculate width for each day column
      // const dayColWidth = Math.min(25, (pageWidth - 2 * margin) / dayHeaders.length)

      // // Draw day header row (days of week)
      // currentX = startX
      // dayHeaders.forEach(header => {
      //   drawCell(header.day, currentX, yPosition, dayColWidth, tableHeight, true)
      //   currentX += dayColWidth
      // })
      // yPosition += tableHeight

      // // Draw date row (date number and month)
      // currentX = startX
      // dayHeaders.forEach(header => {
      //   drawCell(header.date, currentX, yPosition, dayColWidth, tableHeight)
      //   currentX += dayColWidth
      // })
      // yPosition += tableHeight

      // // Draw hours row
      // currentX = startX
      // dayHeaders.forEach(header => {
      //   const dateStr = header.fullDate
      //   const dailyDuration = durationsByDate[dateStr] || 0
      //   const formattedDuration = formatDuration(dailyDuration)

      //   drawCell(formattedDuration, currentX, yPosition, dayColWidth, tableHeight)
      //   currentX += dayColWidth
      // })
      // yPosition += tableHeight + 15

      // Calculate total hours from all entries
      const totalMinutes = Object.values(durationsByDate).reduce((sum, duration) => sum + (duration || 0), 0)
      const totalHours = Math.floor(totalMinutes / 60)
      const totalMins = Math.round(totalMinutes % 60)

      // Add week summary with appropriate spacing
      doc.setFont('helvetica', 'bold')
      doc.text(`Week One - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition)
      doc.text(`Total Hours - ${totalHours} Hrs ${totalMins} Min`, 100, yPosition)

      // Add ratio summary
      doc.text(`Ratio(1:1) - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition + 5)

      yPosition += 10 // Space before acknowledgement

      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.2)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10 // Space before table

      // ACKNOWLEDGEMENT SECTION FOR CLIENT
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Acknowledge and Required Signature for Client', margin, yPosition)
      doc.setFont('helvetica', 'normal')

      // Acknowledgement text with proper wrapping and formatting
      const clientAcknowledgement =
        'After the Caregiver has documented his/her time and activity, the recipient must draw a line through any dates/times he/she did nor receive service from the Caregiver. Review the completed time sheet for accuracy before signing. It is a crime to provide false information on Caregiver billings for Medical Assistance payment. By signing below you swear and verify the time and services entered above are accurate and that time and services entered above are accurate and that the services were performed by the Caregiver listed below as specified in the PCA Care Plan.'
      const clientAckLines = doc.splitTextToSize(clientAcknowledgement, contentWidth)
      doc.text(clientAckLines, margin, yPosition + 5)

      // Adjust position based on acknowledgement text height
      yPosition += 15 + clientAckLines.length * 3

      // Client signature section with styled headers and formatted fields
      doc.setFont('helvetica', 'bold')
      doc.text('RECIPIENT NAME', margin, yPosition)
      doc.text('PMI Number', 60, yPosition)
      doc.text('RECIPIENT SIGNATURE', 100, yPosition)
      doc.text('DATE', 160, yPosition)

      // Add client information
      doc.setFont('helvetica', 'normal')
      doc.text(
        `${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''}`,
        margin,
        yPosition + 5
      )
      doc.text(`${timelogData[0]?.client?.pmiNumber || ''}`, 60, yPosition + 5)

      doc.addImage(`${timelogData[0]?.signature.clientSignature}`, "JPEG", 100, yPosition - 2, 30, 20);

      // Add current date for the signature
      doc.text(moment().format('MMMM DD, YYYY'), 160, yPosition + 5)

      yPosition += 15 // Space before hours summary

      // Repeat hours summary
      doc.setFont('helvetica', 'bold')
      doc.text(`Week One - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition)
      doc.text(`Total Hours - ${totalHours} Hrs ${totalMins} Min`, 60, yPosition)

      yPosition += 10 // Space before acknowledgement

      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.2)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10 // Space before table
      // ACKNOWLEDGEMENT SECTION FOR CAREGIVER
      doc.setFontSize(9)
      doc.text('Acknowledgement and Required Signatures For Caregiver', margin, yPosition)
      doc.setFont('helvetica', 'normal')

      // Caregiver acknowledgement text
      const caregiverAcknowledgement =
        'I certify and swear under penalty of law that I have accurately reported on this time sheet the hours I actually worked, the service I provided, and the dates and times worked. I understand that misreporting my hours is fraud for which I could face criminal prosecution and civil proceedings.'
      const caregiverAckLines = doc.splitTextToSize(caregiverAcknowledgement, contentWidth)
      doc.text(caregiverAckLines, margin, yPosition + 5)

      // Adjust position based on acknowledgement text height
      yPosition += 15 + caregiverAckLines.length * 3

      // Caregiver signature section
      doc.setFont('helvetica', 'bold')
      doc.text('CAREGIVER NAME', margin, yPosition)
      doc.text('CAREGIVER NPI/UMPI', 60, yPosition)
      doc.text('CAREGIVER SIGNATURE', 100, yPosition)
      doc.text('DATE', 160, yPosition)

      // Add caregiver information
      doc.setFont('helvetica', 'normal')
      doc.text(
        `${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`,
        margin,
        yPosition + 5
      )
      doc.text(`${timelogData[0]?.caregiver?.caregiverUMPI || ''}`, 60, yPosition + 5);

      doc.addImage(`${timelogData[0]?.signature?.caregiverSignature}`, "JPEG", 100, yPosition - 2, 30, 20);

      // Add current date for the signature
      doc.text(moment().format('MMMM DD, YYYY'), 160, yPosition + 5)

      // Save the PDF with a descriptive name
      doc.save(
        `Timesheet_${timelogData[0]?.client?.firstName || 'Client'}_${timelogData[0]?.caregiver?.firstName || 'Caregiver'}.pdf`
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div id='timesheet-content'>
        <Card className='h-fit w-[99%] m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2'>
          <div className='grid grid-cols-2 m-4 gap-3'>
            <DetailItem
              label='Recipient Name:'
              value={`${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''}`}
            />
            <DetailItem
              label='Week Duration:'
              value={`${weekDates[0]?.format('DD MMMM YYYY') || ''} - ${weekDates[weekDates.length - 1]?.format('DD MMMM YYYY') || ''}`}
            />
            <DetailItem
              label='Caregiver Name:'
              value={`${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`}
            />
          </div>
          <ReactTable
            columns={columns}
            data={timelogData}
            keyExtractor={user => user.id.toString()}
            enableRowSelect={false}
            enablePagination={false}
            pageSize={5}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </Card>

        <Card className='h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3 border-solid border-2'>
          <h2 className='text-xl pt-4 ml-4 mb-4'>Total Hours</h2>
          <ReactTable
            columns={tableColumns}
            data={tableData}
            keyExtractor={row => row.id.toString()}
            enableRowSelect={false}
            enablePagination={false}
            pageSize={5}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </Card>
        <AcknowledgeSignature data={timelogData} />
        <AcknowledgeSignatureCaregiver data={timelogData} />
      </div>
      <CardContent className='mt-4 mb-4 flex justify-between'>
        <div className='w-1/2 flex justify-start space-x-6'>
          <Button className='mr-6' variant='contained' onClick={() => { }}>
            Accept Timesheets
          </Button>
          <Button className='bg-red-600' variant='contained' onClick={() => { }}>
            Reject Timesheets
          </Button>
        </div>
        <div className='w-1/2 flex justify-end space-x-6'>
          <Button className='bg-[#E89C00] mr-6' variant='contained' onClick={() => { }}>
            Export to CSV
          </Button>
          <Button
            className='bg-[#67C932]'
            variant='contained'
            onClick={() => {
              exportToPDF()
            }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
          >
            Export PDF
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default TimeSheets
