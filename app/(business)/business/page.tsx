'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Car, CalendarCheck, DollarSign, Users, TrendingUp, TrendingDown, 
  ChevronRight, Clock, MapPin, Ban, Percent, Eye, Star,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Stats Card - Lighter design with white bg and soft shadows
function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  prefix = '',
  suffix = '' 
}: { 
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  prefix?: string
  suffix?: string
}) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40 transition-shadow hover:shadow-md">
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
              isNegative && "text-rose-600 dark:text-rose-400",
              !isPositive && !isNegative && "text-muted-foreground"
            )}>
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/80 dark:bg-secondary">
          <Icon className="h-5 w-5 text-foreground/70" />
        </div>
      </div>
    </div>
  )
}

// Section Card - Clean white cards
function SectionCard({ 
  title, 
  description, 
  href, 
  children 
}: { 
  title: string
  description?: string
  href?: string
  children: React.ReactNode 
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm border border-border/40">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {href && (
          <Link href={href}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View all
            </Button>
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

// Ride Item - Compact and clean
function RideItem({ 
  car, 
  color, 
  plate, 
  date, 
  time, 
  customer,
  status
}: { 
  car: string
  color: string
  plate: string
  date: string
  time: string
  customer: string
  status?: 'pending' | 'released' | 'claimed'
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/50 dark:bg-secondary/30 p-3 transition-colors hover:bg-secondary/80 dark:hover:bg-secondary/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-sm">
        <Car className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{car}</p>
        <p className="text-xs text-muted-foreground">{color} · {plate}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{date}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      {status && (
        <Badge variant={status === 'released' ? 'secondary' : status === 'claimed' ? 'destructive' : 'outline'} className="text-xs">
          {status}
        </Badge>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    </div>
  )
}

export default function BusinessHomePage() {
  const [stats, setStats] = useState({
    totalBookings: 245000,
    totalBookingsChange: 12.5,
    totalSales: 198500,
    totalSalesChange: 8.3,
    cancellations: 23,
    cancellationsChange: -5.2,
    cancellationShare: 9.4,
    carsBooked: 45,
    carsDelivered: 42,
    utilization: 78,
    utilizationChange: 4.2,
  })

  const upcomingRides = [
    { car: '2024 Ferrari SF90', color: 'Rosso Corsa', plate: 'J92450', date: 'Fri, Mar 20', time: '12:30 PM', customer: 'Ahmed Al Maktoum' },
    { car: '2024 Lamborghini Huracán', color: 'Verde Mantis', plate: 'K82341', date: 'Sat, Mar 21', time: '10:00 AM', customer: 'Sarah Johnson' },
    { car: '2024 Porsche 911 GT3', color: 'GT Silver', plate: 'L73892', date: 'Sat, Mar 21', time: '2:00 PM', customer: 'Mohammed Ali' },
  ]

  const endingRides = [
    { car: '2024 McLaren 720S', color: 'Papaya Spark', plate: 'P44321', date: 'Fri, Mar 20', time: '4:00 PM', customer: 'Robert Williams' },
    { car: '2024 Aston Martin DB12', color: 'Skyfall Silver', plate: 'Q33210', date: 'Fri, Mar 20', time: '6:00 PM', customer: 'Anna Schmidt' },
  ]

  const endedRides = [
    { car: '2024 Ferrari F8', color: 'Rosso Corsa', plate: 'S11098', date: 'Thu, Mar 19', time: '3:00 PM', customer: 'Michael Brown', status: 'pending' as const },
    { car: '2024 Lamborghini Urus', color: 'Nero Noctis', plate: 'T00987', date: 'Wed, Mar 18', time: '5:00 PM', customer: 'Sophie Martin', status: 'released' as const },
  ]

  const topDemand = [
    { car: 'Ferrari SF90', utilization: 95 },
    { car: 'Lamborghini Huracán', utilization: 89 },
    { car: 'Porsche 911 GT3', utilization: 85 },
    { car: 'Rolls-Royce Ghost', utilization: 82 },
  ]

  const topSales = [
    { car: 'Rolls-Royce Ghost', sales: 125000 },
    { car: 'Ferrari SF90', sales: 98000 },
    { car: 'Bentley Continental', sales: 87000 },
    { car: 'Lamborghini Huracán', sales: 76000 },
  ]

  const latestReviews = [
    { customer: 'Ahmed Al Maktoum', car: 'Ferrari SF90', rating: 5, comment: 'Exceptional service and amazing car!', date: '2 hours ago' },
    { customer: 'Sarah Johnson', car: 'Rolls-Royce Ghost', rating: 5, comment: 'Perfect for my wedding day!', date: '5 hours ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          change={stats.totalBookingsChange}
          icon={CalendarCheck}
          prefix="AED "
        />
        <StatCard 
          title="Total Sales" 
          value={stats.totalSales} 
          change={stats.totalSalesChange}
          icon={DollarSign}
          prefix="AED "
        />
        <StatCard 
          title="Cancellations" 
          value={stats.cancellations} 
          change={stats.cancellationsChange}
          icon={Ban}
        />
        <StatCard 
          title="Utilization" 
          value={stats.utilization} 
          change={stats.utilizationChange}
          icon={Percent}
          suffix="%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Cancellation Share" value={stats.cancellationShare} icon={TrendingDown} suffix="%" />
        <StatCard title="Cars Booked" value={stats.carsBooked} icon={Car} />
        <StatCard title="Cars Delivered" value={stats.carsDelivered} icon={MapPin} />
      </div>

      {/* Rides Sections */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Upcoming Rides" description="Next scheduled pickups" href="/business/rides">
          <div className="space-y-2">
            {upcomingRides.map((ride, i) => (
              <RideItem key={i} {...ride} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ending Rides" description="Scheduled returns" href="/business/rides">
          <div className="space-y-2">
            {endingRides.map((ride, i) => (
              <RideItem key={i} {...ride} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ended Rides" description="Pending deposit actions" href="/business/deposits">
          <div className="space-y-2">
            {endedRides.map((ride, i) => (
              <RideItem key={i} {...ride} />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Performance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Most Demand" description="Top utilized cars">
          <div className="space-y-3">
            {topDemand.map((item, index) => (
              <div key={item.car} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{index + 1}. {item.car}</span>
                  <span className="text-muted-foreground">{item.utilization}%</span>
                </div>
                <Progress value={item.utilization} className="h-1.5" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top Sales" description="Revenue leaders">
          <div className="space-y-2">
            {topSales.map((item, index) => (
              <div key={item.car} className="flex items-center justify-between rounded-lg bg-secondary/50 dark:bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-semibold shadow-sm">
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm">{item.car}</span>
                </div>
                <span className="font-semibold text-sm">AED {item.sales.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Reviews */}
      <SectionCard title="Latest Reviews" description="Recent feedback" href="/business/reviews">
        <div className="space-y-3">
          {latestReviews.map((review, i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-secondary/50 dark:bg-secondary/30 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-xs font-semibold shadow-sm">
                {review.customer.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{review.customer}</p>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-xs text-muted-foreground">{review.car}</p>
                <div className="mt-1 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20")} />
                  ))}
                </div>
                <p className="mt-1.5 text-sm text-foreground/80">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
