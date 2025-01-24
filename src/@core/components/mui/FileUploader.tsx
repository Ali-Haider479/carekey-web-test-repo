import React, { useState } from 'react'
import List from '@mui/material/List'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FileCopyIcon from '@mui/icons-material/FileCopy'
// Third-party Imports
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@mui/material'

type FileProp = {
  name: string
  type: string
  size: number
}

type FileUploaderProps = {
  onFilesSelected: (files: File[]) => void
}

const FileUploaderRestrictions: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  // States
  const [files, setFiles] = useState<File[]>([])

  // Hooks
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 4,
    maxSize: 2000000,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file: File) => Object.assign(file))
      setFiles(newFiles)
      onFilesSelected(newFiles) // Pass files to parent component
      console.log('FILES SELECTED', newFiles)
    },
    onDropRejected: () => {
      toast.error('You can only upload 2 files & maximum size of 2 MB.', {
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
          {/* <Typography variant='h4' className='mbe-2.5'>
            Drop files here or click to upload.
          </Typography> */}
          <Button variant='contained'>CHOOSE FILE</Button>
          <Typography color='text.secondary' className='text-xs'>
            File must be less than 50mb
          </Typography>
          <Typography color='text.secondary' className='text-xs'>
            Allowed file types: pdf,jpeg,png,doc
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default FileUploaderRestrictions
