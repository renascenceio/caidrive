'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ClipboardList, MessageCircle, Car, Clock, User, Moon, Sun } from 'lucide-react'
import { ThemeProvider, useTheme } from 'next-themes'

const navItems = [
  { href: '/driver', icon: ClipboardList, label: 'Orders' },
  { href: '/driver/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/driver/rides', icon: Car, label: 'Rides' },
  { href: '/driver/history', icon: Clock, label: 'History' },
  { href: '/driver/profile', icon: User, label: 'Profile' },
]

function DriverAppContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if we're on the login or splash page
  const isAuthPage = pathname === "/driver/login" || pathname === "/driver/splash"

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Image src="/cai-logo.svg" alt="CAI" width={80} height={32} className="dark:invert" />
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Theme Toggle - Fixed below header */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-14 right-5 z-50 p-2 rounded-xl bg-secondary/80 backdrop-blur-sm border border-border/50 hover:bg-secondary transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50">
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
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-accent" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function DriverAppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <DriverAppContent>{children}</DriverAppContent>
    </ThemeProvider>
  )
}
