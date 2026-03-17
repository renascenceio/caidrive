'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Users, Plus, Search, MoreVertical, Pencil, Trash2,
  Phone, Mail, Calendar, CheckCircle, XCircle, Clock,
  Upload, FileText, Loader2, Save, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Driver {
  id: string
  full_name: string
  email: string
  phone: string
  status: 'active' | 'pending' | 'inactive'
  deliveries: number
  rating: number
  joined_date: string
  avatar_url?: string
  is_on_leave: boolean
  leave_until?: string
  license_number?: string
  license_expiry?: string
  license_verified: boolean
}

const mockDrivers: Driver[] = [
  { 
    id: '1', 
    full_name: 'Mohammed Hassan', 
    email: 'mohammed@example.com',
    phone: '+971 50 123 4567',
    status: 'active',
    deliveries: 145,
    rating: 4.9,
    joined_date: 'Jan 2024',
    avatar_url: undefined,
    is_on_leave: false,
    license_number: 'DXB-123456',
    license_expiry: '2027-06-15',
    license_verified: true,
  },
  { 
    id: '2', 
    full_name: 'Ali Ahmed', 
    email: 'ali@example.com',
    phone: '+971 55 987 6543',
    status: 'active',
    deliveries: 98,
    rating: 4.7,
    joined_date: 'Mar 2024',
    avatar_url: undefined,
    is_on_leave: false,
    license_number: 'DXB-789012',
    license_expiry: '2026-12-20',
    license_verified: true,
  },
  { 
    id: '3', 
    full_name: 'Omar Khalid', 
    email: 'omar@example.com',
    phone: '+971 52 456 7890',
    status: 'active',
    deliveries: 67,
    rating: 4.8,
    joined_date: 'Jun 2024',
    avatar_url: undefined,
    is_on_leave: true,
    leave_until: 'Mar 25, 2026',
    license_number: 'DXB-345678',
    license_expiry: '2028-03-10',
    license_verified: true,
  },
]

