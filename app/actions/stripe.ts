"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

interface CreateCheckoutParams {
  vehicleId: string
  pickupDate: string
  returnDate: string
  totalPrice: number
  depositAmount: number
}

export async function createBookingCheckout({
  vehicleId,
  pickupDate,
  returnDate,
  totalPrice,
  depositAmount,
}: CreateCheckoutParams) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin") || "http://localhost:3000"

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to book a vehicle" }
  }

  // Get vehicle details
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*, companies(*)")
    .eq("id", vehicleId)
    .single()

  if (vehicleError || !vehicle) {
    return { error: "Vehicle not found" }
  }

  // Create pending booking in database
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      vehicle_id: vehicleId,
      company_id: vehicle.company_id,
      pickup_date: pickupDate,
      return_date: returnDate,
      total_price: totalPrice,
      deposit_paid: depositAmount,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single()

  if (bookingError || !booking) {
    return { error: "Failed to create booking" }
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${vehicle.brand} ${vehicle.model} Rental`,
              description: `${new Date(pickupDate).toLocaleDateString()} - ${new Date(returnDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Security Deposit (Refundable)",
              description: "Will be refunded after successful return",
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${origin}/cars/${vehicleId}?canceled=true`,
      metadata: {
        booking_id: booking.id,
        vehicle_id: vehicleId,
        user_id: user.id,
      },
    })

    // Update booking with payment intent
    await supabase
      .from("bookings")
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", booking.id)

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    // Delete the pending booking if Stripe session creation fails
    await supabase.from("bookings").delete().eq("id", booking.id)
    console.error("Stripe error:", error)
    return { error: "Failed to create checkout session" }
  }
}

export async function confirmBookingPayment(
  sessionId: string,
  bookingId: string
) {
  const supabase = await createClient()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      // Update booking status
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", bookingId)

      if (error) {
        return { error: "Failed to update booking status" }
      }

      // Update vehicle status to booked
      const { data: booking } = await supabase
        .from("bookings")
        .select("vehicle_id")
        .eq("id", bookingId)
        .single()

      if (booking) {
        await supabase
          .from("vehicles")
          .update({ status: "booked" })
          .eq("id", booking.vehicle_id)
      }

      // Create notification for user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Booking Confirmed",
          message: "Your car rental booking has been confirmed!",
          type: "booking",
        })
      }

      return { success: true }
    }

    return { error: "Payment not completed" }
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return { error: "Failed to confirm payment" }
  }
}

export async function createRefund(bookingId: string, reason: string) {
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("stripe_payment_intent_id, deposit_paid")
    .eq("id", bookingId)
    .single()

  if (error || !booking?.stripe_payment_intent_id) {
    return { error: "Booking not found or no payment associated" }
  }

  try {
    // Create refund for the deposit
    await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      amount: Math.round(booking.deposit_paid * 100),
      reason: "requested_by_customer",
    })

    // Update booking status
    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: "partially_refunded",
        notes: reason,
      })
      .eq("id", bookingId)

    return { success: true }
  } catch (error) {
    console.error("Refund error:", error)
    return { error: "Failed to process refund" }
  }
}
