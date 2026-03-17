'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Calendar, ChevronDown, Upload, Camera, FileText, X, AlertCircle } from 'lucide-react'
import type { BookingData } from '../page'

interface DrivingLicenseStepProps {
  data: BookingData
  onChange: (updates: Partial<BookingData>) => void
  onNext: () => void
}

const COUNTRIES = [
  { code: 'US', name: 'United States of America', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
]

// Countries that require international license
const INTERNATIONAL_LICENSE_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'JP', 'KR', 'CN', 'BR']

export function DrivingLicenseStep({ data, onChange, onNext }: DrivingLicenseStepProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showInternationalModal, setShowInternationalModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCountry = COUNTRIES.find(c => c.name === data.licenseCountry) || COUNTRIES[0]
  const needsInternational = INTERNATIONAL_LICENSE_COUNTRIES.includes(selectedCountry.code)

  const isValid = data.licenseFirstName && data.licenseSurname && 
    data.licenseNumber && data.licenseExpiry && data.licenseCountry

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    onChange({ licenseCountry: country.name })
    setShowCountryPicker(false)
    
    // Show international license modal if needed
    if (INTERNATIONAL_LICENSE_COUNTRIES.includes(country.code)) {
      setShowInternationalModal(true)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onChange({ licenseImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="px-5 py-6 pb-36">
      <h2 className="font-semibold text-base mb-6">Driving License details</h2>

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Name</label>
          <input
            type="text"
            value={data.licenseFirstName}
            onChange={(e) => onChange({ licenseFirstName: e.target.value })}
            placeholder="Enter your name"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
          />
        </div>

        {/* Surname */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Surname</label>
          <input
            type="text"
            value={data.licenseSurname}
            onChange={(e) => onChange({ licenseSurname: e.target.value })}
            placeholder="Enter your surname"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
          />
        </div>

        {/* License Number */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Driving License Number</label>
          <input
            type="text"
            value={data.licenseNumber}
            onChange={(e) => onChange({ licenseNumber: e.target.value })}
            placeholder="AA1783585"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Address</label>
          <input
            type="text"
            value={data.licenseAddress}
            onChange={(e) => onChange({ licenseAddress: e.target.value })}
            placeholder="Enter your address"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Expiry Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={data.licenseExpiry}
              onChange={(e) => onChange({ licenseExpiry: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
            />
          </div>
        </div>

        {/* Country of Issue */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Country of Issue</label>
          <button
            onClick={() => setShowCountryPicker(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-border/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.name}</span>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Upload Driving License */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Upload your Driving License</label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {data.licenseImage ? (
            <div className="relative bg-white rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-secondary">
                  <Image
                    src={data.licenseImage}
                    alt="License"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">license_front.jpg</p>
                  <p className="text-xs text-muted-foreground">Uploaded successfully</p>
                </div>
                <button
                  onClick={() => onChange({ licenseImage: null })}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl border border-dashed border-border hover:border-foreground/50 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload a Photo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl border border-dashed border-border hover:border-foreground/50 transition-colors"
              >
                <Camera className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Take a Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* International License Warning */}
        {needsInternational && !data.isInternational && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">International license may be required</p>
              <p className="text-xs text-amber-700 mt-1">
                Some countries require an International Driving Permit. Please check local requirements.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-border/30 px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold">Select country</h3>
              <button onClick={() => setShowCountryPicker(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors",
                    data.licenseCountry === country.name && "bg-secondary/50"
                  )}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* International License Modal */}
      {showInternationalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">
              An international driving license is required for {selectedCountry.name}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              How can I obtain one?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onChange({ isInternational: true })
                  setShowInternationalModal(false)
                }}
                className="w-full py-3.5 bg-foreground text-background rounded-xl font-medium"
              >
                My license is International
              </button>
              <button
                onClick={() => setShowInternationalModal(false)}
                className="w-full py-3.5 bg-white border border-border rounded-xl font-medium"
              >
                I'll get one
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Button - Above bottom nav */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-[#f5f5f7] border-t border-border/30 px-5 py-4">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "w-full py-4 rounded-full font-semibold text-base transition-all",
            isValid
              ? "bg-foreground text-background"
              : "bg-foreground/30 text-background/50 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
