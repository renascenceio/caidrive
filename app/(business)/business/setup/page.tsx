'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Building2, Upload, Save, Plus, Trash2, Mail, Phone, MapPin, 
  Globe, Clock, Users, Camera, Loader2, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Company {
  id: string
  name: string
  description?: string
  logo_url?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  website?: string
  operating_hours?: string
  license_number?: string
}

interface TeamMember {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending'
}

export default function SetupPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'You (Owner)', email: 'owner@company.com', role: 'owner', status: 'active' },
  ])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member')

  useEffect(() => {
    fetchCompany()
  }, [])

  async function fetchCompany() {
    try {
      const response = await fetch('/api/business/company')
      const data = await response.json()
      if (data.company) {
        setCompany(data.company)
      }
    } catch (error) {
      console.error('Error fetching company:', error)
      toast.error('Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!company) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/business/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success('Company settings saved successfully')
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error('Failed to save company settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !company) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${company.id}-logo-${Date.now()}.${fileExt}`
      const filePath = `company-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      const response = await fetch('/api/business/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: publicUrl }),
      })

      if (!response.ok) throw new Error('Failed to update logo')

      setCompany({ ...company, logo_url: publicUrl })
      toast.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo. Make sure storage bucket exists.')
    } finally {
      setUploading(false)
    }
  }

  function handleInviteMember() {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      status: 'pending',
    }
    setTeamMembers([...teamMembers, newMember])
    setNewMemberEmail('')
    toast.success(`Invitation sent to ${newMemberEmail}`)
  }

  function removeMember(id: string) {
    setTeamMembers(teamMembers.filter(m => m.id !== id))
    toast.success('Team member removed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No company found. Please complete onboarding first.</p>
        <Button onClick={() => router.push('/business/onboarding')}>
          Go to Onboarding
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Setup</h1>
          <p className="text-muted-foreground">Manage your company profile and team access</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* Company Logo */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Company Logo
        </h2>
        <div className="flex items-center gap-6">
          <div 
            className={cn(
              "relative h-24 w-24 rounded-2xl border-2 border-dashed border-border",
              "flex items-center justify-center overflow-hidden",
              "bg-secondary/50 transition-all hover:bg-secondary hover:border-foreground/20 cursor-pointer"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : company.logo_url ? (
              <Image 
                src={company.logo_url} 
                alt={company.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">Upload Logo</p>
            <p className="text-sm text-muted-foreground mb-3">
              Recommended: 400x400px, PNG or JPG. Max 2MB.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Company Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license">License Number</Label>
            <Input
              id="license"
              value={company.license_number || ''}
              onChange={(e) => setCompany({ ...company, license_number: e.target.value })}
              placeholder="Trade license number"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={company.description || ''}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              placeholder="Brief description of your business"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Contact Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={company.email || ''}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                className="pl-10"
                value={company.phone || ''}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                placeholder="+971 XX XXX XXXX"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                className="pl-10"
                value={company.website || ''}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                placeholder="https://www.company.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Operating Hours</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="hours"
                className="pl-10"
                value={company.operating_hours || ''}
                onChange={(e) => setCompany({ ...company, operating_hours: e.target.value })}
                placeholder="9:00 AM - 9:00 PM"
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                className="pl-10"
                value={company.address || ''}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                placeholder="Full business address"
                rows={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={company.city || ''}
              onChange={(e) => setCompany({ ...company, city: e.target.value })}
              placeholder="Dubai"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={company.country || ''}
              onChange={(e) => setCompany({ ...company, country: e.target.value })}
              placeholder="UAE"
            />
          </div>
        </div>
      </div>

      {/* Team Access */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Access
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Invite team members to manage your business</p>

        {/* Add Member Form */}
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Email address"
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
          />
          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member')}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm min-w-[120px]"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={handleInviteMember}>
            <Plus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </div>

        {/* Team Members List */}
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 dark:bg-secondary/30"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-card flex items-center justify-center text-sm font-medium shadow-sm">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="capitalize">
                  {member.role}
                </Badge>
                {member.status === 'pending' && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Pending
                  </Badge>
                )}
                {member.role !== 'owner' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMember(member.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions Info */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Role Permissions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <Badge className="mb-2">Owner</Badge>
            <p className="text-xs text-muted-foreground">
              Full access including billing, team management, and settings
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <Badge variant="secondary" className="mb-2">Admin</Badge>
            <p className="text-xs text-muted-foreground">
              Manage vehicles, bookings, drivers. Cannot manage billing or team
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <Badge variant="outline" className="mb-2">Member</Badge>
            <p className="text-xs text-muted-foreground">
              View and manage bookings and rides. Limited analytics access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
