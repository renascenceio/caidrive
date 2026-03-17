"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, Star, Gift, Zap, ChevronRight, Trophy, Target, Flame, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tier {
  id: string
  name: string
  min_km: number
  max_km: number | null
  multiplier: number
  benefits: string[]
  color: string
  icon: string
}

interface Milestone {
  id: string
  name: string
  description: string
  type: string
  threshold: number
  reward_points: number
  icon: string
  badge_color: string
  achieved: boolean
  reward_claimed: boolean
}

interface LoyaltyTransaction {
  id: string
  type: string
  points: number
  description: string
  created_at: string
}

interface LoyaltyAccount {
  id: string
  tier: Tier
  total_km: number
  yearly_km: number
  total_points: number
  available_points: number
  lifetime_points: number
  yearly_spend: number
  total_bookings: number
  current_streak: number
  next_tier: Tier | null
  progress_to_next: number
}

export default function LoyaltyPage() {
  const router = useRouter()
  const [account, setAccount] = useState<LoyaltyAccount | null>(null)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'milestones'>('overview')

  useEffect(() => {
    fetchLoyalty()
  }, [])

  async function fetchLoyalty() {
    try {
      const res = await fetch('/api/mobile/loyalty')
      const data = await res.json()
      setAccount(data.account)
      setTiers(data.tiers || [])
      setMilestones(data.milestones || [])
      setTransactions(data.recentTransactions || [])
    } catch (error) {
      console.error('Failed to fetch loyalty:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (icon: string) => {
    switch (icon) {
      case 'medal': return <Award className="h-6 w-6" />
      case 'award': return <Star className="h-6 w-6" />
      case 'crown': return <Trophy className="h-6 w-6" />
      case 'gem': return <Gift className="h-6 w-6" />
      case 'diamond': return <Zap className="h-6 w-6" />
      default: return <Star className="h-6 w-6" />
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
          <h1 className="text-lg font-semibold">Loyalty Program</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tier Card */}
        <div 
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{ backgroundColor: account?.tier?.color || '#CD7F32' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTierIcon(account?.tier?.icon || 'medal')}
                <div>
                  <p className="text-sm opacity-80">Current Tier</p>
                  <p className="text-2xl font-bold">{account?.tier?.name || 'Bronze'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{account?.available_points?.toLocaleString() || 0}</p>
                <p className="text-sm opacity-80">Points</p>
              </div>
            </div>

            {/* Progress to next tier */}
            {account?.next_tier && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="opacity-80">{account.tier?.name}</span>
                  <span className="opacity-80">{account.next_tier.name}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(account.progress_to_next, 100)}%` }}
                  />
                </div>
                <p className="text-xs opacity-70 mt-2">
                  {(account.next_tier.min_km - account.total_km).toFixed(0)} km to {account.next_tier.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border text-center">
            <p className="text-2xl font-bold">{account?.total_km?.toFixed(0) || 0}</p>
            <p className="text-xs text-muted-foreground">Total KM</p>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border text-center">
            <p className="text-2xl font-bold">{account?.total_bookings || 0}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <p className="text-2xl font-bold">{account?.current_streak || 0}</p>
            </div>
            <p className="text-xs text-muted-foreground">Month Streak</p>
          </div>
        </div>

        {/* Multiplier Badge */}
        <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">Points Multiplier</p>
              <p className="text-xs text-muted-foreground">Your {account?.tier?.name} bonus</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-accent">{account?.tier?.multiplier || 1}x</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {(['overview', 'tiers', 'milestones'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize",
                activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Benefits */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Benefits</h3>
              <div className="space-y-2">
                {(account?.tier?.benefits || []).map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          tx.type === 'earn' || tx.type === 'bonus' ? 'bg-green-500/10' : 'bg-red-500/10'
                        )}>
                          {tx.type === 'earn' || tx.type === 'bonus' ? (
                            <Star className="h-4 w-4 text-green-500" />
                          ) : (
                            <Gift className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm font-semibold",
                        tx.points > 0 ? 'text-green-500' : 'text-red-500'
                      )}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-3">
            {tiers.map((tier, idx) => {
              const isCurrent = tier.id === account?.tier?.id
              const isUnlocked = (account?.total_km || 0) >= tier.min_km
              
              return (
                <div 
                  key={tier.id}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-colors",
                    isCurrent ? 'border-accent bg-accent/5' : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                      >
                        {getTierIcon(tier.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{tier.name}</p>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tier.min_km.toLocaleString()} - {tier.max_km ? tier.max_km.toLocaleString() : '∞'} km
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: tier.color }}>{tier.multiplier}x</p>
                      <p className="text-xs text-muted-foreground">Multiplier</p>
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <div className="flex flex-wrap gap-2">
                      {tier.benefits.slice(0, 3).map((benefit, bidx) => (
                        <span key={bidx} className="px-2 py-1 bg-secondary text-xs rounded-md">
                          {benefit}
                        </span>
                      ))}
                      {tier.benefits.length > 3 && (
                        <span className="px-2 py-1 text-xs text-muted-foreground">
                          +{tier.benefits.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id}
                className={cn(
                  "p-4 rounded-xl border transition-colors",
                  milestone.achieved 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div 
                      className={cn(
                        "p-2.5 rounded-xl",
                        milestone.achieved ? 'bg-green-500/20' : 'bg-secondary'
                      )}
                      style={{ 
                        backgroundColor: milestone.achieved ? undefined : `${milestone.badge_color}15`,
                        color: milestone.achieved ? '#22c55e' : milestone.badge_color
                      }}
                    >
                      {milestone.achieved ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Target className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">+{milestone.reward_points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
