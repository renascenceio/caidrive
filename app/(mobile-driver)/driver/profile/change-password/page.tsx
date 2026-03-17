"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      router.push("/driver/profile")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update password"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a2e]">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 pt-12">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Change password</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 py-6 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className={cn(
                "w-full px-4 py-4 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white placeholder:text-gray-500",
                "focus:outline-none focus:border-white/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showCurrent ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={cn(
                "w-full px-4 py-4 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white placeholder:text-gray-500",
                "focus:outline-none focus:border-white/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showNew ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={cn(
                "w-full px-4 py-4 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white placeholder:text-gray-500",
                "focus:outline-none focus:border-white/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showConfirm ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-8">
        <button
          onClick={handleSubmit}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-white",
            "bg-accent hover:bg-accent/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? "Updating..." : "Set password"}
        </button>
      </div>
    </div>
  )
}
