import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How do I book a car?',
    answer: 'Simply browse our collection, select your preferred car, choose your dates, and complete the booking. You can pay securely online and receive instant confirmation.'
  },
  {
    question: 'What documents do I need?',
    answer: 'You need a valid driving license (UAE or international), passport or Emirates ID, and a credit card for the deposit. Documents can be uploaded in your profile.'
  },
  {
    question: 'What is included in the rental price?',
    answer: 'Our prices include comprehensive insurance, 24/7 roadside assistance, and a set number of kilometers per day. Additional services like delivery can be added.'
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel free of charge up to 24 hours before pickup. Cancellations within 24 hours may incur a fee.'
  },
  {
    question: 'What happens if the car breaks down?',
    answer: 'We provide 24/7 roadside assistance. Simply call our support line and we will send help or a replacement vehicle immediately.'
  },
  {
    question: 'Is there a minimum age requirement?',
    answer: 'Yes, drivers must be at least 21 years old for standard cars and 25 for luxury and sports cars. Some premium vehicles may have higher age requirements.'
  },
  {
    question: 'How does the deposit work?',
    answer: 'A security deposit is pre-authorized on your credit card at pickup and released within 7-14 business days after the car is returned in good condition.'
  },
  {
    question: 'Can I extend my rental?',
    answer: 'Yes, you can extend your rental through the app or by contacting us, subject to availability. Additional charges will apply.'
  }
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Frequently Asked Questions</h1>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="rounded-xl border border-border bg-card px-4"
          >
            <AccordionTrigger className="text-left hover:no-underline py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 rounded-xl bg-muted/50 p-6 text-center">
        <p className="font-medium">Still have questions?</p>
        <p className="text-sm text-muted-foreground mt-1">
          Contact our support team for assistance
        </p>
        <Button className="mt-4">Contact Support</Button>
      </div>
    </div>
  )
}
