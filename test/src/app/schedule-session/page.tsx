'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon, CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
// ADD THIS IMPORT - Import session management functions
import { addNewSession, getPreviousSessionsWithDoctor } from '../../model/session-model/session-model'

// Define interfaces for type safety - UPDATED: Added new fields
interface SessionData {
  patientName: string
  patientPhone: string
  practitionerName: string
  practitionerPhone: string
  sessionType: string
  sessionMode: 'In-Person' | 'Online'
  sessionDate: string
  sessionTime: string
  sessionDetails: string
  whatsappNumber: string  // UPDATED: Changed from onlineSessionLink
  emailId: string         // NEW: Added email field
  address: string         // NEW: Added address field
}

interface DoctorInfo {
  id: string
  name: string
  phone: string
  expertise: string
  gender: string
  sessionMode: string
  sessionFee: string
  avatar: string
}

// Time slots component with 1-hour intervals
function TimeSlotPicker({ selectedTime, onTimeSelect, selectedDate }: {
  selectedTime: string
  onTimeSelect: (time: string) => void
  selectedDate: string
}) {
  const generateTimeSlotsByPeriod = () => {
    const timeSlots = {
      Morning: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'],
      Afternoon: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'],
      Evening: ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'],
      Night: ['08:00 PM', '09:00 PM', '10:00 PM']
    }

    const today = new Date()
    const selected = new Date(selectedDate)
    const isToday = selected.toDateString() === today.toDateString()
    
    if (isToday) {
      const currentHour = today.getHours()
      
      Object.keys(timeSlots).forEach(period => {
        timeSlots[period as keyof typeof timeSlots] = timeSlots[period as keyof typeof timeSlots].filter(time => {
          const [timeStr, ampm] = time.split(' ')
          const [hour] = timeStr.split(':').map(Number)
          let hour24 = hour
          
          if (ampm === 'PM' && hour !== 12) hour24 += 12
          if (ampm === 'AM' && hour === 12) hour24 = 0
          
          return hour24 > currentHour
        })
      })
    }

    return timeSlots
  }

  const timeSlotsByPeriod = generateTimeSlotsByPeriod()

  return (
    <div className="space-y-6">
      {Object.entries(timeSlotsByPeriod).map(([period, slots]) => {
        if (slots.length === 0) return null
        
        return (
          <div key={period}>
            <h4 className="text-sm font-medium text-gray-900 mb-3">{period}</h4>
            <div className="grid grid-cols-2 gap-2">
              {slots.map((time, index) => (
                <button
                  key={`${period}-${index}-${time}`}
                  onClick={() => onTimeSelect(time)}
                  className={`p-3 rounded-lg text-sm font-medium border transition-colors ${
                    selectedTime === time
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Date picker component
function DatePicker({ selectedDate, onDateSelect }: {
  selectedDate: string
  onDateSelect: (date: string) => void
}) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < startDay; i++) {
      dates.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (date >= today || date.toDateString() === today.toDateString()) {
        dates.push(date)
      } else {
        dates.push(null)
      }
    }
    
    return dates
  }

  const calendarDates = generateCalendarDates()

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Select Date'
    const date = new Date(dateString.split('/').reverse().join('-'))
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const today = new Date()
    const newMonth = new Date(currentMonth)
    
    if (direction === 'next') {
      newMonth.setMonth(currentMonth.getMonth() + 1)
    } else {
      newMonth.setMonth(currentMonth.getMonth() - 1)
      if (newMonth < new Date(today.getFullYear(), today.getMonth(), 1)) {
        return
      }
    }
    
    setCurrentMonth(newMonth)
  }

  const today = new Date()
  const canGoPrev = currentMonth > new Date(today.getFullYear(), today.getMonth(), 1)

  return (
    <div className="relative">
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
      >
        <span className={selectedDate ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {formatDateForDisplay(selectedDate)}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-400" />
      </button>
      
      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-sm mx-auto max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50">
              <button
                onClick={() => navigateMonth('prev')}
                disabled={!canGoPrev}
                className={`p-2 rounded-lg transition-colors ${
                  canGoPrev 
                    ? 'text-purple-600 hover:bg-purple-100' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-semibold text-purple-900">
                {formatMonthYear(currentMonth)}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={`header-${index}`} className="text-center text-xs font-extrabold text-gray-900 p-3">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDates.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="p-3"></div>
                  }
                  
                  const dateString = date.toLocaleDateString('en-GB')
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate === dateString
                  
                  return (
                    <button
                      key={`date-${index}-${date.getTime()}`}
                      onClick={() => {
                        onDateSelect(dateString)
                        setShowCalendar(false)
                      }}
                      className={`p-3 text-sm font-black rounded-xl transition-all duration-200 border-2 ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105'
                          : isToday
                          ? 'bg-purple-100 text-purple-900 border-purple-400 hover:bg-purple-200 shadow-md'
                          : 'text-gray-900 border-gray-300 hover:bg-purple-50 hover:text-purple-900 hover:border-purple-400 hover:scale-105 shadow-sm'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs font-black text-gray-900 mb-3">Quick Select</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: 'Next Week', days: 7 }
                ].map((option) => {
                  const quickDate = new Date()
                  quickDate.setDate(quickDate.getDate() + option.days)
                  const quickDateString = quickDate.toLocaleDateString('en-GB')
                  
                  return (
                    <button
                      key={option.label}
                      onClick={() => {
                        onDateSelect(quickDateString)
                        setShowCalendar(false)
                      }}
                      className="py-2 px-3 text-xs font-black text-purple-900 bg-white border-2 border-purple-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 transition-colors shadow-sm"
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 space-y-3">
              <button
                onClick={() => setShowCalendar(false)}
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {selectedDate && (
                <button
                  onClick={() => setShowCalendar(false)}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  Confirm Date
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dropdown component
function Dropdown({ value, options, onChange, placeholder }: {
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:border-purple-300 transition-colors"
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            {options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                  value === option 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-900 hover:bg-purple-50 hover:text-purple-700'
                } first:rounded-t-lg last:rounded-b-lg`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Main Schedule Session component with dynamic doctor information
export default function ScheduleSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const patientName = searchParams.get('patientName') || ''
  const patientPhone = searchParams.get('patientPhone') || ''
  
  // Extract doctor information from URL params
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)

  useEffect(() => {
    if (!patientName || !patientPhone) {
      router.push('/patient-details')
      return
    }

    // Check if doctor information is passed
    const doctorId = searchParams.get('doctorId')
    if (doctorId) {
      const doctor: DoctorInfo = {
        id: doctorId,
        name: searchParams.get('doctorName') || 'Saria Dilon',
        phone: searchParams.get('doctorPhone') || '+91 9876543210',
        expertise: searchParams.get('doctorExpertise') || 'Psychologist',
        gender: searchParams.get('doctorGender') || 'Female',
        sessionMode: searchParams.get('doctorSessionMode') || 'In-Person & Online',
        sessionFee: searchParams.get('doctorSessionFee') || '₹2200',
        avatar: searchParams.get('doctorAvatar') || '/api/placeholder/80/80'
      }
      setDoctorInfo(doctor)
    } else {
      // Default doctor information if none provided
      setDoctorInfo({
        id: 'default-1',
        name: 'Saria Dilon',
        phone: '+91 9876543210',
        expertise: 'Psychologist',
        gender: 'Female',
        sessionMode: 'In-Person & Online',
        sessionFee: '₹2200',
        avatar: '/api/placeholder/80/80'
      })
    }
  }, [patientName, patientPhone, router, searchParams])

  // UPDATED: Session data with new fields
  const [sessionData, setSessionData] = useState<SessionData>({
    patientName: patientName,
    patientPhone: patientPhone,
    practitionerName: doctorInfo?.name || 'Saria Dilon',
    practitionerPhone: doctorInfo?.phone || '+91 9876543210',
    sessionType: '',
    sessionMode: 'In-Person',
    sessionDate: '',
    sessionTime: '',
    sessionDetails: '',
    whatsappNumber: '',  // UPDATED: Changed from onlineSessionLink
    emailId: '',         // NEW: Added email field
    address: ''          // NEW: Added address field
  })

  const [showTimePicker, setShowTimePicker] = useState(false)

  // Update session data when doctor info is loaded
  useEffect(() => {
    if (doctorInfo) {
      setSessionData(prev => ({
        ...prev,
        practitionerName: doctorInfo.name,
        practitionerPhone: doctorInfo.phone
      }))
    }
  }, [doctorInfo])

  // Dynamic session type options based on doctor's expertise
  const getSessionTypeOptions = (): string[] => {
    if (!doctorInfo) return ['Counselling', 'Regular checkups']
    
    const expertise = doctorInfo.expertise.toLowerCase()
    if (expertise.includes('psychologist') || expertise.includes('psychiatrist')) {
      return sessionData.sessionMode === 'In-Person' 
        ? ['Counselling', 'Therapy Session', 'Consultation']
        : ['Counselling', 'Online Therapy', 'Video Consultation']
    } else if (expertise.includes('gynecology') || expertise.includes('ivf')) {
      return sessionData.sessionMode === 'In-Person'
        ? ['Consultation', 'Check-up', 'Treatment']
        : ['Online Consultation', 'Medical Advice']
    } else {
      return sessionData.sessionMode === 'In-Person'
        ? ['Consultation', 'Check-up']
        : ['Online Consultation', 'Medical Advice']
    }
  }

  // Check available session modes based on doctor's availability
  const getAvailableSessionModes = (): ('In-Person' | 'Online')[] => {
    if (!doctorInfo) return ['In-Person', 'Online']
    
    const modes = doctorInfo.sessionMode.toLowerCase()
    if (modes.includes('in-person') && modes.includes('online')) {
      return ['In-Person', 'Online']
    } else if (modes.includes('online')) {
      return ['Online']
    } else {
      return ['In-Person']
    }
  }

  const availableSessionModes = getAvailableSessionModes()

  // Set default session mode based on doctor's availability
  useEffect(() => {
    if (availableSessionModes.length > 0 && !availableSessionModes.includes(sessionData.sessionMode)) {
      setSessionData(prev => ({ ...prev, sessionMode: availableSessionModes[0] }))
    }
  }, [availableSessionModes, sessionData.sessionMode])

  // UPDATED: Handle input change with new fields
  const handleInputChange = (field: string, value: string) => {
    setSessionData(prev => {
      const updatedData = { ...prev }
      
      if (field === 'sessionType') updatedData.sessionType = value
      else if (field === 'sessionMode') {
        updatedData.sessionMode = value as 'In-Person' | 'Online'
        updatedData.sessionType = '' // Reset session type when mode changes
      }
      else if (field === 'sessionDate') updatedData.sessionDate = value
      else if (field === 'sessionTime') updatedData.sessionTime = value
      else if (field === 'sessionDetails') updatedData.sessionDetails = value
      else if (field === 'whatsappNumber') updatedData.whatsappNumber = value  // UPDATED
      else if (field === 'emailId') updatedData.emailId = value                // NEW
      else if (field === 'address') updatedData.address = value                // NEW
      
      return updatedData
    })
  }

  // NEW: Helper function to handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (sessionData.whatsappNumber) {
      const cleanNumber = sessionData.whatsappNumber.replace(/[^\d]/g, '')
      const whatsappUrl = `https://wa.me/${cleanNumber}`
      window.open(whatsappUrl, '_blank')
    }
  }

  // UPDATED: Enhanced handleConfirm function with new fields
  const handleConfirm = () => {
    // Basic validation checks
    if (!sessionData.sessionDate || !sessionData.sessionTime || !sessionData.sessionType) {
      alert('Please fill in all required fields: Date, Time, and Session Type')
      return
    }

    // Email validation
    if (sessionData.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sessionData.emailId)) {
      alert('Please enter a valid email address')
      return
    }

    // WhatsApp number validation
    if (sessionData.whatsappNumber && !/^\+?[\d\s-()]{10,}$/.test(sessionData.whatsappNumber.trim())) {
      alert('Please enter a valid WhatsApp number')
      return
    }

    // Check for previous sessions with the same doctor
    const previousSessions = doctorInfo ? getPreviousSessionsWithDoctor(doctorInfo.id) : []
    
    // Determine location based on session mode
    let location = 'Online'
    if (sessionData.sessionMode === 'In-Person') {
      location = sessionData.address || 'Clinic'
    }

    // Create new session data for saving
    const newSessionData = {
      patientName: sessionData.patientName,
      patientPhone: sessionData.patientPhone,
      doctorId: doctorInfo?.id || 'default-1',
      doctorName: sessionData.practitionerName,
      doctorPhone: sessionData.practitionerPhone,
      doctorExpertise: doctorInfo?.expertise || 'Psychologist',
      doctorAvatar: doctorInfo?.avatar || '/api/placeholder/48/48',
      sessionDate: sessionData.sessionDate,
      sessionTime: sessionData.sessionTime,
      sessionType: sessionData.sessionType,
      sessionMode: sessionData.sessionMode,
      sessionDuration: '01:00 HR', // Default duration
      sessionDetails: sessionData.sessionDetails,
      onlineSessionLink: sessionData.whatsappNumber ? `https://wa.me/${sessionData.whatsappNumber.replace(/[^\d]/g, '')}` : '', // UPDATED: Convert WhatsApp to link
      status: 'upcoming' as const,
      location: location
    }

    try {
      // Save the session to data model
      const savedSession = addNewSession(newSessionData)
      
      console.log('Session Data Saved:', savedSession)
      console.log('Previous Sessions with Doctor:', previousSessions)
      console.log('Additional Info:', {
        whatsappNumber: sessionData.whatsappNumber,
        emailId: sessionData.emailId,
        address: sessionData.address
      })
      
      // Show detailed success message
      const successMessage = `✅ Session scheduled successfully!

📅 Session Details:
• Date: ${sessionData.sessionDate}
• Time: ${sessionData.sessionTime}
• Type: ${sessionData.sessionType}
• Mode: ${sessionData.sessionMode}
• Doctor: ${doctorInfo?.name}

📞 Contact Info:
${sessionData.whatsappNumber ? `• WhatsApp: ${sessionData.whatsappNumber}` : ''}
${sessionData.emailId ? `• Email: ${sessionData.emailId}` : ''}
${sessionData.address ? `• Address: ${sessionData.address}` : ''}

${previousSessions.length > 0 
  ? `📋 Previous sessions with ${doctorInfo?.name}: ${previousSessions.length}` 
  : '🆕 This is your first session with this doctor.'
}

Session ID: ${savedSession.id}`

      alert(successMessage)
      
      // Navigate back to dashboard to see the new session
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Error saving session:', error)
      alert('❌ Error scheduling session. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/patient-details')
  }

  if (!patientName || !patientPhone || !doctorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 flex items-center justify-center">
        <div className="text-black text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/patient-details')}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-black text-lg font-semibold">Schedule Session</div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Patient Info - Dynamic */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Patient</label>
            <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-xs">
                  {sessionData.patientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-black font-medium text-sm">{sessionData.patientName}</div>
                <div className="text-black/70 text-xs">{sessionData.patientPhone}</div>
              </div>
            </div>
          </div>

          {/* Assign Practitioner - Dynamic */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Assigned Doctor</label>
            <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <Image 
                  src={doctorInfo.avatar}
                  alt={doctorInfo.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-black font-medium text-sm">{doctorInfo.name}</div>
                <div className="text-black/70 text-xs">{doctorInfo.expertise}</div>
                <div className="text-black/70 text-xs">{doctorInfo.sessionFee}</div>
              </div>
            </div>
          </div>

          {/* Session Type - Dynamic based on doctor's expertise */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Session Type *</label>
            <Dropdown
              value={sessionData.sessionType}
              options={getSessionTypeOptions()}
              onChange={(value) => handleInputChange('sessionType', value)}
              placeholder="Select session type"
            />
          </div>

          {/* Session Mode - Dynamic based on doctor's availability */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Session Mode</label>
            <div className="flex space-x-2">
              {availableSessionModes.includes('In-Person') && (
                <button
                  onClick={() => handleInputChange('sessionMode', 'In-Person')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    sessionData.sessionMode === 'In-Person'
                      ? 'bg-black text-white'
                      : 'bg-white/20 text-black border border-white/30'
                  }`}
                >
                  In-Person
                </button>
              )}
              {availableSessionModes.includes('Online') && (
                <button
                  onClick={() => handleInputChange('sessionMode', 'Online')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                    sessionData.sessionMode === 'Online'
                      ? 'bg-black text-white'
                      : 'bg-white/20 text-black border border-white/30'
                  }`}
                >
                  Online
                </button>
              )}
            </div>
          </div>

          {/* Session Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-black text-sm font-medium mb-2 block">Session Date *</label>
              <DatePicker
                selectedDate={sessionData.sessionDate}
                onDateSelect={(date) => handleInputChange('sessionDate', date)}
              />
            </div>
            <div>
              <label className="text-black text-sm font-medium mb-2 block">Session Time *</label>
              <button
                onClick={() => setShowTimePicker(!showTimePicker)}
                className="w-full flex items-center justify-between px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
              >
                <span className={sessionData.sessionTime ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  {sessionData.sessionTime || 'HH:MM'}
                </span>
                <ClockIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Time Picker Modal */}
          {showTimePicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
              <div className="bg-white rounded-t-2xl w-full max-w-sm mx-auto max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Select Session Time</h2>
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  <TimeSlotPicker
                    selectedTime={sessionData.sessionTime}
                    onTimeSelect={(time) => {
                      handleInputChange('sessionTime', time)
                      setShowTimePicker(false)
                    }}
                    selectedDate={sessionData.sessionDate}
                  />
                </div>
                
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  {sessionData.sessionTime && (
                    <button
                      onClick={() => setShowTimePicker(false)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Confirm Time
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NEW: WhatsApp Number - Always visible, with clickable functionality */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">WhatsApp Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="Enter WhatsApp number"
                value={sessionData.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none hover:border-purple-300 transition-colors"
              />
              {/* Clickable WhatsApp button */}
              {sessionData.whatsappNumber && (
                <button
                  onClick={handleWhatsAppClick}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-700 transition-colors"
                  title="Open WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.105"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* NEW: Email ID */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Email ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Enter email address"
                value={sessionData.emailId}
                onChange={(e) => handleInputChange('emailId', e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none hover:border-purple-300 transition-colors"
              />
            </div>
          </div>

          {/* NEW: Address */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Address</label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                placeholder="Enter your address"
                value={sessionData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none hover:border-purple-300 transition-colors"
              />
            </div>
          </div>

          {/* Session Details */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">
              Session Details (Optional)
            </label>
            <textarea
              placeholder="Enter session details here"
              value={sessionData.sessionDetails}
              onChange={(e) => handleInputChange('sessionDetails', e.target.value)}
              rows={3}
              className="w-full px-3 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none hover:border-purple-300 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pb-8">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 bg-white/20 text-black border border-white/30 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
