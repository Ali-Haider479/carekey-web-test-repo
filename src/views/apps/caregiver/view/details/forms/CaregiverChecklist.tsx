import React from 'react'
import CustomCheckList from '@core/components/mui/CustomChecklist'
import { Button, Menu, MenuItem, Typography } from '@mui/material'
import { Mail as MailIcon, MoreVert as MoreVertIcon } from '@mui/icons-material'
import ListAltIcon from '@mui/icons-material/ListAlt'

interface CareGiverChecklistProps {
  onShowForms?: () => void
}

const CaregiverChecklist = ({ onShowForms }: CareGiverChecklistProps) => {
  const documents = [
    'PCA Emergency backup plan',
    'PCA Emergency backup plan',
    'RN Home visit charting sheet',
    'RN Home visit charting sheet',
    'Home making care plan',
    'Home making care plan'
  ]

  const MiscDocsForms = [
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
    <div className='bg-white p-6 rounded-lg shadow-md w-full mb-2'>
      {/* Header */}
      <div className='h-[38px] flex justify-between items-center'>
        <h2 className='text-2xl font-semibold text-gray-600'>Checklist</h2>
        <div>
          <Button
            variant='contained'
            startIcon={<ListAltIcon />}
            sx={{
              marginRight: '10px',
              backgroundColor: '#4B0082',
              color: 'white',
              '&:hover': {
                backgroundColor: '#6A0DAD'
              }
            }}
            onClick={onShowForms}
          >
            Submitted Forms
          </Button>
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
      </div>
      <CustomCheckList listTitle='New Hire Paper Work' documents={documents} menu={renderMenu()} />

      <CustomCheckList listTitle='Miscellaneous Forms' documents={MiscDocsForms} menu={renderMenu()} />
    </div>
  )
}

export default CaregiverChecklist
