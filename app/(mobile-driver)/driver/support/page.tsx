'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Headphones } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'support'
  timestamp: string
}

export default function DriverSupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How can I help you?',
      sender: 'support',
      timestamp: '09:00AM'
    }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    // Simulate support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for reaching out. Our team will get back to you shortly.',
        sender: 'support',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      }
      setMessages(prev => [...prev, supportMessage])
      setSending(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/driver/profile" className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Support</h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {message.sender === 'support' && (
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-5 w-5 text-accent" />
                  </div>
                )}

                <div>
                  {/* Sender Label */}
                  {message.sender === 'support' && (
                    <p className="text-sm font-medium text-gray-900 mb-1">Support Team</p>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-accent text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>

                  {/* Timestamp */}
                  <p className={`text-xs text-gray-400 mt-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Headphones className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Support Team</p>
                  <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-5 py-4 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-12 w-12 bg-accent rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
