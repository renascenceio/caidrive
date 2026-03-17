"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, Bell, Moon, Globe, Lock, Shield, ChevronRight, LogOut } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'en',
    biometricLogin: false
  })

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/mobile/login")
  }

  const SettingToggle = ({ 
    enabled, 
    onChange 
  }: { 
    enabled: boolean
    onChange: (val: boolean) => void 
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "w-12 h-7 rounded-full transition-colors",
        enabled ? "bg-accent" : "bg-secondary"
      )}
    >
      <div className={cn(
        "h-5 w-5 rounded-full bg-white shadow-sm transition-transform mx-1",
        enabled && "translate-x-5"
      )} />
    </button>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Notifications */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Notifications
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive booking updates</p>
                </div>
              </div>
              <SettingToggle 
                enabled={settings.pushNotifications}
                onChange={(val) => setSettings({ ...settings, pushNotifications: val })}
              />
            </div>
            <div className="h-px bg-border ml-[76px]" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receipts and updates</p>
                </div>
              </div>
              <SettingToggle 
                enabled={settings.emailNotifications}
                onChange={(val) => setSettings({ ...settings, emailNotifications: val })}
              />
            </div>
            <div className="h-px bg-border ml-[76px]" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Important alerts only</p>
                </div>
              </div>
              <SettingToggle 
                enabled={settings.smsNotifications}
                onChange={(val) => setSettings({ ...settings, smsNotifications: val })}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Appearance
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
              </div>
              <SettingToggle 
                enabled={settings.darkMode}
                onChange={(val) => setSettings({ ...settings, darkMode: val })}
              />
            </div>
            <div className="h-px bg-border ml-[76px]" />
            <button className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">English</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Security */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Security
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <button 
              onClick={() => router.push("/mobile/settings/change-password")}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="h-px bg-border ml-[76px]" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Biometric Login</p>
                  <p className="text-sm text-muted-foreground">Face ID / Touch ID</p>
                </div>
              </div>
              <SettingToggle 
                enabled={settings.biometricLogin}
                onChange={(val) => setSettings({ ...settings, biometricLogin: val })}
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
        >
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-red-500" />
          </div>
          <span className="font-medium text-red-500">Log Out</span>
        </button>
      </div>
    </div>
  )
}
