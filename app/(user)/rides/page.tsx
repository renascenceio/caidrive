import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow, format } from 'date-fns'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-blue-500/20 text-blue-500',
  active: 'bg-green-500/20 text-green-500',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/20 text-destructive',
}

async function getBookings(status: 'current' | 'history') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  let query = supabase
    .from('bookings')
    .select(`
      *,
      vehicle:vehicles(id, brand, model, images, price_per_day),
      company:companies(id, name)
    `)
    .eq('user_id', user.id)
    .order('pickup_date', { ascending: status === 'current' })

  if (status === 'current') {
    query = query.in('status', ['pending', 'confirmed', 'active'])
  } else {
    query = query.in('status', ['completed', 'cancelled'])
  }

  const { data } = await query
  return data || []
}

function BookingCard({ booking }: { booking: any }) {
  const vehicle = booking.vehicle
  const imageUrl = vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop'

  return (
    <Link 
      href={`/rides/${booking.id}`}
      className="flex gap-4 rounded-xl bg-card p-4 transition-colors hover:bg-card/80"
    >
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={`${vehicle?.brand} ${vehicle?.model}`}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold">
              {vehicle?.brand} {vehicle?.model}
            </h3>
            <Badge className={statusColors[booking.status] || statusColors.pending}>
              {booking.status}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {booking.company?.name}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(booking.pickup_date), 'MMM d')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(booking.pickup_date), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      
      <ChevronRight className="h-5 w-5 self-center text-muted-foreground" />
    </Link>
  )
}

function BookingsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl bg-card p-4">
          <Skeleton className="h-20 w-28 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function BookingsList({ status }: { status: 'current' | 'history' }) {
  const bookings = await getBookings(status)

  if (bookings.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Calendar className="h-10 w-10" />
        </EmptyMedia>
        <EmptyTitle>
          {status === 'current' ? 'No Active Bookings' : 'No Past Bookings'}
        </EmptyTitle>
        <EmptyDescription>
          {status === 'current' 
            ? 'You don\'t have any upcoming or active bookings.'
            : 'Your booking history will appear here.'}
        </EmptyDescription>
        {status === 'current' && (
          <Link href="/cars">
            <Button className="mt-4">Browse Cars</Button>
          </Link>
        )}
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}

export default async function RidesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">My Rides</h1>
      <p className="mt-1 text-muted-foreground">Manage your bookings</p>

      <Tabs defaultValue="current" className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="current" className="flex-1">Current Bookings</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4">
          <Suspense fallback={<BookingsSkeleton />}>
            <BookingsList status="current" />
          </Suspense>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Suspense fallback={<BookingsSkeleton />}>
            <BookingsList status="history" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
