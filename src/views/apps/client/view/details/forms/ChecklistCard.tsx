import CustomCheckList from '@/@core/components/mui/CustomChecklist'
import { EmailOutlined } from '@mui/icons-material'
import { Menu, MenuItem, Card, CardContent, Button } from '@mui/material'
import { useState } from 'react'

interface ChecklistCardProps {
  onShowForms?: () => void
}

const SubmittedCheckList = ({ onShowForms }: ChecklistCardProps) => {
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
    <Card className='rounded-lg shadow-md'>
      {/* Header */}
      <CardContent className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>Submitted Forms</h2>
        <div>
          <Button variant='contained' onClick={onShowForms} className='mr-2'>
            Go Back
          </Button>
          <Button startIcon={<EmailOutlined />} variant='contained'>
            Send Email
          </Button>
        </div>
      </CardContent>
      {/* <CardContent className='mt-3'>
        <CustomCheckList listTitle='Client Intake Forms' tenantDocuments={documents} menu={renderMenu} />
      </CardContent>
      <CardContent className='mt-3'>
        <CustomCheckList listTitle='Client Consistent Form' tenantDocuments={documents} menu={renderMenu} />
      </CardContent>
      <CardContent className='mt-3'>
        <CustomCheckList listTitle='Miscellaneous Forms' tenantDocuments={documents} menu={renderMenu} />
      </CardContent> */}
    </Card>
  )
}

export default SubmittedCheckList
