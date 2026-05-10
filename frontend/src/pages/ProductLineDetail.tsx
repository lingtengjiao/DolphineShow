import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { productApi, productLineApi } from '../api'
import { useAuthStore } from '../store/auth'
import ProductCard from '../components/product/ProductCard'
import type { ProductLine, PaginatedProducts } from '../types'

export default function ProductLineDetail() {
  const { slug } = useParams()
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [productLine, setProductLine] = useState<ProductLine | null>(null)
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)

  const sortBy = searchParams.get('sort_by') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('page_size') || '16')

  useEffect(() => {
    if (!slug) return
    productLineApi.get(slug).then((r) => setProductLine(r.data)).catch(() => {})
  }, [slug])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productApi
      .list({ product_line_slug: slug, page, page_size: pageSize, sort_by: sortBy })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [slug, page, pageSize, sortBy])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(key, value)
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/product-lines" className="hover:text-brand">All Product Lines</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{productLine?.name || slug}</span>
      </nav>

      {/* Product line header */}
      {productLine && (
        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold font-bold text-gray-800 mb-3">{productLine.name}</h1>
          {productLine.description && (
            <p className="text-gray-600 leading-relaxed">{productLine.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-3">{productLine.product_count} products total</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-lg p-4 shadow-sm">
        <span className="text-sm text-gray-500">{data ? `${data.total} products found` : 'Loading...'}</span>
        <div className="flex items-center gap-4">
          <select value={pageSize} onChange={(e) => setParam('page_size', e.target.value)} className="text-sm border rounded px-2 py-1">
            <option value="16">16 / page</option>
            <option value="32">32 / page</option>
            <option value="64">64 / page</option>
          </select>
          <select value={sortBy} onChange={(e) => setParam('sort_by', e.target.value)} className="text-sm border rounded px-2 py-1">
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
                    <span key={`e-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setParam('page', String(p))}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${p === page ? 'bg-brand text-white' : 'text-gray-600 hover:bg-brand-light/20'}`}
                    >
                      {p}
                    </button>
                  ),
                )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400 py-16">No products in this line</div>
      )}
    </div>
  )
}
