'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Shield, Award, Users, Car, Star, CheckCircle } from 'lucide-react'

const stats = [
  { value: '500+', label: 'Premium Cars', icon: Car },
  { value: '50K+', label: 'Happy Customers', icon: Users },
  { value: '4.9', label: 'Average Rating', icon: Star },
  { value: '24/7', label: 'Support', icon: Shield },
]

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'All vehicles undergo rigorous safety checks and regular maintenance.'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the finest luxury and sports cars in our curated collection.'
  },
  {
    icon: Users,
    title: 'Customer Focus',
    description: 'Dedicated support team available around the clock for your needs.'
  },
]

const features = [
  'Free delivery across Dubai',
  '24/7 roadside assistance',
  'Comprehensive insurance coverage',
  'Flexible rental periods',
  'No hidden fees',
  'Instant booking confirmation'
]

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">About Us</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-48">
        <Image
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200"
          alt="Luxury cars"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <h2 className="text-2xl font-bold text-white">CAI Drive</h2>
          <p className="text-white/80 text-sm">Premium Car Rentals in Dubai</p>
        </div>
      </div>

      <div className="px-5 py-6 space-y-8">
        {/* About Text */}
        <section>
          <p className="text-muted-foreground leading-relaxed">
            CAI Drive is Dubai's premier luxury car rental service, offering an unparalleled 
            selection of high-end vehicles for discerning clients. Founded with a passion for 
            automotive excellence, we bring together the world's most prestigious car brands 
            under one roof.
          </p>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="p-4 bg-card rounded-2xl border border-border text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Our Values */}
        <section>
          <h3 className="font-semibold text-lg mb-4">Our Values</h3>
          <div className="space-y-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="flex gap-4 p-4 bg-card rounded-2xl border border-border">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{value.title}</p>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h3 className="font-semibold text-lg mb-4">Why Choose CAI Drive?</h3>
          <div className="p-4 bg-card rounded-2xl border border-border space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="p-5 bg-accent/5 rounded-2xl border border-accent/20">
          <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To deliver exceptional driving experiences that exceed expectations, combining 
            world-class vehicles with unmatched service to create unforgettable moments 
            for every client.
          </p>
        </section>

        {/* Version Info */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">CAI Drive App</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
