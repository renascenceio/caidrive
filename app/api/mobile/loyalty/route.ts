import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock loyalty tiers for when DB isn't available
const MOCK_TIERS = [
  { id: '1', name: 'Bronze', min_km: 0, max_km: 999, multiplier: 1.00, color: '#CD7F32', icon: 'medal', benefits: ['Basic support', 'Standard booking'] },
  { id: '2', name: 'Silver', min_km: 1000, max_km: 4999, multiplier: 1.25, color: '#C0C0C0', icon: 'award', benefits: ['Priority support', '5% discount on insurance', 'Free car upgrade'] },
  { id: '3', name: 'Gold', min_km: 5000, max_km: 14999, multiplier: 1.50, color: '#FFD700', icon: 'crown', benefits: ['24/7 VIP support', '10% discount on all bookings', 'Free premium insurance'] },
  { id: '4', name: 'Platinum', min_km: 15000, max_km: 49999, multiplier: 2.00, color: '#E5E4E2', icon: 'gem', benefits: ['Personal concierge', '15% discount', 'Complimentary chauffeur'] },
  { id: '5', name: 'Diamond', min_km: 50000, max_km: null, multiplier: 2.50, color: '#B9F2FF', icon: 'diamond', benefits: ['Dedicated account manager', '20% discount', 'Unlimited chauffeur'] }
]

const MOCK_MILESTONES = [
  { id: '1', name: 'First Ride', description: 'Complete your first booking', type: 'bookings', threshold: 1, reward_points: 100, icon: 'car', badge_color: '#4CAF50', achieved: true },
  { id: '2', name: 'Road Warrior', description: 'Drive 500 km total', type: 'km_total', threshold: 500, reward_points: 250, icon: 'road', badge_color: '#2196F3', achieved: true },
  { id: '3', name: 'Explorer', description: 'Drive 1,000 km total', type: 'km_total', threshold: 1000, reward_points: 500, icon: 'compass', badge_color: '#9C27B0', achieved: false },
  { id: '4', name: 'Frequent Rider', description: 'Complete 10 bookings', type: 'bookings', threshold: 10, reward_points: 500, icon: 'star', badge_color: '#FFC107', achieved: false },
  { id: '5', name: 'Big Spender', description: 'Spend 10,000 AED in a year', type: 'spend', threshold: 10000, reward_points: 1000, icon: 'wallet', badge_color: '#4CAF50', achieved: false },
]

