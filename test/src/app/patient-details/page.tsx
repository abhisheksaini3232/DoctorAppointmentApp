'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface PatientDetails {
  name: string
  phone: string
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

export default function PatientDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    phone: ''
  })
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)

  // Extract doctor information from URL params
  useEffect(() => {
    const doctorId = searchParams.get('doctorId')
    if (doctorId) {
      const doctor: DoctorInfo = {
        id: doctorId,
        name: searchParams.get('doctorName') || '',
        phone: searchParams.get('doctorPhone') || '',
        expertise: searchParams.get('doctorExpertise') || '',
        gender: searchParams.get('doctorGender') || '',
        sessionMode: searchParams.get('doctorSessionMode') || '',
        sessionFee: searchParams.get('doctorSessionFee') || '',
        avatar: searchParams.get('doctorAvatar') || '/api/placeholder/48/48'
      }
      setDoctorInfo(doctor)
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {}
    
    if (!patientDetails.name.trim()) {
      newErrors.name = 'Patient name is required'
    }
    
    if (!patientDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]{10,}$/.test(patientDetails.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // FIXED: Back button function to navigate to /available-doctors
  const handleBackToAvailableDoctors = () => {
    router.push('/available-doctors')
  }

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to schedule session page with both patient and doctor details
      const params = new URLSearchParams({
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone
      })

      // Add doctor information if available
      if (doctorInfo) {
        params.append('doctorId', doctorInfo.id)
        params.append('doctorName', doctorInfo.name)
        params.append('doctorPhone', doctorInfo.phone)
        params.append('doctorExpertise', doctorInfo.expertise)
        params.append('doctorGender', doctorInfo.gender)
        params.append('doctorSessionMode', doctorInfo.sessionMode)
        params.append('doctorSessionFee', doctorInfo.sessionFee)
        params.append('doctorAvatar', doctorInfo.avatar)
      }

      router.push(`/schedule-session?${params.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
        
        {/* Header - FIXED: Back button now goes to /available-doctors */}
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleBackToAvailableDoctors}
              className="text-black hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-black text-lg font-semibold">Patient Details</div>
          </div>
        </div>

        <div className="px-4 space-y-6 mt-6">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-black text-xl font-bold mb-2">Welcome!</h2>
            <p className="text-black/80 text-sm">Please enter your details to schedule a session</p>
          </div>

          {/* Selected Doctor Display (if doctor is selected) */}
          {doctorInfo && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mb-6">
              <h3 className="text-black font-medium text-sm mb-3">Selected Doctor</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <Image 
                    src={doctorInfo.avatar}
                    alt={doctorInfo.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-black font-semibold text-sm">{doctorInfo.name}</div>
                  <div className="text-black/70 text-xs">{doctorInfo.expertise}</div>
                  <div className="text-black/70 text-xs">{doctorInfo.sessionFee}</div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Name Input */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Patient Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your full name"
                value={patientDetails.name}
                onChange={(e) => {
                  setPatientDetails(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                }}
                className={`w-full pl-10 pr-3 py-3 bg-white border rounded-lg text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-200 hover:border-purple-300'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="text-black text-sm font-medium mb-2 block">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={patientDetails.phone}
                onChange={(e) => {
                  setPatientDetails(prev => ({ ...prev, phone: e.target.value }))
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
                }}
                className={`w-full pl-10 pr-3 py-3 bg-white border rounded-lg text-sm text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-gray-200 hover:border-purple-300'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-6">
            <button
              onClick={handleContinue}
              disabled={!patientDetails.name.trim() || !patientDetails.phone.trim()}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Schedule Session
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mt-6">
            <h3 className="text-black font-medium text-sm mb-2">Why do we need this?</h3>
            <ul className="text-black/80 text-xs space-y-1">
              <li>• To identify you during the session</li>
              <li>• To send appointment confirmations</li>
              <li>• To contact you if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
