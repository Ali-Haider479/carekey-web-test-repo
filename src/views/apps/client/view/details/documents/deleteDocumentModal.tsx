import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { Dialog, Typography, Button, CircularProgress } from '@mui/material'
import React, { Dispatch, SetStateAction } from 'react'

interface deleteDocumentModalProps {
  openModal: boolean
  setOpenModal: Dispatch<SetStateAction<boolean>>
  deleteApiLoading: boolean
  handleDelete: () => void
}

const DeleteDocumentModal: React.FC<deleteDocumentModalProps> = ({
  openModal,
  setOpenModal,
  deleteApiLoading,
  handleDelete
}) => {
  const handleModalClose = () => {
    setOpenModal(false)
  }
  return (
    <Dialog
      open={openModal}
      onClose={handleModalClose}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      maxWidth='md'
    >
      <DialogCloseButton onClick={handleModalClose} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>
      <div className='flex items-center justify-center w-full px-5 flex-col'>
        {/* <form onSubmit={handleDelete}> */}
        <div>
          <h2 className='text-xl font-semibold mt-5 mb-4'>Delete document</h2>
        </div>
        <div>
          <Typography className='mb-7'>Are you sure you want to delete this document?</Typography>
        </div>
        <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
          <Button variant='outlined' color='secondary' onClick={handleModalClose}>
            NO
          </Button>
          <Button
            startIcon={deleteApiLoading ? <CircularProgress size={20} color='inherit' /> : null}
            disabled={deleteApiLoading}
            // type='submit'
            onClick={handleDelete}
            variant='contained'
            className={``}
          >
            YES
          </Button>
        </div>
        {/* </form> */}
      </div>
    </Dialog>
  )
}

export default DeleteDocumentModal
