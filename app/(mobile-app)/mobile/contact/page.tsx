'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Clock, Send, Check } from 'lucide-react'

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    value: '+971 4 123 4567',
    description: 'Available 24/7',
    action: 'tel:+97141234567'
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'support@caidrive.com',
    description: 'Response within 24h',
    action: 'mailto:support@caidrive.com'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+971 50 123 4567',
    description: 'Chat with us',
    action: 'https://wa.me/971501234567'
  },
  {
    icon: MapPin,
    title: 'Office',
    value: 'Dubai Marina',
    description: 'Visit us',
    action: '#'
  }
]

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4 px-4 py-3">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Contact Us</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
          <p className="text-muted-foreground mb-8 max-w-xs">
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => router.push('/mobile/profile')}
            className="px-8 py-3.5 rounded-2xl bg-accent text-white font-semibold"
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Contact Us</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Contact Methods */}
        <section>
          <h2 className="font-semibold mb-4">Get in Touch</h2>
          <div className="grid grid-cols-2 gap-3">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <a
                  key={method.title}
                  href={method.action}
                  className="p-4 bg-card rounded-2xl border border-border hover:border-accent/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="font-semibold text-sm">{method.title}</p>
                  <p className="text-xs text-muted-foreground">{method.value}</p>
                </a>
              )
            })}
          </div>
        </section>

        {/* Business Hours */}
        <section className="p-4 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Business Hours</p>
              <p className="text-xs text-muted-foreground">Customer Support</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span className="font-medium">9:00 AM - 10:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday - Sunday</span>
              <span className="font-medium">10:00 AM - 8:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency Line</span>
              <span className="font-medium text-accent">24/7</span>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className="font-semibold mb-4">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border focus:outline-none focus:border-accent/50"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border focus:outline-none focus:border-accent/50"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border focus:outline-none focus:border-accent/50"
                placeholder="How can we help?"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border focus:outline-none focus:border-accent/50 min-h-[120px] resize-none"
                placeholder="Describe your inquiry..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2",
                "bg-accent text-white",
                "disabled:opacity-50"
              )}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
