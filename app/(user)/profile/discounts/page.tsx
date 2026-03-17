import Link from 'next/link'
import { ChevronLeft, Gift, Percent, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DiscountsPage() {
  const offers = [
    {
      id: 1,
      title: 'Welcome Bonus',
      description: 'Get 10% off your first booking',
      code: 'WELCOME10',
      expires: 'Dec 31, 2024',
      discount: '10%'
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Book for the weekend and save',
      code: 'WEEKEND15',
      expires: 'Ongoing',
      discount: '15%'
    }
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Discounts & Offers</h1>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                  <Percent className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{offer.title}</h3>
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-accent">{offer.discount}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="rounded-lg bg-background px-3 py-1.5 font-mono text-sm">
                {offer.code}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {offer.expires}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Gift className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          More offers coming soon! Keep booking to unlock exclusive discounts.
        </p>
      </div>
    </div>
  )
}
