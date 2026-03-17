'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, Heart, Share2, Star, Gauge, Zap, Users, Fuel, 
  Calendar, MapPin, ChevronRight, Check, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  images: string[]
  price_per_day: number
  deposit_amount: number
  rating: number
  review_count: number
  max_speed: number
  acceleration: number
  seats: number
  power: number
  features: string[]
  company: {
    id: string
    name: string
    logo_url: string
  }
}

export default function MobileCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [bookingOpen, setBookingOpen] = useState(false)

  useEffect(() => {
    async function fetchVehicle() {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('vehicles')
        .select(`
          *,
          company:companies(id, name, logo_url)
        `)
        .eq('id', id)
        .single()

      setVehicle(data)
      setLoading(false)
    }
    
    fetchVehicle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="h-80 bg-secondary" />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-secondary rounded-lg w-3/4" />
          <div className="h-4 bg-secondary rounded-lg w-1/2" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Vehicle not found</p>
      </div>
    )
  }

  const images = vehicle.images?.length > 0 
    ? vehicle.images 
    : ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Gallery */}
      <div className="relative h-80">
        <Image
          src={images[selectedImageIndex]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover"
        />
        
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 safe-area-top">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-black/30 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full bg-black/30 backdrop-blur-md">
              <Share2 className="h-5 w-5 text-white" />
            </button>
            <button 
              onClick={() => setWishlisted(!wishlisted)}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-md"
            >
              <Heart className={cn(
                "h-5 w-5 transition-all",
                wishlisted ? "fill-accent text-accent" : "text-white"
              )} />
            </button>
          </div>
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === selectedImageIndex ? "bg-white w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Main Info Card */}
        <div className="bg-card rounded-3xl p-5 border border-border/50 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">{vehicle.brand}</p>
              <h1 className="text-2xl font-bold">{vehicle.model}</h1>
              <p className="text-xs text-muted-foreground">{vehicle.year}</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{vehicle.rating?.toFixed(1) || '4.5'}</span>
              <span className="text-xs text-muted-foreground">({vehicle.review_count || 0})</span>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <SpecItem icon={Gauge} value={`${vehicle.max_speed || 300}`} label="km/h" />
            <SpecItem icon={Zap} value={`${vehicle.acceleration || 3.5}s`} label="0-100" />
            <SpecItem icon={Users} value={`${vehicle.seats || 4}`} label="Seats" />
            <SpecItem icon={Fuel} value={`${vehicle.power || 500}`} label="bhp" />
          </div>
        </div>

        {/* Rental Company */}
        {vehicle.company && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/50">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              {vehicle.company.logo_url ? (
                <Image
                  src={vehicle.company.logo_url}
                  alt={vehicle.company.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-bold">{vehicle.company.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{vehicle.company.name}</p>
              <p className="text-xs text-muted-foreground">Verified rental partner</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* Features */}
        <div className="mt-6">
          <h2 className="font-semibold mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {(vehicle.features || ['GPS Navigation', 'Bluetooth', 'Leather Seats', 'Climate Control', 'Cruise Control']).map((feature, idx) => (
              <span 
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 rounded-full text-xs font-medium"
              >
                <Check className="h-3 w-3 text-accent" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Insurance Note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-accent/5 rounded-2xl border border-accent/20">
          <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Comprehensive Insurance</p>
            <p className="text-xs text-muted-foreground mt-1">
              All rentals include basic insurance coverage. Additional protection available at checkout.
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Reviews</h2>
            <Link href={`/app/cars/${id}/reviews`} className="text-xs text-accent font-medium">
              See all
            </Link>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border/50">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{vehicle.rating?.toFixed(1) || '4.5'}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={cn(
                        "h-3 w-3",
                        star <= Math.round(vehicle.rating || 4.5) 
                          ? "fill-amber-400 text-amber-400" 
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{vehicle.review_count || 0} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs w-3">{rating}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: rating === 5 ? '70%' : rating === 4 ? '20%' : '5%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 safe-area-bottom">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-muted-foreground">Price per day</p>
            <p className="text-2xl font-bold">
              AED {vehicle.price_per_day?.toLocaleString() || '1,500'}
            </p>
          </div>
          
          <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-2xl px-8">
                Book Now
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Book {vehicle.brand} {vehicle.model}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Date Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Select Dates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-3 p-4 bg-secondary rounded-2xl text-left">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pick-up</p>
                        <p className="font-medium">Select date</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-secondary rounded-2xl text-left">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Return</p>
                        <p className="font-medium">Select date</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Location Selection */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Pick-up Location</h3>
                  <button className="flex items-center gap-3 w-full p-4 bg-secondary rounded-2xl text-left">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Select location</p>
                      <p className="text-xs text-muted-foreground">Delivery available</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                  </button>
                </div>

                {/* Price Summary */}
                <div className="p-4 bg-secondary/50 rounded-2xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily rate</span>
                    <span>AED {vehicle.price_per_day?.toLocaleString() || '1,500'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security deposit</span>
                    <span>AED {vehicle.deposit_amount?.toLocaleString() || '5,000'}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>Select dates</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full rounded-2xl h-14 text-base">
                  Continue to Payment
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="text-center p-3 bg-secondary/30 rounded-2xl">
      <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
      <p className="font-bold text-sm">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
