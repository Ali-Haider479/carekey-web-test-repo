'use client'
// React Imports
import { forwardRef, useRef, useState } from 'react'

// MUI Imports
import MuiAvatar from '@mui/material/Avatar'
import { lighten, styled } from '@mui/material/styles'
import type { AvatarProps } from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

// Type Imports
import type { ThemeColor } from '@core/types'
import { CircularProgress, Typography } from '@mui/material'
import { CameraAlt } from '@mui/icons-material'

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'filled' | 'light' | 'light-static'
  size?: number
  onImageChange?: (file: File) => Promise<void>
  placeholder_text_size?: string
  allowupdate?: string
  loading?: boolean
}

const AvatarStyled = styled(MuiAvatar)<CustomAvatarProps>(({ skin, color, size, theme }) => {
  return {
    ...(color &&
      skin === 'light' && {
        backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
        color: `var(--mui-palette-${color}-main)`
      }),
    ...(color &&
      skin === 'light-static' && {
        backgroundColor: lighten(theme.palette[color as ThemeColor].main, 0.84),
        color: `var(--mui-palette-${color}-main)`
      }),
    ...(color &&
      skin === 'filled' && {
        backgroundColor: `var(--mui-palette-${color}-main)`,
        color: `var(--mui-palette-${color}-contrastText)`
      }),
    ...(size && {
      height: size,
      width: size
    })
  }
})

const AvatarWrapper = styled(Box)<{ size?: number }>(({ size }) => ({
  position: 'relative',
  display: 'inline-block',
  '&:hover .MuiBox-root': {
    opacity: 1
  },
  ...(size && {
    height: size,
    width: size
  })
}))

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '5%',
  opacity: 0,
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter
  }),
  cursor: 'pointer'
}))

const ProfileAvatar = forwardRef<HTMLDivElement, CustomAvatarProps>((props: CustomAvatarProps, ref) => {
  // Props
  const { color, skin = 'filled', size, onImageChange, loading, ...rest } = props

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // States
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(rest.src)
  const [isInitials, setIsInitials] = useState<Boolean>(false)

  if (previewUrl?.length === 2) {
    console.log('URL is Initals', previewUrl)
    setIsInitials(true)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Call the callback with the selected file
      if (onImageChange) {
        try {
          await onImageChange(file)
        } catch (error) {
          console.error('Error uploading image:', error)
          // Revert preview on error
          setPreviewUrl(rest.src?.toString())
        }
      }
    }
  }

  const altText = rest?.alt || ' '

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ').filter(Boolean) // Split and remove extra spaces

    if (names.length === 1) {
      return names[0][0].toUpperCase() // Only one name, return its initial
    }

    if (names.length >= 2) {
      return `${names[0][0].toUpperCase()}${names[names.length - 1][0].toUpperCase()}` // First and last name initials
    }
    return '' // Return empty string if no valid names
  }

  return (
    <AvatarWrapper size={size}>
      {loading ? (
        <Box
          sx={theme => ({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            backgroundColor: theme.palette.primary.lighterOpacity
          })}
        >
          <CircularProgress size={24} />
        </Box>
      ) : (
        <AvatarStyled
          ref={ref}
          {...rest}
          src={isInitials ? undefined : previewUrl || rest.src}
          color={color}
          skin={skin}
          sx={{ ...rest.sx, width: size, height: size }}
        >
          {!isInitials && (
            <Typography
              className={`font-bold ${props.placeholder_text_size ? props.placeholder_text_size : 'text-4xl'}`}
            >
              {getInitials(altText)}
            </Typography>
          )}
        </AvatarStyled>
      )}

      {props.allowupdate === 'true' && (
        <UploadOverlay onClick={handleClick}>
          <CameraAlt sx={{ color: '#fff', fontSize: 40 }} />
        </UploadOverlay>
      )}
      <input
        type='file'
        ref={fileInputRef}
        hidden
        accept='image/*'
        onChange={handleFileChange}
        onClick={e => e.stopPropagation()}
      />
    </AvatarWrapper>
  )
})

ProfileAvatar.displayName = 'ProfileAvatar'

export default ProfileAvatar
