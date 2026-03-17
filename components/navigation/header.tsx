'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Bell, Search, Menu, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'

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

          {/* Desktop Profile Link */}
          <Link href="/profile" className="hidden md:block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent hover:border-border hover:bg-secondary/50 transition-all duration-300">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800" />
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Profile</span>
            </div>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <nav className="mt-8 flex flex-col gap-4">
                <Link href="/" className="text-lg font-medium">Home</Link>
                <Link href="/cars" className="text-lg font-medium">Garage</Link>
                <Link href="/places" className="text-lg font-medium">Places</Link>
                <Link href="/rides" className="text-lg font-medium">Rides</Link>
                <Link href="/wishlist" className="text-lg font-medium">Wishlist</Link>
                <Link href="/profile" className="text-lg font-medium">Profile</Link>
                <hr className="my-2 border-border" />
                <Link href="/auth/login" className="text-lg font-medium">Sign In</Link>
                <Link href="/auth/sign-up" className="text-lg font-medium text-accent">Create Account</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
