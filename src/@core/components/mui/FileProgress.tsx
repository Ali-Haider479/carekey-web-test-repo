import React from 'react'
import { Box, LinearProgress, Typography, IconButton } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import UploadIcon from '@mui/icons-material/Upload'
import CloseIcon from '@mui/icons-material/Close'

interface FileProgressProps {
  file: File
  onUpload?: () => void
  onRemove: () => void
  progress?: number
  uploadStatus?: 'ready' | 'uploading' | 'completed' | 'error'
}

const FileProgress: React.FC<FileProgressProps> = ({
  file,
  onUpload,
  onRemove,
  progress = 100,
  uploadStatus = 'ready'
}) => {
  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'info.main'
      case 'completed':
        return 'success.main'
      case 'error':
        return 'error.main'
      default:
        return 'warning.main'
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...'
      case 'completed':
        return 'Upload Complete'
      case 'error':
        return 'Upload Failed'
      default:
        return 'Upload Ready'
    }
  }

  const truncateFileName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name
    return `${name.substring(0, maxLength)}...${name.split('.').pop()}`
  }

  return (
    <div className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%] flex gap-3 items-center'>
      <Box sx={{ flexGrow: 1 }}>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 min-w-0'>
              {file.type.includes('pdf') ? <PictureAsPdfIcon color='error' /> : <ImageIcon color='primary' />}
              <Typography
                variant='body2'
                className='font-semibold truncate'
                sx={{ color: getStatusColor() }}
                title={file.name}
              >
                {truncateFileName(file.name)}
              </Typography>
            </div>
            <Typography variant='caption' sx={{ color: 'text.secondary', mr: 1 }}>
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
          </div>
          <Typography
            variant='body2'
            sx={{
              color: uploadStatus === 'error' ? 'error.main' : 'success.main',
              fontWeight: 'medium'
            }}
          >
            {getStatusText()}
          </Typography>
        </div>
        <LinearProgress variant='determinate' value={progress} color={uploadStatus === 'error' ? 'error' : 'success'} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {uploadStatus === 'ready' && onUpload && (
          <IconButton onClick={onUpload} aria-label='Upload file' color='primary' size='small'>
            <UploadIcon fontSize='small' />
          </IconButton>
        )}
        <IconButton onClick={onRemove} aria-label='Remove file' color='error' size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>
    </div>
  )
}

export default FileProgress
