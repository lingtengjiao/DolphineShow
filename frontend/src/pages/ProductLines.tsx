import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productLineApi } from '../api'
import type { ProductLine } from '../types'

function ProductLineCard({ pl, sub }: { pl: ProductLine; sub?: boolean }) {
  return (
    <Link
      to={`/product-lines/${pl.slug}`}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${sub ? 'border border-gray-100' : ''}`}
    >
      <div className={`bg-brand-light/10 flex items-center justify-center ${sub ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}>
        {pl.cover_image ? (
          <img src={pl.cover_image} alt={pl.name} className="w-full h-full object-cover" />
        ) : (
          <span className={sub ? 'text-4xl' : 'text-6xl'}>🧸</span>
        )}
      </div>
      <div className={sub ? 'p-3' : 'p-5'}>
        <h3 className={`font-bold text-gray-800 group-hover:text-brand transition-colors ${sub ? 'text-sm' : 'text-lg'}`}>
          {pl.name}
        </h3>
        {!sub && pl.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pl.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-brand font-medium ${sub ? 'text-xs' : 'text-sm'}`}>
            {pl.product_count} products
          </span>
          <span className="text-brand group-hover:translate-x-1 transition-transform text-sm">→</span>
        </div>
      </div>
    </Link>
  )
}

export default function ProductLines() {
  const [lines, setLines] = useState<ProductLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productLineApi.tree().then((r) => setLines(r.data)).finally(() => setLoading(false))
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

      <h1 className="text-2xl md:text-3xl font-extrabold font-bold text-gray-800 mb-8">All Product Lines</h1>

      <div className="space-y-10">
        {lines.map((pl) => {
          const hasChildren = (pl.children?.length ?? 0) > 0
          return (
            <section key={pl.id}>
              {hasChildren ? (
                <>
                  {/* Parent header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{pl.name}</h2>
                      {pl.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{pl.description}</p>
                      )}
                    </div>
                    <Link
                      to={`/product-lines/${pl.slug}`}
                      className="text-sm text-brand hover:underline whitespace-nowrap ml-4"
                    >
                      View all →
                    </Link>
                  </div>
                  {/* Sub-line grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pl.children!.map((child) => (
                      <ProductLineCard key={child.id} pl={child} sub />
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <ProductLineCard pl={pl} />
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
