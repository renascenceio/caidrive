"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, Camera, Check } from "lucide-react"

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  date_of_birth: string
  nationality: string
  address: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/mobile/login")
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleAvatarUpload = async (file: File) => {
    if (!profile) return

    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error(uploadError)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    setProfile({ ...profile, avatar_url: publicUrl })
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        nationality: profile.nationality,
        address: profile.address,
        avatar_url: profile.avatar_url
      })
      .eq('id', profile.id)

    if (error) {
      console.error(error)
    } else {
      router.back()
    }
    setSaving(false)
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleAvatarUpload(file)
        }}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-accent text-white font-medium text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative"
        >
          <div className="h-24 w-24 rounded-full overflow-hidden bg-secondary">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                {profile.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </button>
        <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
          <input
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl",
              "bg-secondary/50 border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50"
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            value={profile.email || ''}
            disabled
            className={cn(
              "w-full px-4 py-3.5 rounded-xl",
              "bg-secondary/30 border border-border",
              "text-muted-foreground",
              "cursor-not-allowed"
            )}
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl",
              "bg-secondary/50 border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50"
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
          <input
            type="date"
            value={profile.date_of_birth || ''}
            onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl",
              "bg-secondary/50 border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50"
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Nationality</label>
          <select
            value={profile.nationality || ''}
            onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl",
              "bg-secondary/50 border border-border",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50"
            )}
          >
            <option value="">Select nationality</option>
            <option value="UAE">United Arab Emirates</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="IN">India</option>
            <option value="PK">Pakistan</option>
            <option value="PH">Philippines</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <textarea
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            rows={3}
            placeholder="Enter your address"
            className={cn(
              "w-full px-4 py-3.5 rounded-xl resize-none",
              "bg-secondary/50 border border-border",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/50"
            )}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-8" />
    </div>
  )
}
