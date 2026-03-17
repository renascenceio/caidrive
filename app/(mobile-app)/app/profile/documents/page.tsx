"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, Camera, FileText, CheckCircle, Clock, AlertCircle, Upload, X, ChevronRight } from "lucide-react"

interface Document {
  type: string
  status: 'pending' | 'verified' | 'rejected' | 'not_uploaded'
  url?: string
  expiry_date?: string
}

const documentTypes = [
  { id: 'emirates_id', name: 'Emirates ID', description: 'Front and back of your Emirates ID', required: true },
  { id: 'passport', name: 'Passport', description: 'Photo page of your passport', required: true },
  { id: 'driving_license', name: 'Driving License', description: 'Valid UAE or international license', required: true },
  { id: 'visa', name: 'UAE Visa', description: 'Valid residence visa (if applicable)', required: false }
]

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Record<string, Document>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/app/login")
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('documents')
        .eq('id', user.id)
        .single()

      if (profile?.documents) {
        setDocuments(profile.documents as Record<string, Document>)
      }
    }
    fetchDocuments()
  }, [router])

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${docType}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error(uploadError)
      setUploading(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    const updatedDocs = {
      ...documents,
      [docType]: {
        type: docType,
        status: 'pending' as const,
        url: publicUrl
      }
    }

    await supabase
      .from('profiles')
      .update({ documents: updatedDocs })
      .eq('id', user.id)

    setDocuments(updatedDocs)
    setUploading(null)
    setSelectedDoc(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedDoc) {
      handleUpload(selectedDoc, file)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Upload className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified'
      case 'pending':
        return 'Under Review'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Not Uploaded'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-500 bg-green-500/10'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'rejected':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-muted-foreground bg-secondary'
    }
  }

  const verifiedCount = Object.values(documents).filter(d => d.status === 'verified').length
  const requiredCount = documentTypes.filter(d => d.required).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">My Documents</h1>
      </div>

      {/* Progress */}
      <div className="p-6 bg-secondary/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Verification Progress</span>
          <span className="text-sm text-muted-foreground">{verifiedCount}/{requiredCount} required</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${(verifiedCount / requiredCount) * 100}%` }}
          />
        </div>
        {verifiedCount === requiredCount ? (
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            All required documents verified
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            Complete document verification to book cars
          </p>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 p-4 space-y-3">
        {documentTypes.map((docType) => {
          const doc = documents[docType.id]
          const status = doc?.status || 'not_uploaded'
          
          return (
            <button
              key={docType.id}
              onClick={() => {
                setSelectedDoc(docType.id)
                fileInputRef.current?.click()
              }}
              disabled={uploading === docType.id}
              className={cn(
                "w-full p-4 rounded-2xl border border-border bg-card",
                "flex items-center gap-4 text-left",
                "hover:bg-secondary/30 transition-colors",
                "disabled:opacity-50"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                status === 'verified' ? "bg-green-500/10" : "bg-secondary"
              )}>
                {doc?.url ? (
                  <FileText className={cn(
                    "h-6 w-6",
                    status === 'verified' ? "text-green-500" : "text-muted-foreground"
                  )} />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{docType.name}</span>
                  {docType.required && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{docType.description}</p>
              </div>

              {uploading === docType.id ? (
                <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-lg font-medium",
                    getStatusColor(status)
                  )}>
                    {getStatusText(status)}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Info */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Documents are reviewed within 24-48 hours. You will be notified once verification is complete.
        </p>
      </div>
    </div>
  )
}
