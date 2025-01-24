import React, { useState } from 'react'
import List from '@mui/material/List'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@mui/material'

type FileUploaderProps = {
  onFilesSelected: (files: File[]) => void
  title?: string
  fileCount?: number
  fileSize?: number
  mimeType?: string | string[]
}

const FileUploaderRestrictions: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  title = 'Choose File',
  fileCount = 2,
  fileSize = 50 * 1024 * 1024, // 50MB
  mimeType = 'image/*'
}) => {
  const [files, setFiles] = useState<File[]>([])

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: fileCount,
    maxSize: fileSize,
    accept:
      typeof mimeType === 'string'
        ? { [mimeType]: [] }
        : mimeType.reduce((acc: any, type: any) => {
            acc[type] = []
            return acc
          }, {}),
    onDrop: (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file: File) => Object.assign(file))
      setFiles(newFiles)
      onFilesSelected(newFiles)
      console.log('FILES SELECTED', newFiles)
    },
    onDropRejected: fileRejections => {
      const errorMessages = fileRejections.map(rejection => {
        const sizeError = rejection.errors.find(err => err.code === 'file-too-large')
        const typeError = rejection.errors.find(err => err.code === 'file-invalid-type')

        if (sizeError) return 'File size exceeds the maximum limit.'
        if (typeError) return 'Invalid file type.'
        return 'File upload failed.'
      })

      toast.error(errorMessages.join('\n'), {
        autoClose: 3000
      })
    }
  })

  //   const renderFilePreview = (file: FileProp) => {
  //     if (file.type.startsWith('image')) {
  //       return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
  //     } else {
  //       return <i className='bx-file' />
  //     }
  //   }

  //   const handleRemoveFile = (file: FileProp) => {
  //     const filtered = files.filter((i: FileProp) => i.name !== file.name)
  //     setFiles(filtered)
  //     onFilesSelected(filtered) // Update parent component with remaining files
  //   }

  //   const fileList = files.map((file: FileProp) => (
  //     <ListItem key={file.name}>
  //       <div className='file-details'>
  //         <div className='file-preview'>{renderFilePreview(file)}</div>
  //         <div>
  //           <Typography className='file-name'>{file.name}</Typography>
  //           <Typography className='file-size' variant='body2'>
  //             {Math.round(file.size / 100) / 10 > 1000
  //               ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
  //               : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
  //           </Typography>
  //         </div>
  //       </div>
  //       <IconButton onClick={() => handleRemoveFile(file)}>
  //         <i className='bx-x text-xl' />
  //       </IconButton>
  //     </ListItem>
  //   ))

  //   const handleRemoveAllFiles = () => {
  //     setFiles([])
  //     onFilesSelected([]) // Clear files in parent component
  //   }

  return (
    <Card {...getRootProps({ className: 'dropzone, w-full' })}>
      <CardContent className='w-full'>
        <input {...getInputProps()} />
        <div className='flex items-center flex-col justify-center gap-3'>
          <Avatar variant='rounded' className='bs-12 is-12 mbe-3'>
            <FileCopyIcon />
          </Avatar>
          <Button variant='contained'>{title}</Button>
          <Typography color='text.secondary' className='text-xs'>
            File must be less than {fileSize / (1024 * 1024)}mb
          </Typography>
          <Typography color='text.secondary' className='text-xs'>
            Allowed file types: {typeof mimeType === 'string' ? mimeType : mimeType.join(', ')}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default FileUploaderRestrictions
