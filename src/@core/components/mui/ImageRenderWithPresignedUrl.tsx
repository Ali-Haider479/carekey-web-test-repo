import { useState, useEffect } from 'react'
import { Box, CircularProgress, IconButton } from '@mui/material'
import api from '@/utils/api'
import { Download } from '@mui/icons-material'

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
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <IconButton
            onClick={handleClick}
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'background.paper',
                transform: 'scale(1.1)'
              },
              transition: 'transform 0.2s'
            }}
          >
            {downloading ? <CircularProgress size={24} /> : <Download />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default ImageRenderWithPresignedUrl
