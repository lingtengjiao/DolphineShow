import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiFilter, FiX } from 'react-icons/fi'
import { productApi, productLineApi } from '../api'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/product/ProductCard'
import type { ProductLine, PaginatedProducts } from '../types'

export default function Products() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [productLines, setProductLines] = useState<ProductLine[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const slug = searchParams.get('product_line_slug') || ''
  const search = searchParams.get('search') || ''
  const isFeatured = searchParams.get('is_featured')
  const isNew = searchParams.get('is_new')
  const sortBy = searchParams.get('sort_by') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('page_size') || '16')

  useEffect(() => {
    productLineApi.list().then((r) => setProductLines(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
    }
    if (slug) params.product_line_slug = slug
    if (search) params.search = search
    if (isFeatured) params.is_featured = true
    if (isNew) params.is_new = true

    productApi.list(params).then((r) => setData(r.data)).finally(() => setLoading(false))
  }, [slug, search, isFeatured, isNew, sortBy, page, pageSize])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  const title = isFeatured ? 'Featured' : isNew ? 'New Arrivals' : slug ? productLines.find(pl => pl.slug === slug)?.name || 'Products' : search ? `Search: ${search}` : 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{title}</span>
      </nav>

      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-brand hover:text-brand transition-colors"
        >
          {showFilters ? <FiX size={15} /> : <FiFilter size={15} />}
          {showFilters ? 'Close' : 'Filter'}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => { const p = new URLSearchParams(); setSearchParams(p); setShowFilters(false) }}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${!slug && !isFeatured && !isNew ? 'bg-brand text-white' : 'text-gray-600 hover:bg-brand-light/20'}`}
              >
                All Products
              </button>
            </li>
            {productLines.map((pl) => (
              <li key={pl.id}>
                <button
                  onClick={() => { setParam('product_line_slug', pl.slug); setShowFilters(false) }}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${slug === pl.slug ? 'bg-brand text-white' : 'text-gray-600 hover:bg-brand-light/20'}`}
                >
                  {pl.name}
                  <span className="text-xs opacity-60 ml-1">({pl.product_count})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - desktop only */}
        <aside className="hidden lg:block lg:w-56 flex-shrink-0">
          <h2 className="text-xl font-extrabold font-bold text-gray-800 mb-4">{title}</h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => { const p = new URLSearchParams(); setSearchParams(p) }}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${!slug && !isFeatured && !isNew ? 'bg-brand text-white' : 'text-gray-600 hover:bg-brand-light/20'}`}
              >
                All Products
              </button>
            </li>
            {productLines.map((pl) => (
              <li key={pl.id}>
                <button
                  onClick={() => setParam('product_line_slug', pl.slug)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${slug === pl.slug ? 'bg-brand text-white' : 'text-gray-600 hover:bg-brand-light/20'}`}
                >
                  {pl.name}
                  <span className="text-xs opacity-60 ml-1">({pl.product_count})</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-lg p-4 shadow-sm">
            <span className="text-sm text-gray-500">
              {data ? `${data.total} products found` : 'Loading...'}
            </span>
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => setParam('page_size', e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="16">16 / page</option>
                <option value="32">32 / page</option>
                <option value="64">64 / page</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setParam('sort_by', e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name_asc">Name A–Z</option>
                <option value="name_desc">Name Z–A</option>
                <option value="price_asc">Price Low–High</option>
                <option value="price_desc">Price High–Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-16">Loading...</div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} showPrice={!!user} />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.total_pages || Math.abs(p - page) <= 2)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setParam('page', String(p))}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${p === page ? 'bg-brand text-white' : 'text-gray-600 hover:bg-brand-light/20'}`}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-16">No products found</div>
          )}
        </div>
      </div>
    </div>
  )
}
