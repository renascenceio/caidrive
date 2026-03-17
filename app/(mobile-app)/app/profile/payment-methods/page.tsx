"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, CreditCard, Plus, Trash2, Check, X } from "lucide-react"

interface PaymentMethod {
  id: string
  type: 'card' | 'apple_pay'
  last_four: string
  brand: string
  expiry_month: number
  expiry_year: number
  is_default: boolean
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddCard, setShowAddCard] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  useEffect(() => {
    // Mock data for now
    setPaymentMethods([
      {
        id: '1',
        type: 'card',
        last_four: '4242',
        brand: 'Visa',
        expiry_month: 12,
        expiry_year: 2026,
        is_default: true
      },
      {
        id: '2',
        type: 'card',
        last_four: '8888',
        brand: 'Mastercard',
        expiry_month: 6,
        expiry_year: 2025,
        is_default: false
      }
    ])
  }, [])

  const handleAddCard = async () => {
    setLoading(true)
    // Simulate adding card
    await new Promise(r => setTimeout(r, 1000))
    
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last_four: newCard.number.slice(-4),
      brand: newCard.number.startsWith('4') ? 'Visa' : 'Mastercard',
      expiry_month: parseInt(newCard.expiry.split('/')[0]),
      expiry_year: 2000 + parseInt(newCard.expiry.split('/')[1]),
      is_default: paymentMethods.length === 0
    }
    
    setPaymentMethods([...paymentMethods, newMethod])
    setShowAddCard(false)
    setNewCard({ number: '', expiry: '', cvv: '', name: '' })
    setLoading(false)
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      is_default: pm.id === id
    })))
  }

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
  }

  const getCardIcon = (brand: string) => {
    if (brand === 'Visa') {
      return (
        <div className="h-8 w-12 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          VISA
        </div>
      )
    }
    return (
      <div className="h-8 w-12 rounded bg-orange-500 flex items-center justify-center">
        <div className="flex">
          <div className="h-4 w-4 rounded-full bg-red-500 -mr-1.5" />
          <div className="h-4 w-4 rounded-full bg-yellow-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Payment Methods</h1>
        </div>
        <button
          onClick={() => setShowAddCard(true)}
          className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center"
        >
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">No payment methods</p>
            <p className="text-sm text-muted-foreground mb-4">Add a card to make bookings</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="px-6 py-3 rounded-xl bg-accent text-white font-medium"
            >
              Add Card
            </button>
          </div>
        ) : (
          paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className={cn(
                "p-4 rounded-2xl border bg-card",
                pm.is_default ? "border-accent" : "border-border"
              )}
            >
              <div className="flex items-center gap-4">
                {getCardIcon(pm.brand)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{pm.brand} •••• {pm.last_four}</p>
                    {pm.is_default && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {pm.expiry_month.toString().padStart(2, '0')}/{pm.expiry_year.toString().slice(-2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!pm.is_default && (
                    <button
                      onClick={() => handleSetDefault(pm.id)}
                      className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(pm.id)}
                    className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Apple Pay */}
        <button className="w-full p-4 rounded-2xl border border-border bg-card flex items-center gap-4">
          <div className="h-8 w-12 rounded bg-black flex items-center justify-center">
            <span className="text-white text-xs font-bold">Pay</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Apple Pay</p>
            <p className="text-sm text-muted-foreground">Use with Face ID</p>
          </div>
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
        </button>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Add Card</h2>
              <button
                onClick={() => setShowAddCard(false)}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                <input
                  type="text"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  placeholder="1234 5678 9012 3456"
                  className={cn(
                    "w-full px-4 py-3.5 rounded-xl",
                    "bg-secondary/50 border border-border",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-accent/50"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Expiry</label>
                  <input
                    type="text"
                    value={newCard.expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '')
                      if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                      setNewCard({ ...newCard, expiry: val })
                    }}
                    placeholder="MM/YY"
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl",
                      "bg-secondary/50 border border-border",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-accent/50"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">CVV</label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    className={cn(
                      "w-full px-4 py-3.5 rounded-xl",
                      "bg-secondary/50 border border-border",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-accent/50"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Name on Card</label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  placeholder="John Doe"
                  className={cn(
                    "w-full px-4 py-3.5 rounded-xl",
                    "bg-secondary/50 border border-border",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-accent/50"
                  )}
                />
              </div>

              <button
                onClick={handleAddCard}
                disabled={loading || !newCard.number || !newCard.expiry || !newCard.cvv}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold mt-4",
                  "bg-accent text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98]"
                )}
              >
                {loading ? "Adding..." : "Add Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
