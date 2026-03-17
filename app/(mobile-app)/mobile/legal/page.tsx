'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, FileText, Shield, Lock, Cookie } from 'lucide-react'

const legalItems = [
  {
    icon: FileText,
    title: 'Terms of Service',
    description: 'Our terms and conditions',
    href: '/mobile/legal/terms'
  },
  {
    icon: Shield,
    title: 'Privacy Policy',
    description: 'How we handle your data',
    href: '/mobile/legal/privacy'
  },
  {
    icon: Lock,
    title: 'Rental Agreement',
    description: 'Vehicle rental terms',
    href: '/mobile/legal/rental'
  },
  {
    icon: Cookie,
    title: 'Cookie Policy',
    description: 'Our use of cookies',
    href: '/mobile/legal/cookies'
  }
]

export default function LegalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Legal</h1>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {legalItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-accent/30 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          )
        })}

        <p className="text-xs text-muted-foreground text-center pt-6">
          Last updated: March 2024
        </p>
      </div>
    </div>
  )
}
