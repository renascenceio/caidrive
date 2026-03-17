import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAILS = ['aslan@caidrive.com', 'aslan@renascene.io']

// Sample vehicles data
const SAMPLE_VEHICLES = [
  {
    brand: 'Lamborghini',
    model: 'Huracán EVO',
    year: 2024,
    images: ['/cars/lamborghini-huracan.jpg'],
    max_speed: 325,
    acceleration: 2.9,
    power: 640,
    seats: 2,
    price_per_day: 2500,
    deposit_amount: 10000,
    rating: 4.9,
    review_count: 47,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'Carbon Fiber Interior', 'Sport Mode'],
    color: 'Yellow',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'Ferrari',
    model: '488 GTB',
    year: 2023,
    images: ['/cars/ferrari-488.jpg'],
    max_speed: 330,
    acceleration: 3.0,
    power: 670,
    seats: 2,
    price_per_day: 2800,
    deposit_amount: 12000,
    rating: 4.8,
    review_count: 32,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'Racing Seats', 'Launch Control'],
    color: 'Red',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'Porsche',
    model: '911 Turbo S',
    year: 2024,
    images: ['/cars/porsche-911.jpg'],
    max_speed: 330,
    acceleration: 2.7,
    power: 650,
    seats: 4,
    price_per_day: 1800,
    deposit_amount: 8000,
    rating: 4.9,
    review_count: 56,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'Sport Chrono', 'PASM'],
    color: 'White',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'AMG GT',
    year: 2024,
    images: ['/cars/mercedes-amg-gt.jpg'],
    max_speed: 318,
    acceleration: 3.2,
    power: 585,
    seats: 2,
    price_per_day: 1500,
    deposit_amount: 6000,
    rating: 4.7,
    review_count: 28,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'Burmester Sound', 'AMG Performance'],
    color: 'Silver',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'BMW',
    model: 'M8 Competition',
    year: 2024,
    images: ['/cars/bmw-m8.jpg'],
    max_speed: 305,
    acceleration: 3.2,
    power: 625,
    seats: 4,
    price_per_day: 1200,
    deposit_amount: 5000,
    rating: 4.6,
    review_count: 41,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'M Sport Differential', 'Head-up Display'],
    color: 'Black',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'Rolls-Royce',
    model: 'Ghost',
    year: 2024,
    images: ['/cars/rolls-royce-ghost.jpg'],
    max_speed: 250,
    acceleration: 4.8,
    power: 571,
    seats: 5,
    price_per_day: 3500,
    deposit_amount: 15000,
    rating: 5.0,
    review_count: 19,
    status: 'available',
    features: ['GPS', 'Massage Seats', 'Starlight Headliner', 'Champagne Cooler'],
    color: 'Black',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'Bentley',
    model: 'Continental GT',
    year: 2024,
    images: ['/cars/bentley-continental.jpg'],
    max_speed: 333,
    acceleration: 3.6,
    power: 659,
    seats: 4,
    price_per_day: 2200,
    deposit_amount: 9000,
    rating: 4.8,
    review_count: 23,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'Naim Audio', 'Rotating Display'],
    color: 'Blue',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
  {
    brand: 'Aston Martin',
    model: 'DB11',
    year: 2024,
    images: ['/cars/aston-martin-db11.jpg'],
    max_speed: 322,
    acceleration: 3.9,
    power: 639,
    seats: 4,
    price_per_day: 1900,
    deposit_amount: 7500,
    rating: 4.7,
    review_count: 15,
    status: 'available',
    features: ['GPS', 'Bluetooth', 'Bang & Olufsen', 'Sport Plus Mode'],
    color: 'Green',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
  },
]

