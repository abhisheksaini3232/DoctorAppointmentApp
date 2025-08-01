export interface SessionData {
  id: string
  patientName: string
  patientPhone: string
  doctorId: string
  doctorName: string
  doctorPhone: string
  doctorExpertise: string
  doctorAvatar: string
  sessionDate: string
  sessionTime: string
  sessionType: string
  sessionMode: 'In-Person' | 'Online'
  sessionDuration: string
  sessionDetails?: string
  onlineSessionLink?: string
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: string
  location?: string
}

// Sample sessions data with pre-scheduled sessions - UPDATED: Patient name changed to "Radical Minds"
export const sessionsData: SessionData[] = [
  {
    id: 'session-1',
    patientName: 'Radical Minds',
    patientPhone: '+91 9876543210',
    doctorId: 'doc-1',
    doctorName: 'Dr. Kiran Rathi',
    doctorPhone: '+91 9876543211',
    doctorExpertise: 'Psychologist',
    doctorAvatar: '/api/placeholder/48/48',
    sessionDate: '15/02/2024',
    sessionTime: '11:00 AM',
    sessionType: 'Counselling',
    sessionMode: 'Online',
    sessionDuration: '01:00 HR',
    sessionDetails: 'Follow-up session for anxiety management',
    onlineSessionLink: 'https://meet.google.com/abc-def-ghi',
    status: 'upcoming',
    createdAt: '2024-02-10T10:30:00Z',
    location: 'Bandra'
  },
  {
    id: 'session-2',
    patientName: 'Radical Minds',
    patientPhone: '+91 9876543210',
    doctorId: 'doc-2',
    doctorName: 'Dr. Priya Sharma',
    doctorPhone: '+91 9876543212',
    doctorExpertise: 'Psychiatrist',
    doctorAvatar: '/api/placeholder/48/48',
    sessionDate: '18/02/2024',
    sessionTime: '02:00 PM',
    sessionType: 'Therapy Session',
    sessionMode: 'In-Person',
    sessionDuration: '01:00 HR',
    sessionDetails: 'Cognitive behavioral therapy session',
    status: 'upcoming',
    createdAt: '2024-02-08T14:20:00Z',
    location: 'Andheri Clinic'
  },
  {
    id: 'session-3',
    patientName: 'Radical Minds',
    patientPhone: '+91 9876543210',
    doctorId: 'doc-1',
    doctorName: 'Dr. Kiran Rathi',
    doctorPhone: '+91 9876543211',
    doctorExpertise: 'Psychologist',
    doctorAvatar: '/api/placeholder/48/48',
    sessionDate: '05/02/2024',
    sessionTime: '10:00 AM',
    sessionType: 'Counselling',
    sessionMode: 'Online',
    sessionDuration: '01:00 HR',
    sessionDetails: 'Initial consultation for stress management',
    onlineSessionLink: 'https://meet.google.com/xyz-abc-def',
    status: 'completed',
    createdAt: '2024-02-01T09:15:00Z',
    location: 'Online'
  },
  {
    id: 'session-4',
    patientName: 'Radical Minds',
    patientPhone: '+91 9876543210',
    doctorId: 'doc-3',
    doctorName: 'Dr. Ramesh Naik',
    doctorPhone: '+91 9876543213',
    doctorExpertise: 'Clinical Psychologist',
    doctorAvatar: '/api/placeholder/48/48',
    sessionDate: '25/01/2024',
    sessionTime: '12:00 PM',
    sessionType: 'Consultation',
    sessionMode: 'In-Person',
    sessionDuration: '01:00 HR',
    sessionDetails: 'General mental health assessment',
    status: 'completed',
    createdAt: '2024-01-20T11:45:00Z',
    location: 'Powai Clinic'
  },
  {
    id: 'session-5',
    patientName: 'Radical Minds',
    patientPhone: '+91 9876543210',
    doctorId: 'doc-4',
    doctorName: 'Dr. Suresh Sawant',
    doctorPhone: '+91 9876543214',
    doctorExpertise: 'Psychotherapist',
    doctorAvatar: '/api/placeholder/48/48',
    sessionDate: '15/01/2024',
    sessionTime: '10:30 AM',
    sessionType: 'Therapy Session',
    sessionMode: 'In-Person',
    sessionDuration: '01:00 HR',
    sessionDetails: 'Group therapy session',
    status: 'completed',
    createdAt: '2024-01-10T08:30:00Z',
    location: 'Bandra Clinic'
  }
]

// Helper functions for session management
export const getUpcomingSessions = (): SessionData[] => {
  return sessionsData.filter(session => session.status === 'upcoming')
    .sort((a, b) => new Date(a.sessionDate.split('/').reverse().join('-')).getTime() - 
                   new Date(b.sessionDate.split('/').reverse().join('-')).getTime())
}

export const getCompletedSessions = (): SessionData[] => {
  return sessionsData.filter(session => session.status === 'completed')
    .sort((a, b) => new Date(b.sessionDate.split('/').reverse().join('-')).getTime() - 
                   new Date(a.sessionDate.split('/').reverse().join('-')).getTime())
}

export const getPreviousSessionsWithDoctor = (doctorId: string): SessionData[] => {
  return sessionsData.filter(session => 
    session.doctorId === doctorId && session.status === 'completed'
  ).sort((a, b) => new Date(b.sessionDate.split('/').reverse().join('-')).getTime() - 
                  new Date(a.sessionDate.split('/').reverse().join('-')).getTime())
}

export const addNewSession = (newSession: Omit<SessionData, 'id' | 'createdAt'>): SessionData => {
  const session: SessionData = {
    ...newSession,
    id: `session-${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  sessionsData.push(session)
  return session
}

export const markSessionAsCompleted = (sessionId: string): void => {
  const sessionIndex = sessionsData.findIndex(session => session.id === sessionId)
  if (sessionIndex !== -1) {
    sessionsData[sessionIndex].status = 'completed'
  }
}

export const getNextUpcomingSession = (): SessionData | null => {
  const upcoming = getUpcomingSessions()
  return upcoming.length > 0 ? upcoming[0] : null
}
