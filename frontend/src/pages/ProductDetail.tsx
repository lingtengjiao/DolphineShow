import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { productApi, companyImageApi, reviewApi } from '../api'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/product/ProductCard'
import ProductImageZoom from '../components/product/ProductImageZoom'
import type { ProductDetail as ProductDetailType, Product, CompanyImage, CustomerReview } from '../types'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f3ece4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23c4a882" font-size="80"%3E🧸%3C/text%3E%3C/svg%3E'

const CATEGORY_LABELS: Record<string, string> = {
  factory: '工厂实力',
  team: '团队风采',
  brand: '品牌故事',
  certificate: '资质认证',
  other: '更多详情',
}

type GalleryItem =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; poster?: string }

function buildGalleryItems(product: ProductDetailType): GalleryItem[] {
  const images = [product.main_image, ...(product.images || [])].filter(Boolean) as string[]
  const items: GalleryItem[] = []

  if (images.length > 0) {
    items.push({ type: 'image', src: images[0] })
    if (product.video_url) {
      items.push({ type: 'video', src: product.video_url, poster: images[0] })
    }
    for (let i = 1; i < images.length; i++) {
      items.push({ type: 'image', src: images[i] })
    }
  } else if (product.video_url) {
    items.push({ type: 'video', src: product.video_url })
  } else {
    items.push({ type: 'image', src: PLACEHOLDER })
  }

  return items
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [companyImages, setCompanyImages] = useState<CompanyImage[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [selectedMedia, setSelectedMedia] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const shareInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const shareUrl =
    typeof window !== 'undefined' && id
      ? `${window.location.origin}/products/${id}`
      : ''

  const copyShareLink = useCallback(async (url: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        return true
      }
    } catch {
      /* fallback below */
    }
    try {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      return ok
    } catch {
      return false
    }
  }, [])

  const handleShare = useCallback(async () => {
    if (!shareUrl || !product) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: shareUrl,
        })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }

    setShareOpen(true)
    const copied = await copyShareLink(shareUrl)
    if (copied) toast.success('Link copied to clipboard!')
  }, [shareUrl, product, copyShareLink])

  const handleCopyFromModal = useCallback(async () => {
    if (!shareUrl) return
    const copied = await copyShareLink(shareUrl)
    if (copied) {
      toast.success('Link copied to clipboard!')
    } else {
      shareInputRef.current?.focus()
      shareInputRef.current?.select()
      toast.error('Could not copy automatically. Please copy the link manually.')
    }
  }, [shareUrl, copyShareLink])

  useEffect(() => {
    if (!shareOpen) return
    const timer = window.setTimeout(() => {
      shareInputRef.current?.focus()
      shareInputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [shareOpen])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productApi.get(Number(id)).then((r) => {
      setProduct(r.data)
      setSelectedMedia(0)
    }).catch(() => navigate('/products')).finally(() => setLoading(false))
    productApi.related(Number(id), 6).then((r) => setRelated(r.data)).catch(() => {})
    companyImageApi.list().then((r) => setCompanyImages(r.data)).catch(() => {})
    reviewApi.list(12).then((r) => setReviews(r.data)).catch(() => {})
  }, [id, navigate])

  useEffect(() => {
    if (!product) return
    const items = buildGalleryItems(product)
    const current = items[selectedMedia] ?? items[0]
    if (current?.type !== 'video') {
      videoRef.current?.pause()
    }
  }, [product, selectedMedia])

  if (loading || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>
  }

  const galleryItems = buildGalleryItems(product)
  const currentItem = galleryItems[selectedMedia] ?? galleryItems[0]

  const renderThumbnail = (item: GalleryItem, index: number, size: 'sm' | 'lg') => {
    const isActive = index === selectedMedia
    const sizeCls = size === 'lg' ? 'w-[72px] h-[72px]' : 'w-16 h-16'
    const poster = item.type === 'video' ? item.poster : item.src

    return (
      <button
        key={index}
        type="button"
        onClick={() => setSelectedMedia(index)}
        aria-label={item.type === 'video' ? 'View product video' : `View image ${index + 1}`}
        aria-current={isActive ? 'true' : undefined}
        className={`${sizeCls} rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors relative ${
          isActive ? 'border-brand' : 'border-gray-200 hover:border-brand/50'
        }`}
      >
        <img src={poster || PLACEHOLDER} alt="" className="w-full h-full object-cover" />
        {item.type === 'video' && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
            <PlayIcon className="w-6 h-6" />
          </span>
        )}
      </button>
    )
  }

  const hasDetails = !!(product.description || product.detail_html)
  const priceTiers = product.price_tiers || []
  const certifications = product.certifications || []

  // Group company images by category
  const imageGroups = companyImages.reduce<Record<string, CompanyImage[]>>((acc, img) => {
    if (!acc[img.category]) acc[img.category] = []
    acc[img.category].push(img)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/products?product_line_slug=`} className="hover:text-brand">{product.product_line_name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      {/* Product main section */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-10 lg:mb-16">
        {/* Media gallery */}
        <div className="lg:w-1/2 overflow-visible">
          <div className="flex flex-col lg:flex-row gap-3 overflow-visible">
            {/* Vertical thumbnail strip — no scrollbar */}
            {galleryItems.length > 1 && (
              <div className="hidden lg:flex flex-col gap-2 w-[72px] shrink-0">
                {galleryItems.map((item, i) => renderThumbnail(item, i, 'lg'))}
              </div>
            )}

            <div className="flex-1 min-w-0 overflow-visible">
              <div className="bg-white rounded-2xl overflow-visible shadow-sm">
                {currentItem.type === 'image' ? (
                  <ProductImageZoom key={currentItem.src} src={currentItem.src} alt={product.name} />
                ) : (
                  <video
                    ref={videoRef}
                    key={currentItem.src}
                    src={currentItem.src}
                    poster={currentItem.poster}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full aspect-square object-contain bg-black"
                  >
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            </div>
          </div>

          {/* Mobile horizontal thumbnails */}
          {galleryItems.length > 1 && (
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 mt-3">
              {galleryItems.map((item, i) => renderThumbnail(item, i, 'sm'))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:w-1/2">
          <h1 className="text-xl md:text-3xl font-extrabold font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-400 mb-6">SKU: #{product.sku}</p>

          {/* Price card */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            {/* B2B unit price */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">B2B Unit Price</span>
              {user && product.price ? (
                <span className="text-3xl font-bold text-brand">${Number(product.price).toFixed(2)}</span>
              ) : (
                <Link to="/login" className="text-sm text-accent hover:underline">Sign in to view price →</Link>
              )}
            </div>

            <div className="text-sm text-gray-500 mb-4">
              MOQ: <span className="font-medium text-gray-700">{product.min_order_qty} pcs</span>
            </div>

            {/* Price tiers */}
            {user && priceTiers.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-[11px] text-gray-400 mb-2 font-semibold uppercase tracking-wider">批量优惠价格</p>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">订货量</th>
                        <th className="text-right px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">单价 (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {priceTiers.map((tier, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-gray-600">
                            {tier.min_qty}{tier.max_qty ? ` – ${tier.max_qty}` : '+'} pcs
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-brand">${Number(tier.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sample price + get sample */}
            {product.sample_price != null && (
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Sample Price</p>
                  {user ? (
                    <p className="text-lg font-bold text-gray-700">${Number(product.sample_price).toFixed(2)} <span className="text-[12px] font-normal text-gray-400">/ pc</span></p>
                  ) : (
                    <Link to="/login" className="text-sm text-accent hover:underline">Sign in to view →</Link>
                  )}
                </div>
                <Link
                  to={`/inquiry?product_id=${product.id}&product_name=${encodeURIComponent(product.name)}&type=sample`}
                  className="shrink-0 px-4 py-2 border-2 border-brand text-brand text-sm font-semibold rounded-full hover:bg-brand hover:text-white transition-all"
                >
                  Get Sample
                </Link>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Specifications</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {product.material && (
                <><dt className="text-gray-400">Material</dt><dd className="text-gray-700">{product.material}</dd></>
              )}
              {product.filling && (
                <><dt className="text-gray-400">Filling</dt><dd className="text-gray-700">{product.filling}</dd></>
              )}
              {product.size && (
                <><dt className="text-gray-400">Size</dt><dd className="text-gray-700">{product.size}</dd></>
              )}
              {product.weight && (
                <><dt className="text-gray-400">Weight</dt><dd className="text-gray-700">{product.weight}</dd></>
              )}
              {product.age_range && (
                <><dt className="text-gray-400">Age Range</dt><dd className="text-gray-700">{product.age_range}</dd></>
              )}
              <dt className="text-gray-400">Product Line</dt>
              <dd className="text-gray-700">{product.product_line_name}</dd>
            </dl>

            {/* Customization badges */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              {product.support_customization && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-semibold">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  OEM / Custom
                </span>
              )}
              {product.support_logo && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-semibold">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  Logo Printing
                </span>
              )}
            </div>

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {certifications.map((cert) => (
                  <span key={cert} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                    {cert}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* International site link */}
          {product.intl_url && (
            <div className="bg-white rounded-xl px-6 py-4 shadow-sm mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Also available on</p>
                <p className="text-sm font-medium text-gray-700">International Platform</p>
              </div>
              <a
                href={product.intl_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-brand/10 text-brand text-sm font-semibold rounded-full hover:bg-brand/20 transition-colors"
              >
                View Listing
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/inquiry?product_id=${product.id}&product_name=${encodeURIComponent(product.name)}`}
              className="flex-1 py-3 bg-accent text-white text-center rounded-full font-medium hover:bg-accent-dark transition-colors shadow-lg"
            >
              Send Inquiry
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="sm:px-6 py-3 border border-gray-300 rounded-full text-sm text-gray-600 hover:border-brand hover:text-brand transition-colors text-center"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-dialog-title"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="share-dialog-title" className="text-lg font-bold text-gray-800 mb-1">
              Share Product
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Copy this link to share with colleagues or customers.
            </p>
            <div className="flex gap-2">
              <input
                ref={shareInputRef}
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleCopyFromModal}
                className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand/90 transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShareOpen(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Product Details */}
      {hasDetails && (
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">Product Details</h2>
          {product.description && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          )}
          {product.detail_html && (
            <div className={`prose max-w-none ${product.description ? 'mt-6' : ''}`} dangerouslySetInnerHTML={{ __html: product.detail_html }} />
          )}
        </div>
      )}

      {/* Company Images */}
      {companyImages.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-extrabold text-gray-800 mb-6">About Us</h2>
          {Object.entries(imageGroups).map(([category, imgs]) => (
            <div key={category} className="mb-8">
              <h3 className="text-base font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-brand rounded-full inline-block" />
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {imgs.map((img) => (
                  <div key={img.id} className="rounded-xl overflow-hidden bg-gray-50 aspect-video">
                    <img
                      src={img.url}
                      alt={img.caption || ''}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {img.caption && (
                      <p className="text-xs text-gray-500 text-center py-1.5 px-2 truncate">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-extrabold text-gray-800 mb-6">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                <StarRating rating={review.rating} />
                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{review.content}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  {review.avatar_url ? (
                    <img src={review.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
                      {review.reviewer_name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{review.reviewer_name}</p>
                    {(review.reviewer_company || review.reviewer_country) && (
                      <p className="text-[11px] text-gray-400 truncate">
                        {[review.reviewer_company, review.reviewer_country].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-extrabold font-bold text-gray-800 mb-6">Related Products</h2>
          <Swiper
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={2}
            navigation
            breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
          >
            {related.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} showPrice={!!user} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}
