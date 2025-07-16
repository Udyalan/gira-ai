'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, ThumbsUp, User, Verified, MessageSquare, Filter, MoreHorizontal } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  verified: boolean
  helpful: number
  createdAt: string
  user: {
    name: string
    image?: string
  }
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

interface ProductReviewsProps {
  productId: string
  className?: string
}

export default function ProductReviews({ productId, className = '' }: ProductReviewsProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [verifiedFilter, setVerifiedFilter] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId, page, ratingFilter, verifiedFilter])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '10'
      })

      if (ratingFilter) {
        params.append('rating', ratingFilter.toString())
      }

      if (verifiedFilter) {
        params.append('verified', 'true')
      }

      const response = await fetch(`/api/reviews?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (page === 1) {
          setReviews(data.reviews)
          setStats(data.statistics)
        } else {
          setReviews(prev => [...prev, ...data.reviews])
        }
        
        setHasMore(data.pagination.page < data.pagination.pages)
      } else {
        throw new Error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Erro ao carregar avaliações')
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async () => {
    if (!session) {
      toast.error('Faça login para avaliar')
      return
    }

    if (reviewForm.rating === 0) {
      toast.error('Selecione uma avaliação')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          ...reviewForm
        })
      })

      if (response.ok) {
        toast.success('Avaliação enviada com sucesso!')
        setShowReviewForm(false)
        setReviewForm({ rating: 0, title: '', comment: '' })
        setPage(1)
        fetchReviews()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao enviar avaliação')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }

  const markAsHelpful = async (reviewId: string) => {
    if (!session) {
      toast.error('Faça login para avaliar')
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      })

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        ))
        toast.success('Obrigado pela avaliação!')
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  const StarRating = ({ rating, size = 'md', interactive = false, onRatingChange }: {
    rating: number
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
    onRatingChange?: (rating: number) => void
  }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${sizeClasses[size]} ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            <Star
              className={`w-full h-full ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading && page === 1) {
    return (
      <div className={`${className} p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Estatísticas */}
      {stats && (
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Rating geral */}
            <div className="flex-shrink-0">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                <p className="text-sm text-gray-600 mt-2">
                  {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </div>
            </div>

            {/* Distribuição de ratings */}
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 mb-4">Distribuição de avaliações</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

                  return (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                      className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-50 transition-colors ${
                        ratingFilter === rating ? 'bg-pink-50 border border-pink-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1 text-sm w-12">
                        <span>{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-grow bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e botão de avaliar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setVerifiedFilter(!verifiedFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              verifiedFilter 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Verified className="w-4 h-4" />
            Compras verificadas
          </button>

          {ratingFilter && (
            <button
              onClick={() => setRatingFilter(null)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 text-pink-700 rounded-lg"
            >
              {ratingFilter} estrelas
              <span className="ml-2 cursor-pointer">×</span>
            </button>
          )}
        </div>

        {session && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Avaliar produto
          </button>
        )}
      </div>

      {/* Formulário de avaliação */}
      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Escrever avaliação</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sua avaliação *
              </label>
              <StarRating
                rating={reviewForm.rating}
                size="lg"
                interactive
                onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título (opcional)
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Resumo da sua experiência"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário (opcional)
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Conte sobre sua experiência com este produto..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={submitting || reviewForm.rating === 0}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar avaliação'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma avaliação ainda
            </h3>
            <p className="text-gray-600">
              Seja o primeiro a avaliar este produto!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {review.user.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    {review.verified && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Verified className="w-4 h-4" />
                        <span className="text-xs">Compra verificada</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
                  )}

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => markAsHelpful(review.id)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Útil ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carregar mais */}
      {hasMore && reviews.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Carregando...' : 'Carregar mais avaliações'}
          </button>
        </div>
      )}
    </div>
  )
}