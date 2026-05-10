import { Link } from 'react-router-dom'
import type { Product } from '../../types'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23FDF2F5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23FFB3C6" font-size="72"%3E🧸%3C/text%3E%3C/svg%3E'

interface Props {
  product: Product
  showPrice?: boolean
}

export default function ProductCard({ product, showPrice = false }: Props) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.main_image || PLACEHOLDER}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-300 mb-1 font-medium">{product.product_line_name}</p>
        <h3 className="font-bold text-gray-700 text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {product.name}
        </h3>
        <div className="mt-2.5 flex items-center justify-between">
          {showPrice && product.price ? (
            <span className="text-brand font-extrabold">${product.price}</span>
          ) : (
            <span className="text-xs text-gray-300 italic">Sign in for price</span>
          )}
          {product.is_new && (
            <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold">NEW</span>
          )}
        </div>
        <p className="text-xs text-gray-300 mt-1.5">SKU: {product.sku}</p>
      </div>
    </Link>
  )
}
