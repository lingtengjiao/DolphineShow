import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiLayers, FiBox, FiMail, FiUsers, FiClock, FiArrowRight, FiPlus, FiTrendingUp } from 'react-icons/fi'
import { adminApi, inquiryApi } from '../../api'
import type { DashboardStats, Inquiry } from '../../types'

const statCards = [
  { key: 'product_lines' as const, label: '产品线', icon: FiLayers, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', link: '/admin/product-lines' },
  { key: 'products' as const, label: '产品总数', icon: FiBox, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', link: '/admin/products' },
  { key: 'inquiries_total' as const, label: '询盘总数', icon: FiMail, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', link: '/admin/inquiries' },
  { key: 'inquiries_pending' as const, label: '待处理', icon: FiClock, gradient: 'from-rose-400 to-red-500', bg: 'bg-rose-50', link: '/admin/inquiries' },
  { key: 'b2b_clients' as const, label: 'B2B客户', icon: FiUsers, gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', link: '/admin/users' },
]

const quickActions = [
  { label: '新增产品', icon: FiBox, link: '/admin/products', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
  { label: '新增产品线', icon: FiLayers, link: '/admin/product-lines', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
  { label: '处理询盘', icon: FiMail, link: '/admin/inquiries', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.dashboard().then((r) => setStats(r.data)),
      inquiryApi.adminList({ page_size: 5 } as any).then((r) => setRecentInquiries(Array.isArray(r.data) ? r.data.slice(0, 5) : [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 bg-gray-200 rounded-lg w-32 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-12 mb-2" />
              <div className="h-6 bg-gray-100 rounded w-8" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">仪表盘</h1>
        <p className="text-sm text-gray-400 mt-0.5">业务数据一览</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          return (
            <Link
              key={card.key}
              to={card.link}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200/80 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon size={18} />
              </div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-extrabold text-gray-800">{value}</span>
                <FiTrendingUp size={14} className="text-gray-300 group-hover:text-brand transition-colors mb-1" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent inquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/80">
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">最近询盘</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">最新的客户询盘记录</p>
            </div>
            <Link to="/admin/inquiries" className="text-[13px] text-brand font-medium hover:text-brand-dark flex items-center gap-1 transition-colors">
              查看全部 <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInquiries.length > 0 ? recentInquiries.map((inq) => (
              <div key={inq.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                  {inq.contact_person?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-gray-700 truncate">{inq.contact_person}</span>
                    <span className="text-[11px] text-gray-400 truncate">{inq.company_name}</span>
                  </div>
                  <p className="text-[12px] text-gray-400 truncate">{inq.message}</p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    inq.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    inq.status === 'replied' ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {inq.status === 'pending' ? '待处理' : inq.status === 'replied' ? '已回复' : '已关闭'}
                  </span>
                  <span className="text-[10px] text-gray-300 mt-1">{new Date(inq.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            )) : (
              <div className="px-6 py-10 text-center text-sm text-gray-400">暂无询盘记录</div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
          <div className="px-6 py-4 border-b border-gray-100/80">
            <h2 className="text-[15px] font-bold text-gray-800">快捷操作</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">常用功能入口</p>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.link}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-colors ${action.color}`}
                >
                  <Icon size={18} />
                  {action.label}
                  <FiPlus size={14} className="ml-auto opacity-50" />
                </Link>
              )
            })}
          </div>

          {/* Tip card */}
          <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-brand/5 to-accent/5 rounded-xl border border-brand/10">
            <p className="text-[12px] font-semibold text-gray-600 mb-1">管理小贴士</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              及时回复客户询盘可以提高转化率。建议在收到询盘后 24 小时内进行回复。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
