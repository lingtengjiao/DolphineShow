import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { bannerApi, productApi, productLineApi } from '../api'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/product/ProductCard'
import type { Banner, Product, ProductLine } from '../types'
import heroBanner from '../assets/hero-banner.png'

const LINE_ICONS = ['🧸', '🐳', '🦊', '🎨', '🎄', '👶', '🦕', '🎵']
const LINE_COLORS = [
  'from-pink-100 to-rose-50',
  'from-blue-100 to-cyan-50',
  'from-orange-100 to-amber-50',
  'from-purple-100 to-violet-50',
  'from-green-100 to-emerald-50',
  'from-yellow-100 to-lime-50',
  'from-teal-100 to-cyan-50',
  'from-indigo-100 to-blue-50',
]

const DEFAULT_GRADIENT = 'from-rose-50 via-pink-50 to-amber-50'

export default function Home() {
  const { user } = useAuthStore()
  const [banners, setBanners] = useState<Banner[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [productLines, setProductLines] = useState<ProductLine[]>([])
  const [activeTab, setActiveTab] = useState<'featured' | 'new'>('featured')

  useEffect(() => {
    bannerApi.list().then((r) => setBanners(r.data)).catch(() => {})
    productApi.featured(10).then((r) => setFeatured(r.data)).catch(() => {})
    productApi.newProducts(10).then((r) => setNewProducts(r.data)).catch(() => {})
    productLineApi.list().then((r) => setProductLines(r.data)).catch(() => {})
  }, [])

  const displayProducts = activeTab === 'featured' ? featured : newProducts

  return (
    <div className="bg-white">
      {/* ── Hero Banner Slider ── */}
      <section className="relative overflow-hidden">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          navigation={{
            nextEl: '.banner-next',
            prevEl: '.banner-prev',
          }}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="w-full"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className={`relative bg-gradient-to-br ${banner.bg_gradient ?? DEFAULT_GRADIENT} min-h-[420px] md:min-h-[520px] flex`}>
                {/* Left text */}
                <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 max-w-xl">
                  {banner.tag && (
                    <span className="inline-block px-3 py-1 bg-brand/15 text-brand text-xs font-bold rounded-full mb-4 w-fit">
                      {banner.tag}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 leading-tight mb-4">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-gray-500 text-sm md:text-base mb-8 leading-relaxed whitespace-pre-line">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.cta_text && banner.cta_link && (
                    <Link
                      to={banner.cta_link}
                      className="inline-flex items-center px-7 py-3 bg-gray-800 text-white text-sm font-semibold rounded hover:bg-brand transition-colors w-fit"
                    >
                      {banner.cta_text}
                    </Link>
                  )}
                </div>
                {/* Right image */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-[55%] hidden md:block">
                  <img
                    src={banner.image_url ?? heroBanner}
                    alt={banner.title}
                    className="w-full h-full object-cover object-left"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom navigation arrows */}
        <button className="banner-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all hover:shadow-lg">
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="banner-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all hover:shadow-lg">
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* ── Category Quick Nav ── */}
      {productLines.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {productLines.map((pl, i) => (
                <Link
                  key={pl.id}
                  to={`/product-lines/${pl.slug}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-brand/8 hover:text-brand transition-all whitespace-nowrap"
                >
                  <span>{LINE_ICONS[i] || '🧸'}</span>
                  <span>{pl.name}</span>
                </Link>
              ))}
              <Link
                to="/product-lines"
                className="flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold text-brand hover:bg-brand/8 transition-all whitespace-nowrap"
              >
                All Product Lines →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured / New Products ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'featured' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              New Arrivals
            </button>
          </div>
          <Link
            to={activeTab === 'featured' ? '/products?is_featured=true' : '/products?is_new=true'}
            className="text-sm text-gray-400 hover:text-brand transition-colors"
          >
            View All →
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: true }}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
          >
            {displayProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} showPrice={!!user} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-16 text-gray-300 text-sm">No products available</div>
        )}
      </section>

      {/* ── Product Lines Grid ── */}
      <section className="bg-gray-50/60 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-gray-800">Browse by Product Line</h2>
            <Link to="/product-lines" className="text-sm text-gray-400 hover:text-brand transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {productLines.slice(0, 8).map((pl, i) => (
              <Link key={pl.id} to={`/product-lines/${pl.slug}`} className="group block">
                <div className={`bg-gradient-to-br ${LINE_COLORS[i] || 'from-gray-100 to-gray-50'} rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">
                    {LINE_ICONS[i] || '🧸'}
                  </div>
                  <h3 className="font-bold text-sm text-gray-700 group-hover:text-brand transition-colors leading-tight">{pl.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{pl.product_count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Promise Banner ── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-brand-light/30 via-white to-accent/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="text-6xl flex-shrink-0">🏭</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Trusted B2B Plush Toy Manufacturer</h2>
              <p className="text-gray-500 leading-relaxed mb-5 max-w-2xl">
                10+ years of export experience. Products certified by CE, CPC, ASTM and other international safety standards, exported to 50+ countries across Europe, America, Japan, Korea, and beyond.
                Full OEM/ODM service — from creative design to bulk delivery.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link to="/about" className="px-6 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-full hover:bg-brand transition-colors">
                  About Our Factory
                </Link>
                <Link to="/inquiry" className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-full hover:border-brand hover:text-brand transition-colors">
                  Get a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Feature Cards ── */}
      <section className="pb-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '📋', title: 'Online Inquiry', desc: 'Tell us your needs — we reply within 24 hours', to: '/inquiry', color: 'brand' },
              { icon: '🎨', title: 'OEM/ODM Custom', desc: 'Exclusive design & sampling, flexible MOQ negotiation', to: '/inquiry', color: 'accent' },
              { icon: '🌍', title: 'Global Export', desc: 'Serving 50+ countries with professional logistics', to: '/about', color: 'mint' },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-brand/8 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm mb-0.5">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
