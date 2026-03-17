'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Megaphone, Plus, Calendar, Percent, Car, Pencil, Trash2,
  Play, Pause, CheckCircle, Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const mockCampaigns = [
  {
    id: '1',
    name: 'Spring Special',
    startDate: 'Mar 15, 2026',
    endDate: 'Apr 15, 2026',
    discount: 15,
    cars: ['Ferrari SF90', 'Lamborghini Huracán', 'Porsche 911 GT3'],
    status: 'active',
    bookings: 12,
    revenue: 45000,
  },
  {
    id: '2',
    name: 'Weekend Getaway',
    startDate: 'Mar 20, 2026',
    endDate: 'Mar 22, 2026',
    discount: 10,
    cars: ['Rolls-Royce Ghost', 'Bentley Continental'],
    status: 'scheduled',
    bookings: 0,
    revenue: 0,
  },
  {
    id: '3',
    name: 'New Year Sale',
    startDate: 'Jan 1, 2026',
    endDate: 'Jan 15, 2026',
    discount: 10,
    cars: ['Ferrari F8', 'McLaren 720S'],
    status: 'ended',
    bookings: 8,
    revenue: 28000,
  },
]

const mockAvailableCars = [
  { id: '1', name: 'Ferrari SF90', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=100' },
  { id: '2', name: 'Ferrari F8', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=100' },
  { id: '3', name: 'Lamborghini Huracán', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=100' },
  { id: '4', name: 'Lamborghini Urus', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=100' },
  { id: '5', name: 'Porsche 911 GT3', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=100' },
  { id: '6', name: 'Rolls-Royce Ghost', image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=100' },
  { id: '7', name: 'Bentley Continental', image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=100' },
  { id: '8', name: 'McLaren 720S', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=100' },
]

const statusConfig = {
  active: { label: 'Active', variant: 'default' as const, icon: Play },
  scheduled: { label: 'Scheduled', variant: 'outline' as const, icon: Clock },
  ended: { label: 'Ended', variant: 'secondary' as const, icon: CheckCircle },
  paused: { label: 'Paused', variant: 'outline' as const, icon: Pause },
}

function CampaignCard({ campaign, onEdit, onDelete, onToggle }: { 
  campaign: typeof mockCampaigns[0]
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const status = statusConfig[campaign.status as keyof typeof statusConfig]
  const StatusIcon = status?.icon || Clock

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <Badge variant={status?.variant || 'outline'} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status?.label || campaign.status}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            {campaign.startDate} - {campaign.endDate}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status !== 'ended' && (
            <Button variant="ghost" size="icon" onClick={onToggle}>
              {campaign.status === 'active' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Percent className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold">{campaign.discount}%</p>
              <p className="text-xs text-muted-foreground">Discount</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Car className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold">{campaign.cars.length}</p>
              <p className="text-xs text-muted-foreground">Cars</p>
            </div>
          </div>
          {campaign.status !== 'scheduled' && (
            <>
              <div>
                <p className="text-xl font-bold">{campaign.bookings}</p>
                <p className="text-xs text-muted-foreground">Bookings</p>
              </div>
              <div>
                <p className="text-xl font-bold">AED {campaign.revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Cars:</span> {campaign.cars.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedCars, setSelectedCars] = useState<string[]>([])

  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled')
  const endedCampaigns = campaigns.filter(c => c.status === 'ended')

  const handleToggleCar = (carName: string) => {
    setSelectedCars(prev => 
      prev.includes(carName) 
        ? prev.filter(c => c !== carName)
        : [...prev, carName]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">Create and manage promotional campaigns</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up a promotional discount campaign for your fleet</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input placeholder="e.g., Summer Special" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5% Off</SelectItem>
                    <SelectItem value="10">10% Off</SelectItem>
                    <SelectItem value="15">15% Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Select Cars</Label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {mockAvailableCars.map((car) => (
                    <div 
                      key={car.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer transition-colors",
                        selectedCars.includes(car.name) && "border-accent bg-accent/5"
                      )}
                      onClick={() => handleToggleCar(car.name)}
                    >
                      <Checkbox checked={selectedCars.includes(car.name)} />
                      <div className="relative h-10 w-14 rounded overflow-hidden bg-secondary">
                        <Image src={car.image} alt={car.name} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-medium">{car.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setCreateDialogOpen(false)}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="mt-2 text-2xl font-bold">{activeCampaigns.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <Play className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="mt-2 text-2xl font-bold">{scheduledCampaigns.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold">AED 73,000</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Campaigns</h2>
          {activeCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => {}}
              onDelete={() => setCampaigns(prev => prev.filter(c => c.id !== campaign.id))}
              onToggle={() => setCampaigns(prev => prev.map(c => 
                c.id === campaign.id ? { ...c, status: 'paused' } : c
              ))}
            />
          ))}
        </div>
      )}

      {/* Scheduled Campaigns */}
      {scheduledCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Scheduled Campaigns</h2>
          {scheduledCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => {}}
              onDelete={() => setCampaigns(prev => prev.filter(c => c.id !== campaign.id))}
              onToggle={() => {}}
            />
          ))}
        </div>
      )}

      {/* Past Campaigns */}
      {endedCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Past Campaigns</h2>
          {endedCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => {}}
              onDelete={() => setCampaigns(prev => prev.filter(c => c.id !== campaign.id))}
              onToggle={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
