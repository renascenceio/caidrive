"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: 'me' | 'other'
  senderName: string
  senderAvatar?: string
  text: string
  time: string
}

export default function ChatConversationPage() {
  const router = useRouter()
  const params = useParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'other',
      senderName: 'Mr. Alex',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'Hey! Where is my car?',
      time: '09:00AM'
    },
    {
      id: '2',
      sender: 'other',
      senderName: 'Support Team',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      text: 'Hey! How can i help you?',
      time: '09:00AM'
    },
    {
      id: '3',
      sender: 'other',
      senderName: 'Admin',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      text: 'Hey! How can i help you?',
      time: '09:00AM'
    },
    {
      id: '4',
      sender: 'me',
      senderName: 'You',
      text: 'Lorem Ipsum is simply dummy text of the printing.',
      time: '09:00AM'
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      senderName: 'You',
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages([...messages, newMessage])
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e]">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 pt-12 border-b border-white/10">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.sender === 'me' ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar - only for others */}
            {msg.sender === 'other' && (
              <div className="flex-shrink-0">
                {msg.senderAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={msg.senderAvatar} 
                    alt={msg.senderName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {msg.senderName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Message Content */}
            <div className={cn(
              "max-w-[75%]",
              msg.sender === 'me' ? "items-end" : "items-start"
            )}>
              {/* Sender Name */}
              {msg.sender === 'other' && (
                <p className="text-sm font-medium text-white mb-1">{msg.senderName}</p>
              )}
              
              {/* Message Bubble */}
              <div className={cn(
                "px-4 py-3 rounded-2xl",
                msg.sender === 'me' 
                  ? "bg-accent text-white rounded-br-md" 
                  : "bg-white/10 text-white rounded-bl-md"
              )}>
                <p className="text-sm">{msg.text}</p>
              </div>
              
              {/* Time */}
              <p className={cn(
                "text-xs text-gray-500 mt-1",
                msg.sender === 'me' ? "text-right" : "text-left"
              )}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-4 pb-8 border-t border-white/10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a message..."
            className={cn(
              "flex-1 px-4 py-3 rounded-full",
              "bg-white/5 border border-white/10",
              "text-white placeholder:text-gray-500",
              "focus:outline-none focus:border-white/20"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              "bg-accent text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-transform active:scale-95"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
