"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UserRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions")
      return
    }
    
    setLoading(true)
    setError("")
    
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone
        }
      }
    })
    
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    
    if (data.user) {
      // Create profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        role: 'user'
      })
      
      router.push("/app/onboarding")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="p-2 rounded-full hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Create Account</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-6 mb-6">
        {[1, 2].map((s) => (
          <div 
            key={s}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              s <= step ? "bg-accent" : "bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        {step === 1 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Enter your details to get started</p>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className={cn(
                    "w-full px-4 py-3.5 rounded-xl",
                    "bg-secondary/50 border border-border",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-accent/50"
                  )}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className={cn(
                    "w-full px-4 py-3.5 rounded-xl",
                    "bg-secondary/50 border border-border",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-accent/50"
                  )}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <div className="flex gap-2">
                  <select className="px-3 py-3.5 rounded-xl bg-secondary/50 border border-border text-foreground">
                    <option>+971</option>
                    <option>+1</option>
                    <option>+44</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className={cn(
                      "flex-1 px-4 py-3.5 rounded-xl",
                      "bg-secondary/50 border border-border",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-accent/50"
                    )}
                    required
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.fullName || !formData.email || !formData.phone}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold mt-4",
                  "bg-accent text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98]"
                )}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Set Your Password</h2>
              <p className="text-muted-foreground">Create a secure password for your account</p>
            </div>

            <div className="space-y-5">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className={cn(
                      "w-full px-4 py-3.5 pr-12 rounded-xl",
                      "bg-secondary/50 border border-border",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-accent/50"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className={cn(
                      "w-full px-4 py-3.5 pr-12 rounded-xl",
                      "bg-secondary/50 border border-border",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-accent/50"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Password must contain:</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-4 w-4 rounded-full flex items-center justify-center text-xs",
                    formData.password.length >= 8 ? "bg-green-500 text-white" : "bg-secondary"
                  )}>
                    {formData.password.length >= 8 && <Check className="h-3 w-3" />}
                  </div>
                  <span className={formData.password.length >= 8 ? "text-foreground" : "text-muted-foreground"}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-4 w-4 rounded-full flex items-center justify-center text-xs",
                    /[A-Z]/.test(formData.password) ? "bg-green-500 text-white" : "bg-secondary"
                  )}>
                    {/[A-Z]/.test(formData.password) && <Check className="h-3 w-3" />}
                  </div>
                  <span className={/[A-Z]/.test(formData.password) ? "text-foreground" : "text-muted-foreground"}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-4 w-4 rounded-full flex items-center justify-center text-xs",
                    /[0-9]/.test(formData.password) ? "bg-green-500 text-white" : "bg-secondary"
                  )}>
                    {/[0-9]/.test(formData.password) && <Check className="h-3 w-3" />}
                  </div>
                  <span className={/[0-9]/.test(formData.password) ? "text-foreground" : "text-muted-foreground"}>
                    One number
                  </span>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div 
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={cn(
                    "h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0",
                    agreedToTerms ? "bg-accent border-accent" : "border-muted-foreground"
                  )}
                >
                  {agreedToTerms && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-accent">Privacy Policy</Link>
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold",
                  "bg-accent text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98]"
                )}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        {/* Login Link */}
        <p className="text-center mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link href="/app/login" className="text-accent font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
