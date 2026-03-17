'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  User, FileText, CreditCard, Bell, Star, Tag, HelpCircle, 
  FileCheck, Settings, LogOut, ChevronRight, Shield, Award
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  level: number
  total_km_traveled: number
  bonus_km: number
}

const menuItems = [
  { href: '/mobile/profile/edit', icon: User, label: 'Edit Profile' },
  { href: '/mobile/profile/documents', icon: FileText, label: 'My Documents' },
  { href: '/mobile/profile/payment-methods', icon: CreditCard, label: 'Payment Methods' },
  { href: '/mobile/wishlist', icon: Star, label: 'My Wishlist' },
  { href: '/mobile/notifications', icon: Bell, label: 'Notifications', badge: 3 },
  { href: '/mobile/profile/discounts', icon: Tag, label: 'Discounts & Offers' },
]

const supportItems = [
  { href: '/mobile/support', icon: HelpCircle, label: 'Help & Support' },
  { href: '/mobile/terms', icon: FileCheck, label: 'Terms & Conditions' },
  { href: '/mobile/settings', icon: Settings, label: 'Settings' },
]

export default function MobileProfilePage() {
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
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="h-32 rounded-3xl bg-secondary animate-pulse" />
        <div className="h-64 rounded-3xl bg-secondary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Profile</h1>
        
        {/* Profile Card */}
        <div className="p-5 bg-card rounded-3xl border border-border/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-accent rounded-lg flex items-center justify-center">
                <Award className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{profile?.full_name || 'Guest User'}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-3 w-3 text-accent" />
                <span className="text-xs font-medium text-accent">Level {profile?.level || 1} Member</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-secondary/50 rounded-xl text-center">
              <p className="text-xl font-bold">{profile?.total_km_traveled?.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground">km traveled</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl text-center">
              <p className="text-xl font-bold text-accent">{profile?.bonus_km || '0'}</p>
              <p className="text-xs text-muted-foreground">bonus km</p>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <div className="px-4 space-y-4">
        {/* Account Section */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors",
                  idx !== menuItems.length - 1 && "border-b border-border/30"
                )}
              >
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                {item.badge && (
                  <span className="h-5 min-w-5 px-1.5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )
          })}
        </div>

        {/* Support Section */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {supportItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors",
                  idx !== supportItems.length - 1 && "border-b border-border/30"
                )}
              >
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )
          })}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-3.5 bg-card rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors"
        >
          <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <span className="flex-1 font-medium text-sm text-red-500 text-left">Sign Out</span>
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground py-4">
          CAI Drive v1.0.0
        </p>
      </div>
    </div>
  )
}
