import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  User, FileText, CreditCard, Bell, Shield, HelpCircle, 
  LogOut, ChevronRight, Star, Route, Gift, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export default async function ProfilePage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', href: '/profile/edit' },
        { icon: FileText, label: 'My Documents', href: '/profile/documents', badge: profile.role === 'user' ? 'Required' : undefined },
        { icon: CreditCard, label: 'Payment Methods', href: '/profile/payment-methods' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
      ]
    },
    {
      title: 'Reviews & Rewards',
      items: [
        { icon: Star, label: 'My Reviews', href: '/profile/reviews' },
        { icon: Gift, label: 'Discounts & Offers', href: '/profile/discounts' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'FAQ', href: '/faq' },
        { icon: Shield, label: 'Terms & Conditions', href: '/legal/terms' },
        { icon: Settings, label: 'Settings', href: '/profile/settings' },
      ]
    }
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || 'Profile'} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <Link href="/profile/edit">
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <h1 className="mt-4 text-xl font-bold">{profile.full_name || 'Guest User'}</h1>
        <p className="text-sm text-muted-foreground">{profile.email}</p>

        {/* Stats */}
        <div className="mt-6 flex w-full max-w-xs justify-around rounded-xl bg-card p-4">
          <div className="text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-accent/20">
              <Star className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-2 text-lg font-bold">{profile.level || 1}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <Separator orientation="vertical" className="h-auto" />
          <div className="text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-accent/20">
              <Route className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-2 text-lg font-bold">{profile.total_km_traveled || 0}</p>
            <p className="text-xs text-muted-foreground">Total km</p>
          </div>
          <Separator orientation="vertical" className="h-auto" />
          <div className="text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-accent/20">
              <Gift className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-2 text-lg font-bold">{profile.bonus_km || 0}</p>
            <p className="text-xs text-muted-foreground">Bonus km</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="mt-8 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
              {section.title}
            </h2>
            <div className="rounded-xl bg-card overflow-hidden">
              {section.items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <form action={signOut}>
          <Button 
            type="submit"
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl bg-card p-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </form>
      </div>

      {/* App Version */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Cai Drive v1.0.0
      </p>
    </div>
  )
}
