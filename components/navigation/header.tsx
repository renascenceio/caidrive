'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, Menu, ChevronLeft, Home, Car, MapPin, Calendar, Heart, User, LogIn, UserPlus, ChevronRight, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  transparent?: boolean
  className?: string
  onSearchClick?: () => void
}

export function Header({
  title,
  showBack = false,
  showSearch = true,
  showNotifications = true,
  transparent = false,
  className,
  onSearchClick,
}: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setSheetOpen(false)
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full',
      transparent 
        ? 'bg-transparent' 
        : 'border-b border-border bg-background/80 backdrop-blur-lg',
      className
    )}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo-black.png" 
                alt="CAI Drive" 
                width={68} 
                height={27}
                className="h-7 w-auto dark:hidden"
                priority
              />
              <Image 
                src="/logo-white.png" 
                alt="CAI Drive" 
                width={68} 
                height={27}
                className="hidden h-7 w-auto dark:block"
                priority
              />
            </Link>
          )}
          
          {title && (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link 
            href="/" 
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Home
          </Link>
          <Link 
            href="/cars" 
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              pathname.startsWith('/cars') ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Garage
          </Link>
          <Link 
            href="/places" 
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              pathname.startsWith('/places') ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Places
          </Link>
          <Link 
            href="/rides" 
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              pathname.startsWith('/rides') ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Rides
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onSearchClick}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <LanguageSwitcher />
          <ThemeToggle />
          
          {showNotifications && (
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full"
              >
                <Bell className="h-5 w-5" />
                {/* Notification dot */}
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
              </Button>
            </Link>
          )}

          {/* Desktop User Menu */}
          {!loading && (
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent hover:border-border hover:bg-secondary/50 transition-all duration-300">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/50 flex items-center justify-center">
                        <span className="text-sm font-semibold text-accent">
                          {user.email?.[0].toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {user.email?.split('@')[0] || 'Profile'}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/rides" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Rides
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm">Create Account</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 px-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              
              {/* User Info at Top */}
              {user && (
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/50 flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.email?.split('@')[0]}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="mt-4 flex flex-col">
                <Link href="/" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">Home</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link href="/cars" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Car className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">Garage</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link href="/places" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">Places</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link href="/rides" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">Rides</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link href="/wishlist" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">Wishlist</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link href="/profile" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">Profile</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                
                <hr className="my-4 mx-6 border-border" />
                
                {user ? (
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-destructive/10 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-destructive" />
                    </div>
                    <span className="flex-1 font-medium text-destructive">Sign Out</span>
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                        <LogIn className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 font-medium">Sign In</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setSheetOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-accent" />
                      </div>
                      <span className="flex-1 font-medium text-accent">Create Account</span>
                      <ChevronRight className="h-5 w-5 text-accent" />
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
