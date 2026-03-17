"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Car, MapPin, CreditCard, Shield, ArrowRight } from "lucide-react"

const slides = [
  {
    icon: Car,
    title: "Premium Car Rentals",
    description: "Access a fleet of luxury and exotic vehicles at your fingertips",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop"
  },
  {
    icon: MapPin,
    title: "Door-to-Door Delivery",
    description: "We deliver the car to your location and pick it up when you're done",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop"
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Secure payments with multiple options including Apple Pay and cards",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&auto=format&fit=crop"
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "Comprehensive insurance coverage for your peace of mind",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop"
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      router.push("/app")
    }
  }

  const handleSkip = () => {
    router.push("/app")
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button 
          onClick={handleSkip}
          className="text-sm text-muted-foreground font-medium"
        >
          Skip
        </button>
      </div>

      {/* Image */}
      <div className="relative h-[45vh] mx-6 rounded-3xl overflow-hidden">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <Icon className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">CAI Drive</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-8">
        <h1 className="text-3xl font-bold mb-3">{slide.title}</h1>
        <p className="text-lg text-muted-foreground mb-8">{slide.description}</p>

        {/* Dots */}
        <div className="flex items-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide ? "w-8 bg-accent" : "w-2 bg-secondary"
              )}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Button */}
        <button
          onClick={handleNext}
          className={cn(
            "w-full py-4 rounded-xl font-semibold mb-8",
            "bg-accent text-white",
            "flex items-center justify-center gap-2",
            "transition-all active:scale-[0.98]"
          )}
        >
          <span>{currentSlide === slides.length - 1 ? "Get Started" : "Next"}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
