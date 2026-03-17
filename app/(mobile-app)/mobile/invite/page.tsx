'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, Gift, Copy, Share2, Check, Users, Award } from 'lucide-react'

export default function InvitePage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const referralCode = 'CAIDRIVE2024'
  const referralLink = `https://caidrive.com/invite/${referralCode}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join CAI Drive',
          text: 'Use my referral code to get $50 off your first rental!',
          url: referralLink
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Invite Friends</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-12 w-12 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Give $50, Get $50</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Invite your friends to CAI Drive and you both get $50 credit on your next rental
          </p>
        </div>

        {/* Referral Code */}
        <div className="p-5 bg-card rounded-2xl border border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
          <p className="text-2xl font-bold tracking-wider mb-4">{referralCode}</p>
          
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2",
                "bg-secondary border border-border"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Code
                </>
              )}
            </button>
            <button
              onClick={shareReferral}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2",
                "bg-accent text-white"
              )}
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>

        {/* How It Works */}
        <section>
          <h3 className="font-semibold mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-accent">1</span>
              </div>
              <div>
                <p className="font-medium">Share your code</p>
                <p className="text-sm text-muted-foreground">Send your unique referral code to friends</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-accent">2</span>
              </div>
              <div>
                <p className="font-medium">Friend signs up</p>
                <p className="text-sm text-muted-foreground">They register using your referral code</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-accent">3</span>
              </div>
              <div>
                <p className="font-medium">Both get rewarded</p>
                <p className="text-sm text-muted-foreground">You both receive $50 credit after their first rental</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Friends Invited</p>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-xl font-bold">$0</p>
            <p className="text-xs text-muted-foreground">Credits Earned</p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          Referral credits are valid for 12 months from issue date. 
          See full terms and conditions in the app settings.
        </p>
      </div>
    </div>
  )
}
