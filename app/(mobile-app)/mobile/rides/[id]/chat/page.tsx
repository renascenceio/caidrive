"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { UnifiedChat } from "@/components/chat/unified-chat"
import { createClient } from "@/lib/supabase/client"

interface BookingData {
  id: string
  status: string
  vehicle?: {
    brand: string
    model: string
  }
  start_date: string
  end_date: string
}

export default function RideChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<BookingData | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('bookings')
        .select('id, status, start_date, end_date, vehicle:vehicles(brand, model)')
        .eq('id', bookingId)
        .single()
      
      if (data) {
        setBooking(data as BookingData)
      }
    }
    fetchBooking()
  }, [bookingId])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {booking?.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : 'Ride Support'}
          </h1>
          {booking && (
            <p className="text-xs text-muted-foreground">
              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Chat with Status Timeline */}
      <UnifiedChat
        bookingId={bookingId}
        userRole="user"
        showHeader={false}
        showStatusTimeline={true}
        className="flex-1"
      />
    </div>
  )
}
