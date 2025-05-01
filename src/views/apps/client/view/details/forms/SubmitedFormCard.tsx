import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Menu,
  MenuItem
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import LinearProgress from '@mui/material/LinearProgress'
import CustomCheckList from '@/@core/components/mui/CustomChecklist'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import api from '@/utils/api'

interface FormCardProps {
  onShowChecklist?: () => void
}

const SubmittedFormCard = ({ onShowChecklist }: FormCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean | null>(false)
  const [open, setOpen] = useState(false)
  const [documents, setDocuments] = useState<File | null>(null)
  const [tenantDocuments, setTenantDocuments] = useState<File | null>(null)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, doc: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedDoc(doc)
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tenant/tenant-documents/${authUser?.tenant?.id}`)
      setTenantDocuments(response.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDoc(null)
  }

  const handleEdit = () => {
    console.log(`Edit action for ${selectedDoc}`)
    handleMenuClose()
  }

  const handleDelete = () => {
    console.log(`Delete action for ${selectedDoc}`)
    handleMenuClose()
  }
  const handelUpload = async () => {
    if (!documents || !(documents instanceof File)) {
      console.error('No valid file selected. Expected a File object, got:', documents)
      return
    }
    // Create FormData and append the File object
    const formData = new FormData()
    formData.append('file', documents) // 'file' matches the key expected by FileInterceptor('file')

    try {
      await api.post(`/tenant/upload-documents/${authUser?.tenant?.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await fetchInitialData()
      setOpen(false)
      setDocuments(null) // Reset after upload
    } catch (error) {
      console.error('ERROR Uploading tenant documents:', error)
      setOpen(false)
    }
  }
  const renderMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <MenuItem onClick={handleEdit}>Edit</MenuItem>
      <MenuItem onClick={handleDelete}>Delete</MenuItem>
    </Menu>
  )

  return (
    <Card className='rounded-lg shadow-md'>
      <CardContent className='flex justify-between items-center mb-2'>
        <h2 className='text-xl font-semibold'>Submitted Forms</h2>
        <Button variant='contained' onClick={() => setOpen(true)}>
          Upload Form
        </Button>
      </CardContent>
      <CardContent className='mt-2'>
        <CustomCheckList
          // menu={renderMenu}
          tenantDocuments={tenantDocuments}
          loading={loading}
          onDocumentDeleted={fetchInitialData}
        />
      </CardContent>
      <Dialog
        fullWidth
        maxWidth='md'
        open={open}
        onClose={() => setOpen(false)}
        scroll='body'
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col'>
          Upload Forms
        </DialogTitle>
        <DialogContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='col-span-1 p-3 rounded-lg border'>
              <FileUploaderRestrictions
                onFilesSelected={selectedFiles => {
                  console.log('Selected files:', selectedFiles)
                  const file = Array.isArray(selectedFiles) && selectedFiles.length > 0 ? selectedFiles[0] : null
                  setDocuments(file)
                }}
                mimeType={['application/pdf']}
                fileCount={1}
                fileSize={25 * 1024 * 1024}
                title='Choose Files'
              />
            </div>
            <div className='col-span-2'>
              <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {documents && (
                  <div className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
                    <div className='flex justify-between items-center mb-2'>
                      <div className='flex items-center gap-10'>
                        <div className='flex items-center gap-2'>
                          <PictureAsPdfIcon />
                          <Typography className='font-semibold text-green-600 text-sm'>
                            {documents.name.length > 20 ? `${documents.name.substring(0, 20)}...` : documents.name}{' '}
                            (100%)
                          </Typography>
                        </div>
                        <div>
                          <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
                        </div>
                      </div>
                    </div>
                    <div>
                      <LinearProgress variant='determinate' value={100} color='success' />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            onClick={handelUpload}
            type='submit'
            disabled={!documents || !(documents instanceof File)}
          >
            Submit
          </Button>
          <Button variant='tonal' color='secondary' type='reset' onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default SubmittedFormCard
