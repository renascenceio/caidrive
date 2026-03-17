'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Car, Users, CalendarDays, 
  CreditCard, Settings, ChevronLeft,
  Calendar, UserCircle, BarChart3, Wallet,
  Megaphone, Star, MessageCircle, ChevronRight, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  logo_url?: string
}

interface BusinessSidebarProps {
  company: Company
  userName?: string
  lastLogin?: string
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/business', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/business/availability', icon: Calendar, label: 'Availability' },
      { href: '/business/rides', icon: CalendarDays, label: 'Rides' },
      { href: '/business/garage', icon: Car, label: 'Garage' },
    ]
  },
  {
    label: 'People',
    items: [
      { href: '/business/drivers', icon: Users, label: 'Drivers' },
      { href: '/business/customers', icon: UserCircle, label: 'Customers' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { href: '/business/analytics', icon: BarChart3, label: 'Analytics', badge: 'New' },
      { href: '/business/deposits', icon: Wallet, label: 'Deposits' },
      { href: '/business/payments', icon: CreditCard, label: 'Payments' },
    ]
  },
  {
    label: 'Growth',
    items: [
      { href: '/business/marketing', icon: Megaphone, label: 'Marketing' },
      { href: '/business/reviews', icon: Star, label: 'Reviews' },
    ]
  },
]

const bottomItems = [
  { href: '/business/chats', icon: MessageCircle, label: 'Support Chats', notificationCount: 3 },
  { href: '/business/settings', icon: Settings, label: 'Settings' },
  { href: '/business/admin', icon: Shield, label: 'Admin Panel', adminOnly: true },
]

export function BusinessSidebar({ company, userName = 'User', lastLogin }: BusinessSidebarProps) {
  const pathname = usePathname()

  const formatLastLogin = () => {
    if (!lastLogin) return 'Just now'
    const date = new Date(lastLogin)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-card dark:bg-zinc-950 lg:flex">
      {/* Logo & Company Header */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white overflow-hidden">
            {company.logo_url ? (
              <Image src={company.logo_url} alt={company.name} width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <span className="text-sm font-bold text-accent">{company.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{company.name}</p>
            <p className="text-[11px] text-muted-foreground">Business Portal</p>
          </div>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Welcome Section */}
      <div className="px-5 py-4 border-t border-border/50">
        <h2 className="text-xl font-semibold text-foreground leading-tight">
          Welcome<br />Back, {userName.split(' ')[0]}
        </h2>
        <p className="mt-1.5 text-xs">
          <span className="text-muted-foreground">Last login: </span>
          <span className="text-foreground/70">{formatLastLogin()}</span>
        </p>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/business' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                      isActive 
                        ? 'text-foreground bg-secondary/80 dark:bg-white/5' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent" />
                    )}
                    <item.icon className={cn("h-4 w-4", isActive && "text-accent")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded bg-accent/10 text-accent">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border/50 px-3 py-3">
        <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Others
        </p>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                isActive 
                  ? 'text-foreground bg-secondary/80 dark:bg-white/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent" />
              )}
              <item.icon className={cn("h-4 w-4", isActive && "text-accent")} />
              <span className="flex-1">{item.label}</span>
              {item.notificationCount && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                  {item.notificationCount}
                </span>
              )}
            </Link>
          )
        })}
        
        <Link 
          href="/"
          className="mt-3 flex items-center gap-2 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          Back to Main Site
        </Link>
      </div>
    </aside>
  )
}
