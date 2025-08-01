'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  getUpcomingSessions,
  getCompletedSessions,
  markSessionAsCompleted,
  SessionData
} from '../../model/session-model/session-model'

// ADDED: Helper function to get doctor image based on gender
function getDoctorAvatarByGender(session: SessionData): string {
  // Check if the session has gender information from doctor data
  // Since SessionData might not have doctorGender directly, we'll need to determine it
  // For now, we'll use a simple approach based on doctor name patterns or you can add gender to SessionData
  
  // If you have doctorGender in SessionData, uncomment this:
  // if (session.doctorGender?.toLowerCase() === 'male') {
  //   return '/male_doctor.png'
  // } else if (session.doctorGender?.toLowerCase() === 'female') {
  //   return '/female_doctor.png'
  // }
  
  // Alternative: Check doctor name for gender hints (temporary solution)
  const doctorName = session.doctorName.toLowerCase()
  if (doctorName.includes('dr.')) {
    // Common male doctor name patterns
    if (doctorName.includes('ramesh') || doctorName.includes('suresh') || doctorName.includes('kiran')) {
      return '/male_doctor.png'
    }
    // Common female doctor name patterns  
    if (doctorName.includes('priya') || doctorName.includes('neeta')) {
      return '/female_doctor.png'
    }
  }
  
  // Default fallback to original avatar
  return session.doctorAvatar
}

// Filter state interface
interface FilterState {
  sessionTypes: string[]
  doctorTypes: string[]
  sessionModes: string[]
}

