'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function MobileThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl">
        <div className="px-4 py-2 rounded-lg bg-card">
          <Sun className="h-4 w-4" />
        </div>
        <div className="px-4 py-2 rounded-lg">
          <Moon className="h-4 w-4" />
        </div>
        <div className="px-4 py-2 rounded-lg">
          <Monitor className="h-4 w-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          theme === 'light' ? "bg-card shadow-sm" : "hover:bg-card/50"
        )}
      >
        <Sun className="h-4 w-4" />
        <span className="text-sm font-medium">Light</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          theme === 'dark' ? "bg-card shadow-sm" : "hover:bg-card/50"
        )}
      >
        <Moon className="h-4 w-4" />
        <span className="text-sm font-medium">Dark</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          theme === 'system' ? "bg-card shadow-sm" : "hover:bg-card/50"
        )}
      >
        <Monitor className="h-4 w-4" />
        <span className="text-sm font-medium">Auto</span>
      </button>
    </div>
  )
}
