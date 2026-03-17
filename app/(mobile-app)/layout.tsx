'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Car, MapPin, Calendar, User } from 'lucide-react'

const navItems = [
  { href: '/mobile', icon: Home, label: 'Home' },
  { href: '/mobile/garage', icon: Car, label: 'Garage' },
  { href: '/mobile/places', icon: MapPin, label: 'Places' },
  { href: '/mobile/rides', icon: Calendar, label: 'Rides' },
  { href: '/mobile/profile', icon: User, label: 'Profile' },
]

export default function MobileAppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Content - with bottom padding for nav */}
      <main className="flex-1 pb-16 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation - Fixed with theme-aware colors */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/mobile' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full gap-0.5",
                  "transition-colors duration-200",
                  isActive 
                    ? "text-accent" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
