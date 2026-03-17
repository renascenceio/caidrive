'use client'

import { useState } from 'react'
import { 
  BarChart3, TrendingUp, DollarSign, Car, Users, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, ShoppingCart, Clock, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

const mockSalesData = {
  avgBookings: 18500,
  avgSales: 15200,
  avgCheque: 2450,
  avgDays: 3.2,
  totalBookings: 245000,
  totalSales: 198500,
  totalCars: 89,
  totalDays: 267,
  cancellations: 23500,
}

const mockTopCars = {
  views: [
    { name: 'Ferrari SF90', value: 567 },
    { name: 'Porsche 911 GT3', value: 534 },
    { name: 'Lamborghini Huracán', value: 489 },
    { name: 'McLaren 720S', value: 401 },
    { name: 'Rolls-Royce Ghost', value: 278 },
  ],
  bookings: [
    { name: 'Ferrari SF90', value: 23 },
    { name: 'Lamborghini Huracán', value: 21 },
    { name: 'Porsche 911 GT3', value: 19 },
    { name: 'Ferrari F8', value: 18 },
    { name: 'McLaren 720S', value: 17 },
  ],
  sales: [
    { name: 'Rolls-Royce Ghost', value: 125000 },
    { name: 'Ferrari SF90', value: 98000 },
    { name: 'Bentley Continental', value: 87000 },
    { name: 'Lamborghini Huracán', value: 76000 },
    { name: 'Porsche 911 GT3', value: 65000 },
  ],
  utilization: [
    { name: 'Ferrari SF90', value: 95 },
    { name: 'Lamborghini Huracán', value: 89 },
    { name: 'Porsche 911 GT3', value: 85 },
    { name: 'Rolls-Royce Ghost', value: 82 },
    { name: 'McLaren 720S', value: 78 },
  ],
  idle: [
    { name: 'BMW M8', value: 45 },
    { name: 'Aston Martin DB12', value: 38 },
    { name: 'Bentley Continental', value: 32 },
    { name: 'Lamborghini Urus', value: 28 },
    { name: 'Ferrari F8', value: 22 },
  ],
  cancellations: [
    { name: 'Lamborghini Urus', value: 8 },
    { name: 'BMW M8', value: 6 },
    { name: 'Ferrari F8', value: 5 },
    { name: 'McLaren 720S', value: 4 },
    { name: 'Porsche 911 GT3', value: 3 },
  ],
}

const mockTopCustomers = {
  loyal: [
    { name: 'James Chen', value: 15 },
    { name: 'Ahmed Al Maktoum', value: 12 },
    { name: 'Elena Petrova', value: 8 },
    { name: 'Robert Williams', value: 6 },
    { name: 'Sarah Johnson', value: 5 },
  ],
  sales: [
    { name: 'James Chen', value: 67500 },
    { name: 'Ahmed Al Maktoum', value: 45000 },
    { name: 'Elena Petrova', value: 32000 },
    { name: 'Robert Williams', value: 24000 },
    { name: 'Sarah Johnson', value: 18500 },
  ],
  cancellations: [
    { name: 'Guest User 1', value: 3 },
    { name: 'Guest User 2', value: 2 },
    { name: 'Mohammed Ali', value: 1 },
  ],
}

function StatCard({ title, value, change, prefix = '', suffix = '', icon: Icon }: {
  title: string
  value: number | string
  change?: number
  prefix?: string
  suffix?: string
  icon?: React.ElementType
}) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              isPositive && "text-emerald-600 dark:text-emerald-400",
              isNegative && "text-rose-600 dark:text-rose-400"
            )}>
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              <span>{Math.abs(change)}% vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/80 dark:bg-secondary">
            <Icon className="h-5 w-5 text-foreground/70" />
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, data, prefix = '', suffix = '', icon: Icon }: {
  title: string
  data: { name: string; value: number }[]
  prefix?: string
  suffix?: string
  icon?: React.ElementType
}) {
  const max = Math.max(...data.map(d => d.value))
  
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{index + 1}. {item.name}</span>
              <span className="text-muted-foreground">
                {prefix}{item.value.toLocaleString()}{suffix}
              </span>
            </div>
            <Progress value={(item.value / max) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your business performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="cars">Cars</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Averages */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Avg. Bookings" value={mockSalesData.avgBookings} prefix="AED " change={8.5} icon={ShoppingCart} />
            <StatCard title="Avg. Sales" value={mockSalesData.avgSales} prefix="AED " change={12.3} icon={DollarSign} />
            <StatCard title="Avg. Cheque" value={mockSalesData.avgCheque} prefix="AED " change={5.2} icon={TrendingUp} />
            <StatCard title="Avg. Days" value={mockSalesData.avgDays} suffix=" days" change={-2.1} icon={Clock} />
          </div>

          {/* Totals */}
          <div className="rounded-2xl bg-card p-6 shadow-sm border border-border/40">
            <h3 className="font-semibold mb-1">Sales Overview</h3>
            <p className="text-sm text-muted-foreground mb-6">Total figures for the selected period</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div className="text-center p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                <p className="text-2xl font-semibold">AED {mockSalesData.totalBookings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                <p className="text-2xl font-semibold">AED {mockSalesData.totalSales.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                <p className="text-2xl font-semibold">{mockSalesData.totalCars}</p>
                <p className="text-sm text-muted-foreground">Total Cars Rented</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30">
                <p className="text-2xl font-semibold">{mockSalesData.totalDays}</p>
                <p className="text-sm text-muted-foreground">Total Days</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20">
                <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">AED {mockSalesData.cancellations.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Cancellations</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Cars Tab */}
        <TabsContent value="cars" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Most Views (Top 5)" data={mockTopCars.views} icon={Eye} />
            <ChartCard title="Most Bookings (Top 5)" data={mockTopCars.bookings} icon={ShoppingCart} />
            <ChartCard title="Most Sales (Top 5)" data={mockTopCars.sales} prefix="AED " icon={DollarSign} />
            <ChartCard title="Highest Utilization (Top 5)" data={mockTopCars.utilization} suffix="%" icon={TrendingUp} />
            <ChartCard title="Most Idle (Top 5)" data={mockTopCars.idle} suffix="%" icon={Clock} />
            <ChartCard title="Most Cancellations (Top 5)" data={mockTopCars.cancellations} icon={XCircle} />
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Most Loyal Customers" data={mockTopCustomers.loyal} suffix=" rides" icon={Users} />
            <ChartCard title="Top Spenders" data={mockTopCustomers.sales} prefix="AED " icon={DollarSign} />
            <ChartCard title="Most Cancellations" data={mockTopCustomers.cancellations} icon={XCircle} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
