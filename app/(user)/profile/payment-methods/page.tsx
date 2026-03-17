'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, CreditCard, Plus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function PaymentMethodsPage() {
  const [loading, setLoading] = useState(true)
  const [methods, setMethods] = useState<any[]>([])

  useEffect(() => {
    async function loadMethods() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)

      setMethods(data || [])
      setLoading(false)
    }
    loadMethods()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Payment Methods</h1>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No payment methods added yet</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-xl bg-card p-4 border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{method.brand} **** {method.last_four}</p>
                  <p className="text-sm text-muted-foreground">
                    {method.is_default && 'Default'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button className="w-full mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      )}
    </div>
  )
}
