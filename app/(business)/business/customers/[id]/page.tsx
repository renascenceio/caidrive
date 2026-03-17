'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Car,
  FileText, Shield, Star, CreditCard, Loader2, Save,
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  address?: string
  city?: string
  country?: string
  date_of_birth?: string
  driver_license_number?: string
  driver_license_expiry?: string
  driver_license_verified: boolean
  passport_number?: string
  passport_verified: boolean
  id_number?: string
  id_verified: boolean
  total_rides: number
  total_spent: number
  rating: number
  notes?: string
  created_at: string
}

export default function CustomerEditPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    // In production, fetch from API
    // For now, using mock data
    setCustomer({
      id: params.id as string,
      full_name: 'Ahmed Al Maktoum',
      email: 'ahmed@example.com',
      phone: '+971 50 123 4567',
      avatar_url: undefined,
      address: 'Business Bay, Tower 1, Apt 2301',
      city: 'Dubai',
      country: 'UAE',
      date_of_birth: '1985-06-15',
      driver_license_number: 'DXB-12345678',
      driver_license_expiry: '2027-03-20',
      driver_license_verified: true,
      passport_number: 'A12345678',
      passport_verified: true,
      id_number: '784-1985-1234567-1',
      id_verified: true,
      total_rides: 12,
      total_spent: 45000,
      rating: 4.8,
      notes: 'VIP customer, prefers Ferrari models',
      created_at: '2024-01-15T10:00:00Z',
    })
    setLoading(false)
  }, [params.id])

  async function handleSave() {
    if (!customer) return
    
    setSaving(true)
    try {
      // In production, save to API
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Customer details saved successfully')
    } catch (error) {
      toast.error('Failed to save customer details')
    } finally {
      setSaving(false)
    }
  }

  function toggleVerification(field: 'driver_license_verified' | 'passport_verified' | 'id_verified') {
    if (!customer) return
    setCustomer({ ...customer, [field]: !customer[field] })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Customer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/business/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Customer</h1>
            <p className="text-muted-foreground">View and manage customer details</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* Customer Overview Card */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
            {customer.avatar_url ? (
              <Image src={customer.avatar_url} alt={customer.full_name} fill className="object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                {customer.full_name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{customer.full_name}</h2>
            <p className="text-muted-foreground">{customer.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{customer.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Car className="h-4 w-4" />
                <span>{customer.total_rides} rides</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>AED {customer.total_spent.toLocaleString()} spent</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
            Active Customer
          </Badge>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          Personal Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={customer.full_name}
              onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-10"
                value={customer.phone || ''}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dob"
                type="date"
                className="pl-10"
                value={customer.date_of_birth || ''}
                onChange={(e) => setCustomer({ ...customer, date_of_birth: e.target.value })}
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
                value={customer.address || ''}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={customer.city || ''}
              onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={customer.country || ''}
              onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Documents & Verification */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents & Verification
        </h3>
        <div className="space-y-4">
          {/* Driver's License */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                customer.driver_license_verified ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
              )}>
                {customer.driver_license_verified ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Driver's License</p>
                <p className="text-xs text-muted-foreground">
                  {customer.driver_license_number || 'Not provided'} 
                  {customer.driver_license_expiry && ` · Expires ${customer.driver_license_expiry}`}
                </p>
              </div>
            </div>
            <Button 
              variant={customer.driver_license_verified ? "outline" : "default"}
              size="sm"
              onClick={() => toggleVerification('driver_license_verified')}
            >
              {customer.driver_license_verified ? 'Revoke' : 'Verify'}
            </Button>
          </div>

          {/* Passport */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                customer.passport_verified ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
              )}>
                {customer.passport_verified ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Passport</p>
                <p className="text-xs text-muted-foreground">
                  {customer.passport_number || 'Not provided'}
                </p>
              </div>
            </div>
            <Button 
              variant={customer.passport_verified ? "outline" : "default"}
              size="sm"
              onClick={() => toggleVerification('passport_verified')}
            >
              {customer.passport_verified ? 'Revoke' : 'Verify'}
            </Button>
          </div>

          {/* Emirates ID */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                customer.id_verified ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"
              )}>
                {customer.id_verified ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Emirates ID</p>
                <p className="text-xs text-muted-foreground">
                  {customer.id_number || 'Not provided'}
                </p>
              </div>
            </div>
            <Button 
              variant={customer.id_verified ? "outline" : "default"}
              size="sm"
              onClick={() => toggleVerification('id_verified')}
            >
              {customer.id_verified ? 'Revoke' : 'Verify'}
            </Button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
        <h3 className="font-semibold mb-4">Internal Notes</h3>
        <Textarea
          value={customer.notes || ''}
          onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
          placeholder="Add notes about this customer..."
          rows={4}
        />
      </div>
    </div>
  )
}
