'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, FileText, Upload, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    async function loadDocuments() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)

      setDocuments(data || [])
      setLoading(false)
    }
    loadDocuments()
  }, [])

  const documentTypes = [
    { type: 'driving_license', label: 'Driving License', required: true },
    { type: 'passport', label: 'Passport', required: false },
    { type: 'international_license', label: 'International License', required: false }
  ]

  const getStatus = (type: string) => {
    const doc = documents.find(d => d.type === type)
    if (!doc) return 'missing'
    return doc.verification_status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Upload className="h-5 w-5 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">My Documents</h1>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Upload your documents to verify your identity and unlock all features.
      </p>

      <div className="space-y-3">
        {documentTypes.map(({ type, label, required }) => {
          const status = getStatus(type)
          return (
            <div
              key={type}
              className="flex items-center justify-between rounded-xl bg-card p-4 border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    {status === 'verified' && 'Verified'}
                    {status === 'pending' && 'Under review'}
                    {status === 'rejected' && 'Rejected - Please reupload'}
                    {status === 'missing' && (required ? 'Required' : 'Optional')}
                  </p>
                </div>
              </div>
              {getStatusIcon(status)}
            </div>
          )
        })}
      </div>

      <Button className="mt-6 w-full">
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
    </div>
  )
}
