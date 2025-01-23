'use client'
import CustomCheckList from '@/@core/components/mui/CustomChecklist'
import { Button, Card, CardContent, Menu, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { useState } from 'react'
import InfoCard from '../../../components/InfoCard'

const E_Document = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

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

  const documents = [
    'PCA Emergency backup plan',
    'PCA Emergency backup plan',
    'RN Home visit charting sheet',
    'RN Home visit charting sheet',
    'Home making care plan',
    'Home making care plan'
  ]
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
    <Grid container spacing={0}>
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <InfoCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 8 }}>
        <Card className='rounded-lg shadow-md'>
          {/* Header */}
          <CardContent className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Electronic Documentation</h2>
            <Button variant='contained'>+ Create Folder</Button>
          </CardContent>
          <CardContent>
            <CustomCheckList documents={documents} menu={renderMenu} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default E_Document