const mockPendingDrivers = [
  { 
    id: '5', 
    full_name: 'Khalid Saeed', 
    email: 'khalid@example.com',
    phone: '+971 50 333 4444',
    applied_date: 'Mar 15, 2026',
  },
  { 
    id: '6', 
    full_name: 'Yusuf Ahmed', 
    email: 'yusuf@example.com',
    phone: '+971 55 555 6666',
    applied_date: 'Mar 14, 2026',
  },
]

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
  const [pendingDrivers, setPendingDrivers] = useState(mockPendingDrivers)
  const [searchQuery, setSearchQuery] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [saving, setSaving] = useState(false)

  // New driver form state
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
  })

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleAddDriver() {
    if (!newDriver.full_name || !newDriver.email || !newDriver.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // In production, call API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const driver: Driver = {
        id: Date.now().toString(),
        ...newDriver,
        status: 'active',
        deliveries: 0,
        rating: 0,
        joined_date: 'Mar 2026',
        is_on_leave: false,
        license_verified: false,
      }
      
      setDrivers(prev => [...prev, driver])
      setNewDriver({ full_name: '', email: '', phone: '', license_number: '', license_expiry: '' })
      setAddDialogOpen(false)
      toast.success('Driver added successfully')
    } catch (error) {
      toast.error('Failed to add driver')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateDriver() {
    if (!editingDriver) return

    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? editingDriver : d))
      setEditingDriver(null)
      toast.success('Driver updated successfully')
    } catch (error) {
      toast.error('Failed to update driver')
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteDriver(id: string) {
    setDrivers(prev => prev.filter(d => d.id !== id))
    toast.success('Driver removed')
  }

  function toggleLeave(id: string) {
    setDrivers(prev => prev.map(d => 
      d.id === id ? { ...d, is_on_leave: !d.is_on_leave } : d
    ))
    toast.success('Leave status updated')
  }

  function handleApprove(id: string) {
    const pending = pendingDrivers.find(d => d.id === id)
    if (pending) {
      const driver: Driver = {
        id: pending.id,
        full_name: pending.full_name,
        email: pending.email,
        phone: pending.phone,
        status: 'active',
        deliveries: 0,
        rating: 0,
        joined_date: 'Mar 2026',
        is_on_leave: false,
        license_verified: false,
      }
      setDrivers(prev => [...prev, driver])
      setPendingDrivers(prev => prev.filter(d => d.id !== id))
      toast.success(`${pending.full_name} has been approved`)
    }
  }

  function handleReject(id: string) {
    setPendingDrivers(prev => prev.filter(d => d.id !== id))
    toast.success('Application rejected')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">{drivers.length} registered drivers</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search drivers..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            Active Drivers
            <Badge variant="secondary" className="ml-1">{drivers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending Approval
            {pendingDrivers.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingDrivers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {filteredDrivers.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 shadow-sm border border-border/40 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 font-medium">No drivers found</p>
              <p className="text-sm text-muted-foreground">Add your first driver to get started</p>
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <div 
                key={driver.id} 
                className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm border border-border/40"
              >
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                  {driver.avatar_url ? (
                    <Image src={driver.avatar_url} alt={driver.full_name} fill className="object-cover" />
                  ) : (
                    <span className="font-semibold text-muted-foreground">
                      {driver.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{driver.full_name}</p>
                    {driver.is_on_leave && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        On Leave
                      </Badge>
                    )}
                    {driver.license_verified && (
                      <Badge variant="outline" className="gap-1 text-xs text-emerald-600 border-emerald-300">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {driver.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {driver.phone}
                    </span>
                  </div>
                </div>

                <div className="hidden items-center gap-6 lg:flex">
                  <div className="text-center">
                    <p className="text-sm font-semibold">{driver.deliveries}</p>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{driver.rating || '-'}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{driver.joined_date}</p>
                    <p className="text-xs text-muted-foreground">Joined</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingDriver(driver)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleLeave(driver.id)} className="gap-2">
                      <Calendar className="h-4 w-4" />
                      {driver.is_on_leave ? 'End Leave' : 'Set Leave'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteDriver(driver.id)} 
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Driver
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {pendingDrivers.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 shadow-sm border border-border/40 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 font-medium">No pending approvals</p>
              <p className="text-sm text-muted-foreground">New driver applications will appear here</p>
            </div>
          ) : (
            pendingDrivers.map((driver) => (
              <div 
                key={driver.id} 
                className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm border border-border/40"
              >
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="font-semibold text-muted-foreground">
                    {driver.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium">{driver.full_name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{driver.email}</span>
                    <span>·</span>
                    <span>{driver.phone}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Applied: {driver.applied_date}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReject(driver.id)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(driver.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add Driver Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Create a new driver profile for your fleet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                value={newDriver.full_name}
                onChange={(e) => setNewDriver({ ...newDriver, full_name: e.target.value })}
                placeholder="Enter driver's name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                value={newDriver.email}
                onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                placeholder="driver@example.com" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone" 
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                placeholder="+971 50 000 0000" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Driver's License Number</Label>
              <Input 
                id="license" 
                value={newDriver.license_number}
                onChange={(e) => setNewDriver({ ...newDriver, license_number: e.target.value })}
                placeholder="DXB-XXXXXX" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_expiry">License Expiry Date</Label>
              <Input 
                id="license_expiry" 
                type="date"
                value={newDriver.license_expiry}
                onChange={(e) => setNewDriver({ ...newDriver, license_expiry: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDriver} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={!!editingDriver} onOpenChange={(open) => !open && setEditingDriver(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update driver profile and documents</DialogDescription>
          </DialogHeader>
          {editingDriver && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingDriver.full_name}
                  onChange={(e) => setEditingDriver({ ...editingDriver, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={editingDriver.email}
                  onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input 
                  id="edit-phone" 
                  value={editingDriver.phone}
                  onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-license">License Number</Label>
                <Input 
                  id="edit-license" 
                  value={editingDriver.license_number || ''}
                  onChange={(e) => setEditingDriver({ ...editingDriver, license_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-license-expiry">License Expiry</Label>
                <Input 
                  id="edit-license-expiry" 
                  type="date"
                  value={editingDriver.license_expiry || ''}
                  onChange={(e) => setEditingDriver({ ...editingDriver, license_expiry: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm font-medium">License Verified</p>
                  <p className="text-xs text-muted-foreground">Mark license as verified after checking documents</p>
                </div>
                <Button 
                  variant={editingDriver.license_verified ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditingDriver({ ...editingDriver, license_verified: !editingDriver.license_verified })}
                >
                  {editingDriver.license_verified ? 'Verified' : 'Verify'}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDriver(null)}>Cancel</Button>
            <Button onClick={handleUpdateDriver} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
