import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { Button, CircularProgress, Dialog, LinearProgress, Typography } from '@mui/material'
import React, { Dispatch, SetStateAction, useState } from 'react'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

interface addDocumentModalProps {
  openModal: boolean
  setOpenModal: Dispatch<SetStateAction<boolean>>
  uploadingNewDocuments: boolean
  handleNewFilesUpload: () => Promise<void>
  newDocuments: any[]
  setNewDocuments: Dispatch<SetStateAction<File[]>>
}

const AddNewDocumentModal: React.FC<addDocumentModalProps> = ({
  openModal,
  setOpenModal,
  uploadingNewDocuments,
  handleNewFilesUpload,
  newDocuments,
  setNewDocuments
}) => {
  const handleCloseModal = () => {
    setNewDocuments([])
    setOpenModal(false)
  }
  const renderFileProgress = (files: File[]) => {
    return files.map((file: File, index: number) => (
      <div key={index} className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center gap-10'>
            <div className='flex items-center gap-2'>
              <PictureAsPdfIcon />
              <Typography className='font-semibold text-green-600 text-sm'>
                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name} (100%)
              </Typography>
            </div>
            <div>
              <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
            </div>
          </div>
        </div>
        <LinearProgress variant='determinate' value={100} color={'success'} />
      </div>
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newDocuments.length === 0) {
      // Add error state
      return
    }
    await handleNewFilesUpload()
  }

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
      maxWidth='md'
    >
      <DialogCloseButton onClick={handleCloseModal} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>
      <div className='flex items-center justify-center w-full px-5 flex-col'>
        <form onSubmit={handleSubmit}>
          <div>
            <h2 className='text-xl font-semibold mt-5 mb-4'>Add New Document</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='col-span-1 p-3 rounded-lg border'>
              <FileUploaderRestrictions
                onFilesSelected={setNewDocuments}
                mimeType={['application/pdf']}
                fileCount={3}
                fileSize={25 * 1024 * 1024}
                title='Choose Files'
              />
            </div>
            <div className='col-span-2'>
              <h3 className='text-lg font-semibold mb-4 mt-3'>Uploading Files</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(newDocuments)}</div>
            </div>
          </div>
          <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
            <Button variant='outlined' color='secondary' onClick={handleCloseModal}>
              CANCEL
            </Button>
            <Button
              startIcon={uploadingNewDocuments ? <CircularProgress size={20} color='inherit' /> : null}
              disabled={uploadingNewDocuments}
              type='submit'
              variant='contained'
              className={``}
            >
              SAVE
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

export default AddNewDocumentModal
