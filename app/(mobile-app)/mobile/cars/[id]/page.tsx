'use client'

import { useState, useEffect, use, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, Heart, Star, Share2, ChevronLeft, ChevronRight,
  Volume2, VolumeX, Gauge, Zap, Users, Power, Cog, Fuel, 
  Navigation, Speaker, Armchair, Smartphone, Wifi, Bluetooth
} from 'lucide-react'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  images: string[]
  price_per_day: number
  original_price?: number
  deposit_amount: number
  rating: number
  review_count: number
  max_speed: number
  acceleration: number
  seats: number
  horsepower: number
  power?: number
  engine_size?: string
  transmission: string
  fuel_consumption?: number
  drivetrain?: string
  description?: string
  mileage_limit?: number
  audio_power?: number
  gps_enabled?: boolean
  apple_carplay?: boolean
  wifi?: boolean
  bluetooth?: boolean
}

// Brand logos
const brandLogos: Record<string, string> = {
  'Ferrari': 'https://www.carlogos.org/car-logos/ferrari-logo.png',
  'Lamborghini': 'https://www.carlogos.org/car-logos/lamborghini-logo.png',
  'Porsche': 'https://www.carlogos.org/car-logos/porsche-logo.png',
  'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
  'Mercedes-Benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
  'Audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
  'Bentley': 'https://www.carlogos.org/car-logos/bentley-logo.png',
  'Rolls-Royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo.png',
  'McLaren': 'https://www.carlogos.org/car-logos/mclaren-logo.png',
  'Aston Martin': 'https://www.carlogos.org/car-logos/aston-martin-logo.png',
  'Bugatti': 'https://www.carlogos.org/car-logos/bugatti-logo.png',
  'Maserati': 'https://www.carlogos.org/car-logos/maserati-logo.png',
}

