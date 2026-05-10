import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧸</span>
            <span className="text-lg font-extrabold text-gray-800">DolphineShow<span className="text-brand">.</span> Monnca</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Professional plush toy manufacturer with 10+ years of industry experience. OEM/ODM custom services — from design to production, all in one place.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-4 text-sm">Products</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/product-lines" className="hover:text-brand transition-colors">All Product Lines</Link></li>
            <li><Link to="/products?is_new=true" className="hover:text-brand transition-colors">New Arrivals</Link></li>
            <li><Link to="/products?is_featured=true" className="hover:text-brand transition-colors">Featured</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-4 text-sm">Customer Service</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-brand transition-colors">About Us</Link></li>
            <li><Link to="/inquiry" className="hover:text-brand transition-colors">Online Inquiry</Link></li>
            <li><Link to="/login" className="hover:text-brand transition-colors">B2B Client Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-4 text-sm">Contact Info</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li>👤 Jeckey Song（Sales Dept）</li>
            <li>📞 +86-579-85373662 / +86-18657997522</li>
            <li>✉️ admin@dolphineshow.com</li>
            <li>📍 NO.70365# 5F, District 5, International Trade City, YiWu, ZheJiang, China</li>
            <li>🕐 Mon–Fri 9:00–18:00 (GMT+8)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-300">
          © {new Date().getFullYear()} DolphineShow. Monnca. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
