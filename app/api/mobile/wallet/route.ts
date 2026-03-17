import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch user's wallet with recent transactions
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get wallet
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (walletError && walletError.code !== 'PGRST116') {
    // Return mock wallet for development
    return NextResponse.json({
      wallet: {
        id: 'mock-wallet-id',
        user_id: user.id,
        balance: 250.00,
        currency: 'AED',
        created_at: new Date().toISOString()
      },
      transactions: [
        {
          id: '1',
          type: 'refund',
          amount: 150.00,
          balance_after: 250.00,
          description: 'Deposit refund - Booking #12345',
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          type: 'credit',
          amount: 100.00,
          balance_after: 100.00,
          description: 'Welcome bonus',
          status: 'completed',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      pendingRefunds: []
    })
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallet_id', wallet?.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get pending refund requests
  const { data: pendingRefunds } = await supabase
    .from('refund_requests')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })

  return NextResponse.json({
    wallet: wallet || { id: null, balance: 0, currency: 'AED' },
    transactions: transactions || [],
    pendingRefunds: pendingRefunds || []
  })
}

// POST - Add funds or process wallet transaction
export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, amount, bookingId, description } = body

  // Get user's wallet
  let { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Create wallet if doesn't exist
  if (!wallet) {
    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({ user_id: user.id })
      .select()
      .single()
    
    if (createError) {
      return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 })
    }
    wallet = newWallet
  }

  if (action === 'use_balance') {
    // Use wallet balance for a booking
    if (wallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const newBalance = parseFloat(wallet.balance) - parseFloat(amount)

    // Update wallet balance
    await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id)

    // Record transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'debit',
        amount: -amount,
        balance_after: newBalance,
        reference_type: 'booking',
        reference_id: bookingId,
        description: description || `Payment for booking`,
        status: 'completed'
      })

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: `AED ${amount} deducted from wallet`
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
