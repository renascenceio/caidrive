export type UserRole = 'user' | 'business' | 'driver' | 'admin'
export type VehicleStatus = 'available' | 'booked' | 'maintenance' | 'retired'
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded'
export type DocumentType = 'driving_license' | 'passport' | 'international_license'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type PaymentMethodType = 'card' | 'paypal' | 'apple_pay' | 'samsung_pay' | 'crypto'
export type PlaceCategory = 'restaurant' | 'hotel' | 'attraction' | 'gas_station'
export type DriverStatus = 'available' | 'on_trip' | 'off_duty'
export type NotificationType = 'booking' | 'payment' | 'promotion' | 'system'
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          country: string | null
          role: UserRole
          level: number
          total_km_traveled: number
          bonus_km: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          country?: string | null
          role?: UserRole
          level?: number
          total_km_traveled?: number
          bonus_km?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          country?: string | null
          role?: UserRole
          level?: number
          total_km_traveled?: number
          bonus_km?: number
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          owner_id: string
          subscription_tier: SubscriptionTier
          stripe_account_id: string | null
          is_verified: boolean
          description: string | null
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          owner_id: string
          subscription_tier?: SubscriptionTier
          stripe_account_id?: string | null
          is_verified?: boolean
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          owner_id?: string
          subscription_tier?: SubscriptionTier
          stripe_account_id?: string | null
          is_verified?: boolean
          description?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          company_id: string
          brand: string
          model: string
          year: number
          images: string[]
          max_speed: number | null
          acceleration: number | null
          power: number | null
          seats: number
          price_per_day: number
          deposit_amount: number
          rating: number
          review_count: number
          status: VehicleStatus
          features: string[]
          license_plate: string | null
          color: string | null
          fuel_type: string | null
          transmission: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          brand: string
          model: string
          year: number
          images?: string[]
          max_speed?: number | null
          acceleration?: number | null
          power?: number | null
          seats?: number
          price_per_day: number
          deposit_amount?: number
          rating?: number
          review_count?: number
          status?: VehicleStatus
          features?: string[]
          license_plate?: string | null
          color?: string | null
          fuel_type?: string | null
          transmission?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          brand?: string
          model?: string
          year?: number
          images?: string[]
          max_speed?: number | null
          acceleration?: number | null
          power?: number | null
          seats?: number
          price_per_day?: number
          deposit_amount?: number
          rating?: number
          review_count?: number
          status?: VehicleStatus
          features?: string[]
          license_plate?: string | null
          color?: string | null
          fuel_type?: string | null
          transmission?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          company_id: string
          driver_id: string | null
          pickup_date: string
          return_date: string
          pickup_location: Record<string, unknown> | null
          return_location: Record<string, unknown> | null
          total_price: number
          deposit_paid: number
          discount_code: string | null
          discount_amount: number
          status: BookingStatus
          payment_status: PaymentStatus
          stripe_payment_intent_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          company_id: string
          driver_id?: string | null
          pickup_date: string
          return_date: string
          pickup_location?: Record<string, unknown> | null
          return_location?: Record<string, unknown> | null
          total_price: number
          deposit_paid?: number
          discount_code?: string | null
          discount_amount?: number
          status?: BookingStatus
          payment_status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          company_id?: string
          driver_id?: string | null
          pickup_date?: string
          return_date?: string
          pickup_location?: Record<string, unknown> | null
          return_location?: Record<string, unknown> | null
          total_price?: number
          deposit_paid?: number
          discount_code?: string | null
          discount_amount?: number
          status?: BookingStatus
          payment_status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          type: DocumentType
          front_image_url: string | null
          back_image_url: string | null
          expiry_date: string | null
          verification_status: VerificationStatus
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: DocumentType
          front_image_url?: string | null
          back_image_url?: string | null
          expiry_date?: string | null
          verification_status?: VerificationStatus
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: DocumentType
          front_image_url?: string | null
          back_image_url?: string | null
          expiry_date?: string | null
          verification_status?: VerificationStatus
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          booking_id: string | null
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          booking_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          booking_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: PaymentMethodType
          stripe_payment_method_id: string | null
          last_four: string | null
          brand: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: PaymentMethodType
          stripe_payment_method_id?: string | null
          last_four?: string | null
          brand?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: PaymentMethodType
          stripe_payment_method_id?: string | null
          last_four?: string | null
          brand?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      places: {
        Row: {
          id: string
          company_id: string | null
          name: string
          category: PlaceCategory
          description: string | null
          image_url: string | null
          discount_percent: number
          location: Record<string, unknown> | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          name: string
          category: PlaceCategory
          description?: string | null
          image_url?: string | null
          discount_percent?: number
          location?: Record<string, unknown> | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          name?: string
          category?: PlaceCategory
          description?: string | null
          image_url?: string | null
          discount_percent?: number
          location?: Record<string, unknown> | null
          address?: string | null
          created_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          user_id: string
          company_id: string
          license_number: string | null
          status: DriverStatus
          assigned_vehicle_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          license_number?: string | null
          status?: DriverStatus
          assigned_vehicle_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          license_number?: string | null
          status?: DriverStatus
          assigned_vehicle_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      support_messages: {
        Row: {
          id: string
          user_id: string
          agent_id: string | null
          booking_id: string | null
          message: string
          sender_type: 'user' | 'agent' | 'system'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id?: string | null
          booking_id?: string | null
          message: string
          sender_type: 'user' | 'agent' | 'system'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string | null
          booking_id?: string | null
          message?: string
          sender_type?: 'user' | 'agent' | 'system'
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      vehicle_status: VehicleStatus
      booking_status: BookingStatus
      payment_status: PaymentStatus
      document_type: DocumentType
      verification_status: VerificationStatus
      payment_method_type: PaymentMethodType
      place_category: PlaceCategory
      driver_status: DriverStatus
      notification_type: NotificationType
      subscription_tier: SubscriptionTier
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type Place = Database['public']['Tables']['places']['Row']
export type Driver = Database['public']['Tables']['drivers']['Row']
export type SupportMessage = Database['public']['Tables']['support_messages']['Row']

// Extended types with relations
export type VehicleWithCompany = Vehicle & {
  company: Company
}

export type BookingWithDetails = Booking & {
  vehicle: Vehicle
  company: Company
  user: Profile
  driver?: Profile | null
}

export type ReviewWithUser = Review & {
  user: Profile
}
