'use client'

// React Imports
import { forwardRef, useRef, useState } from 'react'

// MUI Imports
import MuiAvatar from '@mui/material/Avatar'
import { lighten, styled } from '@mui/material/styles'
import type { AvatarProps } from '@mui/material/Avatar'
// import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

// Type Imports
import type { ThemeColor } from '@core/types'

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'filled' | 'light' | 'light-static'
  size?: number
  onImageChange?: (file: File) => Promise<void>
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

// const UploadOverlay = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   borderRadius: '50%',
//   opacity: 0,
//   transition: theme.transitions.create('opacity', {
//     duration: theme.transitions.duration.shorter
//   }),
//   cursor: 'pointer'
// }))

const CustomAvatar = forwardRef<HTMLDivElement, CustomAvatarProps>((props: CustomAvatarProps, ref) => {
  // Props
  const { color, skin = 'filled', size, onImageChange, ...rest } = props

  // Refs
  // const fileInputRef = useRef<HTMLInputElement>(null)

  // States
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(rest.src?.toString())

  // const handleClick = () => {
  //   fileInputRef.current?.click()
  // }

  // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (file) {
  //     // Create preview URL
  //     const objectUrl = URL.createObjectURL(file)
  //     setPreviewUrl(objectUrl)

  //     // Call the callback with the selected file
  //     if (onImageChange) {
  //       try {
  //         await onImageChange(file)
  //       } catch (error) {
  //         console.error('Error uploading image:', error)
  //         // Revert preview on error
  //         setPreviewUrl(rest.src?.toString())
  //       }
  //     }
  //   }
  // }

  return (
    <AvatarWrapper size={size}>
      <AvatarStyled
        ref={ref}
        {...rest}
        src={previewUrl}
        color={color}
        skin={skin}
        sx={{ ...rest.sx, width: size, height: size }}
      />
      {/* <UploadOverlay onClick={handleClick} /> */}
      {/* <IconButton
          sx={{
            color: 'white',
            fontSize: size ? size / 5 : undefined
          }}
        >
          Change
        </IconButton>
      </UploadOverlay> */}
      {/* <input
        type='file'
        ref={fileInputRef}
        hidden
        accept='image/*'
        onChange={handleFileChange}
        onClick={e => e.stopPropagation()}
      /> */}
    </AvatarWrapper>
  )
})

CustomAvatar.displayName = 'CustomAvatar'

export default CustomAvatar
