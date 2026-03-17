'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, Gauge, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LuxuryCarCardProps {
  id: string
  brand: string
  model: string
  year: number
  image: string
  maxSpeed: number
  acceleration: number
  power: number
  seats: number
  pricePerDay: number
  rating: number
  reviewCount: number
  isWishlisted?: boolean
  onWishlistToggle?: (id: string) => void
}

export function LuxuryCarCard({
  id,
  brand,
  model,
  year,
  image,
  maxSpeed,
  acceleration,
  pricePerDay,
  rating,
  reviewCount,
  isWishlisted = false,
  onWishlistToggle,
}: LuxuryCarCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [wishlisted, setWishlisted] = useState(isWishlisted)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted(!wishlisted)
    onWishlistToggle?.(id)
  }

  return (
    <Link href={`/cars/${id}`}>
      <div
        className={cn(
          "group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer",
          "transition-all duration-500 ease-out",
          "hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/40",
          "hover:-translate-y-2 hover:scale-[1.02]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image */}
        <Image
          src={image}
          alt={`${brand} ${model}`}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            isHovered ? "scale-110" : "scale-100",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Dark gradient overlay */}
        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-t from-black/80 via-black/20 to-black/10",
          "transition-opacity duration-300",
          isHovered && "from-black/90"
        )} />

        {/* Top Glass Badges - all same height h-9 */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          {/* Rating Badge */}
          <div className={cn(
            "flex items-center gap-2 h-9 px-3 rounded-xl",
            "bg-white/10 backdrop-blur-md border border-white/20",
            "shadow-lg"
          )}>
            <Star className="h-4 w-4 fill-white text-white" />
            <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
          </div>

          {/* Specs Badge */}
          <div className={cn(
            "flex items-center gap-3 h-9 px-3 rounded-xl",
            "bg-white/10 backdrop-blur-md border border-white/20",
            "shadow-lg"
          )}>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs font-medium text-white">{maxSpeed} km/h</span>
            </div>
            <div className="w-px h-3 bg-white/30" />
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs font-medium text-white">{acceleration}s</span>
            </div>
          </div>

          {/* Wishlist Button - same height */}
          <button
            onClick={handleWishlistClick}
            className={cn(
              "h-9 w-9 rounded-xl",
              "bg-black/40 backdrop-blur-md border border-white/20",
              "flex items-center justify-center",
              "transition-all duration-300",
              "hover:bg-black/60 hover:scale-110"
            )}
          >
            <Heart className={cn(
              "h-4 w-4 transition-all",
              wishlisted ? "fill-accent text-accent" : "text-white"
            )} />
          </button>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          {/* Brand Tag - smaller 10-15% */}
          <div className={cn(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg mb-2",
            "bg-white/10 backdrop-blur-md border border-white/20"
          )}>
            <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wider">
              {brand}
            </span>
          </div>

          {/* Title - larger */}
          <h3 className="text-[26px] font-bold text-white mb-1 leading-tight">
            {model}
          </h3>
          
          {/* Subtitle */}
          <p className="text-sm text-white/70 mb-4">
            {year} • {reviewCount} reviews
          </p>

          {/* Price Row */}
          <div className={cn(
            "flex items-center justify-between pt-4",
            "border-t border-white/10"
          )}>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">From</p>
              <p className="text-xl font-bold text-white">
                ${pricePerDay.toLocaleString()}
                <span className="text-sm font-normal text-white/60">/day</span>
              </p>
            </div>
            
            {/* CTA Button */}
            <div className={cn(
              "px-5 py-2.5 rounded-xl",
              "bg-white/10 backdrop-blur-md border border-white/20",
              "text-sm font-medium text-white",
              "transition-all duration-300",
              "group-hover:bg-white group-hover:text-black"
            )}>
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
