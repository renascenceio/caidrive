'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Car, Plus, MapPin, Clock, Calendar, User, Loader2,
  CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface Driver {
  id: string
  name: string
}

interface Booking {
  id: string
  vehicle_id: string
  user_id: string
  start_date: string
  end_date: string
  pickup_location: string
  dropoff_location: string
  total_amount: number
  deposit_amount: number
  status: string
  payment_status: string
  driver_id?: string
  created_at: string
  vehicles?: {
    brand: string
    model: string
    year: number
    color: string
    license_plate: string
    images: string[]
  }
  profiles?: {
    full_name: string
    phone: string
  }
  drivers?: {
    name: string
  }
}

function RideRow({ 
  booking, 
  type,
  drivers,
  onDriverChange,
  onDepositAction
}: { 
  booking: Booking
  type: 'upcoming' | 'ending' | 'ended'
  drivers: Driver[]
  onDriverChange?: (bookingId: string, driverId: string) => void
  onDepositAction?: (bookingId: string, action: 'release' | 'claim', amount?: number, reason?: string) => void
}) {
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [claimAmount, setClaimAmount] = useState('')
  const [claimReason, setClaimReason] = useState('')

  const startDate = new Date(booking.start_date)
  const endDate = new Date(booking.end_date)
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const handleRelease = () => {
    onDepositAction?.(booking.id, 'release')
    setReleaseDialogOpen(false)
  }

  const handleClaim = () => {
    onDepositAction?.(booking.id, 'claim', parseFloat(claimAmount), claimReason)
    setClaimDialogOpen(false)
    setClaimAmount('')
    setClaimReason('')
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-center">
      {/* Car Info */}
      <div className="flex items-center gap-4 lg:w-64">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
          <Car className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="font-medium">{booking.vehicles?.year} {booking.vehicles?.brand} {booking.vehicles?.model}</p>
          <p className="text-sm text-muted-foreground">{booking.vehicles?.color} · {booking.vehicles?.license_plate}</p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-3 lg:w-40">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {type === 'ended' 
              ? endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-3 lg:w-24">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{days} day{days !== 1 ? 's' : ''}</span>
      </div>

      {/* Location (for upcoming/ending) */}
      {type !== 'ended' && booking.pickup_location && (
        <div className="flex flex-1 items-center gap-3">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm truncate">{booking.pickup_location}</span>
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(booking.pickup_location)}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      )}

      {/* Customer */}
      <div className="flex items-center gap-3 lg:w-40">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <span className="text-sm font-medium">{booking.profiles?.full_name || 'Customer'}</span>
          {booking.profiles?.phone && (
            <p className="text-xs text-muted-foreground">{booking.profiles.phone}</p>
          )}
        </div>
      </div>

      {/* Driver Dropdown (for upcoming/ending) */}
      {type !== 'ended' && onDriverChange && (
        <div className="lg:w-48">
          <Select 
            value={booking.driver_id || ''} 
            onValueChange={(value) => onDriverChange(booking.id, value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Assign driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Amount */}
      <div className="lg:w-24 text-right">
        <p className="text-sm font-semibold">AED {booking.total_amount?.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Deposit: {booking.deposit_amount?.toLocaleString()}</p>
      </div>

      {/* Deposit Actions (for ended) */}
      {type === 'ended' && onDepositAction && (
        <div className="flex items-center gap-2">
          {booking.payment_status === 'deposit_held' ? (
            <>
              <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Release
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Release Deposit</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to release the full deposit of AED {booking.deposit_amount?.toLocaleString()} to {booking.profiles?.full_name}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRelease}>Confirm Release</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Claim
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Claim Deposit</DialogTitle>
                    <DialogDescription>
                      Submit a claim for all or part of the AED {booking.deposit_amount?.toLocaleString()} deposit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Claim Amount (AED)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        placeholder="Enter amount" 
                        max={booking.deposit_amount || 0}
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea 
                        id="reason" 
                        placeholder="Describe the reason for the claim..."
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proof (Images/PDF)</Label>
                      <Input type="file" multiple accept="image/*,.pdf" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleClaim} disabled={!claimAmount || !claimReason}>Submit Claim</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Badge variant={booking.payment_status === 'deposit_released' ? 'secondary' : 'outline'}>
              {booking.payment_status === 'deposit_released' ? 'Released' : 'Claimed'}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default function RidesPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [noCompany, setNoCompany] = useState(false)

  // Fetch company ID
  useEffect(() => {
    async function fetchCompany() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get company where user is the owner
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (company?.id) {
        setCompanyId(company.id)
      } else {
        setNoCompany(true)
        setLoading(false)
      }
    }
    fetchCompany()
  }, [])

  // Fetch bookings and drivers when company ID is available
  useEffect(() => {
    if (!companyId) return

    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      // Fetch vehicles for this company first
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('id')
        .eq('company_id', companyId)

      const vehicleIds = vehicleData?.map(v => v.id) || []

      if (vehicleIds.length > 0) {
        // Fetch all bookings for these vehicles
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            vehicles:vehicle_id (brand, model, year, color, license_plate, images),
            profiles:user_id (full_name, phone),
            drivers:driver_id (name)
          `)
          .in('vehicle_id', vehicleIds)
          .order('start_date', { ascending: true })

        if (error) {
          console.error('[v0] Error fetching bookings:', error)
        }

        setBookings(bookingData || [])
      }

      // Fetch drivers for this company
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('status', 'active')

      setDrivers(driverData || [])
      setLoading(false)
    }

    fetchData()
  }, [companyId])

  const handleDriverChange = async (bookingId: string, driverId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('bookings')
      .update({ driver_id: driverId })
      .eq('id', bookingId)

    if (error) {
      console.error('[v0] Error updating driver:', error)
      return
    }

    // Update local state
    const driver = drivers.find(d => d.id === driverId)
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { ...b, driver_id: driverId, drivers: driver ? { name: driver.name } : undefined }
        : b
    ))
  }

  const handleDepositAction = async (bookingId: string, action: 'release' | 'claim', amount?: number, reason?: string) => {
    const supabase = createClient()

    const updateData: any = {
      payment_status: action === 'release' ? 'deposit_released' : 'deposit_claimed'
    }

    if (action === 'claim' && amount) {
      updateData.notes = JSON.stringify({
        claim_amount: amount,
        claim_reason: reason,
        claimed_at: new Date().toISOString()
      })
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (error) {
      console.error('[v0] Error updating deposit:', error)
      return
    }

    // Update local state
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, payment_status: updateData.payment_status } : b
    ))
  }

  // Categorize bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const upcomingBookings = bookings.filter(b => {
    const start = new Date(b.start_date)
    return start > today && (b.status === 'pending' || b.status === 'confirmed')
  })

  const endingBookings = bookings.filter(b => {
    const end = new Date(b.end_date)
    end.setHours(0, 0, 0, 0)
    return end <= tomorrow && end >= today && b.status === 'active'
  })

  const endedBookings = bookings.filter(b => {
    return b.status === 'completed' || b.status === 'cancelled'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rides</h1>
          <p className="text-muted-foreground">Manage all your bookings and rides</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Ride
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : noCompany ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No Company Found</p>
            <p className="text-sm text-muted-foreground">Create a company first to manage rides</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              <Badge variant="secondary" className="ml-1">{upcomingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ending" className="gap-2">
              Ending Today
              <Badge variant="secondary" className="ml-1">{endingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ended" className="gap-2">
              Completed
              <Badge variant="secondary" className="ml-1">{endedBookings.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">No upcoming rides</p>
                  <p className="text-sm text-muted-foreground">New bookings will appear here</p>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <RideRow 
                  key={booking.id} 
                  booking={booking} 
                  type="upcoming" 
                  drivers={drivers}
                  onDriverChange={handleDriverChange}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="ending" className="space-y-4">
            {endingBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">No rides ending today</p>
                  <p className="text-sm text-muted-foreground">Rides nearing completion will appear here</p>
                </CardContent>
              </Card>
            ) : (
              endingBookings.map((booking) => (
                <RideRow 
                  key={booking.id} 
                  booking={booking} 
                  type="ending" 
                  drivers={drivers}
                  onDriverChange={handleDriverChange}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="ended" className="space-y-4">
            {endedBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">No completed rides</p>
                  <p className="text-sm text-muted-foreground">Completed rides will appear here</p>
                </CardContent>
              </Card>
            ) : (
              endedBookings.map((booking) => (
                <RideRow 
                  key={booking.id} 
                  booking={booking} 
                  type="ended"
                  drivers={drivers}
                  onDepositAction={handleDepositAction}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
