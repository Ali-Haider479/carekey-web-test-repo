'use client'
import React, { useState } from 'react'
import {
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Typography,
  Pagination,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { MoreVert, DeleteOutline as DeleteOutlineIcon, Visibility } from '@mui/icons-material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import api from '@/utils/api'

type Props = {
  listTitle?: string
  tenantDocuments: any
  loading: any
  onDocumentDeleted?: any
}

const CustomCheckList = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPreviewModal, setOpenPreviewModal] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, docId: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedDocId(docId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    // setSelectedDocId(null)
  }

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true)
    handleMenuClose()
  }

  const handlePreviewClick = async (fileKey: string) => {
    setOpenPreviewModal(true)
    handleMenuClose()
    try {
      const docResponse = await api.get(`/tenant/getPdf/${fileKey}`)
      console.log('Document Get Response: ', docResponse)
      setPdfUrl(docResponse?.data)
    } catch (error) {
      console.error(`Error fetching pdf file from S3: `, error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (selectedDocId) {
      try {
        const delResponse = await api.patch(`/tenant/tenant-document/${selectedDocId}`, { isDeleted: true })
        console.log('Del Response: ', delResponse)
        props.onDocumentDeleted?.()
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
    setOpenDeleteDialog(false)
    setSelectedDocId(null)
  }

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false)
    setSelectedDocId(null)
  }

  const handlePreviewCancel = () => {
    setOpenPreviewModal(false)
    setSelectedDocId(null)
  }

  const paginatedDocuments = props.tenantDocuments?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      {props?.listTitle && (
        <div className='h-16 py-5 flex justify-between'>
          <Typography variant='h5' className='font-medium'>
            {props.listTitle}
          </Typography>
          <MoreVert />
        </div>
      )}

      {props.loading ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Document List */}
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {paginatedDocuments?.length === 0 ? (
              <Typography align='center' color='textSecondary'>
                No documents available
              </Typography>
            ) : (
              paginatedDocuments?.map((doc: any) => {
                console.log('Paginated Documents: ', paginatedDocuments)
                return (
                  <ListItem
                    key={doc.id}
                    className='border-[1px]'
                    secondaryAction={
                      <>
                        <IconButton edge='end' aria-label='menu' onClick={e => handleMenuClick(e, doc.id)}>
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedDocId === doc.id}
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
                          <MenuItem onClick={() => handlePreviewClick(doc.fileKey)}>
                            <div className='flex flex-row items-center'>
                              <Visibility className='size-4' />
                              <Typography className='ml-2'>View</Typography>
                            </div>
                          </MenuItem>
                          <MenuItem onClick={handleDeleteClick}>
                            <div className='flex flex-row items-center'>
                              <DeleteOutlineIcon className='size-4' color='error' />
                              <Typography className='ml-2 text-error'>Delete</Typography>
                            </div>
                          </MenuItem>
                        </Menu>
                      </>
                    }
                  >
                    <ListItemAvatar>
                      <PictureAsPdfIcon fontSize='medium' />
                    </ListItemAvatar>
                    <ListItemText primary={doc?.fileName} className='mb-1' />
                  </ListItem>
                )
              })
            )}
          </List>

          {/* Pagination */}
          {paginatedDocuments?.length > 0 && (
            <div className='flex justify-end'>
              <Pagination
                count={Math.ceil(props?.tenantDocuments?.length / itemsPerPage)}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                sx={{ mt: 2 }}
                className='mb-5'
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pdf Preview Dialog */}
      <Dialog
        open={openPreviewModal}
        onClose={handlePreviewCancel}
        aria-labelledby='preview-dialog-title'
        aria-describedby='preview-dialog-description'
        sx={{ minWidth: 200, minHeight: 500 }}
      >
        <DialogTitle id='delete-dialog-title'>Preview Pdf</DialogTitle>
        <DialogContent>
          {/* <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText> */}
          <iframe
            src={pdfUrl}
            key={pdfUrl}
            title='PDF Preview'
            className='border-none w-[500px] h-[600px]'
            allowFullScreen
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewCancel} color='primary'>
            Close
          </Button>
          {/* <Button onClick={handleDeleteConfirm} color='error' autoFocus>
            Delete
          </Button> */}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CustomCheckList
