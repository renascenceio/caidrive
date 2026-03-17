'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, Search, MoreVertical, Pencil, Eye, Mail, Phone,
  FileCheck, FileX, DollarSign, Star, ArrowUpDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const mockCustomers = [
  { 
    id: '1', 
    name: 'Ahmed Al Maktoum', 
    email: 'ahmed@example.com',
    phone: '+971 50 123 4567',
    country: 'UAE',
    documentsVerified: true,
    totalRides: 12,
    totalSpent: 45000,
    lastRide: 'Mar 15, 2026',
    rating: 4.9,
  },
  { 
    id: '2', 
    name: 'Sarah Johnson', 
    email: 'sarah@example.com',
    phone: '+1 555 123 4567',
    country: 'USA',
    documentsVerified: true,
    totalRides: 5,
    totalSpent: 18500,
    lastRide: 'Mar 10, 2026',
    rating: 5.0,
  },
  { 
    id: '3', 
    name: 'Mohammed Ali', 
    email: 'mo.ali@example.com',
    phone: '+971 55 987 6543',
    country: 'UAE',
    documentsVerified: false,
    totalRides: 3,
    totalSpent: 9800,
    lastRide: 'Mar 8, 2026',
    rating: 4.7,
  },
  { 
    id: '4', 
    name: 'Elena Petrova', 
    email: 'elena@example.com',
    phone: '+7 999 123 4567',
    country: 'Russia',
    documentsVerified: true,
    totalRides: 8,
    totalSpent: 32000,
    lastRide: 'Mar 12, 2026',
    rating: 4.8,
  },
  { 
    id: '5', 
    name: 'James Chen', 
    email: 'james.chen@example.com',
    phone: '+86 138 1234 5678',
    country: 'China',
    documentsVerified: true,
    totalRides: 15,
    totalSpent: 67500,
    lastRide: 'Mar 14, 2026',
    rating: 5.0,
  },
  { 
    id: '6', 
    name: 'Robert Williams', 
    email: 'robert.w@example.com',
    phone: '+44 7700 123456',
    country: 'UK',
    documentsVerified: true,
    totalRides: 6,
    totalSpent: 24000,
    lastRide: 'Mar 5, 2026',
    rating: 4.6,
  },
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [filterCountry, setFilterCountry] = useState<string>('all')

  const countries = [...new Set(mockCustomers.map(c => c.country))]

  let filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  if (filterCountry !== 'all') {
    filteredCustomers = filteredCustomers.filter(c => c.country === filterCountry)
  }

  // Sort
  filteredCustomers.sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'rides': return b.totalRides - a.totalRides
      case 'spent': return b.totalSpent - a.totalSpent
      case 'recent': return new Date(b.lastRide).getTime() - new Date(a.lastRide).getTime()
      default: return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">{mockCustomers.length} registered customers</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="rides">Most Rides</SelectItem>
            <SelectItem value="spent">Most Spent</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-center">Docs</TableHead>
              <TableHead className="text-right">Rides</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">Last: {customer.lastRide}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.country}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {customer.documentsVerified ? (
                    <FileCheck className="mx-auto h-5 w-5 text-green-500" />
                  ) : (
                    <FileX className="mx-auto h-5 w-5 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">{customer.totalRides}</TableCell>
                <TableCell className="text-right font-medium">
                  AED {customer.totalSpent.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{customer.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/business/customers/${customer.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/business/customers/${customer.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
