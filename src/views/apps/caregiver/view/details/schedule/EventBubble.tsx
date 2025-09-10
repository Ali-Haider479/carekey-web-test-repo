import React from 'react'
import { Check } from '@mui/icons-material'
import { formatTimeTo12hr, getShortStatusName, getStatusColors } from '@/utils/helperFunctions'

interface EventBubbleProps {
  event: any
  onClick?: React.MouseEventHandler<HTMLDivElement>
  onDelete?: () => void
}

const EventBubble: React.FC<EventBubbleProps> = ({ event, onClick, onDelete }) => {
  // Get related data
  const statusColors = getStatusColors(event.status)

  const bubbleEvent = event || event[0]

  const serviceName = bubbleEvent?.clientService?.serviceAuthService?.name

  const procedureCode =
    bubbleEvent?.clientService?.service?.procedureCode || bubbleEvent?.clientService?.serviceAuthService?.procedureCode
  return (
    <div
      onClick={onClick}
      className='event-bubble border-l-3 cursor-pointer hover:opacity-80 transition-opacity touch-manipulation p-1.5 rounded-md text-xs'
      style={{
        backgroundColor: statusColors.bgColor,
        color: statusColors.color,
        borderLeftColor: statusColors.borderColor
      }}
      title={`${bubbleEvent.client?.firstName} ${bubbleEvent.client?.lastName} - ${serviceName} with ${bubbleEvent.caregiver?.firstName} ${bubbleEvent.caregiver?.lastName} (${new Date(bubbleEvent.start).toLocaleDateString().split('/').join('-')}-${new Date(bubbleEvent.end).toLocaleDateString().split('/').join('-')}) - Status: ${statusColors?.name}`}
    >
      {/* Client Name and Status */}
      <div className='font-medium leading-tight flex items-center justify-between'>
        <div className='flex items-center space-x-1 min-w-0 flex-1'>
          <span className='truncate'>
            {bubbleEvent.client?.firstName} {bubbleEvent.client?.lastName}
          </span>
          {bubbleEvent.status === 'worked' && (
            <Check className='w-3 h-3 flex-shrink-0' style={{ color: statusColors.color }} />
          )}
        </div>
        <span className='font-semibold text-[10px] ml-1 flex-shrink-0'>{getShortStatusName(bubbleEvent.status)}</span>
      </div>

      {/* Service and Caregiver Info */}
      <div className='opacity-90 leading-tight truncate mt-0.5'>
        {serviceName}-{procedureCode} • {bubbleEvent.caregiver?.firstName} {bubbleEvent.caregiver?.lastName}
      </div>

      {/* Time Information */}
      <div className='leading-tight mt-0.5'>
        <div className='opacity-75'>
          <div>Scheduled Hours:</div>
          <span className='text-[10px]'>
            {new Date(bubbleEvent.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} -{' '}
            {new Date(bubbleEvent.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        {bubbleEvent.timelog && (
          <div className='opacity-75 mt-0.5'>
            <div>Worked Hours:</div>
            <span className='text-[10px]'>
              {new Date(bubbleEvent.timelog?.clockIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} -{' '}
              {new Date(bubbleEvent.timelog?.clockOut).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
  // return (
  //   <div
  //     onClick={onClick}
  //     className='bubbleEvent-bubble border-l-3 cursor-pointer hover:opacity-80 transition-opacity touch-manipulation p-1.5 rounded-r-md text-xs'
  //     style={{
  //       backgroundColor: statusColors.bgColor,
  //       color: statusColors.color,
  //       borderLeftColor: statusColors.borderColor
  //     }}
  //     title={`${bubbleEvent.client.firstName} ${event.client.lastName} - ${serviceName} with ${event.caregiver.firstName} ${event.caregiver.lastName} (${new Date(event.start).toLocaleDateString().split('/').join('-')}-${new Date(event.end).toLocaleDateString().split('/').join('-')}) - Status: ${statusColors?.name}`}
  //   >
  //     <div className='font-medium leading-tight flex items-center justify-between'>
  //       <div className='flex items-center space-x-1 min-w-0 flex-1'>
  //         <span className='truncate'>
  //           {event.client.firstName} {event.client.lastName}
  //         </span>
  //         {event.status === 'worked' && (
  //           <Check className='w-3 h-3 flex-shrink-0' style={{ color: statusColors.color }} />
  //         )}
  //       </div>
  //       <span className='font-semibold text-[10px] ml-1 flex-shrink-0'>{getShortStatusName(event.status)}</span>
  //     </div>
  //     <div className='opacity-90 leading-tight truncate mt-0.5'>
  //       {serviceName}-{procedureCode} • {event.caregiver.firstName} {event.caregiver.lastName}
  //     </div>
  //     <div className='flex flex-row gap-1'>
  //       <div className='opacity-75 leading-tight mt-0.5'>
  //         <span className='text-[10px]'>
  //           {new Date(event.start).toLocaleTimeString()}-{new Date(event.end).toLocaleTimeString()}
  //         </span>

  //       </div>
  //       {event.timelog && (
  //         <div className='opacity-75 leading-tight mt-0.5'>
  //           <span className='text-[10px]'>
  //             {new Date(event.timelog.clockIn).toLocaleTimeString()}-{new Date(event.timelog.clockOut).toLocaleTimeString()}
  //           </span>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // )
}

export default EventBubble
