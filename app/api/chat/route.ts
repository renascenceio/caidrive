import { streamText, tool, convertToModelMessages } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// AI-powered chat route for CAI Drive support
// Handles user queries, booking info, status updates, and escalation to human support

export async function POST(req: Request) {
  const { messages, roomId, bookingId, userRole } = await req.json()
  
  const supabase = await createClient()
  
  // Get booking context if available
  let bookingContext = ''
  if (bookingId) {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(brand, model, year, price_per_day),
        user:profiles!bookings_user_id_fkey(full_name, phone)
      `)
      .eq('id', bookingId)
      .single()
    
    if (booking) {
      bookingContext = `
Current Booking Context:
- Booking ID: ${booking.id}
- Status: ${booking.status}
- Vehicle: ${booking.vehicle?.brand} ${booking.vehicle?.model} (${booking.vehicle?.year})
- Start Date: ${booking.start_date}
- End Date: ${booking.end_date}
- Total: AED ${booking.total_amount}
- Deposit: AED ${booking.deposit_amount || 0}
- Customer: ${booking.user?.full_name}
- Phone: ${booking.user?.phone}
`
    }
  }

  // Define tools for the AI assistant
  const tools = {
    getBookingStatus: tool({
      description: 'Get the current status and details of a booking',
      inputSchema: z.object({
        bookingId: z.string().describe('The booking ID to look up'),
      }),
      execute: async ({ bookingId }) => {
        const { data } = await supabase
          .from('bookings')
          .select('*, vehicle:vehicles(brand, model)')
          .eq('id', bookingId)
          .single()
        
        if (!data) return { error: 'Booking not found' }
        
        return {
          status: data.status,
          vehicle: `${data.vehicle?.brand} ${data.vehicle?.model}`,
          startDate: data.start_date,
          endDate: data.end_date,
          total: data.total_amount,
          deposit: data.deposit_amount,
        }
      },
    }),

    getBookingHistory: tool({
      description: 'Get the status history timeline for a booking',
      inputSchema: z.object({
        bookingId: z.string().describe('The booking ID'),
      }),
      execute: async ({ bookingId }) => {
        const { data } = await supabase
          .from('booking_status_history')
          .select('*')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: true })
        
        return data || []
      },
    }),

    updateBookingStatus: tool({
      description: 'Update the status of a booking (only for support/admin)',
      inputSchema: z.object({
        bookingId: z.string(),
        newStatus: z.enum(['confirmed', 'driver_assigned', 'en_route', 'delivered', 'active', 'returning', 'completed', 'cancelled']),
        notes: z.string().nullable(),
      }),
      execute: async ({ bookingId, newStatus, notes }) => {
        // Only allow status updates from support or admin
        if (userRole !== 'support' && userRole !== 'admin') {
          return { error: 'Not authorized to update booking status' }
        }

        const { data: current } = await supabase
          .from('bookings')
          .select('status')
          .eq('id', bookingId)
          .single()

        await supabase
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', bookingId)

        // Record in history
        await supabase
          .from('booking_status_history')
          .insert({
            booking_id: bookingId,
            status: newStatus,
            previous_status: current?.status,
            changed_by_role: userRole,
            notes,
          })

        return { success: true, newStatus }
      },
    }),

    escalateToSupport: tool({
      description: 'Escalate the conversation to a human support agent',
      inputSchema: z.object({
        reason: z.string().describe('Reason for escalation'),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
      }),
      execute: async ({ reason, priority }) => {
        // Update chat room to flag for support
        if (roomId) {
          await supabase
            .from('chat_rooms')
            .update({ 
              metadata: { 
                escalated: true, 
                escalation_reason: reason,
                escalation_priority: priority,
                escalated_at: new Date().toISOString(),
              }
            })
            .eq('id', roomId)
        }

        return { 
          escalated: true, 
          message: 'A support agent will join this chat shortly.' 
        }
      },
    }),

    getDriverInfo: tool({
      description: 'Get information about the assigned driver for a booking',
      inputSchema: z.object({
        bookingId: z.string(),
      }),
      execute: async ({ bookingId }) => {
        const { data: booking } = await supabase
          .from('bookings')
          .select('driver_id')
          .eq('id', bookingId)
          .single()

        if (!booking?.driver_id) {
          return { assigned: false, message: 'No driver assigned yet' }
        }

        const { data: driver } = await supabase
          .from('drivers')
          .select('*, profile:profiles(full_name, phone, avatar_url)')
          .eq('id', booking.driver_id)
          .single()

        return {
          assigned: true,
          name: driver?.profile?.full_name,
          phone: driver?.profile?.phone,
          rating: driver?.rating,
        }
      },
    }),

    checkDepositStatus: tool({
      description: 'Check the deposit status for a booking',
      inputSchema: z.object({
        bookingId: z.string(),
      }),
      execute: async ({ bookingId }) => {
        const { data } = await supabase
          .from('deposits')
          .select('*')
          .eq('booking_id', bookingId)
          .single()

        if (!data) {
          return { status: 'no_deposit', message: 'No deposit record found' }
        }

        return {
          amount: data.amount,
          status: data.status,
          claimedAmount: data.claimed_amount || 0,
          reason: data.claim_reason,
        }
      },
    }),

    getFAQAnswer: tool({
      description: 'Get answer to frequently asked questions about CAI Drive services',
      inputSchema: z.object({
        topic: z.enum([
          'cancellation_policy',
          'deposit_refund',
          'insurance_coverage',
          'delivery_options',
          'payment_methods',
          'driver_requirements',
          'damage_policy',
          'extension_policy',
          'fuel_policy',
          'contact_info',
        ]),
      }),
      execute: async ({ topic }) => {
        const faqs: Record<string, string> = {
          cancellation_policy: 'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours incur a 50% charge. No-shows are charged the full amount.',
          deposit_refund: 'Deposits are fully refundable within 3-5 business days after vehicle return, provided no damage or violations. Any claims will be deducted before refund.',
          insurance_coverage: 'Basic insurance is included with all rentals covering third-party liability. Premium insurance (AED 50/day) adds collision damage waiver. Full coverage (AED 100/day) includes zero excess.',
          delivery_options: 'Free pickup from our office locations. Delivery to your location is AED 100 within Dubai, AED 150 to other Emirates.',
          payment_methods: 'We accept all major credit cards, Apple Pay, and cash. Card required for deposit hold.',
          driver_requirements: 'Minimum age 21, valid UAE driving license or international permit, passport, and Emirates ID for residents.',
          damage_policy: 'Any damage must be reported immediately. Costs depend on insurance coverage. Photos are taken at handover and collection for documentation.',
          extension_policy: 'Extensions subject to availability. Contact us at least 24 hours before scheduled return. Same daily rate applies.',
          fuel_policy: 'Vehicles are provided with full tank. Return with full tank or pay refueling charge of AED 3/km for missing fuel.',
          contact_info: 'WhatsApp: +971 50 XXX XXXX, Email: support@caidrive.ae, Available 24/7',
        }
        return { answer: faqs[topic] }
      },
    }),

    sendStatusNotification: tool({
      description: 'Send a status update message to the chat as a system notification',
      inputSchema: z.object({
        status: z.string(),
        message: z.string(),
      }),
      execute: async ({ status, message }) => {
        if (roomId) {
          await supabase
            .from('chat_messages')
            .insert({
              room_id: roomId,
              sender_role: 'system',
              content: message,
              message_type: 'status_update',
              metadata: { status },
            })
        }
        return { sent: true }
      },
    }),
  }

  const systemPrompt = `You are CAI Drive's AI support assistant. You help users with their luxury car rental bookings in the UAE.

Your capabilities:
- Answer questions about bookings, status, and policies
- Provide driver and delivery information
- Check deposit status and explain charges
- Answer FAQs about services
- Escalate complex issues to human support when needed

Guidelines:
- Be professional, helpful, and concise
- Use AED for all prices
- If you don't know something specific to a booking, use the available tools to look it up
- For complaints or complex disputes, escalate to human support
- Always be empathetic when customers are frustrated
- Proactively provide relevant information based on booking status

${bookingContext}

Current chat participant role: ${userRole || 'user'}
${userRole === 'support' || userRole === 'admin' ? 'You have elevated permissions to update booking status and access all information.' : ''}
`

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-20250514',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse()
}
