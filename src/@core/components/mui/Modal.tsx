import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  styled,
  DialogActions,
  Button,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DeleteOutline } from '@mui/icons-material'

interface FormModalProps {
  isModalOpen: boolean
  setIsModalOpen: (value: boolean) => void
  children: React.ReactNode
  title?: string
  handleCancel?: () => void
  bodyStyle?: React.CSSProperties
  handleDelete?: () => void
}

// Updated styled components to match the design
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '55%',
    maxWidth: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      width: '55%'
    }
  }
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  textAlign: 'left',
  padding: '16px 20px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex', // Add flexbox
  alignItems: 'center', // Vertically center items
  justifyContent: 'space-between', // Space between title and icons
  '& h3': {
    margin: 0,
    fontSize: '16px',
    fontWeight: 500
  },
  position: 'relative',
  backgroundColor: theme.palette.background.paper
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[500],
  padding: 4,
  '& .MuiSvgIcon-root': {
    fontSize: '20px'
  }
}))

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[500],
  padding: 4,
  '& .MuiSvgIcon-root': {
    fontSize: '20px'
  }
}))

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '24px',
  '&.MuiDialogContent-root': {
    padding: '24px'
  }
}))

const FooterContainer = styled(DialogActions)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  backgroundColor: theme.palette.background.paper,
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '14px',
    padding: '6px 16px',
    borderRadius: '4px'
  }
}))

const FormModal: React.FC<FormModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  children,
  title = '',
  handleCancel,
  handleDelete,
  bodyStyle
}) => {
  const closeModalHandler = () => {
    setIsModalOpen(false)
  }

  // Split children into main content and footer if children is a form
  const mainContent = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === 'form') {
      const { children: formChildren } = child.props
      const formContent = React.Children.toArray(formChildren).filter(
        (formChild: any) => formChild.type !== 'div' || !formChild.props.className?.includes('flex gap-4 justify-end')
      )
      const footerContent = React.Children.toArray(formChildren).find(
        (formChild: any) => formChild.type === 'div' && formChild.props.className?.includes('flex gap-4 justify-end')
      )
      return (
        <>
          <StyledDialogContent style={bodyStyle}>
            {React.cloneElement(child as React.ReactElement, { children: formContent })}
          </StyledDialogContent>
          <FooterContainer>{footerContent}</FooterContainer>
        </>
      )
    }
    return <StyledDialogContent style={bodyStyle}>{child}</StyledDialogContent>
  })

  return (
    <StyledDialog open={isModalOpen} onClose={handleCancel || closeModalHandler} fullWidth>
      <StyledDialogTitle>
        <Typography className='font-bold'>{title}</Typography>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <DeleteButton
            aria-label='delete'
            className='rounded-full bg-[#32475C8A] hover:bg-red-400'
            onClick={handleDelete}
            sx={{ color: '#fff' }} // Ensure white color for consistency
          >
            <DeleteOutline />
          </DeleteButton>
          <CloseButton
            aria-label='close'
            onClick={handleCancel || closeModalHandler}
            className='rounded-full bg-[#32475C8A]'
            sx={{ color: '#fff' }}
          >
            <CloseIcon />
          </CloseButton>
        </div>
      </StyledDialogTitle>
      {mainContent}
    </StyledDialog>
  )
}

export default FormModal
