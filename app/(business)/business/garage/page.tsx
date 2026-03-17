'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Car, Plus, Search, MoreVertical, Pencil, Pause, Play, 
  Trash2, Copy, ArrowUpDown, Filter
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
import { cn } from '@/lib/utils'

// Mock data grouped by brand
const mockVehicles = {
  'Aston Martin': [
    { id: '1', model: 'DB12', year: 2024, color: 'Skyfall Silver', plate: 'AA12345', image: 'https://images.unsplash.com/photo-1596559873224-e0e8f6376f7d?w=400', price: 1600, status: 'active', views: 234, bookings: 12 },
  ],
  'Bentley': [
    { id: '2', model: 'Continental GT', year: 2024, color: 'Beluga Black', plate: 'BB23456', image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400', price: 1400, status: 'active', views: 189, bookings: 8 },
  ],
  'BMW': [
    { id: '3', model: 'M8 Competition', year: 2024, color: 'Frozen Black', plate: 'CC34567', image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400', price: 800, status: 'active', views: 312, bookings: 15 },
  ],
  'Ferrari': [
    { id: '4', model: 'SF90 Stradale', year: 2024, color: 'Rosso Corsa', plate: 'DD45678', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400', price: 2500, status: 'active', views: 567, bookings: 23 },
    { id: '5', model: 'F8 Tributo', year: 2023, color: 'Giallo Modena', plate: 'EE56789', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400', price: 2200, status: 'paused', views: 423, bookings: 18 },
  ],
  'Lamborghini': [
    { id: '6', model: 'Huracán EVO', year: 2024, color: 'Verde Mantis', plate: 'FF67890', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', price: 2200, status: 'active', views: 489, bookings: 21 },
    { id: '7', model: 'Urus', year: 2024, color: 'Nero Noctis', plate: 'GG78901', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', price: 1500, status: 'active', views: 356, bookings: 14 },
  ],
  'McLaren': [
    { id: '8', model: '720S Spider', year: 2024, color: 'Papaya Spark', plate: 'HH89012', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400', price: 2300, status: 'active', views: 401, bookings: 17 },
  ],
  'Porsche': [
    { id: '9', model: '911 GT3 RS', year: 2024, color: 'GT Silver', plate: 'II90123', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=400', price: 1800, status: 'active', views: 534, bookings: 19 },
  ],
  'Rolls-Royce': [
    { id: '10', model: 'Ghost', year: 2024, color: 'Black Diamond', plate: 'JJ01234', image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=400', price: 1500, status: 'active', views: 278, bookings: 11 },
  ],
}

type Vehicle = typeof mockVehicles['Ferrari'][0]

function VehicleCard({ 
  vehicle, 
  brand,
  onPause,
  onResume,
  onDelete,
  onCopy
}: { 
  vehicle: Vehicle
  brand: string
  onPause: (id: string) => void
  onResume: (id: string) => void
  onDelete: (id: string) => void
  onCopy: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
      {/* Image */}
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
        <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{vehicle.year} {brand} {vehicle.model}</p>
          {vehicle.status === 'paused' && (
            <Badge variant="secondary">Paused</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{vehicle.color} · {vehicle.plate}</p>
      </div>

      {/* Stats */}
      <div className="hidden items-center gap-6 lg:flex">
        <div className="text-center">
          <p className="text-sm font-medium">{vehicle.views}</p>
          <p className="text-xs text-muted-foreground">Views</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{vehicle.bookings}</p>
          <p className="text-xs text-muted-foreground">Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">AED {vehicle.price.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Per Day</p>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/business/garage/${vehicle.id}/edit`} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Modify
            </Link>
          </DropdownMenuItem>
          {vehicle.status === 'active' ? (
            <DropdownMenuItem onClick={() => onPause(vehicle.id)} className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onResume(vehicle.id)} className="gap-2">
              <Play className="h-4 w-4" />
              Resume
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onCopy(vehicle.id)} className="gap-2">
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
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('brand')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handlePause = (id: string) => {
    setVehicles(prev => {
      const updated = { ...prev }
      for (const brand in updated) {
        updated[brand] = updated[brand].map(v => 
          v.id === id ? { ...v, status: 'paused' as const } : v
        )
      }
      return updated
    })
  }

  const handleResume = (id: string) => {
    setVehicles(prev => {
      const updated = { ...prev }
      for (const brand in updated) {
        updated[brand] = updated[brand].map(v => 
          v.id === id ? { ...v, status: 'active' as const } : v
        )
      }
      return updated
    })
  }

  const handleDelete = (id: string) => {
    setVehicles(prev => {
      const updated = { ...prev }
      for (const brand in updated) {
        updated[brand] = updated[brand].filter(v => v.id !== id)
      }
      // Remove empty brands
      for (const brand in updated) {
        if (updated[brand].length === 0) delete updated[brand]
      }
      return updated
    })
    setDeleteId(null)
  }

  const handleCopy = (id: string) => {
    setVehicles(prev => {
      const updated = { ...prev }
      for (const brand in updated) {
        const vehicle = updated[brand].find(v => v.id === id)
        if (vehicle) {
          const newVehicle = {
            ...vehicle,
            id: `${vehicle.id}-copy-${Date.now()}`,
            plate: `${vehicle.plate}-COPY`,
            views: 0,
            bookings: 0,
          }
          updated[brand] = [...updated[brand], newVehicle]
          break
        }
      }
      return updated
    })
  }

  // Filter vehicles by search
  const filteredVehicles = Object.entries(vehicles).reduce((acc, [brand, cars]) => {
    const filtered = cars.filter(car => 
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) acc[brand] = filtered
    return acc
  }, {} as typeof vehicles)

  const totalVehicles = Object.values(vehicles).flat().length

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
            <SelectItem value="views">Views (High-Low)</SelectItem>
            <SelectItem value="bookings">Bookings (High-Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles List */}
      {Object.keys(filteredVehicles).length === 0 ? (
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
          {Object.entries(filteredVehicles).sort().map(([brand, cars]) => (
            <div key={brand}>
              {/* Brand Header */}
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold">{brand}</h2>
                <Badge variant="secondary">{cars.length}</Badge>
              </div>
              
              {/* Brand Vehicles */}
              <div className="space-y-2">
                {cars.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    brand={brand}
                    onPause={handlePause}
                    onResume={handleResume}
                    onDelete={(id) => setDeleteId(id)}
                    onCopy={handleCopy}
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
              Are you sure you want to remove this vehicle from your fleet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
