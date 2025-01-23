'use client'
import React from 'react'
import { UnorderedListOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import CustomCheckList from '@core/components/mui/CustomChecklist'
import { Button, Menu, MenuItem, Typography } from '@mui/material'

interface CareGiverFormCardProps {
  onShowChecklist?: () => void
}

const CareGiverFormCard = ({ onShowChecklist }: CareGiverFormCardProps) => {
  const router = useRouter()
  const { id } = useParams()
  const documents = [
    'PCA Emergency backup plan',
    'PCA Emergency backup plan',
    'PCA Emergency backup plan',
    'RN Home visit charting sheet',
    'RN Home visit charting sheet',
    'RN Home visit charting sheet',
    'Home making care plan',
    'Home making care plan',
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
    <div className='bg-white p-6 rounded-lg shadow-md w-full ml-3 '>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <Typography variant='h4' className='font-semibold text-gray-600'>
          Submitted Forms
        </Typography>
        <Button
          variant='contained'
          startIcon={<UnorderedListOutlined />}
          sx={{
            backgroundColor: '#4B0082',
            color: 'white',
            '&:hover': {
              backgroundColor: '#6A0DAD'
            }
          }}
          onClick={onShowChecklist}
        >
          Checklist
        </Button>
      </div>
      <CustomCheckList listTitle='' documents={documents} menu={renderMenu()} />
    </div>
  )
}

export default CareGiverFormCard
