import jsPDF from 'jspdf'

interface CarePlanPdf {
  formData: any
  serviceType: any[]
  serviceAuth: any[]
  qpsList: any[]
  activities: any[]
}

export function generateCarePlanPDF({ formData, serviceType, serviceAuth, qpsList, activities }: CarePlanPdf) {
  console.log(formData, serviceType, serviceAuth, qpsList, activities)
  const selectedService = serviceType.find(item => item.id === formData.serviceType)
  const selectedServiceAuth = serviceAuth.find(item => item.id === formData.serviceAuth)
  const selectedQP = qpsList.find(item => item.id === formData.qpAssigned)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const client = serviceAuth[0].client
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

  let yPosition = 40
  doc.setFontSize(11)
  doc.text(`Patient Name: ${client.firstName} ${client.lastName}`, margin, yPosition)
  yPosition += 5
  const formattedDOB = client.dateOfBirth
    ? new Date(client.dateOfBirth).toISOString().split('T')[0].split('-').reverse().join('-')
    : ''
  doc.text(`Date of Birth: ${formattedDOB}`, margin, yPosition)
  yPosition += 5
  const reversedDate = formData.dueDate
    ? new Date(formData.dueDate).toISOString().split('T')[0].split('-').reverse().join('-')
    : ''
  doc.text(`Care Plan Date: ${reversedDate}`, margin, yPosition)

  doc.save('care-plan.pdf')
}