// GET - Fetch user's loyalty account
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try to get loyalty account
  const { data: loyaltyAccount, error: accountError } = await supabase
    .from('loyalty_accounts')
    .select(`
      *,
      tier:loyalty_tiers(*)
    `)
    .eq('user_id', user.id)
    .single()

  if (accountError && accountError.code !== 'PGRST116') {
    // Return mock data for development
    const mockTier = MOCK_TIERS[1] // Silver tier
    return NextResponse.json({
      account: {
        id: 'mock-loyalty-id',
        user_id: user.id,
        tier: mockTier,
        total_km: 1250,
        yearly_km: 850,
        total_points: 1500,
        available_points: 1200,
        lifetime_points: 2500,
        yearly_spend: 8500,
        total_bookings: 8,
        current_streak: 3,
        next_tier: MOCK_TIERS[2],
        progress_to_next: ((1250 - 1000) / (5000 - 1000)) * 100 // % progress to Gold
      },
      tiers: MOCK_TIERS,
      milestones: MOCK_MILESTONES,
      recentTransactions: [
        { id: '1', type: 'earn', points: 125, description: 'Booking #12345 - Ferrari 488', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', type: 'earn', points: 200, description: 'Booking #12344 - Lamborghini Urus', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: '3', type: 'bonus', points: 100, description: 'Monthly streak bonus', created_at: new Date(Date.now() - 259200000).toISOString() }
      ]
    })
  }

  // Get all tiers
  const { data: tiers } = await supabase
    .from('loyalty_tiers')
    .select('*')
    .order('min_km', { ascending: true })

  // Get milestones with user achievements
  const { data: allMilestones } = await supabase
    .from('loyalty_milestones')
    .select('*')
    .eq('is_active', true)
    .order('threshold', { ascending: true })

  const { data: userMilestones } = await supabase
    .from('user_milestones')
    .select('milestone_id, achieved_at, reward_claimed')
    .eq('user_id', user.id)

  const achievedIds = new Set(userMilestones?.map(m => m.milestone_id) || [])
  const milestonesWithStatus = allMilestones?.map(m => ({
    ...m,
    achieved: achievedIds.has(m.id),
    reward_claimed: userMilestones?.find(um => um.milestone_id === m.id)?.reward_claimed || false
  }))

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('loyalty_account_id', loyaltyAccount?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate next tier
  const currentTierIndex = (tiers || MOCK_TIERS).findIndex(t => t.id === loyaltyAccount?.tier_id)
  const nextTier = currentTierIndex < (tiers || MOCK_TIERS).length - 1 
    ? (tiers || MOCK_TIERS)[currentTierIndex + 1] 
    : null

  const progressToNext = nextTier 
    ? ((loyaltyAccount?.total_km - loyaltyAccount?.tier?.min_km) / (nextTier.min_km - loyaltyAccount?.tier?.min_km)) * 100
    : 100

  return NextResponse.json({
    account: {
      ...loyaltyAccount,
      next_tier: nextTier,
      progress_to_next: Math.min(progressToNext, 100)
    },
    tiers: tiers || MOCK_TIERS,
    milestones: milestonesWithStatus || MOCK_MILESTONES,
    recentTransactions: recentTransactions || []
  })
}

// POST - Earn or redeem points
export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, points, bookingId, km, amount, description } = body

  // Get loyalty account
  let { data: account } = await supabase
    .from('loyalty_accounts')
    .select('*, tier:loyalty_tiers(*)')
    .eq('user_id', user.id)
    .single()

  if (!account) {
    // Create account
    const { data: bronzeTier } = await supabase
      .from('loyalty_tiers')
      .select('id')
      .eq('name', 'Bronze')
      .single()

    const { data: newAccount } = await supabase
      .from('loyalty_accounts')
      .insert({ user_id: user.id, tier_id: bronzeTier?.id })
      .select('*, tier:loyalty_tiers(*)')
      .single()
    
    account = newAccount
  }

  if (!account) {
    return NextResponse.json({ error: 'Could not create loyalty account' }, { status: 500 })
  }

  if (action === 'earn') {
    // Calculate points with tier multiplier
    const multiplier = account.tier?.multiplier || 1
    const earnedPoints = Math.round(points * multiplier)
    
    const newTotalPoints = account.total_points + earnedPoints
    const newAvailablePoints = account.available_points + earnedPoints
    const newLifetimePoints = account.lifetime_points + earnedPoints
    const newTotalKm = account.total_km + (km || 0)
    const newYearlyKm = account.yearly_km + (km || 0)
    const newYearlySpend = account.yearly_spend + (amount || 0)
    const newTotalBookings = account.total_bookings + 1

    // Update account
    await supabase
      .from('loyalty_accounts')
      .update({
        total_points: newTotalPoints,
        available_points: newAvailablePoints,
        lifetime_points: newLifetimePoints,
        total_km: newTotalKm,
        yearly_km: newYearlyKm,
        yearly_spend: newYearlySpend,
        total_bookings: newTotalBookings,
        last_booking_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', account.id)

    // Record transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        loyalty_account_id: account.id,
        type: 'earn',
        points: earnedPoints,
        points_balance_after: newAvailablePoints,
        km_earned: km || 0,
        reference_type: 'booking',
        reference_id: bookingId,
        description: description || `Earned from booking`,
        multiplier_applied: multiplier
      })

    // Check for milestone achievements
    await checkMilestones(supabase, user.id, account.id, {
      total_km: newTotalKm,
      yearly_km: newYearlyKm,
      total_bookings: newTotalBookings,
      yearly_spend: newYearlySpend
    })

    return NextResponse.json({
      success: true,
      earnedPoints,
      multiplier,
      newBalance: newAvailablePoints,
      message: `You earned ${earnedPoints} points! (${multiplier}x ${account.tier?.name} bonus)`
    })
  }

  if (action === 'redeem') {
    if (account.available_points < points) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    const newAvailablePoints = account.available_points - points

    // Update account
    await supabase
      .from('loyalty_accounts')
      .update({ available_points: newAvailablePoints })
      .eq('id', account.id)

    // Record transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        loyalty_account_id: account.id,
        type: 'redeem',
        points: -points,
        points_balance_after: newAvailablePoints,
        reference_type: 'redemption',
        reference_id: bookingId,
        description: description || `Redeemed for discount`
      })

    return NextResponse.json({
      success: true,
      redeemedPoints: points,
      newBalance: newAvailablePoints,
      message: `Successfully redeemed ${points} points`
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// Helper function to check and award milestones
async function checkMilestones(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  accountId: string,
  stats: { total_km: number; yearly_km: number; total_bookings: number; yearly_spend: number }
) {
  // Get all active milestones
  const { data: milestones } = await supabase
    .from('loyalty_milestones')
    .select('*')
    .eq('is_active', true)

  // Get user's achieved milestones
  const { data: achieved } = await supabase
    .from('user_milestones')
    .select('milestone_id')
    .eq('user_id', userId)

  const achievedIds = new Set(achieved?.map(a => a.milestone_id) || [])

  for (const milestone of milestones || []) {
    if (achievedIds.has(milestone.id)) continue

    let qualified = false
    switch (milestone.type) {
      case 'km_total':
        qualified = stats.total_km >= milestone.threshold
        break
      case 'km_yearly':
        qualified = stats.yearly_km >= milestone.threshold
        break
      case 'bookings':
        qualified = stats.total_bookings >= milestone.threshold
        break
      case 'spend':
        qualified = stats.yearly_spend >= milestone.threshold
        break
    }

    if (qualified) {
      // Award milestone
      await supabase
        .from('user_milestones')
        .insert({
          user_id: userId,
          milestone_id: milestone.id
        })

      // Award bonus points
      if (milestone.reward_points > 0) {
        const { data: account } = await supabase
          .from('loyalty_accounts')
          .select('available_points')
          .eq('id', accountId)
          .single()

        const newBalance = (account?.available_points || 0) + milestone.reward_points

        await supabase
          .from('loyalty_accounts')
          .update({ 
            available_points: newBalance,
            total_points: newBalance 
          })
          .eq('id', accountId)

        await supabase
          .from('loyalty_transactions')
          .insert({
            loyalty_account_id: accountId,
            type: 'bonus',
            points: milestone.reward_points,
            points_balance_after: newBalance,
            reference_type: 'milestone',
            reference_id: milestone.id,
            description: `Milestone achieved: ${milestone.name}`
          })
      }
    }
  }
}
