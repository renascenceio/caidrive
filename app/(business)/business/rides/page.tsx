'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Car, Plus, MapPin, Clock, Calendar, User, ChevronDown,
  CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'

const mockDrivers = [
  { id: '1', name: 'Mohammed Hassan' },
  { id: '2', name: 'Ali Ahmed' },
  { id: '3', name: 'Omar Khalid' },
  { id: '4', name: 'Hassan Ibrahim' },
]

const mockUpcomingRides = [
  { 
    id: '1', 
    car: '2024 Ferrari SF90 Stradale', 
    color: 'Rosso Corsa', 
    plate: 'J92450',
    customer: 'Ahmed Al Maktoum',
    phone: '+971 50 123 4567',
    date: 'Fri, Mar 20, 2026',
    time: '12:30 PM',
    duration: '5 days',
    startDate: 'Mar 20, 2026',
    endDate: 'Mar 25, 2026',
    location: 'Villa 6, The Terraces, Jumeirah, Dubai',
    mapLink: 'https://maps.google.com',
    driver: 'Mohammed Hassan',
    driverId: '1',
    total: 12500,
    deposit: 10000,
  },
  { 
    id: '2', 
    car: '2024 Lamborghini Huracán EVO', 
    color: 'Verde Mantis', 
    plate: 'K82341',
    customer: 'Sarah Johnson',
    phone: '+971 55 987 6543',
    date: 'Sat, Mar 21, 2026',
    time: '10:00 AM',
    duration: '3 days',
    startDate: 'Mar 21, 2026',
    endDate: 'Mar 24, 2026',
    location: 'Dubai Marina Mall, Dubai',
    mapLink: 'https://maps.google.com',
    driver: 'Ali Ahmed',
    driverId: '2',
    total: 6600,
    deposit: 8000,
  },
]

const mockEndingRides = [
  { 
    id: '3', 
    car: '2024 McLaren 720S Spider', 
    color: 'Papaya Spark', 
    plate: 'P44321',
    customer: 'Robert Williams',
    phone: '+971 52 456 7890',
    date: 'Fri, Mar 20, 2026',
    time: '4:00 PM',
    location: 'Dubai Airport T3',
    mapLink: 'https://maps.google.com',
    driver: 'Omar Khalid',
    driverId: '3',
    total: 9200,
    deposit: 9000,
  },
]

const mockEndedRides = [
  { 
    id: '4', 
    car: '2024 Ferrari F8 Tributo', 
    color: 'Rosso Corsa', 
    plate: 'S11098',
    customer: 'Michael Brown',
    phone: '+971 50 111 2222',
    endDate: 'Thu, Mar 19, 2026',
    time: '3:00 PM',
    duration: '7 days',
    total: 17500,
    deposit: 10000,
    depositStatus: 'pending',
  },
  { 
    id: '5', 
    car: '2024 Lamborghini Urus', 
    color: 'Nero Noctis', 
    plate: 'T00987',
    customer: 'Sophie Martin',
    phone: '+971 55 333 4444',
    endDate: 'Wed, Mar 18, 2026',
    time: '5:00 PM',
    duration: '2 days',
    total: 4400,
    deposit: 5000,
    depositStatus: 'released',
  },
]

function RideRow({ 
  ride, 
  type,
  onDriverChange 
}: { 
  ride: any
  type: 'upcoming' | 'ending' | 'ended'
  onDriverChange?: (rideId: string, driverId: string) => void
}) {
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-center">
      {/* Car Info */}
      <div className="flex items-center gap-4 lg:w-64">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
          <Car className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="font-medium">{ride.car}</p>
          <p className="text-sm text-muted-foreground">{ride.color} · {ride.plate}</p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-3 lg:w-40">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{type === 'ended' ? ride.endDate : ride.date}</p>
          <p className="text-xs text-muted-foreground">{ride.time}</p>
        </div>
      </div>

      {/* Duration */}
      {ride.duration && (
        <div className="flex items-center gap-3 lg:w-24">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{ride.duration}</span>
        </div>
      )}

      {/* Location (for upcoming/ending) */}
      {ride.location && (
        <div className="flex flex-1 items-center gap-3">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm truncate">{ride.location}</span>
          <a href={ride.mapLink} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      )}

      {/* Customer */}
      <div className="flex items-center gap-3 lg:w-40">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{ride.customer}</span>
      </div>

      {/* Driver Dropdown (for upcoming/ending) */}
      {type !== 'ended' && onDriverChange && (
        <div className="lg:w-48">
          <Select 
            value={ride.driverId} 
            onValueChange={(value) => onDriverChange(ride.id, value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Assign driver" />
            </SelectTrigger>
            <SelectContent>
              {mockDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Deposit Actions (for ended) */}
      {type === 'ended' && (
        <div className="flex items-center gap-2">
          {ride.depositStatus === 'pending' ? (
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
                      Are you sure you want to release the full deposit of AED {ride.deposit.toLocaleString()} to {ride.customer}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setReleaseDialogOpen(false)}>Confirm Release</Button>
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
                      Submit a claim for all or part of the AED {ride.deposit.toLocaleString()} deposit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Claim Amount (AED)</Label>
                      <Input id="amount" type="number" placeholder="Enter amount" max={ride.deposit} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" placeholder="Describe the reason for the claim..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Proof (Images/PDF)</Label>
                      <Input type="file" multiple accept="image/*,.pdf" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setClaimDialogOpen(false)}>Submit Claim</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Badge variant={ride.depositStatus === 'released' ? 'secondary' : 'outline'}>
              {ride.depositStatus === 'released' ? 'Released' : 'Claimed'}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default function RidesPage() {
  const [upcomingRides, setUpcomingRides] = useState(mockUpcomingRides)
  const [endingRides, setEndingRides] = useState(mockEndingRides)

  const handleDriverChange = (rideId: string, driverId: string) => {
    const driver = mockDrivers.find(d => d.id === driverId)
    if (!driver) return

    setUpcomingRides(prev => prev.map(r => 
      r.id === rideId ? { ...r, driverId, driver: driver.name } : r
    ))
    setEndingRides(prev => prev.map(r => 
      r.id === rideId ? { ...r, driverId, driver: driver.name } : r
    ))
  }

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

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            <Badge variant="secondary" className="ml-1">{upcomingRides.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ending" className="gap-2">
            Ending
            <Badge variant="secondary" className="ml-1">{endingRides.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ended" className="gap-2">
            Ended
            <Badge variant="secondary" className="ml-1">{mockEndedRides.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingRides.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No upcoming rides</p>
                <p className="text-sm text-muted-foreground">New bookings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            upcomingRides.map((ride) => (
              <RideRow 
                key={ride.id} 
                ride={ride} 
                type="upcoming" 
                onDriverChange={handleDriverChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="ending" className="space-y-4">
          {endingRides.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No rides ending soon</p>
                <p className="text-sm text-muted-foreground">Rides nearing completion will appear here</p>
              </CardContent>
            </Card>
          ) : (
            endingRides.map((ride) => (
              <RideRow 
                key={ride.id} 
                ride={ride} 
                type="ending" 
                onDriverChange={handleDriverChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          {mockEndedRides.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No completed rides</p>
                <p className="text-sm text-muted-foreground">Completed rides will appear here</p>
              </CardContent>
            </Card>
          ) : (
            mockEndedRides.map((ride) => (
              <RideRow key={ride.id} ride={ride} type="ended" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
