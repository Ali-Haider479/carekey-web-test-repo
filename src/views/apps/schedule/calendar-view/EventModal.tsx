import React, { useState, useEffect, ChangeEvent } from 'react'
import {
  ExpandMore as ChevronDown,
  ExpandLess as ChevronUp,
  AccessTime as Clock,
  CalendarMonth as CalendarIcon,
  PeopleAlt as Users,
  Work as Briefcase,
  Person as UserIcon,
  HowToReg as UserCheck,
  Edit as EditIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Group as GroupIcon
} from '@mui/icons-material'
import { getStatusColors } from '@/utils/helperFunctions'
import { serviceStatuses } from '@/utils/constants'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: any, isBulk?: boolean) => void
  selectedDate?: string
  event?: any // Existing event data for editing
  events?: any[] // List of all events for hour tracking
}

interface FormData {
  clientId: string
  caregiverId: string
  serviceTypeId: string
  date: string
  startTime: string
  endTime: string
  notes: string
  status: string
  staffRatio: string
}

interface Errors {
  clientId?: string
  caregiverId?: string
  serviceTypeId?: string
  date?: string
  startTime?: string
  endTime?: string
  endDate?: string
  [key: string]: string | undefined
}

// Mock data - replace with your actual data sources
const clients = [
  { id: '1', firstName: 'John', lastName: 'Doe', medicaidId: 'MD123', serviceAuthorizations: ['1', '2'] }
  // Add more clients as needed
]

const caregivers = [
  { id: '1', firstName: 'Jane', lastName: 'Smith', employeeId: 'EMP001', specialties: ['1', '2'] }
  // Add more caregivers as needed
]

const serviceTypes = [
  { id: '1', fullName: 'Personal Care' },
  { id: '2', fullName: 'Respite Care' }
  // Add more service types as needed
]

const staffRatios = [
  '1:1 (1 employee : 1 client)',
  '1:2 (1 employee : 2 clients)',
  '1:3 (1 employee : 3 clients)',
  '1:4 (1 employee : 4 clients)'
]

