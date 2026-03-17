'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ArrowLeft, X, ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function CustomCalendar({ 
  selectedDate, 
  onSelect,
  onClose,
  minDate 
}: { 
  selectedDate: string
  onSelect: (date: string) => void
  onClose: () => void
  minDate?: string
}) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(selectedDate || today))
  
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))
  
  const days: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  
  const isDateDisabled = (day: number) => {
    if (!minDate) return false
    const date = new Date(year, month, day)
    const min = new Date(minDate)
    min.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date < min
  }
  
  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    const date = new Date(year, month, day)
    const selected = new Date(selectedDate)
    return date.toDateString() === selected.toDateString()
  }
  
  const handleSelect = (day: number) => {
    if (isDateDisabled(day)) return
    const date = new Date(year, month, day)
    onSelect(date.toISOString().split('T')[0])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white rounded-2xl p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-lg">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2 font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => (
            <div key={idx} className="aspect-square">
              {day && (
                <button
                  onClick={() => handleSelect(day)}
                  disabled={isDateDisabled(day)}
                  className={cn(
                    "w-full h-full rounded-full flex items-center justify-center text-sm transition-all",
                    isDateSelected(day) 
                      ? "bg-foreground text-background font-semibold" 
                      : "hover:bg-secondary",
                    isDateDisabled(day) && "text-muted-foreground/30 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Brand options with dynamic loading
const defaultBrands = [
  'Aston Martin', 'BMW', 'Ferrari', 'Lamborghini', 'Porsche', 
  'Mercedes-Benz', 'Rolls-Royce', 'Bentley', 'McLaren', 'Audi'
]

function FiltersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [availableBrands, setAvailableBrands] = useState<string[]>(defaultBrands)
  const [priceRange, setPriceRange] = useState({ min: 64, max: 6490 })
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [showFromCalendar, setShowFromCalendar] = useState(false)
  const [showToCalendar, setShowToCalendar] = useState(false)
  const [availability, setAvailability] = useState<'all' | 'available'>('all')
  const [discount, setDiscount] = useState<number | null>(null)
  
  // Price histogram data (mock - would come from actual data)
  const priceHistogram = [
    12, 18, 25, 32, 45, 55, 68, 75, 82, 90, 95, 88, 78, 65, 52, 42, 35, 28, 22, 15
  ]
  const maxHistogramValue = Math.max(...priceHistogram)

  // Load available brands from database
  useEffect(() => {
    async function loadBrands() {
      const supabase = createClient()
      const { data } = await supabase
        .from('vehicles')
        .select('brand')
        .eq('status', 'available')
      
      if (data) {
        const uniqueBrands = [...new Set(data.map(v => v.brand))].filter(Boolean).sort()
        if (uniqueBrands.length > 0) {
          setAvailableBrands(uniqueBrands)
        }
      }
    }
    loadBrands()
  }, [])

  // Parse initial values from URL
  useEffect(() => {
    const brands = searchParams.get('brands')
    if (brands) setSelectedBrands(brands.split(','))
    
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice) setPriceRange(prev => ({ ...prev, min: parseInt(minPrice) }))
    if (maxPrice) setPriceRange(prev => ({ ...prev, max: parseInt(maxPrice) }))
  }, [searchParams])

  const addBrand = (brand: string) => {
    if (!selectedBrands.includes(brand)) {
      setSelectedBrands([...selectedBrands, brand])
    }
    setShowBrandDropdown(false)
  }

  const removeBrand = (brand: string) => {
    setSelectedBrands(selectedBrands.filter(b => b !== brand))
  }

  const clearAll = () => {
    setSelectedBrands([])
    setPriceRange({ min: 64, max: 6490 })
    setDateRange({ from: '', to: '' })
    setAvailability('all')
    setDiscount(null)
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (selectedBrands.length > 0) {
      params.set('brands', selectedBrands.join(','))
    }
    if (priceRange.min > 64) {
      params.set('minPrice', priceRange.min.toString())
    }
    if (priceRange.max < 6490) {
      params.set('maxPrice', priceRange.max.toString())
    }
    if (dateRange.from) {
      params.set('from', dateRange.from)
    }
    if (dateRange.to) {
      params.set('to', dateRange.to)
    }
    if (availability === 'available') {
      params.set('available', 'true')
    }
    if (discount) {
      params.set('discount', discount.toString())
    }

    router.push(`/mobile/garage?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#f5f5f7] border-b border-border/30">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Filters</h1>
          <button 
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="px-6 py-6 pb-40 space-y-8">
        {/* Brands Section */}
        <section>
          <h2 className="font-semibold text-base mb-4">Brands</h2>
          
          {/* Brand Dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setShowBrandDropdown(!showBrandDropdown)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-border/50"
            >
              <span className="text-muted-foreground">Select brand</span>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                showBrandDropdown && "rotate-180"
              )} />
            </button>
            
            {showBrandDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border/50 shadow-lg max-h-64 overflow-y-auto z-10">
                {availableBrands
                  .filter(brand => !selectedBrands.includes(brand))
                  .map(brand => (
                    <button
                      key={brand}
                      onClick={() => addBrand(brand)}
                      className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {brand}
                    </button>
                  ))}
              </div>
            )}
          </div>
          
          {/* Selected Brand Chips */}
          {selectedBrands.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map(brand => (
                <button
                  key={brand}
                  onClick={() => removeBrand(brand)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-border/50"
                >
                  <span className="text-sm">{brand}</span>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Price Range Section */}
        <section>
          <h2 className="font-semibold text-base mb-4">Price range</h2>
          
          {/* Histogram Visualization */}
          <div className="relative h-24 mb-6">
            <div className="absolute inset-x-0 bottom-6 flex items-end justify-between gap-0.5 h-16">
              {priceHistogram.map((value, idx) => {
                const barPosition = idx / priceHistogram.length
                const minPosition = priceRange.min / 6490
                const maxPosition = priceRange.max / 6490
                const isInRange = barPosition >= minPosition && barPosition <= maxPosition
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 rounded-t transition-all",
                      isInRange ? "bg-foreground" : "bg-foreground/20"
                    )}
                    style={{
                      height: `${(value / maxHistogramValue) * 100}%`,
                    }}
                  />
                )
              })}
            </div>
            
            {/* Range Slider */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="relative h-1 bg-foreground/20 rounded-full">
                {/* Active Range */}
                <div 
                  className="absolute h-1 bg-foreground rounded-full"
                  style={{
                    left: `${(priceRange.min / 6490) * 100}%`,
                    right: `${100 - (priceRange.max / 6490) * 100}%`
                  }}
                />
                
                {/* Min Handle */}
                <input
                  type="range"
                  min={0}
                  max={6490}
                  value={priceRange.min}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value)
                    if (newMin < priceRange.max) {
                      setPriceRange({ ...priceRange, min: newMin })
                    }
                  }}
                  className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md"
                />
                
                {/* Max Handle */}
                <input
                  type="range"
                  min={0}
                  max={6490}
                  value={priceRange.max}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value)
                    if (newMax > priceRange.min) {
                      setPriceRange({ ...priceRange, max: newMax })
                    }
                  }}
                  className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>
            </div>
          </div>
          
          {/* Min/Max Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2 text-center">Minimal</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3.5 bg-white rounded-xl border border-border/50 text-center font-medium"
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2 text-center">Maximal</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3.5 bg-white rounded-xl border border-border/50 text-center font-medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Date Range Section */}
        <section>
          <h2 className="font-semibold text-base mb-4">Date range</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">From</p>
              <button
                onClick={() => setShowFromCalendar(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-border/50 text-left"
              >
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className={cn(
                  "text-sm truncate",
                  dateRange.from ? "text-foreground" : "text-muted-foreground"
                )}>
                  {dateRange.from 
                    ? new Date(dateRange.from).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Select date'
                  }
                </span>
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">To</p>
              <button
                onClick={() => setShowToCalendar(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-border/50 text-left"
              >
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className={cn(
                  "text-sm truncate",
                  dateRange.to ? "text-foreground" : "text-muted-foreground"
                )}>
                  {dateRange.to 
                    ? new Date(dateRange.to).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Select date'
                  }
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Availability Section */}
        <section>
          <h2 className="font-semibold text-base mb-4">Availability</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setAvailability('all')}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-medium text-sm transition-colors",
                availability === 'all'
                  ? "bg-white border border-border/50"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              Show all
            </button>
            <button
              onClick={() => setAvailability('available')}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-medium text-sm transition-colors",
                availability === 'available'
                  ? "bg-white border border-border/50"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              Available only
            </button>
          </div>
        </section>

        {/* Discounted Section */}
        <section>
          <h2 className="font-semibold text-base mb-4">Discounted</h2>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-border/50 p-1">
            {[null, 5, 10, 15, 25].map((value, idx) => (
              <button
                key={value ?? 'none'}
                onClick={() => setDiscount(value)}
                className={cn(
                  "flex-1 py-3 rounded-lg font-medium text-sm transition-colors",
                  discount === value
                    ? "bg-white shadow-sm border border-border/30"
                    : "text-muted-foreground"
                )}
              >
                {value === null ? 'None' : `${value}%`}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Calendar Modals */}
      {showFromCalendar && (
        <CustomCalendar
          selectedDate={dateRange.from}
          onSelect={(date) => setDateRange({ ...dateRange, from: date })}
          onClose={() => setShowFromCalendar(false)}
          minDate={new Date().toISOString().split('T')[0]}
        />
      )}

      {showToCalendar && (
        <CustomCalendar
          selectedDate={dateRange.to}
          onSelect={(date) => setDateRange({ ...dateRange, to: date })}
          onClose={() => setShowToCalendar(false)}
          minDate={dateRange.from || new Date().toISOString().split('T')[0]}
        />
      )}

      {/* Fixed Apply Button - Above bottom nav */}
      <div className="fixed bottom-20 left-0 right-0 bg-[#f5f5f7] border-t border-border/30 px-6 py-4">
        <button
          onClick={applyFilters}
          className="w-full py-4 bg-foreground text-background font-semibold rounded-full transition-all active:scale-[0.98]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}

export default function MobileFiltersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading filters...</div>
      </div>
    }>
      <FiltersContent />
    </Suspense>
  )
}
