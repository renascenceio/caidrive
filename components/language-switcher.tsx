'use client'

import { Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage, languages } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full"
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-52 bg-popover border border-border"
      >
        {languages.map((lang) => {
          const isSelected = language === lang.code
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex items-center gap-3 cursor-pointer py-2.5 px-3",
                "hover:bg-secondary hover:text-foreground",
                "focus:bg-secondary focus:text-foreground",
                isSelected && "bg-secondary/50"
              )}
            >
              <span className="text-lg leading-none">{lang.flag}</span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground truncate">{lang.name}</span>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-accent shrink-0" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
