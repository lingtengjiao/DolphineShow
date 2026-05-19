import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { productApi } from '../api'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/product/ProductCard'
import ProductImageZoom from '../components/product/ProductImageZoom'
import type { ProductDetail as ProductDetailType, Product } from '../types'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f3ece4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23c4a882" font-size="80"%3E🧸%3C/text%3E%3C/svg%3E'

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

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [related, setRelated] = useState<Product[]>([])
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
        {/* Media gallery — Amazon-style shared carousel */}
        <div className="lg:w-1/2 overflow-visible">
          <div className="flex flex-col lg:flex-row gap-3 overflow-visible">
            {galleryItems.length > 1 && (
              <div className="hidden lg:flex flex-col gap-2 w-[72px] shrink-0 max-h-[min(520px,70vh)] overflow-y-auto">
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

          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">B2B Price</span>
              {user && product.price ? (
                <span className="text-3xl font-bold text-brand">${product.price}</span>
              ) : (
                <Link to="/login" className="text-sm text-accent hover:underline">Sign in to view price →</Link>
              )}
            </div>
            <div className="text-sm text-gray-500">
              MOQ: <span className="font-medium text-gray-700">{product.min_order_qty} pcs</span>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Specifications</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {product.material && (
                <><dt className="text-gray-400">Material</dt><dd className="text-gray-700">{product.material}</dd></>
              )}
              {product.size && (
                <><dt className="text-gray-400">Size</dt><dd className="text-gray-700">{product.size}</dd></>
              )}
              {product.weight && (
                <><dt className="text-gray-400">Weight</dt><dd className="text-gray-700">{product.weight}</dd></>
              )}
              <dt className="text-gray-400">Product Line</dt>
              <dd className="text-gray-700">{product.product_line_name}</dd>
            </dl>
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

      {/* Description */}
      {product.description && (
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10">
          <h2 className="text-xl font-extrabold font-bold text-gray-800 mb-4">Product Details</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          {product.detail_html && (
            <div className="mt-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.detail_html }} />
          )}
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
