import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, Heart, Share2, ChevronLeft,
  Gauge, Zap, Users, Activity, Fuel, Settings2, Calendar, Shield,
  MapPin, Clock, Check, ChevronRight, Wifi, Bluetooth, Navigation, Radio, Car
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'

interface CarDetailPageProps {
  params: Promise<{ id: string }>
}

async function getVehicle(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select(`
      *,
      company:companies(id, name, logo_url, is_verified),
      reviews:reviews(id, rating, comment, created_at, user:profiles(full_name, avatar_url))
    `)
    .eq('id', id)
    .single()
  
  return data
}

async function getVehicleBookings(vehicleId: string) {
  const supabase = await createClient()
  const today = new Date()
  const thirtyDaysLater = addDays(today, 30)
  
  const { data } = await supabase
    .from('bookings')
    .select('id, pickup_date, return_date, status')
    .eq('vehicle_id', vehicleId)
    .in('status', ['confirmed', 'active', 'pending'])
    .gte('return_date', today.toISOString())
    .lte('pickup_date', thirtyDaysLater.toISOString())
  
  return data || []
}

async function getSimilarCars(brand: string, excludeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'available')
    .neq('id', excludeId)
    .limit(4)
  
  return data || []
}

function isDateBooked(date: Date, bookings: Array<{pickup_date: string, return_date: string}>) {
  return bookings.some(booking => {
    const pickup = new Date(booking.pickup_date)
    const returnDate = new Date(booking.return_date)
    return date >= pickup && date <= returnDate
  })
}

