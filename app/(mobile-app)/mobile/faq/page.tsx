'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, ChevronDown, Search } from 'lucide-react'

const faqCategories = [
  { id: 'booking', label: 'Booking' },
  { id: 'payment', label: 'Payment' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'cancellation', label: 'Cancellation' },
]

const faqs = [
  {
    category: 'booking',
    question: 'How do I book a car?',
    answer: 'To book a car, browse our collection in the Garage, select your preferred vehicle, choose your dates and pickup location, then proceed to checkout. You\'ll receive a confirmation email once your booking is complete.'
  },
  {
    category: 'booking',
    question: 'What documents do I need to rent a car?',
    answer: 'You\'ll need a valid driving license, passport or Emirates ID, and a credit card for the security deposit. International visitors should have an International Driving Permit along with their home country license.'
  },
  {
    category: 'booking',
    question: 'Can I extend my rental period?',
    answer: 'Yes, you can extend your rental by contacting our support team at least 24 hours before your return date. Extensions are subject to vehicle availability.'
  },
  {
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, Apple Pay, and Google Pay. Cash payments are not accepted.'
  },
  {
    category: 'payment',
    question: 'Is there a security deposit?',
    answer: 'Yes, a security deposit is required for all rentals. The amount varies depending on the vehicle category. The deposit is held on your card and released within 7-14 business days after the rental ends.'
  },
  {
    category: 'delivery',
    question: 'Do you offer car delivery?',
    answer: 'Yes, we offer free delivery and pickup within Dubai city limits. For locations outside the city, a small fee may apply. You can select your preferred delivery location during booking.'
  },
  {
    category: 'delivery',
    question: 'What are your delivery hours?',
    answer: 'Our standard delivery hours are from 8:00 AM to 10:00 PM, seven days a week. For deliveries outside these hours, please contact our support team.'
  },
  {
    category: 'cancellation',
    question: 'What is your cancellation policy?',
    answer: 'Free cancellation is available up to 48 hours before pickup. Cancellations within 48 hours may incur a fee. No-shows will be charged the full rental amount.'
  },
  {
    category: 'cancellation',
    question: 'How do I cancel my booking?',
    answer: 'You can cancel your booking through the app by going to My Rides, selecting the booking, and tapping "Cancel Booking". You\'ll receive a confirmation email with refund details.'
  },
]

export default function FAQPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('booking')
  const [expandedId, setExpandedId] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = faq.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">FAQ</h1>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm",
                "bg-card border border-border",
                "focus:outline-none focus:border-accent/50"
              )}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === cat.id
                  ? "bg-accent text-white"
                  : "bg-card border border-border text-muted-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="p-5 space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions found</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === index ? null : index)}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                  expandedId === index && "rotate-180"
                )} />
              </button>
              {expandedId === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
