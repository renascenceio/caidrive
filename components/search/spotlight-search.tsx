'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Mic, Sparkles, X, Car, MapPin, Loader2, ArrowRight, TrendingUp, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface SearchResult {
  type: 'car' | 'brand' | 'location' | 'suggestion' | 'trending'
  title: string
  subtitle?: string
  image?: string
  href: string
  price?: string
  rating?: number
}

const trendingSearches: SearchResult[] = [
  { type: 'trending', title: 'Ferrari SF90 Stradale', subtitle: 'Most searched today', href: '/cars?brand=Ferrari', price: '$2,500/day', rating: 4.9 },
  { type: 'trending', title: 'Lamborghini Huracán', subtitle: 'Trending this week', href: '/cars?brand=Lamborghini', price: '$2,200/day', rating: 4.8 },
]

const quickSuggestions = [
  { label: 'Sports Cars', href: '/cars?type=sports' },
  { label: 'Luxury Sedans', href: '/cars?type=luxury' },
  { label: 'Convertibles', href: '/cars?type=convertible' },
  { label: 'SUVs', href: '/cars?type=suv' },
]

interface SpotlightSearchProps {
  className?: string
}

export function SpotlightSearch({ className }: SpotlightSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockResults: SearchResult[] = [
      { type: 'car', title: 'Ferrari SF90 Stradale', subtitle: '2024 • $2,500/day', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=200', href: '/cars/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', price: '$2,500', rating: 4.9 },
      { type: 'car', title: 'Lamborghini Huracán EVO', subtitle: '2024 • $2,200/day', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200', href: '/cars/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', price: '$2,200', rating: 4.8 },
      { type: 'brand', title: 'View all Ferrari', subtitle: '3 vehicles available', href: '/cars?brand=Ferrari' },
      { type: 'location', title: 'Dubai Marina Pickup', subtitle: 'Most popular location', href: '/cars?location=dubai-marina' },
    ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))

    setResults(mockResults)
    setIsSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : trendingSearches
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const item = items[selectedIndex]
      if (item) {
        router.push(item.href)
        setIsOpen(false)
      }
    }
  }

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true)
      const SpeechRecognition = (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    }
  }

  const displayResults = results.length > 0 ? results : (query ? [] : trendingSearches)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
        className={cn(
          "relative w-full max-w-2xl mx-auto",
          "group cursor-pointer",
          className
        )}
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Magical gradient glow - CAI Red (#dd3155) to Royal Blue - Safari-optimized */}
        <div 
          className={cn(
            "absolute -inset-1 rounded-2xl transition-all duration-700",
            "opacity-0",
            isFocused && "opacity-60 -inset-2"
          )}
          style={{ 
            background: 'linear-gradient(90deg, #dd3155, #1e40af, #dd3155)',
            filter: isFocused ? 'blur(24px)' : 'blur(16px)',
            transform: 'translateZ(0)',
            willChange: 'opacity, filter',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        />
        
        {/* Secondary glow layer for depth - Royal Blue to CAI Red - Safari-optimized */}
        <div 
          className={cn(
            "absolute -inset-0.5 rounded-2xl transition-all duration-500",
            "opacity-0",
            isFocused && "opacity-40"
          )}
          style={{ 
            background: 'linear-gradient(90deg, #1e40af, #dd3155, #1e40af)',
            filter: 'blur(12px)',
            transform: 'translateZ(0)',
            willChange: 'opacity',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        />
        
        <div className={cn(
          "relative flex items-center gap-4 px-6 py-5",
          "bg-card backdrop-blur-xl",
          "border border-border/50 rounded-2xl",
          "shadow-lg shadow-black/5",
          "transition-all duration-300",
          isFocused && "border-accent/30 shadow-xl shadow-accent/10"
        )}
        style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            <Search className="h-5 w-5" />
          </div>
          
          <span className="flex-1 text-left text-muted-foreground text-sm sm:text-base md:text-lg truncate">
            Search any car, anywhere...
          </span>
          
          <div className="flex items-center gap-3">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-md">
              <span className="text-xs">⌘</span>K
            </kbd>
            <div className={cn(
              "p-2 rounded-xl",
              "bg-muted/50",
              "group-hover:bg-accent/10 transition-colors"
            )}>
              <Mic className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </div>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0 bg-card/95 backdrop-blur-2xl border-border/50 overflow-hidden">
          <DialogTitle className="sr-only">Search Cars</DialogTitle>
          
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #dd3155, #1e40af, #dd3155)' }} />
          
          <div className="p-6">
            <div className="relative flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search any car, brand, or location..."
                className="flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground/50"
              />
              
              <div className="flex items-center gap-2">
                {query && (
                  <Button variant="ghost" size="icon" onClick={() => setQuery('')} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceSearch}
                  className={cn("h-10 w-10 rounded-xl", isListening && "bg-accent/20 text-accent")}
                >
                  <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50" />

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="flex flex-wrap gap-2 mb-6">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => { router.push(suggestion.href); setIsOpen(false) }}
                    className="px-4 py-2 text-sm bg-muted/50 hover:bg-muted rounded-full transition-colors"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}

            {displayResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-3">
                  {query ? 'Results' : 'Trending'}
                </p>
                {displayResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.title}`}
                    onClick={() => { router.push(result.href); setIsOpen(false) }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all",
                      selectedIndex === index ? "bg-muted" : "hover:bg-muted/50"
                    )}
                  >
                    {result.image ? (
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={result.image} alt={result.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                        {result.type === 'brand' && <Car className="h-5 w-5 text-muted-foreground" />}
                        {result.type === 'location' && <MapPin className="h-5 w-5 text-muted-foreground" />}
                        {result.type === 'trending' && <TrendingUp className="h-5 w-5 text-accent" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>}
                    </div>
                    {result.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{result.rating}</span>
                      </div>
                    )}
                    <ArrowRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      selectedIndex === index && "translate-x-1"
                    )} />
                  </button>
                ))}
              </div>
            )}

            {query && results.length === 0 && !isSearching && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try different keywords</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd> Close</span>
            </div>
            <span className="text-accent font-medium">Keeper of the Keys</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
