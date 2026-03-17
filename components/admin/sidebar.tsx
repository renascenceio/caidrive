'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Building2, Users, Car, 
  CalendarDays, CreditCard, BarChart3, Settings,
  Shield, ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/companies', icon: Building2, label: 'Companies' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/vehicles', icon: Car, label: 'Vehicles' },
  { href: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

const bottomItems = [
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">Cai Drive</p>
          <p className="text-xs text-sidebar-foreground/60">Super Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-sidebar-border px-3 py-4">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        
        <Link href="/">
          <Button variant="ghost" className="mt-4 w-full justify-start gap-3 text-sidebar-foreground/70">
            <ChevronLeft className="h-4 w-4" />
            Back to Main Site
          </Button>
        </Link>
      </div>
    </aside>
  )
}
