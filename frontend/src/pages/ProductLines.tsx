import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productLineApi } from '../api'
import type { ProductLine } from '../types'

export default function ProductLines() {
  const [lines, setLines] = useState<ProductLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productLineApi.list().then((r) => setLines(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">All Product Lines</span>
      </nav>

      <h1 className="text-3xl font-extrabold font-bold text-gray-800 mb-8">All Product Lines</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {lines.map((pl) => (
          <Link
            key={pl.id}
            to={`/product-lines/${pl.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-[4/3] bg-brand-light/10 flex items-center justify-center">
              {pl.cover_image ? (
                <img src={pl.cover_image} alt={pl.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">🧸</span>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-brand transition-colors">{pl.name}</h2>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pl.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-brand font-medium">{pl.product_count} products</span>
                <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
