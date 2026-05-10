import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiUser, FiMenu, FiX, FiPhone, FiMail } from 'react-icons/fi'
import { FaWeixin, FaInstagram, FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import { useAuthStore } from '../../store/auth'
import { productLineApi } from '../../api'
import type { ProductLine } from '../../types'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [productLines, setProductLines] = useState<ProductLine[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    productLineApi.list().then((r) => setProductLines(r.data)).catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top announcement bar */}
      <div className="bg-[#C8A96E] text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
        <span className="hidden md:inline">🎉 &nbsp;Professional Plush Toy B2B Supplier &nbsp;·&nbsp; OEM/ODM Custom Manufacturing &nbsp;·&nbsp; CE / CPC / ASTM Certified &nbsp;·&nbsp;</span>
        <span className="md:hidden">🎉 &nbsp;B2B Plush Toy OEM Manufacturer &nbsp;·&nbsp;</span>
        <a href="mailto:admin@dolphineshow.com" className="underline underline-offset-2 hover:opacity-80 transition-opacity">Contact Us Now</a>
      </div>

      {/* Top info bar */}
      <div className="hidden md:block border-b border-gray-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-5">
            <a href="tel:+8657985373662" className="flex items-center gap-1.5 hover:text-brand transition-colors">
              <FiPhone size={12} />
              <span>+86-579-85373662</span>
            </a>
            <a href="mailto:admin@dolphineshow.com" className="flex items-center gap-1.5 hover:text-brand transition-colors">
              <FiMail size={12} />
              <span>admin@dolphineshow.com</span>
            </a>
            <span className="text-gray-300">|</span>
            <span>Mon–Fri 9:00–18:00 (GMT+8)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-300">Follow Us</span>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500 transition-colors"><FaInstagram size={14} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-blue-500 transition-colors"><FaFacebookF size={13} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-700 transition-colors"><FaLinkedinIn size={13} /></a>
            <a href="#" aria-label="WhatsApp" className="hover:text-green-500 transition-colors"><FaWhatsapp size={14} /></a>
            <span className="text-gray-200">|</span>
            <a href="#" aria-label="WeChat" className="hover:text-green-500 transition-colors"><FaWeixin size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <span className="text-3xl">🧸</span>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            <span className="text-gray-800">Dolphine</span>
            <span className="text-brand">Show</span>
            <span className="text-gray-400 font-medium text-base">. Monnca</span>
          </h1>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full bg-gray-50 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:bg-white border border-transparent focus:border-brand/30 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition-colors">
              <FiSearch size={18} />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to={user.role === 'admin' ? '/admin' : '/account'} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors">
                <FiUser size={16} />
                <span>{user.contact_person || user.email}</span>
              </Link>
              <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">Sign Out</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand border border-brand/30 rounded-full hover:bg-brand hover:text-white transition-all">
              <FiUser size={15} />
              <span>Sign In</span>
            </Link>
          )}
          <button className="md:hidden text-gray-500" onClick={() => setShowMobile(!showMobile)}>
            {showMobile ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="hidden md:flex items-center gap-1">
            <li
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <Link to="/product-lines" className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-brand rounded-lg hover:bg-brand/5 transition-all">
                All Product Lines
              </Link>
              {showDropdown && productLines.length > 0 && (
                <div className="absolute left-0 top-full bg-white shadow-lg shadow-gray-200/50 rounded-xl min-w-56 py-2 z-50 border border-gray-100">
                  {productLines.map((pl) => (
                    <Link
                      key={pl.id}
                      to={`/product-lines/${pl.slug}`}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-brand/5 hover:text-brand transition-all"
                      onClick={() => setShowDropdown(false)}
                    >
                      {pl.name}
                      <span className="text-xs text-gray-300 ml-2">({pl.product_count})</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
            <li>
              <Link to="/products?is_new=true" className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-brand rounded-lg hover:bg-brand/5 transition-all">New Arrivals</Link>
            </li>
            <li>
              <Link to="/products?is_featured=true" className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-brand rounded-lg hover:bg-brand/5 transition-all">Featured</Link>
            </li>
            <li>
              <Link to="/about" className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-brand rounded-lg hover:bg-brand/5 transition-all">About Us</Link>
            </li>
            <li>
              <Link to="/inquiry" className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-brand rounded-lg hover:bg-brand/5 transition-all">Inquiry</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {showMobile && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <form onSubmit={handleSearch} className="p-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-gray-50 rounded-full pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </form>
          <nav className="pb-4">
            {[
              { to: '/product-lines', label: 'All Product Lines' },
              { to: '/products?is_new=true', label: 'New Arrivals' },
              { to: '/products?is_featured=true', label: 'Featured' },
              { to: '/about', label: 'About Us' },
              { to: '/inquiry', label: 'Inquiry' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="block px-6 py-3 text-gray-600 hover:text-brand hover:bg-brand/5 transition-all" onClick={() => setShowMobile(false)}>
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/account'} className="block px-6 py-3 text-gray-600 hover:text-brand" onClick={() => setShowMobile(false)}>
                  My Account
                </Link>
                <button onClick={() => { logout(); setShowMobile(false) }} className="block w-full text-left px-6 py-3 text-red-400 hover:bg-red-50">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="block px-6 py-3 text-brand font-semibold" onClick={() => setShowMobile(false)}>
                Sign In / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
