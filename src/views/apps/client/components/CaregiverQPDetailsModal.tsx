import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { Dialog, DialogTitle, DialogContent, Avatar, Typography, TextField } from '@mui/material'

interface CaregiverQPViewDetailsModalProps {
  openViewModal: boolean
  handleCancel: () => void
  data: any
  componentMode: 'QP' | 'CG'
}

const CaregiverQPViewDetailsModal = ({
  openViewModal,
  handleCancel,
  data,
  componentMode
}: CaregiverQPViewDetailsModalProps) => {
  return (
    <Dialog
      open={openViewModal}
      onClose={handleCancel}
      aria-labelledby='view-dialog-title'
      aria-describedby='view-dialog-description'
      sx={{ '& .MuiDialog-paper': { width: '100%', overflow: 'hidden', maxWidth: '500px' } }}
    >
      <DialogTitle>{`Assigned ${componentMode === 'CG' ? 'Caregiver' : 'QP'} Detail`}</DialogTitle>
      <DialogCloseButton onClick={handleCancel} disableRipple sx={{ right: '8px', top: '8px' }}>
        <i className='bx-x' />
      </DialogCloseButton>
      <DialogContent sx={{ pt: '4px' }}>
        <div className='flex items-center space-x-3 mb-4'>
          <Avatar
            alt={`${data?.user.caregiver?.firstName} ${data?.user.caregiver?.lastName}`}
            src={data?.user.caregiver?.profileImgUrl || data?.user.caregiver?.firstName}
            className='w-10 h-10'
          />
          <div>
            <Typography className='text-sm font-medium'>
              {`${data?.user.caregiver?.firstName} ${data?.user.caregiver?.lastName}`}
            </Typography>
            <Typography className='text-sm text-green-600'>
              {data?.user.emailAddress ? data.user.emailAddress : ''}
            </Typography>
          </div>
        </div>
        <div className='mb-2'>
          <Typography variant='body2'>
            Assignment Date: {new Date(data?.assignmentDate).toLocaleDateString()}
          </Typography>
        </div>
        <div className='mb-2'>
          <Typography variant='body2'>
            Unassignment Date:{' '}
            {data?.unassignmentDate ? new Date(data.unassignmentDate).toLocaleDateString() : 'Not Assigned'}
          </Typography>
        </div>
        {componentMode !== 'QP' && (
          <div className='mb-2'>
            <Typography variant='body2'>Scheduled Hours: {data?.scheduleHours || 'N/A'}</Typography>
          </div>
        )}
        <div className='mb-2'>
          <Typography variant='body2' className='mb-1'>
            Notes:
          </Typography>
          <TextField fullWidth multiline minRows={3} disabled size='small' value={data?.notes} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CaregiverQPViewDetailsModal
