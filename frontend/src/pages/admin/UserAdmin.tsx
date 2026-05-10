import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FiUsers, FiSearch, FiMail, FiPhone, FiCalendar, FiShield, FiShieldOff } from 'react-icons/fi'
import { adminApi } from '../../api'
import type { User } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import TableSkeleton from '../../components/admin/TableSkeleton'

export default function UserAdmin() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)
  const [toggling, setToggling] = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.users({ role: 'b2b_client' }).then((r) => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.company_name?.toLowerCase().includes(q) ||
        u.contact_person?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.includes(q),
    )
  }, [users, search])

  const handleToggle = async () => {
    if (!toggleTarget) return
    setToggling(true)
    try {
      await adminApi.toggleUserActive(toggleTarget.id)
      toast.success(toggleTarget.is_active ? '已禁用该客户' : '已启用该客户')
      setToggleTarget(null)
      load()
    } catch {
      toast.error('操作失败')
    } finally {
      setToggling(false)
    }
  }

  const activeCount = users.filter((u) => u.is_active).length

  return (
    <div>
      <PageHeader
        title="B2B 客户管理"
        subtitle={`共 ${users.length} 位客户，${activeCount} 位活跃`}
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公司、联系人、邮箱..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
          />
        </div>
      </div>

      {/* Toggle confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? '禁用客户' : '启用客户'}
        message={
          toggleTarget?.is_active
            ? `确定要禁用「${toggleTarget?.company_name || toggleTarget?.email}」吗？禁用后该客户将无法登录系统。`
            : `确定要启用「${toggleTarget?.company_name || toggleTarget?.email}」吗？启用后该客户可以正常登录。`
        }
        confirmLabel={toggleTarget?.is_active ? '确认禁用' : '确认启用'}
        danger={toggleTarget?.is_active ?? false}
        loading={toggling}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiUsers size={28} />}
          title={search ? '没有找到匹配的客户' : '暂无 B2B 客户'}
          description={search ? '请尝试其他搜索关键词' : '客户注册后将显示在这里'}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100/80">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">客户</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">联系方式</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">注册时间</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">状态</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        u.is_active ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}>
                        {u.contact_person?.[0] || u.company_name?.[0] || u.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-gray-700 truncate">{u.company_name || '-'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{u.contact_person || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="space-y-1">
                      <p className="text-[12px] text-gray-500 flex items-center gap-1.5"><FiMail size={11} className="text-gray-400" /> {u.email}</p>
                      {u.phone && <p className="text-[12px] text-gray-500 flex items-center gap-1.5"><FiPhone size={11} className="text-gray-400" /> {u.phone}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-[12px] text-gray-400 flex items-center gap-1.5">
                      <FiCalendar size={11} />
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {u.is_active ? '活跃' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setToggleTarget(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                        u.is_active
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.is_active ? <><FiShieldOff size={13} /> 禁用</> : <><FiShield size={13} /> 启用</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
