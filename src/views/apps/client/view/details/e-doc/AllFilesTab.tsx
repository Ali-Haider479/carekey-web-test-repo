'use client'
import { DeleteOutline, FileDownloadOutlined, MoreVert } from '@mui/icons-material'
import {
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Box
} from '@mui/material'
import React, { useState } from 'react'
import api from '@/utils/api'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

const AllFilesTab = ({ clientDocuments, clientDocsLoading, onDocumentDeleted }: any) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, docId: number) => {
    console.log('USAMA MENU CLICK', docId)
    setSelectedDocId(docId)
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    // setSelectedDocId(null)
  }

  const handleDownload = (fileKey: string, fileName: string) => {
    const s3Url = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`
    const link = document.createElement('a')
    link.href = s3Url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    handleMenuClose()
  }

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true)
    handleMenuClose()
  }

  const handleDeleteConfirm = async () => {
    console.log('USAMA DEL', selectedDocId)
    if (selectedDocId) {
      try {
        await api.delete(`/client/${selectedDocId}`)
        console.log(`Document with ID ${selectedDocId} deleted successfully`)
        onDocumentDeleted?.() // Trigger refetch in parent
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

  const paginatedDocuments = clientDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
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

      {/* Loading Indicator */}
      {clientDocsLoading ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Document List */}
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {paginatedDocuments.length === 0 ? (
              <Typography align='center' color='textSecondary'>
                No documents available
              </Typography>
            ) : (
              paginatedDocuments.map((doc: any) => (
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
                        <MenuItem onClick={() => handleDownload(doc.fileKey, doc.fileName)}>
                          <div className='flex flex-row items-center'>
                            <FileDownloadOutlined className='size-5' />
                            <Typography className='ml-2'>Download</Typography>
                          </div>
                        </MenuItem>
                        <MenuItem onClick={handleDeleteClick}>
                          <div className='flex flex-row items-center'>
                            <DeleteOutline className='size-4' color='error' />
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
                  <ListItemText primary={doc.fileName} />
                </ListItem>
              ))
            )}
          </List>

          {/* Pagination */}
          {paginatedDocuments.length > 0 && (
            <div className='flex justify-end'>
              <Pagination
                count={Math.ceil(clientDocuments.length / itemsPerPage)}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                sx={{ mt: 2 }}
                className='mb-5'
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AllFilesTab