const EventModal = ({ isOpen, onClose, onSave, selectedDate, event, events }: EventModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    clientId: '',
    caregiverId: '',
    serviceTypeId: '',
    date: selectedDate || '',
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
    status: 'scheduled',
    staffRatio: '1:1 (1 employee : 1 client)'
  })

  const [isBulkScheduling, setIsBulkScheduling] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [isFormExpanded, setIsFormExpanded] = useState(false)

  useEffect(() => {
    if (event) {
      setFormData({
        clientId: event.clientId,
        caregiverId: event.caregiverId,
        serviceTypeId: event.serviceTypeId,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        notes: event.notes || '',
        status: event.status || 'scheduled',
        staffRatio: event.staffRatio || '1:1 (1 employee : 1 client)'
      })
      setIsEditMode(false)
      setIsFormExpanded(false)
    } else {
      setIsEditMode(true)
      setIsFormExpanded(true)
      if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          date: selectedDate
        }))
      }
    }
  }, [event, selectedDate])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const filteredCaregivers = caregivers.filter(caregiver => {
    if (formData.serviceTypeId && !caregiver.specialties.includes(formData.serviceTypeId)) {
      return false
    }
    return true
  })

  const validateForm = (): boolean => {
    const newErrors: Errors = {}

    if (!formData.clientId) newErrors.clientId = 'Client is required'
    if (!formData.caregiverId) newErrors.caregiverId = 'Caregiver is required'
    if (!formData.serviceTypeId) newErrors.serviceTypeId = 'Service type is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'

    if (isBulkScheduling && !endDate) {
      newErrors.endDate = 'End date is required for bulk scheduling'
    }

    if (isBulkScheduling && endDate && new Date(endDate) <= new Date(formData.date)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    const selectedClient = clients.find(c => c.id === formData.clientId)
    if (
      selectedClient &&
      formData.serviceTypeId &&
      !selectedClient.serviceAuthorizations.includes(formData.serviceTypeId)
    ) {
      newErrors.serviceTypeId = 'Client is not authorized for this service type'
    }

    const selectedCaregiver = caregivers.find(c => c.id === formData.caregiverId)
    if (
      selectedCaregiver &&
      formData.serviceTypeId &&
      !selectedCaregiver.specialties.includes(formData.serviceTypeId)
    ) {
      newErrors.caregiverId = 'Caregiver is not qualified for this service type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateServiceCount = (): number => {
    if (!isBulkScheduling || !endDate) return 1

    const start = new Date(formData.date)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    return diffDays
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (isBulkScheduling && endDate) {
      const start = new Date(formData.date)
      const end = new Date(endDate)
      const events = []

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const eventData = {
          id: event?.id || `event-${Date.now()}-${d.getTime()}`,
          ...formData,
          date: d.toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        events.push(eventData)
      }

      onSave(events, true)
    } else {
      const eventData = {
        id: event?.id || `event-${Date.now()}`,
        ...formData,
        createdAt: event?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onSave(eventData)
    }

    onClose()
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      caregiverId: '',
      serviceTypeId: '',
      date: selectedDate || '',
      startTime: '09:00',
      endTime: '10:00',
      notes: '',
      status: 'scheduled',
      staffRatio: '1:1 (1 employee : 1 client)'
    })
    setIsBulkScheduling(false)
    setEndDate('')
    setErrors({})
    setIsEditMode(false)
    setIsFormExpanded(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleEditClick = () => {
    setIsEditMode(true)
    setIsFormExpanded(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setIsFormExpanded(false)
    if (event) {
      setFormData({
        clientId: event.clientId,
        caregiverId: event.caregiverId,
        serviceTypeId: event.serviceTypeId,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        notes: event.notes || '',
        status: event.status || 'scheduled',
        staffRatio: event.staffRatio || '1:1 (1 employee : 1 client)'
      })
    }
    setErrors({})
  }

  if (!isOpen) return null

  const selectedClient = clients.find(c => c.id === formData.clientId)
  const selectedCaregiver = caregivers.find(c => c.id === formData.caregiverId)
  const selectedServiceType = serviceTypes.find(st => st.id === formData.serviceTypeId)

  const getStatusBadgeStyle = (status: string) => {
    const statusColors = getStatusColors(status)
    return {
      backgroundColor: statusColors.bgColor,
      color: statusColors.color,
      borderColor: statusColors.borderColor
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-3'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white'>
              {event ? 'Service Details' : 'Schedule New Service'}
            </h2>
            {event && !isEditMode && (
              <span
                className='px-2 py-1 rounded-full text-xs font-medium border'
                style={getStatusBadgeStyle(formData.status)}
              >
                {getStatusColors(formData.status).name.toUpperCase()}
              </span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            {event && !isEditMode && (
              <button
                onClick={handleEditClick}
                className='flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-md transition-colors'
              >
                <EditIcon className='w-4 h-4' />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 touch-manipulation'
            >
              <CloseIcon className='w-6 h-6' />
            </button>
          </div>
        </div>

        <div className='p-4 sm:p-6'>
          {/* Hour Tracking Panel - Always Visible */}
          {formData.clientId && formData.serviceTypeId && (
            <div className='mb-6'>
              {/* <HourTrackingPanel 
                clientId={formData.clientId}
                serviceTypeId={formData.serviceTypeId}
                events={events || []}
              /> */}
            </div>
          )}

          {/* View Mode - Compact Event Details */}
          {event && !isEditMode && (
            <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <UserIcon className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Client:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Unknown Client'}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <UserCheck className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Caregiver:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {selectedCaregiver
                        ? `${selectedCaregiver.firstName} ${selectedCaregiver.lastName}`
                        : 'Unknown Caregiver'}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Briefcase className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Service:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {selectedServiceType?.fullName || 'Unknown Service'}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Users className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Staff Ratio:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {formData.staffRatio || '1:1 (1 employee : 1 client)'}
                    </span>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <CalendarIcon className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Date:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {new Date(formData.date).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Clock className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Time:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {formData.startTime} - {formData.endTime}
                    </span>
                  </div>
                  {formData.notes && (
                    <div className='flex items-start space-x-2'>
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Notes:</span>
                      <span className='text-sm text-gray-900 dark:text-white'>{formData.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit Form Toggle */}
          {event && !isFormExpanded && (
            <div className='text-center mb-4'>
              <button
                onClick={() => setIsFormExpanded(true)}
                className='flex items-center justify-center space-x-2 mx-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors'
              >
                <span>Show Edit Form</span>
                <ChevronDown className='w-4 h-4' />
              </button>
            </div>
          )}

          {/* Edit Form - Collapsible */}
          {(isFormExpanded || !event) && (
            <div className='space-y-4'>
              {event && (
                <div className='flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700'>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Edit Service</h3>
                  <button
                    onClick={() => setIsFormExpanded(false)}
                    className='flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  >
                    <span>Collapse</span>
                    <ChevronUp className='w-4 h-4' />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
                {/* Client Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    <PersonIcon className='w-4 h-4 inline mr-1' />
                    Client *
                  </label>
                  <select
                    name='clientId'
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                      errors.clientId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Select a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} - {client.medicaidId}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && <p className='mt-1 text-sm text-red-600'>{errors.clientId}</p>}
                </div>

                {/* Service Type Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    <WorkIcon className='w-4 h-4 inline mr-1' />
                    Service Type *
                  </label>
                  <select
                    name='serviceTypeId'
                    value={formData.serviceTypeId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                      errors.serviceTypeId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Select a service type...</option>
                    {serviceTypes
                      .filter(st => !selectedClient || selectedClient.serviceAuthorizations.includes(st.id))
                      .map(serviceType => (
                        <option key={serviceType.id} value={serviceType.id}>
                          {serviceType.fullName}
                        </option>
                      ))}
                  </select>
                  {errors.serviceTypeId && <p className='mt-1 text-sm text-red-600'>{errors.serviceTypeId}</p>}
                </div>

                {/* Caregiver Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    <PersonIcon className='w-4 h-4 inline mr-1' />
                    Caregiver *
                  </label>
                  <select
                    name='caregiverId'
                    value={formData.caregiverId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                      errors.caregiverId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>Select a caregiver...</option>
                    {filteredCaregivers.map(caregiver => (
                      <option key={caregiver.id} value={caregiver.id}>
                        {caregiver.firstName} {caregiver.lastName} - {caregiver.employeeId}
                      </option>
                    ))}
                  </select>
                  {errors.caregiverId && <p className='mt-1 text-sm text-red-600'>{errors.caregiverId}</p>}
                  {formData.serviceTypeId && filteredCaregivers.length === 0 && (
                    <p className='mt-1 text-sm text-yellow-600'>No caregivers qualified for this service type</p>
                  )}
                </div>

                {/* Bulk Scheduling Toggle */}
                {!event && (
                  <div className='flex items-center space-x-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                    <input
                      type='checkbox'
                      id='bulkScheduling'
                      checked={isBulkScheduling}
                      onChange={e => setIsBulkScheduling(e.target.checked)}
                      className='w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 touch-manipulation'
                    />
                    <label htmlFor='bulkScheduling' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Schedule across multiple days
                    </label>
                  </div>
                )}

                {/* Date Selection */}
                <div className={isBulkScheduling ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      <CalendarTodayIcon className='w-4 h-4 inline mr-1' />
                      {isBulkScheduling ? 'Start Date *' : 'Date *'}
                    </label>
                    <input
                      type='date'
                      name='date'
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.date && <p className='mt-1 text-sm text-red-600'>{errors.date}</p>}
                  </div>

                  {isBulkScheduling && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        <CalendarTodayIcon className='w-4 h-4 inline mr-1' />
                        End Date *
                      </label>
                      <input
                        type='date'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        min={formData.date}
                        className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.endDate && <p className='mt-1 text-sm text-red-600'>{errors.endDate}</p>}
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      <AccessTimeIcon className='w-4 h-4 inline mr-1' />
                      Start Time *
                    </label>
                    <input
                      type='time'
                      name='startTime'
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                        errors.startTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startTime && <p className='mt-1 text-sm text-red-600'>{errors.startTime}</p>}
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      <AccessTimeIcon className='w-4 h-4 inline mr-1' />
                      End Time *
                    </label>
                    <input
                      type='time'
                      name='endTime'
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation ${
                        errors.endTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endTime && <p className='mt-1 text-sm text-red-600'>{errors.endTime}</p>}
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Service Status *
                  </label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    className='w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation'
                  >
                    {serviceStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name} - {status.description}
                      </option>
                    ))}
                  </select>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {serviceStatuses.map(status => (
                      <div
                        key={status.id}
                        className='flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border'
                        style={{
                          backgroundColor: status.bgColor,
                          borderColor: status.color,
                          color: status.color
                        }}
                      >
                        <div className='w-2 h-2 rounded-full' style={{ backgroundColor: status.color }} />
                        <span>{status.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff Ratio */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    <GroupIcon className='w-4 h-4 inline mr-1' />
                    Staff Ratio *
                  </label>
                  <select
                    name='staffRatio'
                    value={formData.staffRatio}
                    onChange={handleInputChange}
                    className='w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation'
                  >
                    {staffRatios.map(ratio => (
                      <option key={ratio} value={ratio}>
                        {ratio}
                      </option>
                    ))}
                  </select>
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                    Select the staff-to-client ratio for this service
                  </p>
                </div>

                {/* Bulk Scheduling Summary */}
                {isBulkScheduling && endDate && (
                  <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4'>
                    <h4 className='text-sm font-medium text-green-800 dark:text-green-200 mb-2'>
                      Bulk Scheduling Summary
                    </h4>
                    <p className='text-sm text-green-700 dark:text-green-300'>
                      You are scheduling <strong>{calculateServiceCount()} services</strong> from{' '}
                      <strong>{new Date(formData.date).toLocaleDateString('en-US')}</strong> to{' '}
                      <strong>{new Date(endDate).toLocaleDateString('en-US')}</strong>
                    </p>
                    <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
                      Time: {formData.startTime} - {formData.endTime} each day
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Notes</label>
                  <textarea
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder='Additional notes about this service...'
                    className='w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-manipulation'
                  />
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
                  <button
                    type='button'
                    onClick={event ? handleCancelEdit : handleClose}
                    className='w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 touch-manipulation'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation'
                  >
                    {isBulkScheduling
                      ? `Schedule ${calculateServiceCount()} Services`
                      : event
                        ? 'Update Service'
                        : 'Schedule Service'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventModal
