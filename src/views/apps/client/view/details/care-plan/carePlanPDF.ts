import jsPDF from 'jspdf'

interface CarePlanPdf {
  formData: any
  serviceType: any[]
  serviceAuth: any[]
  qpsList: any[]
  activities: any[]
}

export function generateCarePlanPDF({ formData, serviceType, serviceAuth, qpsList, activities }: CarePlanPdf) {
  const selectedService = serviceType.find(item => item.id === formData.serviceType)
  const selectedServiceAuth = serviceAuth.find(item => item.id === formData.serviceAuth)
  const selectedQP = qpsList.find(item => item.id === formData.qpAssigned)
  // console.log(
  //   'FormData--->',
  //   formData,
  //   'selectedService---->',
  //   selectedService,
  //   'selectedServiceAuth---->',
  //   selectedServiceAuth,
  //   'selectedQP---->',
  //   selectedQP,
  //   'activities---->',
  //   activities
  // )
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const client = serviceAuth[0].client
  const clientAddress = client.addresses.find((item: any) => item.address.addressType === 'Residential')
  // console.log('clientAddress---->', clientAddress)
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.width
  const margin = 10
  const contentWidth = pageWidth - margin * 2

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const titleText = authUser.tenant.companyName
  const titleWidth = doc.getStringUnitWidth(titleText) * 16 * 0.352778
  doc.text(titleText, (pageWidth - titleWidth) / 2, 15)

  doc.setFontSize(14)
  const subTitleText = 'Care Plan'
  const subTitleWidth = doc.getStringUnitWidth(subTitleText) * 14 * 0.352778
  doc.text(subTitleText, (pageWidth - subTitleWidth) / 2, 22)

  doc.setFontSize(10)
  const addressText = `Address: ${authUser.tenant.address}  Contact: ${authUser.tenant.contactNumber}`
  const addressWidth = doc.getStringUnitWidth(addressText) * 10 * 0.352778
  doc.text(addressText, (pageWidth - addressWidth) / 2, 29)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(margin, 32, pageWidth - margin, 32)

  // let yPosition = 40

  // Client information section
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Client: ${client.firstName} ${client.lastName}`, margin, 40)
  doc.text(
    `Address: ${clientAddress.address.address}, ${clientAddress.address.city}, ${clientAddress.address.state},${clientAddress.address.zipCode} `,
    margin,
    46
  )
  doc.text(
    `Service Authorization:${selectedServiceAuth.serviceAuthNumber} ${selectedServiceAuth.procedureCode}`,
    margin,
    52
  )
  doc.text(
    `Service Details: ${selectedService.service ? `${selectedService.service.name} ${selectedService.service.procedureCode}` : `${selectedService.serviceAuthService.name}`}`,
    margin,
    58
  )

  // Record information
  doc.text(`Due Date: ${formData.dueDate}`, 120, 40)
  doc.text(`Date of Birth: ${client.dateOfBirth}`, 120, 46)
  doc.text(`Mobile Phone: ${client.primaryCellNumber}`, 120, 52)
  doc.text(`Diagnosis Code(s): ${selectedServiceAuth.diagnosisCode}`, 120, 58)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, 64, pageWidth - margin, 64)

  // Advance Directive section
  doc.setFont('helvetica', 'bold')
  doc.text('Advance Directive', margin, 70)
  doc.text('Details', 60, 70)
  doc.text('Remarks', 120, 70)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, 90, pageWidth - margin, 90)

  // Assessment section
  doc.setFont('helvetica', 'bold')
  doc.text('Assessment', margin, 95)
  doc.setFont('helvetica', 'normal')
  doc.text('Special Diet/Instructions:', margin, 102)
  doc.text('Special Equipment:', margin, 109)
  doc.text('Allergies:', margin, 116)
  doc.text('Client Remarks:', margin, 123)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, 129, pageWidth - margin, 129)

  // Right side of assessment
  doc.text(`Qualified Professional: ${selectedQP.firstName} ${selectedQP.lastName}`, margin, 137)
  doc.text(`Care Plan Dates: ${formData.dueDate} to ${formData.lastCompletedDate}`, margin, 144)
  doc.text('Caregiver: First Employee', margin, 151)
  doc.text('Expected Hours Per Week: 6.88', margin, 158)
  doc.text(`Rehab Potential: ${formData.rehabPotential}`, margin, 165)

  // Safety section
  doc.text('Self Abuse: No', 120, 137)
  doc.text('Behaviors: No', 120, 144)
  doc.text('Susceptibility Factors:No', 120, 151)
  doc.text('Safety & Vulnerability Issues:', 120, 158)
  doc.text('Personal Care Assistant Preference: No', 120, 165)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, 171, pageWidth - margin, 171)

  // Backup Staffing Plan
  doc.setFont('helvetica', 'bold')
  doc.text(
    'Backup Staffing Plan: (1) Agency Staff (2) Family Member (3) Friend/Neighbour (4) Verbal Order to Cancel.',
    margin,
    179
  )
  doc.setFont('helvetica', 'normal')
  doc.text("The agency will fulfil the client's staffing needs in the order listed above.", margin, 186)

  doc.setFont('helvetica', 'bold')
  doc.text('Back-Up Staffing Responsible Party:', margin, 193)

  doc.setFont('helvetica', 'normal')
  doc.text('Name:', margin, 200)
  doc.text('Phone Number:', 80, 200)
  doc.text('Address:', margin, 207)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, 213, pageWidth - margin, 213)

  // Other sections
  doc.text('Other Tasks: -', margin, 221)
  doc.text('Discharge Plan: -', margin, 228)
  doc.text('General Notes: Staffing backup plan is available in the admission form of the client.', margin, 235)
  doc.text('Outcome: -', margin, 242)
  doc.text('Remarks: notes', margin, 249)
  doc.text('Goals: Promote self-care/independence', margin, 256)

  // Service Instructions header

  // Add a new page for the second part
  doc.addPage()

  doc.setFont('helvetica', 'bold')
  doc.text('Service Instructions', margin, 20)

  let yPos = 24
  const pageHeight = doc.internal.pageSize.height
  const rowHeight = 10
  const colWidths = [100, 90]

  const drawCell = (
    text: string,
    x: number,
    y: number,
    width: number,
    initialHeight: number,
    isHeader = false,
    align: 'left' | 'center' | 'right' = 'center',
    wrapText = false
  ) => {
    doc.rect(x, y, width, initialHeight)

    doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
    doc.setFontSize(isHeader ? 9 : 8)

    if (wrapText) {
      const splitText = doc.splitTextToSize(text, width - 4)
      const lineHeight = 5
      const neededHeight = splitText.length * lineHeight

      splitText.forEach((line: string, i: number) => {
        const lineY = y + i * lineHeight + lineHeight / 2 + 2
        doc.text(line, x + 2, lineY)
      })

      return Math.max(initialHeight, neededHeight)
    } else {
      let textX = x
      const textY = y + initialHeight / 2 + 2

      if (align === 'center') {
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() * 0.352778
        textX = x + (width - textWidth) / 2
      } else if (align === 'left') {
        textX = x + 2
      } else if (align === 'right') {
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() * 0.352778
        textX = x + width - textWidth - 2
      }

      doc.text(text, textX, textY)
      return initialHeight
    }
  }

  // Service Instructions table
  const headerHeight = drawCell('Activity', margin, yPos, colWidths[0], rowHeight, true, 'left')

  drawCell('Instructions', margin + colWidths[0], yPos, colWidths[1], rowHeight, true, 'left')

  yPos += headerHeight

  // Table data
  const serviceData = formData.serviceActivities.map((activityId: number) => {
    const activity = activities.find(a => a.id === activityId)
    const note = formData.notes[activityId]

    return [activity.title, `${note.note} (Assistance Level: ${note.assistanceLevel})`]
  })
  formData.serviceActivities.forEach((activityId: number) => {
    const activity = activities.find(a => a.id === activityId)
    const note = formData.notes[activityId]

    // Check for page break
    if (yPos > pageHeight - 30) {
      doc.addPage()
      yPos = 20
      // Redraw headers on new page
      drawCell('Activity', margin, yPos, colWidths[0], rowHeight, true, 'left')
      drawCell('Instructions', margin + colWidths[0], yPos, colWidths[1], rowHeight, true, 'left')
      yPos += rowHeight
    }

    // Draw activity cell (left column)
    const activityText = activity?.title || `Activity ${activityId}`
    const activityCellHeight = drawCell(
      activityText,
      margin,
      yPos,
      colWidths[0],
      rowHeight,
      false,
      'left',
      true // Wrap text
    )

    // Draw instructions cell (right column)
    const instructionText = `${note?.note || ''} (${note?.assistanceLevel || 'Not specified'})`
    const instructionCellHeight = drawCell(
      instructionText,
      margin + colWidths[0],
      yPos,
      colWidths[1],
      rowHeight,
      false,
      'left',
      true // Wrap text
    )

    // Move to next row based on the tallest cell
    yPos += Math.max(activityCellHeight, instructionCellHeight)
  })

  yPos = yPos + 8

  // Emergency Procedure Plan
  doc.setFont('helvetica', 'bold')
  doc.text('Authorization for Emergency Procedure Plan & Phone Numbers:', margin, yPos)
  yPos = yPos + 6
  doc.setFont('helvetica', 'normal')
  doc.text('Ambulance:', margin, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text('Call 911', 30, yPos)

  yPos = yPos + 6

  doc.setFont('helvetica', 'normal')
  doc.text('Police or Fire:', margin, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text('Call 911', 30, yPos)

  yPos = yPos + 6

  doc.setFont('helvetica', 'normal')
  doc.text('Agency Contact Name: Name', margin, yPos)

  doc.text('Phone No:', 120, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text('612-111-1111', 135, yPos)

  yPos = yPos + 6

  doc.setFont('helvetica', 'normal')
  doc.text('Call for Non-Emergency and other Concerns:', margin, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text('612-111-1111', 70, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text('Email: ', 120, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text('abcino@gmail.com', 135, yPos)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, yPos + 6, pageWidth - margin, yPos + 6)

  yPos = yPos + 12

  // Primary Physician
  doc.setFont('helvetica', 'normal')
  doc.text('Primary Physician:', margin, yPos)
  doc.text('Phone No:', margin + 110, yPos)
  doc.text('Address:', margin, yPos + 6)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, yPos + 12, pageWidth - margin, yPos + 12)

  yPos = yPos + 18
  // Signatures
  doc.text('Caregiver Name:', margin, yPos)
  doc.text('Employee, First', 50, yPos)

  yPos = yPos + 12

  doc.text('Caregiver Signature:', margin, yPos)
  doc.text('Date:', 100, yPos)
  doc.text('12/10/2024 13:14', 120, yPos)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, yPos + 12, pageWidth - margin, yPos + 12)

  yPos = yPos + 18

  doc.text('Client/Rep. Party:', margin, yPos)
  yPos = yPos + 12
  doc.text('Signature:', margin, yPos)
  doc.text('Date:', 100, yPos)

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.125)
  doc.line(margin, yPos + 12, pageWidth - margin, yPos + 12)

  yPos = yPos + 18

  doc.text('QP Name:', margin, yPos)
  yPos = yPos + 12
  doc.text('QP Signature:', margin, yPos)
  doc.text('Date:', 100, yPos)

  doc.save('care-plan.pdf')
}
