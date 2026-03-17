import { Suspense } from 'react'
import Link from 'next/link'
import { 
  Building2, Users, Car, CalendarDays, DollarSign,
  TrendingUp, TrendingDown, ChevronRight, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'

async function getPlatformStats() {
  const supabase = await createClient()

  // Get counts
  const [
    { count: companyCount },
    { count: userCount },
    { count: vehicleCount },
    { count: bookingCount },
    { count: pendingCompanies },
    { data: recentCompanies },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select(`
      id,
      status,
      total_amount,
      created_at,
      user:profiles!bookings_user_id_fkey(full_name, email),
      vehicle:vehicles(brand, model),
      company:companies(name)
    `).order('created_at', { ascending: false }).limit(5),
  ])

  // Calculate total revenue
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('status', 'completed')

  const totalRevenue = completedBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0

  return {
    companyCount: companyCount || 0,
    userCount: userCount || 0,
    vehicleCount: vehicleCount || 0,
    bookingCount: bookingCount || 0,
    pendingCompanies: pendingCompanies || 0,
    totalRevenue,
    recentCompanies: recentCompanies || [],
    recentBookings: recentBookings || [],
  }
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-1 h-4 w-32" />
      </CardContent>
    </Card>
  )
}

async function DashboardContent() {
  const stats = await getPlatformStats()

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.companyCount,
      description: `${stats.pendingCompanies} pending verification`,
      icon: Building2,
      href: '/admin/companies',
    },
    {
      title: 'Total Users',
      value: stats.userCount,
      description: 'Registered users',
      icon: Users,
      href: '/admin/users',
    },
    {
      title: 'Total Vehicles',
      value: stats.vehicleCount,
      description: 'Across all companies',
      icon: Car,
      href: '/admin/vehicles',
    },
    {
      title: 'Total Bookings',
      value: stats.bookingCount,
      description: 'All time bookings',
      icon: CalendarDays,
      href: '/admin/bookings',
    },
    {
      title: 'Platform Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: 'Total earnings',
      icon: DollarSign,
      href: '/admin/payments',
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    confirmed: 'bg-blue-500/20 text-blue-500',
    active: 'bg-green-500/20 text-green-500',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive/20 text-destructive',
  }

  return (
    <>
      {/* Alert for pending verifications */}
      {stats.pendingCompanies > 0 && (
        <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium">Pending Verifications</p>
              <p className="text-sm text-muted-foreground">
                {stats.pendingCompanies} companies waiting for verification
              </p>
            </div>
            <Link href="/admin/companies?filter=pending">
              <Button variant="outline" size="sm">Review</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Companies</CardTitle>
              <CardDescription>Newly registered businesses</CardDescription>
            </div>
            <Link href="/admin/companies">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No companies yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentCompanies.map((company: any) => (
                  <div key={company.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.city || 'Location not set'}</p>
                      </div>
                    </div>
                    <Badge variant={company.is_verified ? 'default' : 'secondary'}>
                      {company.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </div>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.user?.full_name || booking.user?.email || 'Guest'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[booking.status] || statusColors.pending}>
                        {booking.status}
                      </Badge>
                      <p className="mt-1 text-sm font-medium">
                        ${booking.total_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <Suspense fallback={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
