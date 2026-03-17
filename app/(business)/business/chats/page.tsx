"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Bot, 
  User, 
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  Phone,
  Car
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UnifiedChat } from "@/components/chat/unified-chat"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChatRoom {
  id: string
  booking_id: string
  status: 'active' | 'escalated' | 'resolved'
  last_message_at: string
  last_message_preview: string
  unread_count: number
  metadata?: {
    escalated?: boolean
    escalation_priority?: string
    escalation_reason?: string
  }
  customer?: {
    name: string
    avatar?: string
  }
  booking?: {
    vehicle: string
    status: string
  }
}

// Mock data for demonstration
const mockChats: ChatRoom[] = [
  {
    id: '1',
    booking_id: 'BK-001',
    status: 'escalated',
    last_message_at: new Date(Date.now() - 5 * 60000).toISOString(),
    last_message_preview: "I need to speak to a human agent please",
    unread_count: 3,
    metadata: { escalated: true, escalation_priority: 'high', escalation_reason: 'Customer frustrated' },
    customer: { name: 'Ahmed Hassan' },
    booking: { vehicle: 'Mercedes S-Class', status: 'active' }
  },
  {
    id: '2',
    booking_id: 'BK-002',
    status: 'active',
    last_message_at: new Date(Date.now() - 15 * 60000).toISOString(),
    last_message_preview: "When will my driver arrive?",
    unread_count: 1,
    customer: { name: 'Sarah Johnson' },
    booking: { vehicle: 'BMW 7 Series', status: 'driver_assigned' }
  },
  {
    id: '3',
    booking_id: 'BK-003',
    status: 'active',
    last_message_at: new Date(Date.now() - 30 * 60000).toISOString(),
    last_message_preview: "Thanks for the information!",
    unread_count: 0,
    customer: { name: 'Mohammed Ali' },
    booking: { vehicle: 'Porsche 911', status: 'delivered' }
  },
  {
    id: '4',
    booking_id: 'BK-004',
    status: 'resolved',
    last_message_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    last_message_preview: "Issue resolved. Thank you!",
    unread_count: 0,
    customer: { name: 'Emma Williams' },
    booking: { vehicle: 'Range Rover', status: 'completed' }
  },
]

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString()
}

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatRoom[]>(mockChats)
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userRole, setUserRole] = useState<'support' | 'admin'>('support')

  // Filter chats
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.booking_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Sort: escalated first, then by last message time
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.status === 'escalated' && b.status !== 'escalated') return -1
    if (b.status === 'escalated' && a.status !== 'escalated') return 1
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  })

  const escalatedCount = chats.filter(c => c.status === 'escalated').length
  const activeCount = chats.filter(c => c.status === 'active').length

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Chat List */}
      <div className="w-96 bg-card rounded-2xl border border-border/40 shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Support Chats</h2>
            <div className="flex items-center gap-2">
              {escalatedCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {escalatedCount} Urgent
                </Badge>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or booking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className="gap-1">
              <MessageCircle className="h-3 w-3" />
              {activeCount} Active
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Bot className="h-3 w-3" />
              AI Handling
            </Badge>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {sortedChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full p-4 text-left border-b border-border/40 hover:bg-secondary/50 transition-colors",
                selectedChat?.id === chat.id && "bg-secondary/50",
                chat.status === 'escalated' && "bg-red-500/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.customer?.avatar} />
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {chat.status === 'escalated' && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                      <AlertTriangle className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {chat.customer?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTime(chat.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Car className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {chat.booking?.vehicle}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {chat.last_message_preview}
                  </p>
                </div>

                {chat.unread_count > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full shrink-0">
                    {chat.unread_count}
                  </Badge>
                )}
              </div>

              {chat.status === 'escalated' && chat.metadata?.escalation_reason && (
                <div className="mt-2 px-2 py-1.5 rounded-lg bg-red-500/10 text-xs text-red-600">
                  <span className="font-medium">Escalation: </span>
                  {chat.metadata.escalation_reason}
                </div>
              )}
            </button>
          ))}

          {sortedChats.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No chats found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        {selectedChat ? (
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.customer?.avatar} />
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.customer?.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{selectedChat.booking_id}</span>
                    <span>•</span>
                    <span>{selectedChat.booking?.vehicle}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedChat.status === 'escalated' && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Escalated
                  </Badge>
                )}
                <Button variant="outline" size="sm" className="gap-1">
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setChats(prev => prev.map(c => 
                      c.id === selectedChat.id ? { ...c, status: 'resolved' } : c
                    ))
                    setSelectedChat({ ...selectedChat, status: 'resolved' })
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>

            {/* Unified Chat Component */}
            <UnifiedChat
              roomId={selectedChat.id}
              bookingId={selectedChat.booking_id}
              userRole={userRole}
              showHeader={false}
              showStatusTimeline={true}
              className="flex-1"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-1">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a chat from the list to view and respond
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
