import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FiMail, FiClock, FiCheckCircle, FiXCircle, FiSend, FiUser, FiPhone, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { inquiryApi } from '../../api'
import type { Inquiry } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import EmptyState from '../../components/admin/EmptyState'

type StatusFilter = 'all' | 'pending' | 'replied' | 'closed'

const tabs: { key: StatusFilter; label: string; icon: typeof FiMail }[] = [
  { key: 'all', label: '全部', icon: FiMail },
  { key: 'pending', label: '待处理', icon: FiClock },
  { key: 'replied', label: '已回复', icon: FiCheckCircle },
  { key: 'closed', label: '已关闭', icon: FiXCircle },
]

const statusStyle: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: '待处理', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  replied: { label: '已回复', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  closed: { label: '已关闭', dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-500' },
}

export default function InquiryAdmin() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [replyTo, setReplyTo] = useState<Inquiry | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    inquiryApi.adminList().then((r) => setInquiries(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(
    () => (filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter)),
    [inquiries, filter],
  )

  const counts = useMemo(() => ({
    all: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'pending').length,
    replied: inquiries.filter((i) => i.status === 'replied').length,
    closed: inquiries.filter((i) => i.status === 'closed').length,
  }), [inquiries])

  const handleReply = async () => {
    if (!replyTo || !replyText.trim()) return toast.error('请输入回复内容')
    setReplying(true)
    try {
      await inquiryApi.reply(replyTo.id, { admin_reply: replyText, status: 'replied' })
      toast.success('回复成功')
      setReplyTo(null)
      setReplyText('')
      load()
    } catch {
      toast.error('回复失败')
    } finally {
      setReplying(false)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
    return d.toLocaleDateString('zh-CN')
  }

  return (
    <div>
      <PageHeader
        title="询盘管理"
        subtitle={counts.pending > 0 ? `${counts.pending} 条待处理` : '所有询盘已处理'}
      />

      {/* Reply Modal */}
      <Modal
        open={!!replyTo}
        onClose={() => { setReplyTo(null); setReplyText('') }}
        title="回复询盘"
        footer={
          <>
            <button onClick={() => { setReplyTo(null); setReplyText('') }} className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={handleReply} disabled={replying || !replyText.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all disabled:opacity-50">
              <FiSend size={14} /> {replying ? '发送中...' : '发送回复'}
            </button>
          </>
        }
      >
        {replyTo && (
          <div className="space-y-4">
            {/* Original message card */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {replyTo.contact_person?.[0] || '?'}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-700">{replyTo.contact_person}</p>
                  <p className="text-[11px] text-gray-400">{replyTo.company_name} · {replyTo.email}</p>
                </div>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">{replyTo.message}</p>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1.5">回复内容</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
                rows={5}
                placeholder="输入回复内容..."
                autoFocus
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-brand text-white shadow-sm shadow-brand/20'
                  : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              <span className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100/80 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
                  <div className="h-2.5 bg-gray-50 rounded w-40" />
                </div>
                <div className="h-5 bg-gray-100 rounded-lg w-14" />
              </div>
              <div className="h-3 bg-gray-50 rounded w-full mb-1.5" />
              <div className="h-3 bg-gray-50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiMail size={28} />}
          title={filter === 'all' ? '暂无询盘' : `没有${tabs.find((t) => t.key === filter)?.label}的询盘`}
          description="客户提交的询盘将显示在这里"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => {
            const st = statusStyle[inq.status]
            const expanded = expandedId === inq.id
            return (
              <div key={inq.id} className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Main row */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      inq.status === 'pending' ? 'bg-gradient-to-br from-amber-400 to-orange-400' :
                      inq.status === 'replied' ? 'bg-gradient-to-br from-emerald-400 to-teal-400' :
                      'bg-gradient-to-br from-gray-300 to-gray-400'
                    }`}>
                      {inq.contact_person?.[0] || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-semibold text-gray-800">{inq.contact_person}</span>
                        <span className="text-[12px] text-gray-400">{inq.company_name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">{inq.message}</p>

                      {/* Contact info + time */}
                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><FiMail size={11} /> {inq.email}</span>
                        {inq.phone && <span className="flex items-center gap-1"><FiPhone size={11} /> {inq.phone}</span>}
                        <span className="flex items-center gap-1"><FiClock size={11} /> {formatTime(inq.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {inq.status === 'pending' && (
                        <button
                          onClick={() => { setReplyTo(inq); setReplyText('') }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand text-white rounded-xl text-[12px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all"
                        >
                          <FiSend size={13} /> 回复
                        </button>
                      )}
                      {inq.admin_reply && (
                        <button
                          onClick={() => setExpandedId(expanded ? null : inq.id)}
                          className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          {expanded ? '收起' : '查看回复'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded reply */}
                {expanded && inq.admin_reply && (
                  <div className="px-5 pb-5">
                    <div className="ml-14 bg-emerald-50/70 rounded-xl p-4 border border-emerald-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <FiUser size={10} className="text-white" />
                        </div>
                        <span className="text-[12px] font-semibold text-emerald-700">管理员回复</span>
                      </div>
                      <p className="text-[13px] text-emerald-800 leading-relaxed">{inq.admin_reply}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
