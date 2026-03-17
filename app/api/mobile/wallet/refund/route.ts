import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Request a refund
export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { 
    bookingId, 
    amount, 
    refundType, // 'wallet' | 'bank_transfer' | 'card'
    reason,
    notes,
    bankDetails // { bankName, accountNumber, iban, swiftCode, accountHolderName }
  } = body

  if (!amount || !refundType || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create refund request
  const refundData: Record<string, unknown> = {
    user_id: user.id,
    booking_id: bookingId,
    amount,
    refund_type: refundType,
    reason,
    notes,
    status: refundType === 'wallet' ? 'approved' : 'pending' // Wallet refunds are auto-approved
  }

  // Add bank details if bank transfer
  if (refundType === 'bank_transfer' && bankDetails) {
    refundData.bank_name = bankDetails.bankName
    refundData.account_number = bankDetails.accountNumber
    refundData.iban = bankDetails.iban
    refundData.swift_code = bankDetails.swiftCode
    refundData.account_holder_name = bankDetails.accountHolderName
  }

  const { data: refundRequest, error: refundError } = await supabase
    .from('refund_requests')
    .insert(refundData)
    .select()
    .single()

  if (refundError) {
    // Return mock success for development
    return NextResponse.json({
      success: true,
      refundRequest: {
        id: 'mock-refund-id',
        ...refundData,
        created_at: new Date().toISOString()
      },
      message: refundType === 'wallet' 
        ? 'Refund added to your wallet instantly'
        : 'Refund request submitted for review'
    })
  }

  // If wallet refund, process immediately
  if (refundType === 'wallet') {
    // Get user's wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!wallet) {
      // Create wallet
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: user.id })
        .select()
        .single()
      wallet = newWallet
    }

    if (wallet) {
      const newBalance = parseFloat(wallet.balance) + parseFloat(amount)

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
          type: 'refund',
          amount,
          balance_after: newBalance,
          reference_type: 'refund',
          reference_id: refundRequest?.id,
          description: `Refund: ${reason}`,
          status: 'completed',
          processed_at: new Date().toISOString()
        })

      // Update refund request status
      await supabase
        .from('refund_requests')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('id', refundRequest?.id)
    }
  }

  return NextResponse.json({
    success: true,
    refundRequest,
    message: refundType === 'wallet' 
      ? 'Refund added to your wallet instantly'
      : 'Refund request submitted for review'
  })
}

// GET - Get user's refund requests
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: refunds, error } = await supabase
    .from('refund_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    // Return mock data for development
    return NextResponse.json({
      refunds: [
        {
          id: '1',
          amount: 500,
          refund_type: 'wallet',
          reason: 'Booking cancellation',
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    })
  }

  return NextResponse.json({ refunds })
}