const SAMPLE_DRIVERS = [
  { full_name: 'Ahmed Al-Rashid', phone: '+971501234567', license_number: 'DRV-001' },
  { full_name: 'Mohammed Hassan', phone: '+971502345678', license_number: 'DRV-002' },
  { full_name: 'Khalid Omar', phone: '+971503456789', license_number: 'DRV-003' },
  { full_name: 'Saeed Abdullah', phone: '+971504567890', license_number: 'DRV-004' },
  { full_name: 'Yusuf Ibrahim', phone: '+971505678901', license_number: 'DRV-005' },
]

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Verify admin user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action } = await request.json()

  // Get or create company for admin
  let { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!company) {
    // Create company for admin
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'CaiDrive Premium',
        owner_id: user.id,
        subscription_tier: 'enterprise',
        is_verified: true,
        description: 'Premium luxury car rentals in Dubai',
        address: 'Dubai, UAE',
        phone: '+971501234567',
        email: ADMIN_EMAIL,
      })
      .select()
      .single()

    if (companyError) {
      return NextResponse.json({ error: 'Failed to create company', details: companyError.message }, { status: 500 })
    }
    company = newCompany
  }

  if (action === 'seed_vehicles') {
    // Clear existing vehicles for this company
    await supabase.from('vehicles').delete().eq('company_id', company.id)

    // Insert sample vehicles
    const vehiclesWithCompany = SAMPLE_VEHICLES.map(v => ({
      ...v,
      company_id: company.id,
    }))

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .insert(vehiclesWithCompany)
      .select()

    if (error) {
      return NextResponse.json({ error: 'Failed to seed vehicles', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${vehicles.length} vehicles`,
      vehicles 
    })
  }

  if (action === 'seed_drivers') {
    // Clear existing drivers for this company
    await supabase.from('drivers').delete().eq('company_id', company.id)

    // Create driver profiles and link to company
    const driverResults = []
    for (const driver of SAMPLE_DRIVERS) {
      // Create a profile entry (simulated - in real app would create auth user)
      const driverId = crypto.randomUUID()
      
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: user.id, // Link to admin for now
          company_id: company.id,
          license_number: driver.license_number,
          status: 'available',
        })

      if (!driverError) {
        driverResults.push(driver)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${driverResults.length} drivers`,
      drivers: driverResults 
    })
  }

  if (action === 'flush_vehicles') {
    const { error } = await supabase.from('vehicles').delete().eq('company_id', company.id)
    if (error) {
      return NextResponse.json({ error: 'Failed to flush vehicles', details: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'All vehicles removed' })
  }

  if (action === 'flush_drivers') {
    const { error } = await supabase.from('drivers').delete().eq('company_id', company.id)
    if (error) {
      return NextResponse.json({ error: 'Failed to flush drivers', details: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'All drivers removed' })
  }

  if (action === 'flush_bookings') {
    const { error } = await supabase.from('bookings').delete().eq('company_id', company.id)
    if (error) {
      return NextResponse.json({ error: 'Failed to flush bookings', details: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'All bookings removed' })
  }

  if (action === 'flush_all') {
    // Delete in order due to foreign keys
    await supabase.from('bookings').delete().eq('company_id', company.id)
    await supabase.from('drivers').delete().eq('company_id', company.id)
    await supabase.from('vehicles').delete().eq('company_id', company.id)
    
    return NextResponse.json({ success: true, message: 'All data flushed' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function GET() {
  const supabase = await createClient()
  
  // Verify admin user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get company stats
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!company) {
    return NextResponse.json({ 
      hasCompany: false,
      vehicleCount: 0,
      driverCount: 0,
      bookingCount: 0,
    })
  }

  const [vehicles, drivers, bookings] = await Promise.all([
    supabase.from('vehicles').select('id', { count: 'exact' }).eq('company_id', company.id),
    supabase.from('drivers').select('id', { count: 'exact' }).eq('company_id', company.id),
    supabase.from('bookings').select('id', { count: 'exact' }).eq('company_id', company.id),
  ])

  return NextResponse.json({
    hasCompany: true,
    companyId: company.id,
    vehicleCount: vehicles.count || 0,
    driverCount: drivers.count || 0,
    bookingCount: bookings.count || 0,
  })
}
