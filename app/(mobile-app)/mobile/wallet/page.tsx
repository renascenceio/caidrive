"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, Building2, RefreshCw, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: 'credit' | 'debit' | 'refund' | 'withdrawal' | 'loyalty_bonus' | 'promotional'
  amount: number
  balance_after: number
  description: string
  status: string
  created_at: string
}

interface RefundRequest {
  id: string
  amount: number
  refund_type: string
  reason: string
  status: string
  created_at: string
}

export default function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<{ balance: number; currency: string } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingRefunds, setPendingRefunds] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showRefundModal, setShowRefundModal] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [])

  async function fetchWallet() {
    try {
      const res = await fetch('/api/mobile/wallet')
      const data = await res.json()
      setWallet(data.wallet)
      setTransactions(data.transactions || [])
      setPendingRefunds(data.pendingRefunds || [])
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'refund':
      case 'loyalty_bonus':
      case 'promotional':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'debit':
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'refund':
      case 'loyalty_bonus':
      case 'promotional':
        return 'text-green-500'
      case 'debit':
      case 'withdrawal':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">My Wallet</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-80">Available Balance</span>
            </div>
            <div className="text-4xl font-bold mb-4">
              {wallet?.currency || 'AED'} {(wallet?.balance || 0).toFixed(2)}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRefundModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Funds
              </button>
              <button 
                onClick={() => router.push('/mobile/wallet/withdraw')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => router.push('/mobile/wallet/refund')}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <div className="p-2 bg-green-500/10 rounded-lg">
              <RefreshCw className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Request Refund</p>
              <p className="text-xs text-muted-foreground">To wallet or bank</p>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/mobile/loyalty')}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Loyalty Points</p>
              <p className="text-xs text-muted-foreground">Earn & redeem</p>
            </div>
          </button>
        </div>

        {/* Pending Refunds */}
        {pendingRefunds.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Pending Refunds</h2>
            <div className="space-y-2">
              {pendingRefunds.map((refund) => (
                <div key={refund.id} className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">{refund.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {refund.refund_type === 'wallet' ? 'To Wallet' : 'To Bank Account'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">AED {refund.amount.toFixed(2)}</p>
                    <p className="text-xs text-yellow-600 capitalize">{refund.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Transaction History</h2>
            <button className="text-xs text-accent">See All</button>
          </div>
          
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      tx.type === 'credit' || tx.type === 'refund' ? 'bg-green-500/10' : 'bg-red-500/10'
                    )}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-semibold", getTransactionColor(tx.type))}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} AED
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bal: {tx.balance_after.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <RefundModal onClose={() => setShowRefundModal(false)} onSuccess={fetchWallet} />
      )}
    </div>
  )
}

function RefundModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [refundType, setRefundType] = useState<'wallet' | 'bank_transfer'>('wallet')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    accountHolderName: ''
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!amount || !reason) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/mobile/wallet/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          refundType,
          reason,
          bankDetails: refundType === 'bank_transfer' ? bankDetails : undefined
        })
      })
      
      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Failed to submit refund:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="w-full bg-background rounded-t-3xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Request Refund</h2>
            <button onClick={onClose} className="text-muted-foreground">Cancel</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Refund Type */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Refund To</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRefundType('wallet')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-colors",
                  refundType === 'wallet' ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <Wallet className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-medium">Wallet</p>
                  <p className="text-xs text-muted-foreground">Instant</p>
                </div>
              </button>
              <button
                onClick={() => setRefundType('bank_transfer')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-colors",
                  refundType === 'bank_transfer' ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <Building2 className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-medium">Bank</p>
                  <p className="text-xs text-muted-foreground">3-5 days</p>
                </div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Amount (AED)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-accent outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-accent outline-none"
            >
              <option value="">Select reason</option>
              <option value="Booking cancellation">Booking cancellation</option>
              <option value="Deposit return">Deposit return</option>
              <option value="Overcharge">Overcharge</option>
              <option value="Service issue">Service issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Bank Details */}
          {refundType === 'bank_transfer' && (
            <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm font-medium">Bank Details</p>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                placeholder="Account Holder Name"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent outline-none"
              />
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="Bank Name"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent outline-none"
              />
              <input
                type="text"
                value={bankDetails.iban}
                onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                placeholder="IBAN"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent outline-none"
              />
              <input
                type="text"
                value={bankDetails.swiftCode}
                onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                placeholder="SWIFT Code"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent outline-none"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!amount || !reason || loading}
            className="w-full py-4 bg-accent text-white rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
