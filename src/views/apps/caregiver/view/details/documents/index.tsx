import React, { useEffect, useRef, useState } from 'react'
import CaregiverDocuments from './CaregiverDocuments'
import { Button, Card } from '@mui/material'
import api from '@/utils/api'
import { useParams } from 'next/navigation'

const CG_Documents = () => {
  const [documentsData, setDocumentsData] = useState<any>({})
  const [caregiverDocuments, setCaregiverDocuments] = useState<any>()
  const { id } = useParams()
  const documentsFormRef = useRef<{ handleSubmit: any }>(null)
  const onDocumentsSubmit = (data: any) => {
    console.log('Documents Data:', data)
    setDocumentsData((prevData: any) => ({ ...prevData, ...data }))
  }

  return (
    <>
      <div>
        <CaregiverDocuments
          caregiverDocuments={caregiverDocuments}
          ref={documentsFormRef}
          onFinish={onDocumentsSubmit}
          defaultValues={documentsData}
        />
      </div>
    </>
  )
}

export default CG_Documents
