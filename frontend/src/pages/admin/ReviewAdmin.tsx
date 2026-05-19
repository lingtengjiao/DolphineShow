import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiMessageSquare } from 'react-icons/fi'
import { reviewApi } from '../../api'
import type { CustomerReview } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'

interface ReviewForm {
  reviewer_name: string
  reviewer_company: string
  reviewer_country: string
  content: string
  rating: number
  avatar_url: string
  sort_order: number
  is_active: boolean
}

const emptyForm: ReviewForm = {
  reviewer_name: '',
  reviewer_company: '',
  reviewer_country: '',
  content: '',
  rating: 5,
  avatar_url: '',
  sort_order: 0,
  is_active: true,
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            star <= value ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-amber-300'
          }`}
        >
          <FiStar size={20} fill={star <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewAdmin() {
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ReviewForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadReviews = useCallback(() => {
    setLoading(true)
    reviewApi.adminList().then((r) => setReviews(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadReviews() }, [loadReviews])

  const handleCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleEdit = (review: CustomerReview) => {
    setEditingId(review.id)
    setForm({
      reviewer_name: review.reviewer_name,
      reviewer_company: review.reviewer_company || '',
      reviewer_country: review.reviewer_country || '',
      content: review.content,
      rating: review.rating,
      avatar_url: review.avatar_url || '',
      sort_order: review.sort_order,
      is_active: review.is_active,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.reviewer_name.trim()) return toast.error('客户名称不能为空')
    if (!form.content.trim()) return toast.error('评价内容不能为空')
    setSaving(true)
    try {
      const payload = {
        ...form,
        reviewer_company: form.reviewer_company || null,
        reviewer_country: form.reviewer_country || null,
        avatar_url: form.avatar_url || null,
      }
      if (editingId) {
        await reviewApi.update(editingId, payload)
        toast.success('更新成功')
      } else {
        await reviewApi.create(payload)
        toast.success('添加成功')
      }
      setShowForm(false)
      loadReviews()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || '操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await reviewApi.delete(deleteTarget.id)
      toast.success('已删除')
      setDeleteTarget(null)
      loadReviews()
    } catch {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"

  return (
    <div>
      <PageHeader
        title="客户评价管理"
        subtitle="管理在产品详情页展示的客户评价"
        actions={
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all">
            <FiPlus size={16} /> 添加评价
          </button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? '编辑评价' : '添加评价'}
        maxWidth="max-w-lg"
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">客户姓名 *</label>
              <input value={form.reviewer_name} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} className={inputCls} placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">所在国家</label>
              <input value={form.reviewer_country} onChange={(e) => setForm({ ...form, reviewer_country: e.target.value })} className={inputCls} placeholder="USA" />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">公司名称</label>
            <input value={form.reviewer_company} onChange={(e) => setForm({ ...form, reviewer_company: e.target.value })} className={inputCls} placeholder="ABC Toys Ltd." />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">评分</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">评价内容 *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder="输入客户评价内容..."
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">头像 URL（选填）</label>
            <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className={inputCls} placeholder="https://..." type="url" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">排序</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="peer sr-only" />
                  <div className="w-9 h-5 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500" />
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <span className="text-[13px] font-medium text-gray-600">显示</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除评价"
        message={`确定要删除「${deleteTarget?.name}」的评价吗？`}
        confirmLabel="确认删除"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">加载中...</div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<FiMessageSquare size={28} />}
          title="暂无客户评价"
          description="添加客户评价以增强产品可信度"
          action={
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark transition-colors">
              <FiPlus size={16} /> 添加评价
            </button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${review.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'} relative group`}>
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-3 line-clamp-3">"{review.content}"</p>
              <div className="flex items-center gap-2.5 border-t border-gray-50 pt-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-brand text-[12px] font-bold flex-shrink-0">
                  {review.reviewer_name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-700 truncate">{review.reviewer_name}</p>
                  {(review.reviewer_company || review.reviewer_country) && (
                    <p className="text-[11px] text-gray-400 truncate">
                      {[review.reviewer_company, review.reviewer_country].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(review)} className="w-7 h-7 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-brand transition-colors">
                  <FiEdit2 size={12} />
                </button>
                <button onClick={() => setDeleteTarget({ id: review.id, name: review.reviewer_name })} className="w-7 h-7 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                  <FiTrash2 size={12} />
                </button>
              </div>
              {!review.is_active && (
                <span className="absolute top-3 left-3 text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">隐藏</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
