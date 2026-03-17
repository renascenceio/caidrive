'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, LogOut, Phone, Lock, Headphones, FileText, Star, Car, Calendar } from 'lucide-react'
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

  const displayProfile = profile || {
    full_name: 'Alexis Enache',
    email: 'email@email.com',
    phone: '0123354343',
    license_number: 'DL32423423'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-muted-foreground/20 border-t-accent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayProfile.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {displayProfile.full_name?.[0] || 'A'}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold mb-0.5">{displayProfile.full_name}</h1>
            <p className="text-muted-foreground text-sm">{displayProfile.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">4.9</span>
              <span className="text-xs text-muted-foreground">(124 rides)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
            <Car className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-xl font-bold">847</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Rides</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
            <Calendar className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-xl font-bold">2y</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Experience</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
            <Star className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-xl font-bold">98%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rating</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-2 pb-24">
        {/* Phone Number */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50">
          <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Phone number</p>
            <p className="font-semibold">{displayProfile.phone || '0123354343'}</p>
          </div>
        </div>

        {/* Change Password */}
        <Link href="/driver/profile/change-password">
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Change password</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>

        {/* Support */}
        <Link href="/driver/support">
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center">
              <Headphones className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Support</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>

        {/* Driving License */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50">
          <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Driving License</p>
            <p className="font-semibold">{displayProfile.license_number || 'DL32423423'}</p>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:bg-destructive/10 transition-colors mt-4"
        >
          <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-destructive">Log Out</p>
          </div>
        </button>
      </div>
    </div>
  )
}
