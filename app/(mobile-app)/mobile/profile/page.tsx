'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  User, FileText, Lock, Star, HelpCircle, MessageCircle,
  Shield, Info, Users, LogOut, ChevronRight, Plus, Award, Route, Gift
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  level: string
  total_km_traveled: number
  bonus_km: number
}

export default function MobileProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/mobile/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data ? { ...data, email: user.email } : null)
      setLoading(false)
    }
    
    fetchProfile()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/mobile/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="h-48 rounded-3xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-3xl bg-secondary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header - Matching PDF */}
      <div className="px-5 pt-12 pb-6">
        {/* Avatar with add button */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <Link 
              href="/mobile/profile/edit"
              className="absolute -bottom-1 -right-1 h-8 w-8 bg-accent rounded-full flex items-center justify-center border-4 border-background"
            >
              <Plus className="h-4 w-4 text-white" />
            </Link>
          </div>
          
          <h1 className="text-xl font-bold">{profile?.full_name || 'Alexis Enache'}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email || 'email@email.com'}</p>
        </div>

        {/* Stats Row - Matching PDF exactly */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-card rounded-2xl border border-border">
            <Award className="h-6 w-6 mx-auto text-accent mb-2" />
            <p className="text-sm font-bold">{profile?.level || 'Beginner'}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <div className="text-center p-4 bg-card rounded-2xl border border-border">
            <Route className="h-6 w-6 mx-auto text-accent mb-2" />
            <p className="text-sm font-bold">{profile?.total_km_traveled?.toLocaleString() || '1,000'} km</p>
            <p className="text-xs text-muted-foreground">Total Traveled</p>
          </div>
          <div className="text-center p-4 bg-card rounded-2xl border border-border">
            <Gift className="h-6 w-6 mx-auto text-accent mb-2" />
            <p className="text-sm font-bold">{profile?.bonus_km || '500'} km</p>
            <p className="text-xs text-muted-foreground">Bonus</p>
          </div>
        </div>
      </div>

      {/* Menu Items - Matching PDF exactly */}
      <div className="px-5 space-y-2">
        <MenuItem href="/mobile/profile/edit" icon={User} label="Edit profile" />
        <MenuItem href="/mobile/profile/change-password" icon={Lock} label="Change password" />
        <MenuItem href="/mobile/reviews" icon={Star} label="My Reviews" />
        <MenuItem href="/mobile/faq" icon={HelpCircle} label="FAQ" />
        <MenuItem href="/mobile/contact" icon={MessageCircle} label="Contact Us" />
        <MenuItem href="/mobile/legal" icon={Shield} label="Legal" />
        <MenuItem href="/mobile/profile/documents" icon={FileText} label="Documents" />
        <MenuItem href="/mobile/about" icon={Info} label="About Us" />
        <MenuItem href="/mobile/invite" icon={Users} label="Invite a Friends" />
        
        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-4 bg-card rounded-2xl border border-border hover:bg-secondary/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-red-500" />
          </div>
          <span className="flex-1 font-medium text-left text-red-500">Log Out</span>
        </button>
      </div>
    </div>
  )
}

function MenuItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 px-4 py-4 bg-card rounded-2xl border border-border hover:bg-secondary/50 transition-colors"
    >
      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  )
}
