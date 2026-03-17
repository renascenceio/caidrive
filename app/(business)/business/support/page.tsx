'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, Send, Paperclip, HelpCircle, FileText,
  Phone, Mail, Clock, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const mockMessages = [
  {
    id: '1',
    sender: 'support',
    name: 'CAI Support',
    message: 'Hello! Welcome to CAI Support. How can I help you today?',
    timestamp: '10:00 AM',
  },
  {
    id: '2',
    sender: 'user',
    name: 'You',
    message: 'Hi, I have a question about deposit claims. How long does the approval process take?',
    timestamp: '10:02 AM',
  },
  {
    id: '3',
    sender: 'support',
    name: 'CAI Support',
    message: 'Great question! The deposit claim approval process typically takes 2-3 business days. We review all submitted documentation and may reach out if we need additional information.',
    timestamp: '10:05 AM',
  },
]

const faqItems = [
  { question: 'How do I add a new vehicle?', answer: 'Go to Garage > Add New Car and fill in the vehicle details.' },
  { question: 'How are payments processed?', answer: 'Card payments are processed automatically. Cash payments require manual confirmation.' },
  { question: 'Can I pause my listing temporarily?', answer: 'Yes, you can pause any vehicle from the Garage section using the Pause option.' },
  { question: 'How do deposit claims work?', answer: 'Submit a claim with evidence, and our team will review it within 2-3 business days.' },
]

function ChatMessage({ message }: { message: typeof mockMessages[0] }) {
  const isSupport = message.sender === 'support'
  
  return (
    <div className={cn("flex gap-3", !isSupport && "flex-row-reverse")}>
      <Avatar className="h-8 w-8">
        {isSupport ? (
          <AvatarImage src="/images/support-avatar.png" />
        ) : null}
        <AvatarFallback className={isSupport ? "bg-accent text-white" : "bg-secondary"}>
          {isSupport ? 'CS' : 'Y'}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[70%]", !isSupport && "text-right")}>
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isSupport 
            ? "bg-secondary text-foreground rounded-tl-none" 
            : "bg-accent text-white rounded-tr-none"
        )}>
          <p className="text-sm">{message.message}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{message.timestamp}</p>
      </div>
    </div>
  )
}

export default function SupportPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: `${Date.now()}`,
      sender: 'user' as const,
      name: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')

    // Simulate support response
    setTimeout(() => {
      const supportResponse = {
        id: `${Date.now() + 1}`,
        sender: 'support' as const,
        name: 'CAI Support',
        message: 'Thank you for your message. One of our support agents will respond shortly. Our typical response time is under 5 minutes during business hours.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, supportResponse])
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground">Get help from our support team</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-accent text-white">CS</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">CAI Support</CardTitle>
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Online
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input 
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+971 4 123 4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@caidrive.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">9 AM - 6 PM GST, Mon-Sat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Quick FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqItems.map((item, index) => (
                <details key={index} className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-secondary transition-colors">
                    <span className="text-sm font-medium">{item.question}</span>
                  </summary>
                  <p className="mt-2 px-2 text-sm text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">All Systems Operational</p>
                  <p className="text-xs text-muted-foreground">Last updated: 5 mins ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
