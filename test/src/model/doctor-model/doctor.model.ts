// doctorData.ts
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

export const doctorsData: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    phone: '+91 98765 43210',
    expertise: 'Gynecology',
    gender: 'Male',
    sessionMode: 'In-Person & Online',
    sessionFee: '₹1500',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    phone: '+91 98765 43211',
    expertise: 'IVF Specialist',
    gender: 'Female',
    sessionMode: 'Online',
    sessionFee: '₹2200',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '3',
    name: 'Dr. Amit Patel',
    phone: '+91 98765 43212',
    expertise: 'Psychologist',
    gender: 'Male',
    sessionMode: 'In-Person',
    sessionFee: '₹1200',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '4',
    name: 'Dr. Sneha Gupta',
    phone: '+91 98765 43213',
    expertise: 'Psychiatrist',
    gender: 'Female',
    sessionMode: 'In-Person & Online',
    sessionFee: '₹1800',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '5',
    name: 'Dr. Vikram Singh',
    phone: '+91 98765 43214',
    expertise: 'Dermatologist',
    gender: 'Male',
    sessionMode: 'Online',
    sessionFee: '₹1600',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '6',
    name: 'Dr. Kavita Reddy',
    phone: '+91 98765 43215',
    expertise: 'Gynaecology',
    gender: 'Female',
    sessionMode: 'In-Person',
    sessionFee: '₹1400',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '7',
    name: 'Dr. Manoj Agarwal',
    phone: '+91 98765 43216',
    expertise: 'IVF Specialist',
    gender: 'Male',
    sessionMode: 'In-Person & Online',
    sessionFee: '₹2500',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '8',
    name: 'Dr. Ritu Verma',
    phone: '+91 98765 43217',
    expertise: 'Psychologist',
    gender: 'Female',
    sessionMode: 'Online',
    sessionFee: '₹1100',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '9',
    name: 'Dr. Suresh Jain',
    phone: '+91 98765 43218',
    expertise: 'Psychiatrist',
    gender: 'Male',
    sessionMode: 'In-Person',
    sessionFee: '₹2000',
    avatar: '/api/placeholder/48/48'
  },
  {
    id: '10',
    name: 'Dr. Anita Chopra',
    phone: '+91 98765 43219',
    expertise: 'Dermatologist',
    gender: 'Female',
    sessionMode: 'In-Person & Online',
    sessionFee: '₹1700',
    avatar: '/api/placeholder/48/48'
  }
]
