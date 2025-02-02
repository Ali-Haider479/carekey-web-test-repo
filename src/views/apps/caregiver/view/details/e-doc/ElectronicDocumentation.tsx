'use client'

import React from 'react'
import { Typography, Button, Divider, List, Menu, MenuItem, IconButton, Pagination, Card } from '@mui/material'
import { Mail as MailIcon, MoreVert as MoreVertIcon } from '@mui/icons-material'
import CustomCheckList from '@core/components/mui/CustomChecklist'

const ElectronicDocumentation = () => {
  const documents = [
    'PCA Emergency backup plan',
    'PCA Emergency backup plan',
    'RN Home visit charting sheet',
    'RN Home visit charting sheet',
    'Home making care plan',
    'Home making care plan'
  ]

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [selectedDoc, setSelectedDoc] = React.useState<string | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, doc: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedDoc(doc)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDoc(null)
  }

  const handleEdit = () => {
    console.log(`Edit action for ${selectedDoc}`)
    handleMenuClose()
  }

  const handleDelete = () => {
    console.log(`Delete action for ${selectedDoc}`)
    handleMenuClose()
  }

  const renderMenu = () => (
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
      <MenuItem onClick={handleEdit}>Edit</MenuItem>
      <MenuItem onClick={handleDelete}>Delete</MenuItem>
    </Menu>
  )

  return (
    <Card className='p-6 rounded-lg shadow-md w-full ml-3'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <Typography variant='h4' className=''>
          Electronic Documentation
        </Typography>
        <Button
          variant='contained'
          startIcon={<MailIcon />}
          sx={{
            backgroundColor: '#4B0082',
            color: 'white',
            '&:hover': {
              backgroundColor: '#6A0DAD'
            }
          }}
        >
          Send Email
        </Button>
      </div>
      <Divider className='mb-4' />

      {/* Checklist Components */}
      <CustomCheckList listTitle='New Hire Paper Work' documents={documents} menu={renderMenu()} />
      <Divider className='' />
      <CustomCheckList listTitle='Miscellaneous Forms' documents={documents} menu={renderMenu()} />
    </Card>
  )
}

export default ElectronicDocumentation
