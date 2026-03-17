import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Retrieve user's saved details
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try to get from user_saved_details table first
  const { data: savedDetails } = await supabase
    .from('user_saved_details')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (savedDetails) {
    return NextResponse.json({
      hasSavedDetails: true,
      details: {
        // Driving License
        licenseFirstName: savedDetails.license_first_name || '',
        licenseSurname: savedDetails.license_surname || '',
        licenseNumber: savedDetails.license_number || '',
        licenseAddress: savedDetails.license_address || '',
        licenseExpiry: savedDetails.license_expiry || '',
        licenseCountry: savedDetails.license_country || 'United States of America',
        licenseImage: savedDetails.license_image_url || null,
        isInternational: savedDetails.is_international_license || false,
        // Passport
        passportFirstName: savedDetails.passport_first_name || '',
        passportSurname: savedDetails.passport_surname || '',
        passportNumber: savedDetails.passport_number || '',
        passportCountry: savedDetails.passport_country || 'United States of America',
        passportExpiry: savedDetails.passport_expiry || '',
        passportImage: savedDetails.passport_image_url || null,
        // Payment
        preferredPaymentMethod: savedDetails.preferred_payment_method || 'card',
      }
    })
  }

  // No saved details found
  return NextResponse.json({
    hasSavedDetails: false,
    details: null
  })
}

// POST - Save user's details after successful booking
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      licenseFirstName,
      licenseSurname,
      licenseNumber,
      licenseAddress,
      licenseExpiry,
      licenseCountry,
      licenseImage,
      isInternational,
      passportFirstName,
      passportSurname,
      passportNumber,
      passportCountry,
      passportExpiry,
      passportImage,
      paymentMethod,
    } = body

    // Upsert user saved details
    const { error } = await supabase
      .from('user_saved_details')
      .upsert({
        user_id: user.id,
        license_first_name: licenseFirstName,
        license_surname: licenseSurname,
        license_number: licenseNumber,
        license_address: licenseAddress,
        license_expiry: licenseExpiry || null,
        license_country: licenseCountry,
        license_image_url: licenseImage,
        is_international_license: isInternational,
        passport_first_name: passportFirstName,
        passport_surname: passportSurname,
        passport_number: passportNumber,
        passport_country: passportCountry,
        passport_expiry: passportExpiry || null,
        passport_image_url: passportImage,
        preferred_payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error saving user details:', error)
      return NextResponse.json({ error: 'Failed to save details' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/saved-details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
