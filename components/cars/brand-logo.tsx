'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  brand: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showName?: boolean
}

// Official brand logo URLs (SVG/PNG from brand resources or reliable CDNs)
const brandLogos: Record<string, string> = {
  ferrari: 'https://www.carlogos.org/car-logos/ferrari-logo-750x1100.png',
  bmw: 'https://www.carlogos.org/car-logos/bmw-logo-2020-grey.png',
  bentley: 'https://www.carlogos.org/car-logos/bentley-logo-1400x800.png',
  porsche: 'https://www.carlogos.org/car-logos/porsche-logo-2100x1100.png',
  audi: 'https://www.carlogos.org/car-logos/audi-logo-2016.png',
  'mercedes-benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo-1916.png',
  mercedes: 'https://www.carlogos.org/car-logos/mercedes-benz-logo-1916.png',
  lamborghini: 'https://www.carlogos.org/car-logos/lamborghini-logo-1000x1100.png',
  'rolls-royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo-2048x2048.png',
  rollsroyce: 'https://www.carlogos.org/car-logos/rolls-royce-logo-2048x2048.png',
  maserati: 'https://www.carlogos.org/car-logos/maserati-logo-5500x6000.png',
  'aston-martin': 'https://www.carlogos.org/car-logos/aston-martin-logo-2022-show.png',
  astonmartin: 'https://www.carlogos.org/car-logos/aston-martin-logo-2022-show.png',
  mclaren: 'https://www.carlogos.org/car-logos/mclaren-logo-2002-2560x1440.png',
  bugatti: 'https://www.carlogos.org/car-logos/bugatti-logo-2022-full-640x500.png',
  pagani: 'https://www.carlogos.org/car-logos/pagani-logo-1992-1920x1080.png',
  koenigsegg: 'https://www.carlogos.org/car-logos/koenigsegg-logo-1920x1080.png',
  maybach: 'https://www.carlogos.org/car-logos/maybach-logo-2560x1440.png',
  lincoln: 'https://www.carlogos.org/car-logos/lincoln-logo-2019-show.png',
  tesla: 'https://www.carlogos.org/car-logos/tesla-logo-2200x2800.png',
  lexus: 'https://www.carlogos.org/car-logos/lexus-logo-1988-1920x1080.png',
  jaguar: 'https://www.carlogos.org/car-logos/jaguar-logo-2012-1920x1080.png',
  'land-rover': 'https://www.carlogos.org/car-logos/land-rover-logo-2020-green.png',
  'range-rover': 'https://www.carlogos.org/car-logos/land-rover-logo-2020-green.png',
  rangerover: 'https://www.carlogos.org/car-logos/land-rover-logo-2020-green.png',
  cadillac: 'https://www.carlogos.org/car-logos/cadillac-logo-2021-full-640x550.png',
  genesis: 'https://www.carlogos.org/car-logos/genesis-logo-2020-full-640x550.png',
  infiniti: 'https://www.carlogos.org/car-logos/infiniti-logo-2020-full-640x475.png',
  acura: 'https://www.carlogos.org/car-logos/acura-logo-2022-full-640x290.png',
}

const sizes = {
  sm: { container: 'h-8 w-8', image: 24 },
  md: { container: 'h-12 w-12', image: 36 },
  lg: { container: 'h-16 w-16', image: 48 },
  xl: { container: 'h-20 w-20', image: 64 },
}

export function BrandLogo({ brand, size = 'md', className, showName = false }: BrandLogoProps) {
  const normalizedBrand = brand.toLowerCase().replace(/[\s-]+/g, '-').replace(/[^a-z-]/g, '')
  const logoUrl = brandLogos[normalizedBrand] || brandLogos[brand.toLowerCase().replace(/\s+/g, '')]
  const sizeConfig = sizes[size]
  
  // Get initials for fallback
  const initials = brand
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-white dark:bg-white/10 p-2 overflow-hidden',
          sizeConfig.container
        )}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${brand} logo`}
            width={sizeConfig.image}
            height={sizeConfig.image}
            className="object-contain w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-xs font-bold text-foreground">{initials}</span>
        )}
      </div>
      {showName && (
        <span className="text-xs text-muted-foreground font-medium">{brand}</span>
      )}
    </div>
  )
}

interface BrandFilterProps {
  brands: string[]
  selectedBrands: string[]
  onBrandToggle: (brand: string) => void
  className?: string
}

export function BrandFilter({ brands, selectedBrands, onBrandToggle, className }: BrandFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-3 p-1', className)}>
      {brands.map((brand) => {
        const isSelected = selectedBrands.includes(brand)
        return (
          <button
            key={brand}
            onClick={() => onBrandToggle(brand)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl p-3 transition-all border-2',
              isSelected
                ? 'bg-accent/10 border-accent'
                : 'bg-secondary/30 border-transparent hover:bg-secondary/50 hover:border-border'
            )}
          >
            <BrandLogo brand={brand} size="md" />
            <span className={cn(
              'text-xs font-medium',
              isSelected ? 'text-accent' : 'text-muted-foreground'
            )}>
              {brand}
            </span>
          </button>
        )
      })}
    </div>
  )
}
