'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ArrowLeft, Check, X, ChevronDown } from 'lucide-react'

// Brands matching PDF
const brands = [
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Porsche', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { name: 'Lamborghini', logo: 'https://www.carlogos.org/car-logos/lamborghini-logo.png' },
  { name: 'Mercedes', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { name: 'Rolls Royce', logo: 'https://www.carlogos.org/car-logos/rolls-royce-logo.png' },
]

// Categories matching PDF
const categories = ['Sport', 'Sedan', 'Coupe', 'SUV', 'Convertible', 'Luxury']

// Transmission types
const transmissions = ['Automatic', 'Manual']

// Fuel types
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

export default function FiltersPage() {
  const router = useRouter()
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTransmission, setSelectedTransmission] = useState<string>('Automatic')
  const [selectedFuel, setSelectedFuel] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [expandedSection, setExpandedSection] = useState<string | null>('brand')

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const applyFilters = () => {
    // Build query params
    const params = new URLSearchParams()
    if (selectedBrands.length) params.set('brands', selectedBrands.join(','))
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','))
    if (selectedTransmission) params.set('transmission', selectedTransmission)
    if (selectedFuel) params.set('fuel', selectedFuel)
    params.set('minPrice', priceRange[0].toString())
    params.set('maxPrice', priceRange[1].toString())
    
    router.push(`/mobile/garage?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedBrands([])
    setSelectedCategories([])
    setSelectedTransmission('Automatic')
    setSelectedFuel('')
    setPriceRange([0, 5000])
  }

  const hasFilters = selectedBrands.length > 0 || selectedCategories.length > 0 || selectedFuel !== ''

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Filter</h1>
          </div>
          {hasFilters && (
            <button 
              onClick={resetFilters}
              className="text-sm text-accent font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Brand Selection - Matching PDF */}
        <section>
          <button 
            onClick={() => setExpandedSection(expandedSection === 'brand' ? null : 'brand')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="font-semibold text-lg">Brand</h2>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              expandedSection === 'brand' && "rotate-180"
            )} />
          </button>
          
          {expandedSection === 'brand' && (
            <div className="grid grid-cols-4 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => toggleBrand(brand.name)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-colors",
                    selectedBrands.includes(brand.name)
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="relative w-8 h-8">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                    />
                    {selectedBrands.includes(brand.name) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-center">{brand.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Category Selection */}
        <section>
          <button 
            onClick={() => setExpandedSection(expandedSection === 'category' ? null : 'category')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="font-semibold text-lg">Category</h2>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              expandedSection === 'category' && "rotate-180"
            )} />
          </button>
          
          {expandedSection === 'category' && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    selectedCategories.includes(category)
                      ? "bg-accent text-white"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Transmission */}
        <section>
          <button 
            onClick={() => setExpandedSection(expandedSection === 'transmission' ? null : 'transmission')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="font-semibold text-lg">Transmission</h2>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              expandedSection === 'transmission' && "rotate-180"
            )} />
          </button>
          
          {expandedSection === 'transmission' && (
            <div className="flex gap-3">
              {transmissions.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTransmission(type)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-medium transition-colors",
                    selectedTransmission === type
                      ? "bg-accent text-white"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Fuel Type */}
        <section>
          <button 
            onClick={() => setExpandedSection(expandedSection === 'fuel' ? null : 'fuel')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="font-semibold text-lg">Fuel Type</h2>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              expandedSection === 'fuel' && "rotate-180"
            )} />
          </button>
          
          {expandedSection === 'fuel' && (
            <div className="flex flex-wrap gap-2">
              {fuelTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFuel(selectedFuel === type ? '' : type)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    selectedFuel === type
                      ? "bg-accent text-white"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Price Range */}
        <section>
          <button 
            onClick={() => setExpandedSection(expandedSection === 'price' ? null : 'price')}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="font-semibold text-lg">Price Range</h2>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              expandedSection === 'price' && "rotate-180"
            )} />
          </button>
          
          {expandedSection === 'price' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Min: ${priceRange[0]}</span>
                <span className="text-sm text-muted-foreground">Max: ${priceRange[1]}</span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-accent"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Apply Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/95 backdrop-blur-xl border-t border-border/50">
        <button
          onClick={applyFilters}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-base",
            "bg-accent text-white"
          )}
        >
          Apply Filters
          {hasFilters && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {selectedBrands.length + selectedCategories.length + (selectedFuel ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
