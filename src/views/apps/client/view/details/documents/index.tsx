'use client'
import { SetStateAction, useEffect, useState } from 'react'
import { Add, DeleteOutline, EditOutlined } from '@mui/icons-material'
import { Card, CardContent, Typography, Button, CircularProgress } from '@mui/material'
import ReactTable, { Column } from '@/@core/components/mui/ReactTable'
import api from '@/utils/api'
import { useParams } from 'next/navigation'
import DeleteDocumentModal from './deleteDocumentModal'
import AddNewDocumentModal from './addDocumentModal'
import axios from 'axios'

const Documents = () => {
  const { id } = useParams()
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [newDocumentsModalShow, setNewDocumentsModalShow] = useState<boolean>(false)
  const [deleteDocumentsModalShow, setDeleteDocumentsModalShow] = useState<boolean>(false)
  const [deleteDocumentLoading, setDeleteDocumentLoading] = useState<boolean>(false)
  const [newDocumentsUploading, setNewDocumentsUploading] = useState<boolean>(false)
  const [newDocumentsToUpload, setNewDocumentsToUpload] = useState<File[]>([])
  const [itemToDelete, setItemToDelete] = useState<any>()

  const getDocuments = async () => {
    try {
      setDocumentsLoading(true)
      const clientDocsRes = await api.get(`/client/client-documents/${id}`)
      if (Array.isArray(clientDocsRes.data)) {
        setDocuments(clientDocsRes.data)
      } else {
        throw new Error('Invalid API response format')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      // Example: toast.error('Failed to load documents. Please try again.');
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    getDocuments()
  }, [])
  const otherDocColumns: Column<any>[] = [
    {
      id: 'fileName',
      label: 'FILE NAME',
      width: 1000,
      render: item => (
        <div
          className='cursor-pointer w-1/2'
          onClick={() => getPdf(item?.uploadedDocument?.fileKey, item.uploadedDocument.fileName)}
        >
          <Typography className='font-light text-sm my-3'>
            {item.uploadedDocument.fileName.length > 20
              ? `${item.uploadedDocument.fileName.substring(0, 20)}...`
              : item.uploadedDocument.fileName}
          </Typography>
        </div>
      )
    },
    {
      id: 'uploadDate',
      label: 'UPLOAD DATE',
      width: 1000,
      render: item => <Typography className='font-light text-sm my-3'>{item.uploadedDocument.uploadDate}</Typography>
    },
    {
      id: 'expiryDate',
      label: 'EXPIRY DATE',
      width: 1000,
      render: item => <Typography className='font-light text-sm my-3'>{item.uploadedDocument.expiryDate}</Typography>
    },
    {
      id: 'actions',
      label: 'ACTION',
      width: 220,
      render: item => (
        <DeleteOutline
          color='error'
          className='cursor-pointer'
          onClick={() => {
            setItemToDelete(item)
            setDeleteDocumentsModalShow(true)
          }}
        />
      )
    }
  ]

  const handleDelete = async () => {
    try {
      setDeleteDocumentLoading(true)
      const deleteResponse = await api.delete(`/client/document/${itemToDelete.id}`)
      console.log('DELETE RESPONSE ---->> ', deleteResponse)
      await getDocuments()
      setDeleteDocumentsModalShow(false)
    } catch (error) {
      console.error('Error in deleting document: ', error)
    } finally {
      setDeleteDocumentLoading(false)
    }
  }

  const uploadDocuments = async (
    files: File[],
    documentType: string,
    id: string
    // expiryDate?: string,
    // additionalMetadata?: Record<string, any>
  ) => {
    if (!files || files.length === 0) {
      console.log(`No files found for ${documentType}. Skipping upload.`)
      return null
    }

    try {
      // Extract file names
      const fileNames = files.map(file => file.name)

      console.log('Files to be uploaded:', fileNames)

      // Request pre-signed URLs from the backend
      const { data: preSignedUrls } = await api.post(`/upload-document/get-signed-pdf-put-url`, fileNames)

      console.log('Received Pre-Signed URLs:', preSignedUrls)
      if (!Array.isArray(preSignedUrls) || preSignedUrls.length !== files.length) {
        throw new Error('Invalid pre-signed URLs response from server')
      }
      // Upload each file to S3
      const uploadPromises = files.map(async (file, index) => {
        const { key, url } = preSignedUrls[index] // Get corresponding pre-signed URL
        const fileType = file.type

        console.log(`Uploading ${file.name} to S3..., url ${url}`)

        // Upload file to S3
        const s3UploadedDocRes = await axios.put(url, file)

        console.log(`${file.name} uploaded successfully.`)

        // Prepare metadata to store in DB
        const body = {
          fileName: file.name,
          documentType,
          fileKey: key,
          fileType,
          fileSize: file.size,
          clientId: id
        }

        // Store record in backend
        const dbResponse = await api.post(`/client/documents`, body)
        return dbResponse.data
      })

      // Wait for all uploads & database records to complete
      const results = await Promise.all(uploadPromises)

      console.log('All files uploaded & records created:', results)

      return results
    } catch (error) {
      console.error(`Error uploading ${documentType} documents:`, error)
      return null
    }
  }

  const handleAddNewFilesUpload = async () => {
    try {
      setNewDocumentsUploading(true)
      console.log('Uploaded-Files', newDocumentsToUpload)
      //   const expiryDate = new Date()
      //   expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      const documentUploads = [
        uploadDocuments(newDocumentsToUpload, 'other', String(id)) // expiryDate.toISOString(), metaData
      ]
      const uploadResponses = await Promise.all(documentUploads)
      const successfulUploads = uploadResponses.filter(response => response !== null)
      console.log('Successful document uploads:', successfulUploads)
      await getDocuments()
      setNewDocumentsToUpload([])
      setNewDocumentsModalShow(false)
    } catch (error) {
      console.error('Error in adding training certificate: ', error)
    } finally {
      setNewDocumentsUploading(false)
    }
  }

  const getPdf = async (key: string, fileName: string) => {
    console.log('Getting pdf with key: ', key)
    const pdfRes = await api.get(`/caregivers/getPdf/${key}`)
    console.log('PDF RESPONSE --->> ', pdfRes)
    if (pdfRes && pdfRes.status === 200) {
      openPdfInNewTab(pdfRes.data, fileName)
    }
  }

  const openPdfInNewTab = (pdfUrl: string, itemName: string) => {
    console.log('Opening pdf with url: ', pdfUrl)
    if (/iPhone/i.test(navigator.userAgent) || !pdfUrl.includes('data')) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.target = '_blank'
      a.click()
    } else {
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob)
          const win = window.open(objectUrl, '_blank')
          if (!win) {
            console.error('Unable to open a new tab. Please check your browser settings.')
          } else {
            win.document.title = itemName
          }
        })
        .catch(error => {
          console.error('Error loading PDF:', error)
        })
    }
  }
  return (
    <>
      <Card className='mt-5 px-0'>
        <CardContent className='px-0'>
          <div className='flex flex-row justify-between'>
            <Typography className='text-xl font-semibold mb-4 ml-5'>Documents</Typography>
            <Button
              variant='contained'
              onClick={() => setNewDocumentsModalShow(true)}
              className={` mr-5 mb-4 cursor-pointer`}
              startIcon={<Add />}
              // disabled={otherDocuments?.length === 3}
            >
              Add
            </Button>
          </div>
          <div>
            {documentsLoading ? (
              <div className='flex justify-center itmes-center'>
                <CircularProgress />
              </div>
            ) : documents?.length ? (
              <ReactTable
                data={documents}
                columns={otherDocColumns}
                keyExtractor={user => user.id.toString()}
                // enablePagination
                pageSize={20}
                stickyHeader
                maxHeight={600}
                containerStyle={{ borderRadius: 2 }}
              />
            ) : (
              <div className='flex items-center justify-center'>
                <Typography className='text-base font-semibold'>No Documents uploaded yet</Typography>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <DeleteDocumentModal
        openModal={deleteDocumentsModalShow}
        setOpenModal={setDeleteDocumentsModalShow}
        deleteApiLoading={deleteDocumentLoading}
        handleDelete={handleDelete}
      />
      <AddNewDocumentModal
        openModal={newDocumentsModalShow}
        setOpenModal={setNewDocumentsModalShow}
        uploadingNewDocuments={newDocumentsUploading}
        handleNewFilesUpload={handleAddNewFilesUpload}
        newDocuments={newDocumentsToUpload}
        setNewDocuments={setNewDocumentsToUpload}
      />
    </>
  )
}

export default Documents
