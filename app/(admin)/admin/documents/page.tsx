"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface Document {
  id: string
  user_id: string
  type: string
  front_image_url: string | null
  back_image_url: string | null
  expiry_date: string | null
  verification_status: string
  rejection_reason: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  }
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch documents")
      return
    }

    setDocuments(data || [])
    setLoading(false)
  }

  async function handleVerify(approve: boolean) {
    if (!selectedDoc) return

    const supabase = createClient()
    const updateData: {
      verification_status: string
      rejection_reason?: string | null
    } = {
      verification_status: approve ? "verified" : "rejected",
    }

    if (!approve && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", selectedDoc.id)

    if (error) {
      toast.error("Failed to update document")
      return
    }

    toast.success(approve ? "Document approved" : "Document rejected")
    setShowReviewDialog(false)
    setRejectionReason("")
    fetchDocuments()
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = documents.filter(
    (d) => d.verification_status === "pending"
  ).length
  const verifiedCount = documents.filter(
    (d) => d.verification_status === "verified"
  ).length
  const rejectedCount = documents.filter(
    (d) => d.verification_status === "rejected"
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500/20 text-green-500"
      case "rejected":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-amber-500/20 text-amber-500"
    }
  }

  const getDocTypeName = (type: string) => {
    switch (type) {
      case "driving_license":
        return "Driving License"
      case "passport":
        return "Passport"
      case "international_license":
        return "International License"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground">
          Review and verify user documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {verifiedCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Document Type</TableHead>
              <TableHead className="text-muted-foreground">Expiry Date</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Submitted</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">Loading...</div>
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">No documents found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={doc.profiles?.avatar_url || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {doc.profiles?.full_name?.[0] ||
                            doc.profiles?.email?.[0] ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {doc.profiles?.full_name || "No name"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doc.profiles?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {getDocTypeName(doc.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.expiry_date
                      ? new Date(doc.expiry_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.verification_status)}>
                      {doc.verification_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => {
                          setSelectedDoc(doc)
                          setShowImageDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.verification_status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-green-500/20 text-green-500"
                            onClick={() => {
                              setSelectedDoc(doc)
                              handleVerify(true)
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-500/20 text-red-500"
                            onClick={() => {
                              setSelectedDoc(doc)
                              setShowReviewDialog(true)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Document Preview
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedDoc && getDocTypeName(selectedDoc.type)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Front</p>
              {selectedDoc?.front_image_url ? (
                <img
                  src={selectedDoc.front_image_url}
                  alt="Front"
                  className="rounded-lg border border-border w-full"
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted h-48 flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Back</p>
              {selectedDoc?.back_image_url ? (
                <img
                  src={selectedDoc.back_image_url}
                  alt="Back"
                  className="rounded-lg border border-border w-full"
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted h-48 flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reject Document</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="bg-muted border-border min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleVerify(false)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
