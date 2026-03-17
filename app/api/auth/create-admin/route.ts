import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint creates test users with different roles
// It should only be used for initial setup
export async function POST(request: Request) {
  try {
    const { email, password, secretKey, role = 'admin', fullName } = await request.json()

    // Simple protection - require a secret key
    if (secretKey !== process.env.ADMIN_SETUP_KEY && secretKey !== 'cai-admin-setup-2024') {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 401 }
      )
    }

    // Validate role
    const validRoles = ['user', 'business', 'driver', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: user, business, driver, admin' },
        { status: 400 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const displayName = fullName || (role === 'admin' ? 'Super Admin' : role === 'business' ? 'CAI Premium Motors' : 'CAI User')

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUsers?.users?.some(u => u.email === email)
    
    if (userExists) {
      // Update existing user's password and role
      const existingUser = existingUsers?.users?.find(u => u.email === email)
      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: password,
          user_metadata: { role: role, full_name: displayName }
        })

        // Update profile
        await supabaseAdmin.from('profiles').upsert({
          id: existingUser.id,
          email: email,
          full_name: displayName,
          role: role
        })

        // If business role, create/update company
        if (role === 'business') {
          await supabaseAdmin.from('companies').upsert({
            id: '11111111-1111-1111-1111-111111111111',
            name: 'CAI Premium Motors',
            owner_id: existingUser.id,
            subscription_tier: 'enterprise',
            is_verified: true,
            description: 'Dubai\'s premier luxury car rental service',
            address: 'Dubai Marina, Dubai, UAE',
            phone: '+971 4 123 4567',
            email: email
          })
        }

        return NextResponse.json({
          success: true,
          message: `${role.charAt(0).toUpperCase() + role.slice(1)} account updated successfully. You can now login.`,
          userId: existingUser.id
        })
      }
    }

    // Create new user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: role,
        full_name: displayName
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Create profile
      await supabaseAdmin.from('profiles').upsert({
        id: authData.user.id,
        email: email,
        full_name: displayName,
        role: role
      })

      // If business role, create company
      if (role === 'business') {
        await supabaseAdmin.from('companies').upsert({
          id: '11111111-1111-1111-1111-111111111111',
          name: 'CAI Premium Motors',
          owner_id: authData.user.id,
          subscription_tier: 'enterprise',
          is_verified: true,
          description: 'Dubai\'s premier luxury car rental service',
          address: 'Dubai Marina, Dubai, UAE',
          phone: '+971 4 123 4567',
          email: email
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully. You can now login.`,
      userId: authData.user?.id
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
