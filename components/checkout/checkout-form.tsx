"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createBookingCheckout } from "@/app/actions/stripe"
import { toast } from "sonner"
import { Loader2, CreditCard, Shield } from "lucide-react"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface CheckoutFormProps {
  vehicle: {
    id: string
    brand: string
    model: string
    price_per_day: number
    deposit_amount: number
    images: string[]
  }
  pickupDate: Date
  returnDate: Date
}

export function CheckoutForm({ vehicle, pickupDate, returnDate }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)

  const days = Math.ceil(
    (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const rentalPrice = vehicle.price_per_day * days
  const depositAmount = vehicle.deposit_amount || 500
  const total = rentalPrice + depositAmount

  async function handleCheckout() {
    setLoading(true)

    try {
      const result = await createBookingCheckout({
        vehicleId: vehicle.id,
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
        totalPrice: rentalPrice,
        depositAmount: depositAmount,
      })

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Info */}
        <div className="flex gap-4">
          <div className="h-20 w-28 rounded-lg bg-muted overflow-hidden">
            {vehicle.images?.[0] && (
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground">
              {pickupDate.toLocaleDateString()} - {returnDate.toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">{days} days</p>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Rental ({days} days x ${vehicle.price_per_day})
            </span>
            <span className="text-foreground">${rentalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Security Deposit (Refundable)
            </span>
            <span className="text-foreground">${depositAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Total */}
        <div className="flex justify-between font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-accent">${total.toFixed(2)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          The security deposit will be fully refunded after the vehicle is
          returned in good condition.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${total.toFixed(2)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
