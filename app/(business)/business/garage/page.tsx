'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Car, Plus, Search, MoreVertical, Pencil, Pause, Play, 
  Trash2, Copy, ArrowUpDown, Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  color: string
  license_plate: string
  images: string[]
  price_per_day: number
  status: 'available' | 'booked' | 'maintenance' | 'paused'
  company_id: string
  views?: number
  booking_count?: number
}

function VehicleCard({ 
  vehicle,
  onPause,
  onResume,
  onDelete,
  onDuplicate,
  isLoading
}: { 
  vehicle: Vehicle
  onPause: (id: string) => void
  onResume: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  isLoading: string | null
}) {
  const isPaused = vehicle.status === 'paused' || vehicle.status === 'maintenance'
  const isThisLoading = isLoading === vehicle.id

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
      {/* Image */}
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
        <Image 
          src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'} 
          alt={vehicle.model} 
          fill 
          className="object-cover" 
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{vehicle.year} {vehicle.brand} {vehicle.model}</p>
          <Badge variant={
            vehicle.status === 'available' ? 'default' :
            vehicle.status === 'booked' ? 'secondary' :
            'outline'
          }>
            {vehicle.status === 'available' ? 'Active' :
             vehicle.status === 'booked' ? 'Booked' :
             vehicle.status === 'paused' ? 'Paused' :
             'Maintenance'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{vehicle.color || 'N/A'} · {vehicle.license_plate || 'No plate'}</p>
      </div>

      {/* Stats */}
      <div className="hidden items-center gap-6 lg:flex">
        <div className="text-center">
          <p className="text-sm font-medium">{vehicle.views || 0}</p>
          <p className="text-xs text-muted-foreground">Views</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{vehicle.booking_count || 0}</p>
          <p className="text-xs text-muted-foreground">Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">AED {vehicle.price_per_day?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground">Per Day</p>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isThisLoading}>
            {isThisLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/business/garage/${vehicle.id}/edit`} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Modify
            </Link>
          </DropdownMenuItem>
          {isPaused ? (
            <DropdownMenuItem onClick={() => onResume(vehicle.id)} className="gap-2">
              <Play className="h-4 w-4" />
              Resume
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onPause(vehicle.id)} className="gap-2" disabled={vehicle.status === 'booked'}>
              <Pause className="h-4 w-4" />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onDuplicate(vehicle.id)} className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(vehicle.id)} className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function GaragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('brand')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    setLoading(true)
    const supabase = createClient()
    
    // Get current user's company
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Get user's company
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profile?.company_id) {
      setCompanyId(profile.company_id)
      
      // Fetch vehicles for this company with booking counts
      const { data: vehiclesData, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          bookings:bookings(count)
        `)
        .eq('company_id', profile.company_id)
        .order('brand', { ascending: true })

      if (!error && vehiclesData) {
        // Transform to include booking count
        const vehiclesWithCounts = vehiclesData.map(v => ({
          ...v,
          booking_count: v.bookings?.[0]?.count || 0
        }))
        setVehicles(vehiclesWithCounts)
      }
    }
    
    setLoading(false)
  }

  const handlePause = async (id: string) => {
    setActionLoading(id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('vehicles')
      .update({ status: 'paused' })
      .eq('id', id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to pause vehicle', variant: 'destructive' })
    } else {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'paused' as const } : v))
      toast({ title: 'Vehicle paused', description: 'The vehicle has been paused and will not appear in listings' })
    }
    setActionLoading(null)
  }

  const handleResume = async (id: string) => {
    setActionLoading(id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('vehicles')
      .update({ status: 'available' })
      .eq('id', id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to resume vehicle', variant: 'destructive' })
    } else {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'available' as const } : v))
      toast({ title: 'Vehicle resumed', description: 'The vehicle is now available for booking' })
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove vehicle. It may have active bookings.', variant: 'destructive' })
    } else {
      setVehicles(prev => prev.filter(v => v.id !== id))
      toast({ title: 'Vehicle removed', description: 'The vehicle has been removed from your fleet' })
    }
    setActionLoading(null)
    setDeleteId(null)
  }

  const handleDuplicate = async (id: string) => {
    setActionLoading(id)
    const supabase = createClient()
    
    const vehicleToCopy = vehicles.find(v => v.id === id)
    if (!vehicleToCopy || !companyId) {
      setActionLoading(null)
      return
    }

    const { id: _, booking_count, views, ...vehicleData } = vehicleToCopy
    const newVehicle = {
      ...vehicleData,
      license_plate: `${vehicleData.license_plate || 'NEW'}-COPY`,
      status: 'paused' as const,
      company_id: companyId,
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert(newVehicle)
      .select()
      .single()

    if (error) {
      toast({ title: 'Error', description: 'Failed to duplicate vehicle', variant: 'destructive' })
    } else if (data) {
      setVehicles(prev => [...prev, { ...data, booking_count: 0 }])
      toast({ title: 'Vehicle duplicated', description: 'A copy has been created and is paused. Edit it to update details.' })
    }
    setActionLoading(null)
  }

  // Group vehicles by brand
  const groupedVehicles = vehicles.reduce((acc, vehicle) => {
    const brand = vehicle.brand || 'Unknown'
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(vehicle)
    return acc
  }, {} as Record<string, Vehicle[]>)

  // Filter vehicles by search
  const filteredVehicles = Object.entries(groupedVehicles).reduce((acc, [brand, cars]) => {
    const filtered = cars.filter(car => 
      car.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) acc[brand] = filtered
    return acc
  }, {} as Record<string, Vehicle[]>)

  // Sort brands
  const sortedBrands = Object.keys(filteredVehicles).sort((a, b) => {
    if (sortBy === 'brand') return a.localeCompare(b)
    return 0
  })

  const totalVehicles = vehicles.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Garage</h1>
          <p className="text-muted-foreground">{totalVehicles} vehicles in your fleet</p>
        </div>
        <Link href="/business/garage/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by brand, model, color, or plate..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brand">Brand (A-Z)</SelectItem>
            <SelectItem value="year">Year (Newest)</SelectItem>
            <SelectItem value="price">Price (High-Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles List */}
      {sortedBrands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No vehicles found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Add your first car to get started'}
            </p>
            {!searchQuery && (
              <Link href="/business/garage/add">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Car
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedBrands.map((brand) => (
            <div key={brand}>
              {/* Brand Header */}
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{brand}</h2>
                <Badge variant="secondary">{filteredVehicles[brand].length}</Badge>
              </div>
              
              {/* Brand Vehicles */}
              <div className="space-y-2">
                {filteredVehicles[brand].map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onPause={handlePause}
                    onResume={handleResume}
                    onDelete={(id) => setDeleteId(id)}
                    onDuplicate={handleDuplicate}
                    isLoading={actionLoading}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this vehicle from your fleet? This action cannot be undone and the vehicle will be removed from all listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)} 
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
