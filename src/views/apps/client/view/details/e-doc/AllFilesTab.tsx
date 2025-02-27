'use client'
import {
  DeleteOutline,
  EditOutlined,
  FileDownloadOutlined,
  FolderOutlined,
  MoreVert,
  SendOutlined
} from '@mui/icons-material'
import {
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Typography
} from '@mui/material'
import React, { useState } from 'react'

const documents = [
  'PCA Emergency backup plan',
  'PCA Emergency backup plan',
  'RN Home visit charting sheet',
  'RN Home visit charting sheet',
  'Home making care plan',
  'Home making care plan'
]

const AllFilesTab = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const paginatedDocuments = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      {/* File Actions */}
      <div className='mb-4'>
        <Select displayEmpty defaultValue='' variant='outlined' fullWidth sx={{ maxWidth: 530, height: 40 }}>
          <MenuItem value=''>Select files</MenuItem>
          <MenuItem value='upload'>Upload new</MenuItem>
          <MenuItem value='delete'>Delete selected</MenuItem>
        </Select>
      </div>

      {/* Document List */}
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {paginatedDocuments.map((doc, index) => (
          <ListItem
            key={index}
            className='border-[1px]'
            secondaryAction={
              <>
                <IconButton edge='end' aria-label='menu' onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
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
                  <MenuItem>
                    <div className='flex flex-row items-center'>
                      <SendOutlined className='size-4' />
                      <Typography className='ml-2'>Send</Typography>
                    </div>
                  </MenuItem>
                  <MenuItem>
                    <div className='flex flex-row items-center'>
                      <EditOutlined className='size-4' />
                      <Typography className='ml-2'>Modify</Typography>
                    </div>
                  </MenuItem>
                  <MenuItem>
                    <div className='flex flex-row items-center'>
                      <FileDownloadOutlined className='size-5' />
                      <Typography className='ml-2'>Download</Typography>
                    </div>
                  </MenuItem>
                  <MenuItem>
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
              <FolderOutlined fontSize='medium' sx={{ color: '#555' }} />
            </ListItemAvatar>
            <ListItemText primary={doc} />
          </ListItem>
        ))}
      </List>

      {/* Pagination */}
      <div className='flex justify-end'>
        <Pagination
          count={Math.ceil(documents.length / itemsPerPage)}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          sx={{ mt: 2 }}
          className='mb-5'
        />
      </div>
    </div>
  )
}

export default AllFilesTab
