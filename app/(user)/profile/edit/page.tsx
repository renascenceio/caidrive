'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    avatar_url: ''
  })

  useEffect(() => {
    async function loadProfile() {
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

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          country: data.country || '',
          avatar_url: data.avatar_url || ''
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          country: profile.country
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated successfully')
      router.push('/profile')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">
                {profile.full_name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <Button size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Enter your full name"
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={profile.email}
            disabled
            className="mt-1.5 bg-muted"
          />
          <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <Input
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+971 50 123 4567"
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Country</label>
          <Input
            value={profile.country}
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            placeholder="UAE"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
