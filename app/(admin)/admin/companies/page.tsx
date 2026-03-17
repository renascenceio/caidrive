"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, MoreHorizontal, Check, X, Eye, Building2 } from "lucide-react"
import { toast } from "sonner"

interface Company {
  id: string
  name: string
  logo_url: string | null
  owner_id: string
  subscription_tier: string
  is_verified: boolean
  email: string | null
  phone: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    email: string | null
  }
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verifyAction, setVerifyAction] = useState<"approve" | "reject">("approve")

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        profiles:owner_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to fetch companies")
      return
    }

    setCompanies(data || [])
    setLoading(false)
  }

  async function handleVerify(approve: boolean) {
    if (!selectedCompany) return

    const supabase = createClient()
    const { error } = await supabase
      .from("companies")
      .update({ is_verified: approve })
      .eq("id", selectedCompany.id)

    if (error) {
      toast.error("Failed to update company verification")
      return
    }

    toast.success(approve ? "Company approved" : "Company rejected")
    setShowVerifyDialog(false)
    fetchCompanies()
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = companies.filter((c) => !c.is_verified).length
  const verifiedCount = companies.filter((c) => c.is_verified).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Companies</h1>
        <p className="text-muted-foreground">
          Manage and verify rental companies on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {companies.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
            <Check className="h-4 w-4 text-green-500" />
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
              Pending Review
            </CardTitle>
            <X className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
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
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Owner</TableHead>
              <TableHead className="text-muted-foreground">Subscription</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Joined</TableHead>
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
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">No companies found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow
                  key={company.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {company.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {company.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {company.profiles?.full_name || company.profiles?.email || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        company.subscription_tier === "enterprise"
                          ? "border-amber-500/50 text-amber-500"
                          : company.subscription_tier === "pro"
                          ? "border-blue-500/50 text-blue-500"
                          : "border-border text-muted-foreground"
                      }
                    >
                      {company.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={company.is_verified ? "default" : "secondary"}
                      className={
                        company.is_verified
                          ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                          : "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                      }
                    >
                      {company.is_verified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-card border-border"
                      >
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {!company.is_verified && (
                          <DropdownMenuItem
                            className="cursor-pointer text-green-500"
                            onClick={() => {
                              setSelectedCompany(company)
                              setVerifyAction("approve")
                              setShowVerifyDialog(true)
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {company.is_verified && (
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => {
                              setSelectedCompany(company)
                              setVerifyAction("reject")
                              setShowVerifyDialog(true)
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Revoke Verification
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {verifyAction === "approve" ? "Approve Company" : "Revoke Verification"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {verifyAction === "approve"
                ? `Are you sure you want to approve "${selectedCompany?.name}"? This will allow them to list vehicles on the platform.`
                : `Are you sure you want to revoke verification for "${selectedCompany?.name}"? Their vehicles will no longer be visible to customers.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleVerify(verifyAction === "approve")}
              className={
                verifyAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {verifyAction === "approve" ? "Approve" : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
