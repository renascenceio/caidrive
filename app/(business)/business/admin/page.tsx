'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  Car, Users, CalendarDays, Trash2, Plus, Loader2, 
  AlertTriangle, Shield, Database, RefreshCw 
} from 'lucide-react'

const ADMIN_EMAIL = 'aslan@caidrive.com'

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    hasCompany: false,
    vehicleCount: 0,
    driverCount: 0,
    bookingCount: 0,
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/business')
      return
    }

    setIsAdmin(true)
    fetchStats()
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/seed')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('Error fetching stats:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: string) {
    setActionLoading(action)
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: data.message,
        })
        fetchStats()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Action failed',
          variant: 'destructive',
        })
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
          <Shield className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Database management for admins</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="text-xl font-bold">{stats.hasCompany ? 'Active' : 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Car className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicles</p>
                <p className="text-xl font-bold">{stats.vehicleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drivers</p>
                <p className="text-xl font-bold">{stats.driverCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <CalendarDays className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-xl font-bold">{stats.bookingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seed Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Populate Data
          </CardTitle>
          <CardDescription>
            Add sample data to your database for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleAction('seed_vehicles')}
              disabled={!!actionLoading}
            >
              {actionLoading === 'seed_vehicles' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Car className="mr-2 h-4 w-4" />
              )}
              Add 8 Sample Vehicles
            </Button>
            
            <Button
              onClick={() => handleAction('seed_drivers')}
              disabled={!!actionLoading}
              variant="secondary"
            >
              {actionLoading === 'seed_drivers' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              Add 5 Sample Drivers
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            This will replace existing data of the same type with fresh sample data.
          </p>
        </CardContent>
      </Card>

      {/* Flush Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            These actions will permanently delete data. Use with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleAction('flush_vehicles')}
              disabled={!!actionLoading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {actionLoading === 'flush_vehicles' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Flush Vehicles
            </Button>
            
            <Button
              onClick={() => handleAction('flush_drivers')}
              disabled={!!actionLoading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {actionLoading === 'flush_drivers' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Flush Drivers
            </Button>
            
            <Button
              onClick={() => handleAction('flush_bookings')}
              disabled={!!actionLoading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {actionLoading === 'flush_bookings' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Flush Bookings
            </Button>
            
            <Button
              onClick={() => handleAction('flush_all')}
              disabled={!!actionLoading}
              variant="destructive"
            >
              {actionLoading === 'flush_all' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Flush All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button
          onClick={fetchStats}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Stats
        </Button>
      </div>
    </div>
  )
}
