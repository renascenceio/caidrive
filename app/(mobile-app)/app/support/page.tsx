"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowLeft, Phone, Mail, ChevronRight, HelpCircle } from "lucide-react"
import { UnifiedChat } from "@/components/chat/unified-chat"

const faqs = [
  { q: "How do I book a car?", a: "Browse our garage, select a car, choose your dates, and proceed to payment." },
  { q: "What documents do I need?", a: "Valid Emirates ID, driving license, and passport for verification." },
  { q: "How does the deposit work?", a: "A refundable security deposit is held and released after the car is returned." },
  { q: "Can I extend my booking?", a: "Yes, contact support or extend through the app before your return time." },
  { q: "What if I have an accident?", a: "Contact us immediately. Our insurance covers most incidents." },
  { q: "What's the cancellation policy?", a: "Free cancellation up to 24 hours before pickup. 50% charge within 24 hours." },
  { q: "Do you deliver the car?", a: "Yes! Free office pickup or AED 100 delivery to your location within Dubai." },
  { q: "What payment methods are accepted?", a: "All major credit cards, Apple Pay, and cash payments." }
]

export default function SupportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleCall = () => {
    window.open('tel:+97141234567', '_self')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Support</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-2 mx-4 mt-4 bg-secondary/50 rounded-xl">
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors",
            activeTab === 'chat' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={cn(
            "flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors",
            activeTab === 'faq' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          FAQs
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col min-h-0">
          <UnifiedChat
            userRole="user"
            showHeader={false}
            showStatusTimeline={false}
            onEscalate={handleCall}
            className="flex-1"
          />
        </div>
      ) : (
        <div className="flex-1 p-4 space-y-3 overflow-auto">
          {faqs.map((faq, index) => (
            <button
              key={index}
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              className="w-full p-4 rounded-2xl border border-border bg-card text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-accent" />
                </div>
                <p className="flex-1 font-medium text-sm">{faq.q}</p>
                <ChevronRight className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedFaq === index && "rotate-90"
                )} />
              </div>
              {expandedFaq === index && (
                <p className="mt-3 pl-[52px] text-sm text-muted-foreground">
                  {faq.a}
                </p>
              )}
            </button>
          ))}

          {/* Contact Options */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Other Ways to Reach Us
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+97141234567"
                className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center gap-2"
              >
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-500" />
                </div>
                <span className="text-sm font-medium">Call Us</span>
              </a>
              <a
                href="mailto:support@caidrive.com"
                className="p-4 rounded-2xl border border-border bg-card flex flex-col items-center gap-2"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Email Us</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
