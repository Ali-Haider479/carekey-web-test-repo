import { useState, useEffect } from 'react'
import { Box, CircularProgress, Dialog, IconButton } from '@mui/material'
import api from '@/utils/api'
import { Download, Visibility } from '@mui/icons-material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

interface ImageRenderWithPresignedUrlProps {
  fileKey: string
  fileName: string
  handleClick?: () => void
  downloading: boolean
  onLoad?: () => void
}

const ImageRenderWithPresignedUrl = ({
  fileKey,
  fileName,
  handleClick,
  downloading,
  onLoad
}: ImageRenderWithPresignedUrlProps) => {
  const [imgUrl, setImgUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imagePreviewModalVisible, setImagePreviewModalVisible] = useState<boolean>(false)

  const handleImagePreviewModalOpen = () => {
    setImagePreviewModalVisible(true)
  }

  const handleImagePreviewModalClose = () => {
    setImagePreviewModalVisible(false)
  }

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await api.get(`/upload-document/get-signed-chat-file-get-url/${fileKey}`)
        setImgUrl(response.data)
      } catch (err) {
        console.error('Error fetching image URL:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (fileKey) {
      fetchImageUrl()
    }
  }, [fileKey])

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress color='inherit' size={24} />
      </Box>
    )
  }

  if (error || !imgUrl) {
    return (
      <Box
        sx={{
          color: 'error.main'
        }}
      >
        Failed to load image
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&:hover .image-overlay': {
            opacity: 1
          },
          '&:hover .image-blur': {
            filter: 'blur(4px)'
          }
        }}
      >
        <img
          src={imgUrl}
          alt={fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}
          className='image-blur w-[315px] h-auto rounded-sm cursor-pointer transition-all duration-300'
          onError={() => setError(true)}
          onLoad={onLoad}
        />
        <Box
          className='image-overlay'
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'row',
            gap: 4,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <IconButton
            onClick={handleImagePreviewModalOpen}
            sx={{
              // backgroundColor: 'background.paper',
              '&:hover': {
                // backgroundColor: 'background.paper',
                transform: 'scale(1.1)'
              },
              transition: 'transform 0.2s'
            }}
            className='bg-white hover:bg-gray-300'
          >
            <Visibility
              sx={theme => ({
                color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main
              })}
            />
          </IconButton>
          <IconButton
            onClick={handleClick}
            sx={{
              // backgroundColor: 'background.paper',
              '&:hover': {
                // backgroundColor: 'background.paper',
                transform: 'scale(1.1)'
              },
              transition: 'transform 0.2s'
            }}
            className='bg-white hover:bg-gray-300'
          >
            {downloading ? (
              <CircularProgress size={24} />
            ) : (
              <Download
                sx={theme => ({
                  color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main
                })}
              />
            )}
          </IconButton>
        </Box>
      </Box>
      <Dialog
        open={imagePreviewModalVisible}
        onClose={handleImagePreviewModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='md'
      >
        <DialogCloseButton onClick={handleImagePreviewModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center w-full p-1'>
          <img
            src={imgUrl}
            alt={fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}
            className='image-blur w-[315px] h-auto rounded-sm cursor-pointer transition-all duration-300'
            onError={() => setError(true)}
            onLoad={onLoad}
          />
        </div>
      </Dialog>
    </Box>
  )
}

export default ImageRenderWithPresignedUrl
