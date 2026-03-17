'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, LogOut, Phone, Lock, Headphones, FileText } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  license_number?: string
}

export default function DriverProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: driverData } = await supabase
        .from('drivers')
        .select('license_number')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData ? { 
        ...profileData, 
        email: user.email,
        license_number: driverData?.license_number 
      } : null)
      
      setLoading(false)
    }
    
    fetchProfile()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Mock profile for demo
  const displayProfile = profile || {
    full_name: 'Alexis Enache',
    email: 'email@email.com',
    phone: '0123354343',
    license_number: 'DL32423423'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-accent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Profile Header */}
      <div className="px-5 pt-16 pb-8 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-white/10 mb-4">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayProfile.full_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-white/60">
              {displayProfile.full_name?.[0] || 'A'}
            </div>
          )}
        </div>

        {/* Name & Email */}
        <h1 className="text-xl font-semibold mb-1">{displayProfile.full_name}</h1>
        <p className="text-white/40 text-sm">{displayProfile.email}</p>
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-3 pb-24">
        {/* Phone Number */}
        <div className="flex items-center gap-4 p-4 bg-[#111111] rounded-2xl border border-white/5">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
            <Phone className="h-5 w-5 text-white/40" />
          </div>
          <div className="flex-1">
            <p className="text-white/40 text-xs">Phone number</p>
            <p className="font-medium">{displayProfile.phone || '0123354343'}</p>
          </div>
        </div>

        {/* Change Password */}
        <Link href="/driver/profile/change-password">
          <div className="flex items-center gap-4 p-4 bg-[#111111] rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Change password</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40" />
          </div>
        </Link>

        {/* Support */}
        <Link href="/driver/support">
          <div className="flex items-center gap-4 p-4 bg-[#111111] rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-white/40" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Support</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40" />
          </div>
        </Link>

        {/* Driving License */}
        <div className="flex items-center gap-4 p-4 bg-[#111111] rounded-2xl border border-white/5">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white/40" />
          </div>
          <div className="flex-1">
            <p className="text-white/40 text-xs">Driving License</p>
            <p className="font-medium">{displayProfile.license_number || 'DL32423423'}</p>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 p-4 bg-[#111111] rounded-2xl border border-white/5 hover:bg-white/5 transition-colors mt-6"
        >
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-accent">Log Out</p>
          </div>
        </button>
      </div>
    </div>
  )
}
