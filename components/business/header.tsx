'use client'

import Link from 'next/link'
import { Bell, Menu, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { signOut } from '@/app/auth/actions'

interface Profile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface BusinessHeaderProps {
  profile: Profile
}

export function BusinessHeader({ profile }: BusinessHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {/* Mobile sidebar content would go here */}
          <div className="p-6">
            <h2 className="font-semibold">Menu</h2>
            <nav className="mt-4 space-y-2">
              <Link href="/business" className="block py-2">Dashboard</Link>
              <Link href="/business/fleet" className="block py-2">Fleet</Link>
              <Link href="/business/drivers" className="block py-2">Drivers</Link>
              <Link href="/business/bookings" className="block py-2">Bookings</Link>
              <Link href="/business/payments" className="block py-2">Payments</Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, bookings..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Mobile Search */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Search className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </Button>

        {/* Profile Dropdown - Quiet Luxury Style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent hover:border-border hover:bg-secondary/50 transition-all duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'Profile'} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">{profile.full_name || 'Account'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{profile.full_name || 'Account'}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/business/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">Help & Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut} className="w-full">
                <button type="submit" className="w-full text-left text-destructive">
                  Sign Out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
