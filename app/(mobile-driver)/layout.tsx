'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ClipboardList, MessageCircle, Car, Clock, User } from 'lucide-react'

const navItems = [
  { href: '/driver', icon: ClipboardList, label: 'Orders' },
  { href: '/driver/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/driver/rides', icon: Car, label: 'Rides' },
  { href: '/driver/history', icon: Clock, label: 'History' },
  { href: '/driver/profile', icon: User, label: 'Profile' },
]

export default function DriverAppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if we're on the login or splash page
  const isAuthPage = pathname === "/driver/login" || pathname === "/driver/splash"

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse">
          <Image src="/cai-logo.svg" alt="CAI" width={80} height={32} className="invert" />
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0a0a0a]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation - Dark themed matching designs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/5">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/driver' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1",
                  "transition-colors duration-200",
                  isActive 
                    ? "text-white" 
                    : "text-white/40 hover:text-white/60"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-accent" : "text-white/40"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-white" : "text-white/40"
                )}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
