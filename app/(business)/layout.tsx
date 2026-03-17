import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BusinessSidebar } from '@/components/business/sidebar'
import { BusinessHeader } from '@/components/business/header'

async function getBusinessUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Get company owned by this user
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return { ...profile, company }
}

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getBusinessUser()

  if (!profile) {
    redirect('/auth/login?redirect=/business')
  }

  if (profile.role !== 'business' && profile.role !== 'admin') {
    redirect('/?error=unauthorized')
  }

  // If no company, allow access to onboarding page
  if (!profile.company) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-secondary/30 dark:bg-background">
      <BusinessSidebar 
        company={profile.company} 
        userName={profile.full_name || 'User'}
        lastLogin={profile.last_login_at}
      />
      <div className="flex flex-1 flex-col lg:pl-64">
        <BusinessHeader profile={profile} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
