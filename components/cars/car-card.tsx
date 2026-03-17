'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, Gauge, Zap, Users, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Vehicle } from '@/types/database'

interface CarCardProps {
  vehicle: Vehicle
  isWishlisted?: boolean
  onWishlistToggle?: (id: string) => void
  variant?: 'default' | 'compact' | 'horizontal'
  className?: string
}

export function CarCard({
  vehicle,
  isWishlisted = false,
  onWishlistToggle,
  variant = 'default',
  className,
}: CarCardProps) {
  const imageUrl = vehicle.images?.[0] || '/placeholder-car.jpg'
  
  if (variant === 'horizontal') {
    return (
      <div className={cn(
        'group flex gap-4 rounded-xl bg-card border border-border p-4 hover-lift',
        className
      )}>
        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-sm text-muted-foreground">{vehicle.year}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onWishlistToggle?.(vehicle.id)}
              >
                <Heart className={cn('h-4 w-4', isWishlisted && 'fill-accent text-accent')} />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{vehicle.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              ${vehicle.price_per_day}<span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Link 
        href={`/cars/${vehicle.id}`}
        className={cn(
          'group block rounded-xl bg-card border border-border overflow-hidden hover-lift',
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/70"
            onClick={(e) => {
              e.preventDefault()
              onWishlistToggle?.(vehicle.id)
            }}
          >
            <Heart className={cn('h-4 w-4', isWishlisted && 'fill-accent text-accent')} />
          </Button>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-foreground truncate">{vehicle.brand} {vehicle.model}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs">{vehicle.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <p className="font-bold">${vehicle.price_per_day}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link 
      href={`/cars/${vehicle.id}`}
      className={cn(
        'group block rounded-2xl bg-card border border-border overflow-hidden hover-lift',
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-10 w-10 bg-background/30 backdrop-blur-sm hover:bg-background/50"
          onClick={(e) => {
            e.preventDefault()
            onWishlistToggle?.(vehicle.id)
          }}
        >
          <Heart className={cn('h-5 w-5', isWishlisted && 'fill-accent text-accent')} />
        </Button>

        {/* Rating badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/30 px-2 py-1 backdrop-blur-sm">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{vehicle.rating?.toFixed(1) || '0.0'}</span>
          {vehicle.review_count && vehicle.review_count > 0 && (
            <span className="text-xs text-muted-foreground">({vehicle.review_count})</span>
          )}
        </div>

        {/* Status badge */}
        {vehicle.status !== 'available' && (
          <Badge 
            variant={vehicle.status === 'booked' ? 'secondary' : 'destructive'}
            className="absolute left-3 top-3"
          >
            {vehicle.status}
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.color || 'N/A'}</p>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1 text-xs font-medium">{vehicle.max_speed || '-'}</span>
            <span className="text-[10px] text-muted-foreground">km/h</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1 text-xs font-medium">{vehicle.acceleration || '-'}</span>
            <span className="text-[10px] text-muted-foreground">0-100</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1 text-xs font-medium">{vehicle.seats || '-'}</span>
            <span className="text-[10px] text-muted-foreground">seats</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="mt-1 text-xs font-medium">{vehicle.power || '-'}</span>
            <span className="text-[10px] text-muted-foreground">bhp</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
          </div>
          <p className="text-xl font-bold text-foreground">
            ${vehicle.price_per_day}<span className="text-sm font-normal text-muted-foreground">/day</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
