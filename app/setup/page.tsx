'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2, Copy, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface AccountStatus {
  loading: boolean
  success: boolean
  error: string | null
  message: string | null
}

const testAccounts = [
  {
    id: 'admin',
    title: 'Super Admin',
    description: 'Full platform access - manage companies, users, vehicles, and all settings',
    email: 'aslan@renascence.io',
    password: 'rDf462sF',
    role: 'admin',
    portal: '/admin',
    features: ['Platform Analytics', 'Company Verification', 'User Management', 'System Settings'],
  },
  {
    id: 'business',
    title: 'Car Rental Company',
    description: 'Fleet management, bookings, drivers, and business analytics',
    email: 'business@caidrive.com',
    password: 'Business123!',
    role: 'business',
    portal: '/business',
    features: ['Fleet Management', 'Booking Calendar', 'Driver Assignment', 'Revenue Reports'],
  },
  {
    id: 'user',
    title: 'Regular User',
    description: 'Browse cars, make bookings, manage profile and wishlist',
    email: 'user@caidrive.com',
    password: 'User123!',
    role: 'user',
    portal: '/',
    features: ['Browse Cars', 'Make Bookings', 'View Rides', 'Wishlist'],
  },
]

export default function SetupPage() {
  const [statuses, setStatuses] = useState<Record<string, AccountStatus>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const createAccount = async (account: typeof testAccounts[0]) => {
    setStatuses(prev => ({
      ...prev,
      [account.id]: { loading: true, success: false, error: null, message: null }
    }))

    try {
      const res = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          fullName: account.title,
          role: account.role,
          secretKey: 'cai-admin-setup-2024',
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatuses(prev => ({
          ...prev,
          [account.id]: { 
            loading: false, 
            success: true, 
            error: null, 
            message: data.message || 'Account created successfully!'
          }
        }))
      } else {
        setStatuses(prev => ({
          ...prev,
          [account.id]: { 
            loading: false, 
            success: false, 
            error: data.error || 'Failed to create account',
            message: null
          }
        }))
      }
    } catch (err) {
      setStatuses(prev => ({
        ...prev,
        [account.id]: { 
          loading: false, 
          success: false, 
          error: 'Network error - please try again',
          message: null
        }
      }))
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const createAllAccounts = async () => {
    for (const account of testAccounts) {
      await createAccount(account)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <Image 
            src="/logo-black.png" 
            alt="CAI Drive" 
            width={120} 
            height={48}
            className="mx-auto mb-6 h-12 w-auto dark:hidden"
          />
          <Image 
            src="/logo-white.png" 
            alt="CAI Drive" 
            width={120} 
            height={48}
            className="mx-auto mb-6 hidden h-12 w-auto dark:block"
          />
          <h1 className="text-3xl font-bold">Account Setup</h1>
          <p className="mt-2 text-muted-foreground">
            Create test accounts to explore all CAI Drive portals
          </p>
        </div>

        {/* Create All Button */}
        <div className="mb-8 flex justify-center">
          <Button 
            size="lg" 
            onClick={createAllAccounts}
            className="gap-2"
          >
            Create All Test Accounts
          </Button>
        </div>

        {/* Account Cards */}
        <div className="grid gap-6">
          {testAccounts.map((account) => {
            const status = statuses[account.id]
            return (
              <Card key={account.id} className="overflow-hidden">
                <CardHeader className="bg-secondary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{account.title}</CardTitle>
                      <CardDescription className="mt-1">{account.description}</CardDescription>
                    </div>
                    {status?.success && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                    {status?.error && (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Credentials */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={account.email} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(account.email, `${account.id}-email`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        {copied === `${account.id}-email` && (
                          <span className="text-xs text-green-500">Copied!</span>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Password</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={account.password} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(account.password, `${account.id}-pass`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        {copied === `${account.id}-pass` && (
                          <span className="text-xs text-green-500">Copied!</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Portal Features</Label>
                      <ul className="mt-2 space-y-1">
                        {account.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div>
                      {status?.loading && (
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </span>
                      )}
                      {status?.success && (
                        <span className="text-sm text-green-500">{status.message}</span>
                      )}
                      {status?.error && (
                        <span className="text-sm text-red-500">{status.error}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => createAccount(account)}
                        disabled={status?.loading}
                      >
                        {status?.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                      {status?.success && (
                        <Button
                          size="sm"
                          asChild
                        >
                          <a href={account.portal}>
                            Open Portal
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <a href="/auth/login" className="text-accent hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
