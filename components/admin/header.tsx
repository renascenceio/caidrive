'use client'

import Link from 'next/link'
import { Bell, Menu, Search, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  role: string
}

interface AdminHeaderProps {
  profile: Profile
}

export function AdminHeader({ profile }: AdminHeaderProps) {
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
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">Admin Portal</h2>
            </div>
            <nav className="mt-6 space-y-2">
              <Link href="/admin" className="block py-2">Dashboard</Link>
              <Link href="/admin/companies" className="block py-2">Companies</Link>
              <Link href="/admin/users" className="block py-2">Users</Link>
              <Link href="/admin/vehicles" className="block py-2">Vehicles</Link>
              <Link href="/admin/bookings" className="block py-2">Bookings</Link>
              <Link href="/admin/payments" className="block py-2">Payments</Link>
              <Link href="/admin/analytics" className="block py-2">Analytics</Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Mobile Search */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Search className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Role Badge */}
        <Badge variant="outline" className="hidden gap-1 sm:flex">
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'Profile'} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="hidden md:inline-block">{profile.full_name || 'Admin'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{profile.full_name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/audit-log">Audit Log</Link>
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
