'use client'

import { useState } from 'react'
import { 
  Star, MessageCircle, Calendar, Car, Send, CheckCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const mockReviews = [
  {
    id: '1',
    customer: 'Ahmed Al Maktoum',
    car: 'Ferrari SF90',
    rating: 5,
    comment: 'Exceptional service and amazing car! The delivery was on time, and the car was in perfect condition. Will definitely rent again.',
    date: 'Today',
    timestamp: '2 hours ago',
    response: null,
    responded: false,
  },
  {
    id: '2',
    customer: 'Sarah Johnson',
    car: 'Rolls-Royce Ghost',
    rating: 5,
    comment: 'Perfect for my wedding day. The car was stunning and the driver was very professional. Thank you for making our day special!',
    date: 'Today',
    timestamp: '5 hours ago',
    response: 'Thank you so much, Sarah! We are thrilled that we could be part of your special day. Wishing you all the best!',
    responded: true,
  },
  {
    id: '3',
    customer: 'James Chen',
    car: 'Lamborghini Huracán',
    rating: 4,
    comment: 'Great experience overall. The car was amazing but there was a slight delay in delivery. Otherwise, everything was perfect.',
    date: 'Yesterday',
    timestamp: '1 day ago',
    response: null,
    responded: false,
  },
  {
    id: '4',
    customer: 'Elena Petrova',
    car: 'Porsche 911 GT3',
    rating: 5,
    comment: 'Incredible driving experience! The GT3 is a dream car and the rental process was seamless. Highly recommend!',
    date: 'Mar 14, 2026',
    timestamp: '2 days ago',
    response: 'Thank you for your kind words, Elena! We\'re glad you enjoyed the GT3. Looking forward to seeing you again!',
    responded: true,
  },
  {
    id: '5',
    customer: 'Robert Williams',
    car: 'McLaren 720S',
    rating: 4,
    comment: 'Beautiful car and great service. The pickup location was a bit hard to find but the team helped us out.',
    date: 'Mar 12, 2026',
    timestamp: '4 days ago',
    response: null,
    responded: false,
  },
]

function ReviewCard({ review, onRespond }: { 
  review: typeof mockReviews[0]
  onRespond: (id: string, response: string) => void
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleSubmitResponse = () => {
    if (replyText.trim()) {
      onRespond(review.id, replyText)
      setReplyText('')
      setIsReplying(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {review.customer.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{review.customer}</p>
                  {!review.responded && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Awaiting Response
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Car className="h-3 w-3" />
                  <span>{review.car}</span>
                  <span>·</span>
                  <span>{review.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-4 w-4",
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                    )} 
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>

            {/* Response */}
            {review.response && (
              <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Your Response
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{review.response}</p>
              </div>
            )}

            {/* Reply Form */}
            {!review.responded && !isReplying && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 gap-2"
                onClick={() => setIsReplying(true)}
              >
                <MessageCircle className="h-4 w-4" />
                Reply
              </Button>
            )}

            {isReplying && (
              <div className="mt-4 space-y-3">
                <Textarea 
                  placeholder="Write your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={handleSubmitResponse}
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-4 w-4" />
                    Send Response
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsReplying(false)
                      setReplyText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [timeRange, setTimeRange] = useState('all')
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all')

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  const pendingCount = reviews.filter(r => !r.responded).length
  
  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.responded
    if (filter === 'responded') return review.responded
    return true
  })

  // Group by date
  const groupedReviews = filteredReviews.reduce((groups, review) => {
    const date = review.date
    if (!groups[date]) groups[date] = []
    groups[date].push(review)
    return groups
  }, {} as Record<string, typeof reviews>)

  const handleRespond = (id: string, response: string) => {
    setReviews(prev => prev.map(r => 
      r.id === id ? { ...r, response, responded: true } : r
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage customer feedback and responses</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-3xl font-bold">{avgRating}</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-4 w-4",
                          i < Math.round(Number(avgRating)) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground/30"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="mt-2 text-3xl font-bold">{reviews.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <MessageCircle className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awaiting Response</p>
                <p className="mt-2 text-3xl font-bold">{pendingCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Clock className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({reviews.length})
        </Button>
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button 
          variant={filter === 'responded' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('responded')}
        >
          Responded ({reviews.length - pendingCount})
        </Button>
      </div>

      {/* Reviews by Date */}
      {Object.entries(groupedReviews).map(([date, dateReviews]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
          {dateReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onRespond={handleRespond}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