function AvailabilityCalendar({ bookings }: { bookings: Array<{pickup_date: string, return_date: string, status: string}> }) {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{format(today, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Booked</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === today.getMonth()
          const isToday = isSameDay(day, today)
          const isPast = day < today && !isToday
          const booked = isDateBooked(day, bookings)
          
          return (
            <div
              key={i}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm
                ${!isCurrentMonth ? 'text-muted-foreground/30' : ''}
                ${isPast ? 'text-muted-foreground/50' : ''}
                ${isToday ? 'ring-2 ring-accent ring-offset-2 ring-offset-background font-semibold' : ''}
                ${booked && !isPast ? 'bg-accent/20 text-accent font-medium' : ''}
                ${!booked && !isPast && isCurrentMonth ? 'bg-green-500/10 text-green-600' : ''}
              `}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
      
      {/* Upcoming Bookings */}
      {bookings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-2">Upcoming Bookings</p>
          <div className="space-y-2">
            {bookings.slice(0, 3).map((booking, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-muted-foreground">
                  {format(new Date(booking.pickup_date), 'MMM d')} - {format(new Date(booking.return_date), 'MMM d, yyyy')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params
  const vehicle = await getVehicle(id)

  if (!vehicle) {
    notFound()
  }

  const [similarCars, bookings] = await Promise.all([
    getSimilarCars(vehicle.brand, vehicle.id),
    getVehicleBookings(vehicle.id)
  ])

  const images = vehicle.images?.length > 0 
    ? vehicle.images 
    : ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=800&fit=crop']

  // Primary specs shown in grid
  const primarySpecs = [
    { icon: Gauge, label: 'Top Speed', value: `${vehicle.max_speed || 0} km/h` },
    { icon: Zap, label: '0-100 km/h', value: `${vehicle.acceleration || 0}s` },
    { icon: Activity, label: 'Power', value: `${vehicle.power || 0} HP` },
    { icon: Users, label: 'Seats', value: vehicle.seats || 2 },
    { icon: Fuel, label: 'Fuel', value: vehicle.fuel_type || 'Petrol' },
    { icon: Settings2, label: 'Transmission', value: vehicle.transmission || 'Auto' },
  ]

  // About Booking section
  const bookingInfo = [
    { label: 'Deposit Amount', value: `$${vehicle.deposit_amount?.toLocaleString() || 0}` },
    { label: 'Price per Day', value: `$${vehicle.price_per_day?.toLocaleString() || 0}` },
    { label: 'Mileage Limit', value: `${vehicle.mileage_limit || 300} km` },
  ]

  // Technical Specifications
  const technicalSpecs = [
    { label: 'Power', value: `${vehicle.power || 0} bhp` },
    { label: 'Engine', value: vehicle.engine_size || 'N/A' },
    { label: '0-100 / 0-200', value: `${vehicle.acceleration || 0}s / ${(vehicle.acceleration || 0) * 2}s` },
    { label: 'Top Speed', value: `${vehicle.max_speed || 0} km/h` },
    { label: 'Transmission', value: vehicle.transmission || 'Automatic' },
    { label: 'Fuel Consumption', value: vehicle.fuel_consumption ? `${vehicle.fuel_consumption} L/100km` : 'N/A' },
    { label: 'Drivetrain', value: vehicle.drivetrain || 'RWD' },
    { label: 'GPS/Glonass', value: vehicle.gps_enabled !== false ? 'Yes' : 'No' },
    { label: 'Seats', value: `${vehicle.seats || 2} seats` },
    { label: 'Multimedia', value: vehicle.multimedia || 'Premium' },
    { label: 'Audio', value: vehicle.audio_power ? `${vehicle.audio_power}W` : 'N/A' },
  ]

  // Connectivity
  const connectivity = [
    { icon: Navigation, label: 'GPS Navigation', enabled: vehicle.gps_enabled !== false },
    { icon: Car, label: 'Apple CarPlay', enabled: vehicle.apple_carplay !== false },
    { icon: Wifi, label: 'WiFi', enabled: vehicle.wifi !== false },
    { icon: Bluetooth, label: 'Bluetooth', enabled: vehicle.bluetooth !== false },
  ]

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/cars">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={images[0]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.slice(1, 5).map((img: string, i: number) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                      <Image
                        src={img}
                        alt={`${vehicle.brand} ${vehicle.model} - Image ${i + 2}`}
                        fill
                        className="object-cover"
                      />
                      {i === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold">+{images.length - 5}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {vehicle.company?.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline">{vehicle.year}</Badge>
              </div>
              <h1 className="text-3xl font-bold lg:text-4xl">
                {vehicle.brand} {vehicle.model}
              </h1>
              <div className="mt-3 flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  Dubai, UAE
                </span>
                <span>{vehicle.color}</span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium text-foreground">{vehicle.rating?.toFixed(1) || '0.0'}</span>
                  <Link href="#reviews" className="hover:underline">
                    ({vehicle.review_count || 0} reviews)
                  </Link>
                </div>
              </div>
            </div>

            {/* Primary Specs Grid */}
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {primarySpecs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
                  <Icon className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
                  <p className="font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {vehicle.description && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* About Booking */}
            <div>
              <h2 className="text-lg font-semibold mb-4">About Booking</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {bookingInfo.map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className="text-lg font-bold text-accent">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Technical Specifications</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {technicalSpecs.map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connectivity */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Connectivity</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {connectivity.map(({ icon: Icon, label, enabled }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${enabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className={`text-xs ${enabled ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {enabled ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature: string, i: number) => (
                    <Badge key={i} variant="secondary" className="py-2 px-4 gap-1.5">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rental Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Rental Information</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Full Insurance</p>
                    <p className="text-sm text-muted-foreground">Comprehensive coverage included</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Free Cancellation</p>
                    <p className="text-sm text-muted-foreground">Up to 24 hours before</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Delivery Available</p>
                    <p className="text-sm text-muted-foreground">Anywhere in Dubai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Availability - Next 30 Days</h2>
              <AvailabilityCalendar bookings={bookings} />
            </div>

            {/* Reviews */}
            <div id="reviews">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Reviews</h2>
                {vehicle.reviews?.length > 0 && (
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {vehicle.reviews && vehicle.reviews.length > 0 ? (
                <div className="space-y-4">
                  {vehicle.reviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="font-semibold text-muted-foreground">
                            {(review.user?.full_name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{review.user?.full_name || 'Anonymous'}</p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              )}
            </div>

            {/* Similar Cars */}
            {similarCars.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">You May Also Like</h2>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {similarCars.map((car) => (
                    <Link
                      key={car.id}
                      href={`/cars/${car.id}`}
                      className="group rounded-xl border border-border overflow-hidden hover:border-foreground/20 transition-colors"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={car.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate">{car.brand} {car.model}</h3>
                        <p className="text-sm font-semibold text-accent mt-1">${car.price_per_day}/day</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-accent">${vehicle.price_per_day}</span>
                <span className="text-muted-foreground">/day</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Pick-up Date</label>
                  <Button variant="outline" className="w-full justify-start h-11">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    Select date
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Return Date</label>
                  <Button variant="outline" className="w-full justify-start h-11">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    Select date
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily rate</span>
                  <span>${vehicle.price_per_day}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="text-green-600">Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span>$25</span>
                </div>
                {vehicle.deposit_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit (refundable)</span>
                    <span>${vehicle.deposit_amount}</span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-accent">${vehicle.price_per_day + 25}</span>
              </div>

              <Link href={`/cars/${vehicle.id}/book`}>
                <Button className="w-full h-12 text-base" size="lg">
                  Book Now
                </Button>
              </Link>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Free cancellation up to 24 hours before pickup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Booking Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-bold text-accent">${vehicle.price_per_day}</span>
            <span className="text-muted-foreground">/day</span>
          </div>
          <Link href={`/cars/${vehicle.id}/book`}>
            <Button className="h-12 px-8" size="lg">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