export default function MobileCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [availability, setAvailability] = useState<Array<{ date: string; available: boolean }>>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function fetchVehicle() {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      setVehicle(data)
      setLoading(false)
    }
    
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/vehicles/${id}/availability`)
        if (response.ok) {
          const data = await response.json()
          setAvailability(data.availability || [])
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setAvailabilityLoading(false)
      }
    }
    
    fetchVehicle()
    fetchAvailability()
  }, [id])

  const toggleSound = () => {
    // This would play an engine sound - mock implementation
    setSoundEnabled(!soundEnabled)
  }

  const nextImage = () => {
    if (!vehicle?.images) return
    setSelectedImageIndex((prev) => (prev + 1) % vehicle.images.length)
  }

  const prevImage = () => {
    if (!vehicle?.images) return
    setSelectedImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="h-72 bg-card" />
        <div className="p-5 space-y-4">
          <div className="h-8 bg-card rounded-xl w-3/4" />
          <div className="h-4 bg-card rounded-xl w-1/2" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    )
  }

  const images = vehicle.images?.length > 0 
    ? vehicle.images 
    : ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']

  const brandLogo = brandLogos[vehicle.brand]

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header - Floating on Image */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-[#161821]" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {/* Share functionality */}}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm"
            >
              <Share2 className="h-5 w-5 text-[#161821]" />
            </button>
            <button 
              onClick={() => setWishlisted(!wishlisted)}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm"
            >
              <Heart className={cn(
                "h-5 w-5 transition-all text-[#161821]",
                wishlisted ? "fill-[#dd3155] text-[#dd3155]" : ""
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery - Full width, edge to edge */}
      <div className="relative bg-white pt-16">
        <div className="relative h-56 w-full">
          <Image
            src={images[selectedImageIndex]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        
        {/* Image Dots - Red accent color */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-4 bg-background">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === selectedImageIndex ? "bg-accent w-4" : "bg-accent/30 w-1.5"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          {brandLogo && (
            <div className="w-10 h-10">
              <Image
                src={brandLogo}
                alt={vehicle.brand}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold mobile-text-dark">{vehicle.brand}</h1>
            <Link 
              href={`/mobile/cars/${id}/reviews`}
              className="flex items-center gap-1 text-sm"
            >
              <Star className="h-4 w-4 fill-[#161821] mobile-text-dark" />
              <span className="font-medium mobile-text-dark">{vehicle.rating?.toFixed(1) || '4.7'}</span>
              <span className="mobile-text-muted ml-1">View reviews ({vehicle.review_count || 34})</span>
            </Link>
          </div>
        </div>

        {/* Sound Button & Price Bar - Matching PDF */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>
          
          <div className="flex-1 flex items-center justify-between bg-foreground text-background rounded-full px-5 py-3">
            <div className="flex items-center gap-2">
              {vehicle.original_price && (
                <span className="text-sm text-background/60 line-through">
                  ${vehicle.original_price.toLocaleString()}/day
                </span>
              )}
              <span className="text-lg font-bold">
                ${vehicle.price_per_day?.toLocaleString() || '1,899'}/day
              </span>
            </div>
            <Link href={`/mobile/cars/${id}/book`}>
              <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Stats - 3 Boxes with Glass effect */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-border/50 shadow-sm">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary/80 backdrop-blur flex items-center justify-center">
              <Gauge className="h-5 w-5 text-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{vehicle.max_speed || 296} km/h</p>
            <p className="text-xs text-muted-foreground">Max speed</p>
          </div>
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-border/50 shadow-sm">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary/80 backdrop-blur flex items-center justify-center">
              <Zap className="h-5 w-5 text-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{vehicle.acceleration || 2.7} sec</p>
            <p className="text-xs text-muted-foreground">Acceleration</p>
          </div>
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-border/50 shadow-sm">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary/80 backdrop-blur flex items-center justify-center">
              <Power className="h-5 w-5 text-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{vehicle.horsepower || vehicle.power || 510} bhp</p>
            <p className="text-xs text-muted-foreground">Power</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold text-base mb-3 mobile-text-dark">Description</h2>
          <p className="text-sm mobile-text-muted leading-relaxed">
            {vehicle.description || 'Lorem ipsum dolor sit amet consectetur. Consectetur lorem fusce euismod viverra egestas fermentum. Arcu sollicitudin tincidunt pellentesque integer diam. Id amet ac congue leo hendrerit. Cras pellentesque orci at posuere.'}
          </p>
        </div>

        {/* About Booking - Glass Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-sm">
          <h2 className="font-semibold text-base mb-4 text-foreground">About Booking</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deposit Amount</span>
              <span className="text-sm font-medium text-foreground text-right">
                {vehicle.deposit_amount 
                  ? `$${vehicle.deposit_amount.toLocaleString()}` 
                  : '50%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price per Day</span>
              <span className="text-sm font-medium text-foreground">${vehicle.price_per_day?.toLocaleString() || '1,256'}/day</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mileage Limit</span>
              <span className="text-sm font-medium text-foreground">{vehicle.mileage_limit || 10} km</span>
            </div>
          </div>
        </div>

        {/* Availability Calendar - Glass Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 border border-border/50 shadow-sm">
          <h2 className="font-semibold text-base mb-4 text-foreground">Availability (Next 30 Days)</h2>
          {availabilityLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-[10px] mobile-text-muted font-medium py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Add empty slots for alignment to start of week */}
                {availability.length > 0 && (() => {
                  const firstDate = new Date(availability[0].date)
                  const dayOfWeek = firstDate.getDay()
                  return Array.from({ length: dayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))
                })()}
                
                {availability.map((day, idx) => {
                  const date = new Date(day.date)
                  const dayNum = date.getDate()
                  const isToday = new Date().toDateString() === date.toDateString()
                  
                  return (
                    <div
                      key={day.date}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                        day.available 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-[#f0f0f2] text-[#c7c7cc]",
                        isToday && day.available && "bg-green-500 text-white border-green-500",
                        isToday && !day.available && "bg-[#8e8e93] text-white"
                      )}
                    >
                      {dayNum}
                    </div>
                  )
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-50 border border-green-200" />
                  <span className="mobile-text-muted">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#f0f0f2]" />
                  <span className="mobile-text-muted">Booked</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Technical Specification - Two columns, no image */}
        <div>
          <h2 className="font-semibold text-base mb-4 mobile-text-dark">Technical specification</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <SpecItem icon={<Power className="h-5 w-5" />} label="Power" value={`${vehicle.horsepower || vehicle.power || 440} bhp`} />
            <SpecItem icon={<Cog className="h-5 w-5" />} label="Engine" value={vehicle.engine_size || '3.9 liters'} />
            <SpecItem icon={<Gauge className="h-5 w-5" />} label="0-100 / 0-200" value={`${vehicle.acceleration || 5.1}s / ${((vehicle.acceleration || 5.1) * 2.2).toFixed(1)}s`} />
            <SpecItem icon={<Gauge className="h-5 w-5" />} label="Top speed" value={`${vehicle.max_speed || 440} km/h`} />
            <SpecItem icon={<Cog className="h-5 w-5" />} label="Transmission" value={vehicle.transmission || 'Automatic'} />
            <SpecItem icon={<Fuel className="h-5 w-5" />} label="Fuel Consumption" value={`${vehicle.fuel_consumption || 11.9} L`} />
            <SpecItem icon={<Cog className="h-5 w-5" />} label="Drive train" value={vehicle.drivetrain || '4x4'} />
            <SpecItem icon={<Users className="h-5 w-5" />} label="Seats" value={`${vehicle.seats || 4} seats`} />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-3">
          <FeatureBox 
            icon={<Navigation className="h-5 w-5" />} 
            label="GPS/Glonass" 
            sublabel="Navigation" 
            active={vehicle.gps_enabled !== false}
          />
          <FeatureBox 
            icon={<Speaker className="h-5 w-5" />} 
            label={`${vehicle.audio_power || 130} W`} 
            sublabel="Audio" 
          />
          <FeatureBox 
            icon={<Armchair className="h-5 w-5" />} 
            label={`Sports / ${vehicle.seats || 18} pos.`} 
            sublabel="Seats" 
          />
          <FeatureBox 
            icon={<Smartphone className="h-5 w-5" />} 
            label="Apple Car Play" 
            sublabel="Multimedia" 
            active={vehicle.apple_carplay !== false}
          />
          <FeatureBox 
            icon={<Wifi className="h-5 w-5" />} 
            label="WiFi / Bluetooth" 
            sublabel="Connectivity" 
            active={vehicle.wifi !== false || vehicle.bluetooth !== false}
          />
          <FeatureBox 
            icon={<Power className="h-5 w-5" />} 
            label={`${vehicle.horsepower || 650} bhp`} 
            sublabel="Power" 
          />
        </div>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base mobile-text-dark">Reviews</h2>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[#161821] mobile-text-dark" />
              <span className="font-semibold mobile-text-dark">{vehicle.rating?.toFixed(1) || '4.7'}</span>
              <span className="text-sm mobile-text-muted ml-1">{vehicle.review_count || 34} reviews</span>
            </div>
          </div>
          
          {/* Review Cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 snap-x">
            {[1, 2].map((_, idx) => (
              <div key={idx} className="min-w-[280px] bg-white rounded-2xl p-4 border border-[#e5e5e7] snap-start">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center overflow-hidden">
                    <Image
                      src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? 'men' : 'women'}/${idx + 1}.jpg`}
                      alt="Reviewer"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mobile-text-dark">{idx === 0 ? 'John Doe' : 'Jane Smith'}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-[#161821] mobile-text-dark" />
                      <span className="text-xs mobile-text-dark">{idx === 0 ? '5' : '4'}</span>
                      <span className="text-xs mobile-text-muted ml-1">October {idx + 2}, 2023</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm mobile-text-muted line-clamp-3">
                  Lorem ipsum dolor sit amet consectetur. Consectetur lorem fusce euismod viverra egestas fermentum. Arcu sollicitudin tincidunt pellentesque integer diam.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar - Directly above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#f5f5f7] px-5 py-3 border-b border-[#e5e5e7]">
        <div className="flex items-center justify-between">
          <div>
            {vehicle.original_price && (
              <p className="text-sm text-[#8e8e93] line-through">${vehicle.original_price.toLocaleString()}/day</p>
            )}
            <p className="text-xl font-bold text-[#161821]">${vehicle.price_per_day?.toLocaleString() || '1,899'}/day</p>
          </div>
          
          <Link href={`/mobile/cars/${id}/book`} className="flex-1 ml-4">
            <button className="w-full py-4 bg-[#161821] text-white font-semibold rounded-full flex items-center justify-center gap-2">
              Book Now
              <ChevronRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-xl rounded-xl p-3 border border-border/50 shadow-sm">
      <div className="w-9 h-9 rounded-lg bg-secondary/80 backdrop-blur flex items-center justify-center flex-shrink-0 text-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-sm truncate text-foreground">{value}</p>
      </div>
    </div>
  )
}

function FeatureBox({ icon, label, sublabel, active = true }: { icon: React.ReactNode; label: string; sublabel: string; active?: boolean }) {
  return (
    <div className={cn(
      "bg-card/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-border/50 shadow-sm",
      !active && "opacity-50"
    )}>
      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary/80 backdrop-blur flex items-center justify-center text-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  )
}
