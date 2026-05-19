import { useState } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { FiGrid, FiLayers, FiBox, FiMail, FiUsers, FiArrowLeft, FiLogOut, FiMenu, FiX, FiChevronRight, FiImage, FiCamera, FiMessageSquare } from 'react-icons/fi'
import { useAuthStore } from '../../store/auth'

const navItems = [
  { to: '/admin', icon: FiGrid, label: '仪表盘', end: true },
  { to: '/admin/product-lines', icon: FiLayers, label: '产品线管理' },
  { to: '/admin/products', icon: FiBox, label: '产品管理' },
  { to: '/admin/inquiries', icon: FiMail, label: '询盘管理' },
  { to: '/admin/users', icon: FiUsers, label: '客户管理' },
  { to: '/admin/banners', icon: FiImage, label: 'Banner 管理' },
  { to: '/admin/company-images', icon: FiCamera, label: '公司图片' },
  { to: '/admin/reviews', icon: FiMessageSquare, label: '客户评价' },
]

const breadcrumbMap: Record<string, string> = {
  '/admin': '仪表盘',
  '/admin/product-lines': '产品线管理',
  '/admin/products': '产品管理',
  '/admin/inquiries': '询盘管理',
  '/admin/users': '客户管理',
  '/admin/banners': 'Banner 管理',
  '/admin/company-images': '公司图片',
  '/admin/reviews': '客户评价',
}

export default function AdminLayout() {
  const { user, loading, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-medium">正在加载...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const currentPage = breadcrumbMap[location.pathname] || '仪表盘'

  return (
    <div className="min-h-screen flex bg-gray-50/80">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto w-64 h-screen bg-white border-r border-gray-100/80 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo area */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-sm font-bold shadow-sm">P</div>
            <span className="text-[15px] font-bold text-gray-800 tracking-tight">PlushToy 管理</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand/8 text-brand shadow-sm shadow-brand/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon size={18} className="flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100/80">
          <div className="px-3 py-2.5 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.contact_person?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-700 truncate">{user.contact_person || 'Admin'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:text-brand hover:bg-gray-50 transition-colors">
            <FiArrowLeft size={16} /> 返回前台
          </NavLink>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-colors">
            <FiLogOut size={16} /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100/80 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 -ml-1">
            <FiMenu size={22} />
          </button>
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400">管理后台</span>
            <FiChevronRight size={14} className="text-gray-300" />
            <span className="font-medium text-gray-700">{currentPage}</span>
          </nav>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
