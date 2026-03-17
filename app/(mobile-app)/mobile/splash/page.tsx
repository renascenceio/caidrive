"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function SplashPage() {
  const router = useRouter()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Auto redirect after animation
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        router.push('/mobile')
      }, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className={cn(
      "fixed inset-0 bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-500",
      fadeOut && "opacity-0"
    )}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"
          alt="Sports car on road"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Tire tracks decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,50 Q100,30 200,50 T400,50"
            fill="none"
            stroke="#333"
            strokeWidth="20"
            strokeDasharray="5,5"
          />
          <path
            d="M0,70 Q100,50 200,70 T400,70"
            fill="none"
            stroke="#333"
            strokeWidth="20"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      {/* Logo and Brand */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        {/* CAI Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-3xl tracking-tight">CAI</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-white text-2xl font-light tracking-[0.3em] mb-2">CAI</h1>
        <p className="text-white/70 text-sm tracking-[0.2em] uppercase">Keeper of the Keys</p>

        {/* Loading indicator */}
        <div className="mt-12 flex gap-1">
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