// Filter Modal Component
function FilterModal({ isOpen, onClose, filters, onFiltersChange }: {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleSessionTypeChange = (type: string) => {
    const updatedTypes = localFilters.sessionTypes.includes(type)
      ? localFilters.sessionTypes.filter(t => t !== type)
      : [...localFilters.sessionTypes, type]
    
    setLocalFilters({ ...localFilters, sessionTypes: updatedTypes })
  }

  const handleDoctorTypeChange = (type: string) => {
    const updatedTypes = localFilters.doctorTypes.includes(type)
      ? localFilters.doctorTypes.filter(t => t !== type)
      : [...localFilters.doctorTypes, type]
    
    setLocalFilters({ ...localFilters, doctorTypes: updatedTypes })
  }

  const handleSessionModeChange = (mode: string) => {
    const updatedModes = localFilters.sessionModes.includes(mode)
      ? localFilters.sessionModes.filter(m => m !== mode)
      : [...localFilters.sessionModes, mode]
    
    setLocalFilters({ ...localFilters, sessionModes: updatedModes })
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters: FilterState = { sessionTypes: [], doctorTypes: [], sessionModes: [] }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    onClose()
  }

  if (!isOpen) return null

  // Get all sessions to extract unique filter options
  const allSessions = [...getUpcomingSessions(), ...getCompletedSessions()]
  const uniqueSessionTypes = [...new Set(allSessions.map(session => session.sessionType))]
  const uniqueDoctorTypes = [...new Set(allSessions.map(session => session.doctorExpertise))]
  const uniqueSessionModes = [...new Set(allSessions.map(session => session.sessionMode))]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-sm mx-auto max-h-[80vh] overflow-hidden">
        {/* Filter Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filter Sessions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Session Types Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Session Types</h3>
            <div className="space-y-2">
              {uniqueSessionTypes.map((type) => (
                <label key={type} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.sessionTypes.includes(type)}
                    onChange={() => handleSessionTypeChange(type)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Doctor Types Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Doctor Specializations</h3>
            <div className="space-y-2">
              {uniqueDoctorTypes.map((type) => (
                <label key={type} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.doctorTypes.includes(type)}
                    onChange={() => handleDoctorTypeChange(type)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Session Modes Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Session Modes</h3>
            <div className="space-y-2">
              {uniqueSessionModes.map((mode) => (
                <label key={mode} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.sessionModes.includes(mode)}
                    onChange={() => handleSessionModeChange(mode)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced search component with doctor name suggestions
function SearchContent({ onFilterClick }: { onFilterClick: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Get all doctor names for suggestions
  const allSessions = [...getUpcomingSessions(), ...getCompletedSessions()]
  const allDoctorNames = [...new Set(allSessions.map(session => session.doctorName))]

  // Filter doctor names based on search query
  const filteredDoctors = allDoctorNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(value.length > 0)
    
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`)
  }

  const handleSuggestionClick = (doctorName: string) => {
    setSearchQuery(doctorName)
    setShowSuggestions(false)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', doctorName)
    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* Search Section */}
      <div className="px-4 mt-6">
        <div className="flex space-x-3">
          {/* Search Bar with Suggestions */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-3 py-3 bg-white rounded-xl border-0 shadow-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            />
            
            {/* Doctor Name Suggestions */}
            {showSuggestions && filteredDoctors.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
                {filteredDoctors.slice(0, 5).map((doctorName, index) => (
                  <button
                    key={`${doctorName}-${index}`}
                    onClick={() => handleSuggestionClick(doctorName)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                      <span>{doctorName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Button */}
          <button 
            onClick={onFilterClick}
            className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </>
  )
}

// Main dashboard component with enhanced search and filter
export default function PsychologistDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for sessions and filters
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([])
  const [pastSessions, setPastSessions] = useState<SessionData[]>([])
  const [currentUpcomingSession, setCurrentUpcomingSession] = useState<SessionData | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    sessionTypes: [],
    doctorTypes: [],
    sessionModes: []
  })

  // Load and filter sessions data
  useEffect(() => {
    const upcoming = getUpcomingSessions()
    const completed = getCompletedSessions()
    
    // Apply search and filters
    const searchQuery = searchParams.get('q')?.toLowerCase() || ''
    
    const filterSessions = (sessions: SessionData[]) => {
      return sessions.filter(session => {
        // Search filter (doctor name)
        if (searchQuery && !session.doctorName.toLowerCase().includes(searchQuery)) {
          return false
        }
        
        // Session type filter
        if (filters.sessionTypes.length > 0 && !filters.sessionTypes.includes(session.sessionType)) {
          return false
        }
        
        // Doctor type filter
        if (filters.doctorTypes.length > 0 && !filters.doctorTypes.includes(session.doctorExpertise)) {
          return false
        }
        
        // Session mode filter
        if (filters.sessionModes.length > 0 && !filters.sessionModes.includes(session.sessionMode)) {
          return false
        }
        
        return true
      })
    }
    
    const filteredUpcoming = filterSessions(upcoming)
    const filteredPast = filterSessions(completed)
    
    setUpcomingSessions(filteredUpcoming)
    setPastSessions(filteredPast)
    setCurrentUpcomingSession(filteredUpcoming.length > 0 ? filteredUpcoming[0] : null)
  }, [searchParams, filters])

  // Function to handle marking session as completed
  const handleMarkAsCompleted = () => {
    if (currentUpcomingSession) {
      markSessionAsCompleted(currentUpcomingSession.id)
      
      // Refresh the data
      const updatedUpcoming = getUpcomingSessions()
      const updatedCompleted = getCompletedSessions()
      
      setUpcomingSessions(updatedUpcoming)
      setPastSessions(updatedCompleted)
      setCurrentUpcomingSession(updatedUpcoming.length > 0 ? updatedUpcoming[0] : null)
    }
  }

  // Function to handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Function to handle Schedule Now navigation
  const handleScheduleNow = () => {
    router.push('/available-doctors')
  }

  // Check if any filters are active
  const hasActiveFilters = filters.sessionTypes.length > 0 || filters.doctorTypes.length > 0 || filters.sessionModes.length > 0
  const searchQuery = searchParams.get('q') || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
      {/* Mobile container wrapper */}
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
        
        {/* 1. HEADER COMPONENT */}
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-3">
            <div className="text-black">
              <div className="text-xs opacity-70 font-bold">Hello,</div>
              <div className="text-2xl font-bold  ">Radical Minds</div>
            </div>
          </div>
          
          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <Image 
              src="/logo_RM.png" 
              alt="Profile" 
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Search Section with Suspense */}
        <Suspense fallback={
          <div className="px-4 mt-6">
            <div className="flex space-x-3">
              <div className="flex-1 bg-white rounded-xl p-3 animate-pulse">
                <div className="h-5 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white p-3 rounded-xl animate-pulse">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        }>
          <SearchContent onFilterClick={() => setIsFilterOpen(true)} />
        </Suspense>

        {/* Active Search/Filter Indicator */}
        {(searchQuery || hasActiveFilters) && (
          <div className="px-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="flex items-center justify-between">
                <div className="text-black text-sm">
                  {searchQuery && (
                    <div>🔍 Searching: &quot;<span className="font-semibold">{searchQuery}</span>&quot;</div>
                  )}
                  {hasActiveFilters && (
                    <div className="text-xs text-black/70 mt-1">
                      Filters active: {filters.sessionTypes.length + filters.doctorTypes.length + filters.sessionModes.length} selected
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setFilters({ sessionTypes: [], doctorTypes: [], sessionModes: [] })
                    router.push('/dashboard')
                  }}
                  className="text-black/70 text-xs hover:text-black transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {(searchQuery || hasActiveFilters) && (
          <div className="px-4 mt-2">
            <div className="text-black/70 text-xs">
              Found {upcomingSessions.length} upcoming and {pastSessions.length} past sessions
            </div>
          </div>
        )}

        {/* 2. UPCOMING SESSION COMPONENT - UPDATED: Using gender-based images */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black font-semibold text-lg">Upcoming Sessions</h3>
            {upcomingSessions.length > 1 && (
              <span className="text-black/70 text-xs bg-white/20 px-2 py-1 rounded-full">
                {upcomingSessions.length} sessions
              </span>
            )}
          </div>
          
          {currentUpcomingSession ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-200">
              {/* Session Time */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-black">
                  <div className="text-2xl font-bold">{currentUpcomingSession.sessionTime}</div>
                  <div className="text-sm text-gray-600">{currentUpcomingSession.sessionDate}</div>
                  {currentUpcomingSession.location && (
                    <div className="text-xs text-gray-500">{currentUpcomingSession.location}</div>
                  )}
                </div>
                
                {/* Doctor Info - UPDATED: Using gender-based image */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-black font-semibold text-sm">{currentUpcomingSession.doctorName}</div>
                    <div className="text-xs text-gray-600">{currentUpcomingSession.doctorExpertise}</div>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600">Available</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <Image 
                      src={getDoctorAvatarByGender(currentUpcomingSession)}
                      alt={currentUpcomingSession.doctorName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Session Duration:</span> {currentUpcomingSession.sessionDuration}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Session Mode:</span> {currentUpcomingSession.sessionMode}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Session Type:</span> {currentUpcomingSession.sessionType}
                </div>
                {currentUpcomingSession.sessionDetails && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Details:</span> {currentUpcomingSession.sessionDetails}
                  </div>
                )}
              </div>

              {/* Mark as Completed Button */}
              <button 
                onClick={handleMarkAsCompleted}
                className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-purple-200">
              <div className="text-gray-500 text-sm mb-2">
                {searchQuery || hasActiveFilters ? 'No matching upcoming sessions' : 'No upcoming sessions'}
              </div>
              <div className="text-xs text-gray-400">
                {searchQuery || hasActiveFilters ? 'Try adjusting your search or filters' : 'Your next session will appear here'}
              </div>
            </div>
          )}

          {/* Additional Upcoming Sessions - UPDATED: Using gender-based images */}
          {upcomingSessions.length > 1 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-black font-medium text-sm">Next Sessions</h4>
              {upcomingSessions.slice(1, 3).map((session) => (
                <div key={session.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="flex items-center justify-between">
                    <div className="text-black">
                      <div className="text-sm font-semibold">{session.sessionTime}</div>
                      <div className="text-xs text-gray-600">{session.sessionDate}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-black font-medium text-xs">{session.doctorName}</div>
                        <div className="text-xs text-gray-500">{session.doctorExpertise}</div>
                        <div className="text-xs text-gray-500">{session.sessionMode}</div>
                      </div>
                      {/* ADDED: Doctor avatar for additional upcoming sessions */}
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <Image 
                          src={getDoctorAvatarByGender(session)}
                          alt={session.doctorName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. PAST SESSIONS COMPONENT - UPDATED: Using gender-based images */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black font-semibold text-lg">Past Sessions</h3>
            {pastSessions.length > 0 && (
              <span className="text-black/70 text-xs bg-white/20 px-2 py-1 rounded-full">
                {pastSessions.length} completed
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {pastSessions.length > 0 ? (
              pastSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="flex items-center justify-between">
                    <div className="text-black">
                      <div className="text-lg font-semibold">{session.sessionTime}</div>
                      <div className="text-sm font-medium">{session.doctorName}</div>
                      <div className="text-xs text-gray-600">Session Date: {session.sessionDate}</div>
                      <div className="text-xs text-gray-600">{session.sessionType} • {session.sessionMode}</div>
                      <div className="text-xs text-gray-500">{session.doctorExpertise}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{session.sessionDuration}</div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-1 ml-auto"></div>
                      </div>
                      {/* ADDED: Doctor avatar for past sessions */}
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <Image 
                          src={getDoctorAvatarByGender(session)}
                          alt={session.doctorName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 text-center border border-white/30">
                <div className="text-gray-500 text-sm">
                  {searchQuery || hasActiveFilters ? 'No matching past sessions' : 'No past sessions'}
                </div>
                {(searchQuery || hasActiveFilters) && (
                  <div className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. FOOTER COMPONENT with Navigation */}
        <div className="px-4 mt-8 pb-8">
          <button 
            onClick={handleScheduleNow}
            className="w-full bg-purple-600 text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg hover:bg-purple-700 transition-colors"
          >
            Schedule New Session
          </button>
        </div>

        {/* Extra bottom padding for scroll space */}
        <div className="h-6"></div>
      </div>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
}
