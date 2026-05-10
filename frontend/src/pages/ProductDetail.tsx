import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { productApi } from '../api'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/product/ProductCard'
import type { ProductDetail as ProductDetailType, Product } from '../types'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f3ece4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23c4a882" font-size="80"%3E🧸%3C/text%3E%3C/svg%3E'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productApi.get(Number(id)).then((r) => {
      setProduct(r.data)
      setSelectedImage(0)
    }).catch(() => navigate('/products')).finally(() => setLoading(false))
    productApi.related(Number(id), 6).then((r) => setRelated(r.data)).catch(() => {})
  }, [id, navigate])

  if (loading || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>
  }

  const allImages = [product.main_image, ...(product.images || [])].filter(Boolean) as string[]
  if (allImages.length === 0) allImages.push(PLACEHOLDER)

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
      <div className="flex flex-col lg:flex-row gap-10 mb-16">
        {/* Images */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
            <img
              src={allImages[selectedImage]}
              alt={product.name}
              className="w-full aspect-square object-contain p-4"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === selectedImage ? 'border-brand' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:w-1/2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-bold text-gray-800 mb-2">{product.name}</h1>
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
            <dl className="grid grid-cols-2 gap-3 text-sm">
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
          <div className="flex gap-4">
            <Link
              to={`/inquiry?product_id=${product.id}&product_name=${encodeURIComponent(product.name)}`}
              className="flex-1 py-3 bg-accent text-white text-center rounded-full font-medium hover:bg-accent-dark transition-colors shadow-lg"
            >
              Send Inquiry
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied!')
              }}
              className="px-6 py-3 border border-gray-300 rounded-full text-sm text-gray-600 hover:border-brand hover:text-brand transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>

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
