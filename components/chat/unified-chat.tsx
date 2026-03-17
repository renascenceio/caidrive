"use client"

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  Phone, 
  MoreVertical,
  CheckCheck,
  Clock,
  AlertCircle,
  Car,
  MapPin,
  CreditCard,
  Shield,
  Loader2
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
  senderRole?: string
  senderName?: string
  senderAvatar?: string
  messageType?: 'text' | 'status_update' | 'system' | 'ai_response'
  metadata?: Record<string, unknown>
}

interface UnifiedChatProps {
  roomId?: string
  bookingId?: string
  userRole: 'user' | 'driver' | 'support' | 'admin'
  userName?: string
  userAvatar?: string
  showHeader?: boolean
  showStatusTimeline?: boolean
  className?: string
  onEscalate?: () => void
}

// Status icons mapping
const statusIcons: Record<string, typeof Car> = {
  pending: Clock,
  confirmed: CheckCheck,
  driver_assigned: User,
  en_route: Car,
  delivered: MapPin,
  active: Car,
  returning: Car,
  completed: CheckCheck,
  cancelled: AlertCircle,
  deposit_held: CreditCard,
  deposit_released: CreditCard,
  deposit_claimed: AlertCircle,
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  driver_assigned: 'bg-purple-500',
  en_route: 'bg-indigo-500',
  delivered: 'bg-green-500',
  active: 'bg-green-600',
  returning: 'bg-orange-500',
  completed: 'bg-green-700',
  cancelled: 'bg-red-500',
  deposit_held: 'bg-blue-400',
  deposit_released: 'bg-green-400',
  deposit_claimed: 'bg-red-400',
}

function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function UnifiedChat({
  roomId,
  bookingId,
  userRole,
  userName = 'You',
  userAvatar,
  showHeader = true,
  showStatusTimeline = true,
  className,
  onEscalate,
}: UnifiedChatProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [statusHistory, setStatusHistory] = useState<Array<{
    status: string
    createdAt: string
    notes?: string
  }>>([])

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: { roomId, bookingId, userRole },
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch status history if showing timeline
  useEffect(() => {
    if (showStatusTimeline && bookingId) {
      fetch(`/api/bookings/${bookingId}/history`)
        .then(res => res.json())
        .then(data => setStatusHistory(data || []))
        .catch(() => {})
    }
  }, [showStatusTimeline, bookingId])

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/cai-logo.png" />
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">CAI Drive Support</h3>
              <p className="text-xs text-muted-foreground">AI-powered assistance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEscalate && (
              <Button variant="outline" size="sm" onClick={onEscalate}>
                <Phone className="h-4 w-4 mr-1" />
                Call Support
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Status Timeline (if enabled) */}
      {showStatusTimeline && statusHistory.length > 0 && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">Booking Status</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {statusHistory.map((item, index) => {
              const Icon = statusIcons[item.status] || Clock
              return (
                <div key={index} className="flex items-center gap-1 shrink-0">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center",
                    statusColors[item.status] || 'bg-gray-500'
                  )}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  {index < statusHistory.length - 1 && (
                    <div className="w-4 h-0.5 bg-border" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold mb-1">Welcome to CAI Drive Support</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              I'm your AI assistant. I can help with booking questions, status updates, 
              and general inquiries. How can I help you today?
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                'Check my booking status',
                'Where is my driver?',
                'Deposit refund policy',
                'Extend my rental',
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInputValue(suggestion)
                    setTimeout(() => {
                      sendMessage({ text: suggestion })
                      setInputValue('')
                    }, 100)
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === 'user'
          const isSystem = message.role === 'system'
          const text = getUIMessageText(message)

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center">
                <Badge variant="secondary" className="text-xs font-normal">
                  {text}
                </Badge>
              </div>
            )
          }

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-accent/10">
                    <Bot className="h-4 w-4 text-accent" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  isUser
                    ? "bg-accent text-accent-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{text}</p>
                <p className={cn(
                  "text-[10px] mt-1",
                  isUser ? "text-accent-foreground/70" : "text-muted-foreground"
                )}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {isUser && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-accent/10">
                <Bot className="h-4 w-4 text-accent" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Powered by AI. A human agent can join if needed.
        </p>
      </div>
    </div>
  )
}
