'use client'

import { useState } from 'react'
import { 
  Wallet, Car, Calendar, CheckCircle, XCircle, Clock,
  AlertCircle, FileText, Download, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const mockPendingDeposits = [
  { 
    id: '1', 
    customer: 'Michael Brown',
    car: '2024 Ferrari F8 Tributo',
    dates: 'Mar 12-19, 2026',
    amount: 10000,
    rideAmount: 17500,
  },
  { 
    id: '2', 
    customer: 'Anna Schmidt',
    car: '2024 McLaren 720S',
    dates: 'Mar 15-18, 2026',
    amount: 9000,
    rideAmount: 6900,
  },
]

const mockClaimedDeposits = [
  { 
    id: '3', 
    customer: 'David Park',
    car: '2024 Lamborghini Huracán',
    dates: 'Mar 5-10, 2026',
    amount: 8000,
    claimedAmount: 2500,
    reason: 'Minor scratch on front bumper',
    status: 'pending' as const,
  },
  { 
    id: '4', 
    customer: 'Sophie Martin',
    car: '2024 Porsche 911 GT3',
    dates: 'Mar 1-5, 2026',
    amount: 7500,
    claimedAmount: 1200,
    reason: 'Late return fee - 4 hours',
    status: 'approved' as const,
  },
]

export default function DepositsPage() {
  const [pendingDeposits, setPendingDeposits] = useState(mockPendingDeposits)
  const [claimedDeposits, setClaimedDeposits] = useState(mockClaimedDeposits)
  const [releasedDeposits, setReleasedDeposits] = useState<typeof mockPendingDeposits>([])
  
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<typeof mockPendingDeposits[0] | null>(null)
  const [claimAmount, setClaimAmount] = useState('')
  const [claimReason, setClaimReason] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleRelease() {
    if (!selectedDeposit) return
    
    setProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setPendingDeposits(prev => prev.filter(d => d.id !== selectedDeposit.id))
      setReleasedDeposits(prev => [...prev, selectedDeposit])
      setReleaseDialogOpen(false)
      setSelectedDeposit(null)
      toast.success(`Deposit of AED ${selectedDeposit.amount.toLocaleString()} released to ${selectedDeposit.customer}`)
    } catch (error) {
      toast.error('Failed to release deposit')
    } finally {
      setProcessing(false)
    }
  }

  async function handleClaim() {
    if (!selectedDeposit || !claimAmount || !claimReason) {
      toast.error('Please fill in all fields')
      return
    }
    
    setProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setPendingDeposits(prev => prev.filter(d => d.id !== selectedDeposit.id))
      setClaimedDeposits(prev => [...prev, {
        ...selectedDeposit,
        claimedAmount: parseInt(claimAmount),
        reason: claimReason,
        status: 'pending' as const,
      }])
      setClaimDialogOpen(false)
      setSelectedDeposit(null)
      setClaimAmount('')
      setClaimReason('')
      toast.success(`Claim submitted for AED ${claimAmount}`)
    } catch (error) {
      toast.error('Failed to submit claim')
    } finally {
      setProcessing(false)
    }
  }

  const totalHeld = pendingDeposits.reduce((sum, d) => sum + d.amount, 0)
  const pendingClaims = claimedDeposits.filter(d => d.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deposits</h1>
        <p className="text-muted-foreground">Manage customer deposits and claims</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Actions</p>
              <p className="mt-2 text-2xl font-semibold">{pendingDeposits.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Held</p>
              <p className="mt-2 text-2xl font-semibold">AED {totalHeld.toLocaleString()}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/80">
              <Wallet className="h-5 w-5 text-foreground/70" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Claims</p>
              <p className="mt-2 text-2xl font-semibold">{pendingClaims}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actions" className="gap-2">
            Actions
            {pendingDeposits.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingDeposits.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claimed" className="gap-2">
            Claimed
            <Badge variant="secondary" className="ml-1">{claimedDeposits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="released" className="gap-2">
            Released
            <Badge variant="secondary" className="ml-1">{releasedDeposits.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Pending Actions Tab */}
        <TabsContent value="actions" className="space-y-3">
          {pendingDeposits.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 shadow-sm border border-border/40 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-emerald-500" />
              <p className="mt-4 font-medium">No pending actions</p>
              <p className="text-sm text-muted-foreground">All deposits have been processed</p>
            </div>
          ) : (
            pendingDeposits.map((deposit) => (
              <div 
                key={deposit.id} 
                className="flex flex-col gap-4 lg:flex-row lg:items-center rounded-2xl bg-card p-4 shadow-sm border border-border/40"
              >
                <div className="flex items-center gap-4 lg:w-48">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/80">
                    <Wallet className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-medium">{deposit.customer}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:flex-1">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{deposit.car}</span>
                </div>

                <div className="flex items-center gap-3 lg:w-40">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{deposit.dates}</span>
                </div>

                <div className="lg:w-32 text-right">
                  <p className="font-semibold">AED {deposit.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Deposit</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedDeposit(deposit)
                      setReleaseDialogOpen(true)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Release
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedDeposit(deposit)
                      setClaimDialogOpen(true)
                    }}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Claim
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Claimed Tab */}
        <TabsContent value="claimed" className="space-y-3">
          {claimedDeposits.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 shadow-sm border border-border/40 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 font-medium">No claims</p>
              <p className="text-sm text-muted-foreground">No deposit claims have been made</p>
            </div>
          ) : (
            claimedDeposits.map((deposit) => (
              <div 
                key={deposit.id} 
                className="rounded-2xl bg-card p-4 shadow-sm border border-border/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-4 lg:w-48">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                      <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="font-medium">{deposit.customer}</p>
                      <p className="text-xs text-muted-foreground">Customer</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:flex-1">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{deposit.car}</span>
                  </div>

                  <div className="flex items-center gap-3 lg:w-40">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{deposit.dates}</span>
                  </div>

                  <div className="lg:w-32 text-right">
                    <p className="font-semibold text-rose-600 dark:text-rose-400">
                      AED {deposit.claimedAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">of {deposit.amount.toLocaleString()}</p>
                  </div>

                  <Badge 
                    variant={deposit.status === 'approved' ? 'default' : 'outline'} 
                    className={cn(
                      "capitalize",
                      deposit.status === 'pending' && "text-amber-600 border-amber-300"
                    )}
                  >
                    {deposit.status}
                  </Badge>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Reason:</span> {deposit.reason}
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Released Tab */}
        <TabsContent value="released" className="space-y-3">
          {releasedDeposits.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 shadow-sm border border-border/40 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 font-medium">No released deposits yet</p>
              <p className="text-sm text-muted-foreground">Released deposits will appear here</p>
            </div>
          ) : (
            releasedDeposits.map((deposit) => (
              <div 
                key={deposit.id} 
                className="flex flex-col gap-4 lg:flex-row lg:items-center rounded-2xl bg-card p-4 shadow-sm border border-border/40"
              >
                <div className="flex items-center gap-4 lg:w-48">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">{deposit.customer}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:flex-1">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{deposit.car}</span>
                </div>

                <div className="flex items-center gap-3 lg:w-40">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{deposit.dates}</span>
                </div>

                <div className="lg:w-32 text-right">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    AED {deposit.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Released</p>
                </div>

                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Released
                </Badge>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Release Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Deposit</DialogTitle>
            <DialogDescription>
              {selectedDeposit && (
                <>Confirm release of AED {selectedDeposit.amount.toLocaleString()} deposit to {selectedDeposit.customer}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will release the full deposit amount back to the customer. Make sure you have inspected the vehicle and there are no damages.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRelease} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Claim Deposit</DialogTitle>
            <DialogDescription>
              {selectedDeposit && (
                <>Submit a claim for the AED {selectedDeposit.amount.toLocaleString()} deposit</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Claim Amount (AED) *</Label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                max={selectedDeposit?.amount}
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
              />
              {selectedDeposit && (
                <p className="text-xs text-muted-foreground">
                  Maximum: AED {selectedDeposit.amount.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea 
                placeholder="Describe the reason for the claim (e.g., vehicle damage, late return)..." 
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Evidence (Optional)</Label>
              <Input type="file" multiple accept="image/*,.pdf" />
              <p className="text-xs text-muted-foreground">
                Upload photos or documents supporting your claim
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClaim} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
