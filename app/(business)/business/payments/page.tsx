'use client'

import { useState } from 'react'
import { 
  CreditCard, Banknote, Wallet, TrendingUp, TrendingDown,
  ArrowDownLeft, ArrowUpRight, Calendar, Car
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const mockIncomingPayments = {
  cardReceipts: [
    { id: '1', customer: 'Ahmed Al Maktoum', car: 'Ferrari SF90', date: 'Mar 15, 2026', amount: 12500, type: 'card' },
    { id: '2', customer: 'Sarah Johnson', car: 'Rolls-Royce Ghost', date: 'Mar 14, 2026', amount: 9800, type: 'card' },
    { id: '3', customer: 'James Chen', car: 'Lamborghini Huracán', date: 'Mar 12, 2026', amount: 6600, type: 'card' },
  ],
  cashReceipts: [
    { id: '4', customer: 'Elena Petrova', car: 'Porsche 911 GT3', date: 'Mar 13, 2026', amount: 7200, type: 'cash' },
    { id: '5', customer: 'Robert Williams', car: 'McLaren 720S', date: 'Mar 10, 2026', amount: 9200, type: 'cash' },
  ],
  depositClaims: [
    { id: '6', customer: 'David Park', car: 'Lamborghini Huracán', date: 'Mar 11, 2026', amount: 2500, reason: 'Scratch repair' },
    { id: '7', customer: 'Sophie Martin', car: 'Porsche 911 GT3', date: 'Mar 8, 2026', amount: 1200, reason: 'Late return fee' },
  ],
}

const mockOutgoingPayments = [
  { id: '1', description: 'Cash Payment Fee - Elena Petrova', date: 'Mar 13, 2026', amount: 720, type: 'fee' },
  { id: '2', description: 'Cash Payment Fee - Robert Williams', date: 'Mar 10, 2026', amount: 920, type: 'fee' },
]

const mockSummary = {
  totalIncoming: 49000,
  cardReceipts: 28900,
  cashReceipts: 16400,
  depositClaims: 3700,
  totalOutgoing: 1640,
  cashFees: 1640,
  totalReceivable: 47360,
}

function PaymentRow({ payment, showType = false }: { payment: any; showType?: boolean }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        {payment.type === 'card' && <CreditCard className="h-5 w-5 text-muted-foreground" />}
        {payment.type === 'cash' && <Banknote className="h-5 w-5 text-muted-foreground" />}
        {payment.type === 'fee' && <ArrowUpRight className="h-5 w-5 text-destructive" />}
        {!payment.type && <Wallet className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{payment.customer || payment.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {payment.car && <span>{payment.car}</span>}
          {payment.car && <span>·</span>}
          <span>{payment.date}</span>
          {payment.reason && (
            <>
              <span>·</span>
              <span>{payment.reason}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-semibold",
          payment.type === 'fee' && "text-destructive"
        )}>
          {payment.type === 'fee' ? '-' : '+'}AED {payment.amount.toLocaleString()}
        </p>
        {showType && (
          <Badge variant="outline" className="mt-1">
            {payment.type === 'card' ? 'Card' : payment.type === 'cash' ? 'Cash' : 'Claim'}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [timeRange, setTimeRange] = useState('month')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track your incoming and outgoing payments</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Incoming</p>
                <p className="mt-2 text-2xl font-bold text-green-500">
                  AED {mockSummary.totalIncoming.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <ArrowDownLeft className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Outgoing</p>
                <p className="mt-2 text-2xl font-bold text-destructive">
                  AED {mockSummary.totalOutgoing.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Receivable</p>
                <p className="mt-2 text-3xl font-bold">
                  AED {mockSummary.totalReceivable.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Incoming - Outgoing</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Wallet className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="incoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-6">
          {/* Card Receipts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Card Receipts
                </CardTitle>
                <CardDescription>Online card payments</CardDescription>
              </div>
              <p className="text-lg font-semibold text-green-500">
                +AED {mockSummary.cardReceipts.toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              {mockIncomingPayments.cardReceipts.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </CardContent>
          </Card>

          {/* Cash Receipts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Cash Receipts
                </CardTitle>
                <CardDescription>Cash payments on delivery</CardDescription>
              </div>
              <p className="text-lg font-semibold text-green-500">
                +AED {mockSummary.cashReceipts.toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              {mockIncomingPayments.cashReceipts.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </CardContent>
          </Card>

          {/* Deposit Claims */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Deposit Claims
                </CardTitle>
                <CardDescription>Approved deposit deductions</CardDescription>
              </div>
              <p className="text-lg font-semibold text-green-500">
                +AED {mockSummary.depositClaims.toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              {mockIncomingPayments.depositClaims.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-6">
          {/* Cash Payment Fees */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Cash Payment Fees
                </CardTitle>
                <CardDescription>10% fee on cash payments</CardDescription>
              </div>
              <p className="text-lg font-semibold text-destructive">
                -AED {mockSummary.cashFees.toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              {mockOutgoingPayments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
