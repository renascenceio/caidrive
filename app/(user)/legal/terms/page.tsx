import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Terms & Conditions</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: January 2024</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to CAI Drive. These terms and conditions outline the rules and regulations 
          for the use of our car rental services and platform.
        </p>

        <h2>2. Rental Agreement</h2>
        <p>
          By booking a vehicle through CAI Drive, you agree to be bound by these terms. 
          You must be at least 21 years of age and hold a valid driving license to rent a vehicle.
        </p>

        <h2>3. Booking and Payment</h2>
        <p>
          All bookings are subject to vehicle availability. Payment is required at the time of booking. 
          A security deposit will be pre-authorized on your credit card at pickup.
        </p>

        <h2>4. Cancellation Policy</h2>
        <p>
          Free cancellation is available up to 24 hours before the scheduled pickup time. 
          Cancellations within 24 hours may be subject to a cancellation fee.
        </p>

        <h2>5. Insurance and Liability</h2>
        <p>
          All rentals include comprehensive insurance coverage. However, the renter is responsible 
          for any damage resulting from negligence, violation of traffic laws, or use under the 
          influence of alcohol or drugs.
        </p>

        <h2>6. Vehicle Use</h2>
        <p>
          Vehicles must be used in accordance with UAE traffic laws. Off-road driving, racing, 
          or use outside the UAE without prior authorization is prohibited.
        </p>

        <h2>7. Return Conditions</h2>
        <p>
          Vehicles must be returned at the agreed time and location with the same fuel level as 
          at pickup. Late returns may incur additional charges.
        </p>

        <h2>8. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy to understand how 
          we collect, use, and protect your personal information.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of our services 
          after changes constitutes acceptance of the new terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          If you have any questions about these Terms & Conditions, please contact us at 
          support@caidrive.com
        </p>
      </div>
    </div>
  )
}
