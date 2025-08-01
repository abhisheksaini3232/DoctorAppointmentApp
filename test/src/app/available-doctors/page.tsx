'use client'
// import { doctorsData } from '@/data/doctorData'
import { doctorsData } from '../../model/doctor-model/doctor.model'
import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Define proper TypeScript interfaces
interface FilterState {
  gender: string[]
  priceRange: string
  expertise: string[]
  sessionMode: string[]
}

interface Doctor {
  id: string
  name: string
  phone: string
  expertise: string
  gender: string
  sessionMode: string
  sessionFee: string
  avatar: string
}

// Helper function to get doctor image based on gender
function getDoctorAvatar(doctor: Doctor): string {
  if (doctor.gender.toLowerCase() === 'male') {
    return '/male_doctor.png'
  } else if (doctor.gender.toLowerCase() === 'female') {
    return '/female_doctor.png'
  } else {
    // Fallback to original avatar if gender is not male/female
    return doctor.avatar
  }
}

// Filter Modal Component with proper typing
function FilterModal({ isOpen, onClose, filters, onFiltersChange }: {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleGenderChange = (gender: string) => {
    const updatedGenders = localFilters.gender.includes(gender)
      ? localFilters.gender.filter(g => g !== gender)
      : [...localFilters.gender, gender]
    
    setLocalFilters({ ...localFilters, gender: updatedGenders })
  }

  const handleExpertiseChange = (expertise: string) => {
    const updatedExpertise = localFilters.expertise.includes(expertise)
      ? localFilters.expertise.filter(e => e !== expertise)
      : [...localFilters.expertise, expertise]
    
    setLocalFilters({ ...localFilters, expertise: updatedExpertise })
  }

  const handleSessionModeChange = (mode: string) => {
    const updatedModes = localFilters.sessionMode.includes(mode)
      ? localFilters.sessionMode.filter(m => m !== mode)
      : [...localFilters.sessionMode, mode]
    
    setLocalFilters({ ...localFilters, sessionMode: updatedModes })
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters: FilterState = { gender: [], priceRange: '', expertise: [], sessionMode: [] }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    onClose()
  }

  if (!isOpen) return null

  // Get unique values from doctorsData for dynamic filter options
  const uniqueExpertise = [...new Set(doctorsData.map(doctor => doctor.expertise))]
  const uniqueGenders = [...new Set(doctorsData.map(doctor => doctor.gender)), 'Any']
  const uniqueSessionModes = [...new Set(doctorsData.map(doctor => doctor.sessionMode))]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-sm mx-auto max-h-[80vh] overflow-hidden">
        {/* Filter Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Gender Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Gender</h3>
            <div className="space-y-2">
              {uniqueGenders.map((gender) => (
                <label key={gender} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.gender.includes(gender)}
                    onChange={() => handleGenderChange(gender)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Session Mode Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Session Mode</h3>
            <div className="space-y-2">
              {uniqueSessionModes.map((mode) => (
                <label key={mode} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.sessionMode.includes(mode)}
                    onChange={() => handleSessionModeChange(mode)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-2">
              {[
                { label: 'Under ₹1000', value: '0-1000' },
                { label: '₹1000 - ₹1500', value: '1000-1500' },
                { label: '₹1500 - ₹2000', value: '1500-2000' },
                { label: 'Above ₹2000', value: '2000+' },
                { label: 'Any', value: '' }
              ].map((price) => (
                <label key={price.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="priceRange"
                    value={price.value}
                    checked={localFilters.priceRange === price.value}
                    onChange={(e) => setLocalFilters({ ...localFilters, priceRange: e.target.value })}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{price.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expertise Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Expertise</h3>
            <div className="space-y-2">
              {uniqueExpertise.map((expertise) => (
                <label key={expertise} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.expertise.includes(expertise)}
                    onChange={() => handleExpertiseChange(expertise)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{expertise}</span>
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

// Search component
function SearchContent({ onFilterClick }: { onFilterClick: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* Search Section */}
      <div className="px-4 mt-6">
        <div className="flex space-x-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Doctors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-white rounded-xl border-0 shadow-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            />
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

// UPDATED: Doctor Card Component with gender-based images
function DoctorCard({ doctor, isExpanded, onToggle }: {
  doctor: Doctor
  isExpanded: boolean
  onToggle: () => void
}) {
  const router = useRouter()

  // Handle Book Now - Pass doctor information to patient details page
  const handleBookNow = () => {
    const doctorAvatar = getDoctorAvatar(doctor)
    const doctorParams = new URLSearchParams({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorPhone: doctor.phone,
      doctorExpertise: doctor.expertise,
      doctorGender: doctor.gender,
      doctorSessionMode: doctor.sessionMode,
      doctorSessionFee: doctor.sessionFee,
      doctorAvatar: doctorAvatar
    })
    router.push(`/patient-details?${doctorParams.toString()}`)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100">
      {/* Doctor Info Header */}
      <button 
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-purple-50/50 transition-colors rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <Image 
                src={getDoctorAvatar(doctor)}
                alt={doctor.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-black font-semibold text-sm">{doctor.name}</div>
              <div className="text-gray-600 text-xs">{doctor.phone}</div>
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="text-gray-400">
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-purple-100/50">
          <div className="pt-4 space-y-3">
            {/* Doctor Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Expertise</span>
                <div className="text-black font-medium">{doctor.expertise}</div>
              </div>
              <div>
                <span className="text-gray-500">Gender</span>
                <div className="text-black font-medium">{doctor.gender}</div>
              </div>
              <div>
                <span className="text-gray-500">Session mode</span>
                <div className="text-black font-medium">{doctor.sessionMode}</div>
              </div>
              <div>
                <span className="text-gray-500">Session Fee</span>
                <div className="text-black font-medium">{doctor.sessionFee}</div>
              </div>
            </div>

            {/* Book Now Button - Updated with navigation */}
            <button 
              onClick={handleBookNow}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors mt-4"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Main page with proper TypeScript typing
export default function AvailableDoctorsPage() {
  const router = useRouter()
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    priceRange: '',
    expertise: [],
    sessionMode: []
  })
  const searchParams = useSearchParams()

  // Load doctors data on component mount
  useEffect(() => {
    setDoctors(doctorsData)
  }, [])

  // Filter doctors with proper typing and search functionality
  const filteredDoctors = doctors.filter(doctor => {
    // Search query filter
    const searchQuery = searchParams.get('q')?.toLowerCase() || ''
    if (searchQuery) {
      const matchesSearch = 
        doctor.name.toLowerCase().includes(searchQuery) ||
        doctor.expertise.toLowerCase().includes(searchQuery) ||
        doctor.phone.includes(searchQuery)
      if (!matchesSearch) return false
    }

    // Gender filter
    if (filters.gender.length > 0 && !filters.gender.includes('Any')) {
      if (!filters.gender.includes(doctor.gender)) return false
    }

    // Session Mode filter
    if (filters.sessionMode.length > 0) {
      const doctorModes = doctor.sessionMode.split(' & ')
      const hasMatchingMode = filters.sessionMode.some(filterMode => {
        if (filterMode === 'In-Person & Online') {
          return doctor.sessionMode === 'In-Person & Online'
        }
        return doctorModes.includes(filterMode)
      })
      if (!hasMatchingMode) return false
    }

    // Price filter
    if (filters.priceRange && filters.priceRange !== '') {
      const fee = parseInt(doctor.sessionFee.replace(/[₹,-]/g, ''))
      
      if (filters.priceRange === '0-1000' && fee >= 1000) return false
      if (filters.priceRange === '1000-1500' && (fee < 1000 || fee >= 1500)) return false
      if (filters.priceRange === '1500-2000' && (fee < 1500 || fee >= 2000)) return false
      if (filters.priceRange === '2000+' && fee < 2000) return false
    }

    // Expertise filter
    if (filters.expertise.length > 0) {
      if (!filters.expertise.includes(doctor.expertise)) return false
    }

    return true
  })

  const handleDoctorToggle = (doctorId: string) => {
    setExpandedDoctor(expandedDoctor === doctorId ? null : doctorId)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // FIXED: Back button function to navigate to /dashboard
  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
      {/* Mobile container wrapper */}
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
        
        {/* Header - FIXED: Back button now goes to /dashboard */}
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleBackToDashboard}
              className="text-black hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-black text-lg font-semibold">Available Doctors</div>
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

        {/* Active Filters Display */}
        {(filters.gender.length > 0 || filters.priceRange || filters.expertise.length > 0 || filters.sessionMode.length > 0) && (
          <div className="px-4 mt-4">
            <div className="text-black text-sm opacity-70 mb-2">
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </div>
          </div>
        )}

        {/* Doctors List */}
        <div className="px-4 mt-6 pb-8">
          <div className="space-y-3">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  isExpanded={expandedDoctor === doctor.id}
                  onToggle={() => handleDoctorToggle(doctor.id)}
                />
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="text-gray-500 text-sm">
                  No doctors found matching your criteria
                </div>
                <button 
                  onClick={() => setFilters({ gender: [], priceRange: '', expertise: [], sessionMode: [] })}
                  className="text-purple-600 text-sm font-medium mt-2 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
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
