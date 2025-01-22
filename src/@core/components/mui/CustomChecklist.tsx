'use client'
import React, { useState } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  Select,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Typography,
  Pagination
} from '@mui/material'
import { FolderOutlined, MoreVert } from '@mui/icons-material'

type Props = {
  listTitle?: string
  documents: string[]
  menu: any
}

const CustomCheckList = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const paginatedDocuments = props.documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      {props?.listTitle && (
        <div className='h-16 py-5 flex justify-between'>
          <Typography variant='h5' className='text-gray-500 font-medium'>
            {props.listTitle}
          </Typography>
          <MoreVert />
        </div>
      )}

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
                  {props.menu}
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
          count={Math.ceil(props.documents.length / itemsPerPage)}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          sx={{ mt: 2 }}
          className='mb-5'
        />
      </div>
    </div>
  )
}

export default CustomCheckList
