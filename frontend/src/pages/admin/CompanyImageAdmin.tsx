import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi'
import { companyImageApi, uploadApi } from '../../api'
import type { CompanyImage } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'

const CATEGORY_OPTIONS = [
  { value: 'factory', label: '工厂实力' },
  { value: 'team', label: '团队风采' },
  { value: 'brand', label: '品牌故事' },
  { value: 'certificate', label: '资质认证' },
  { value: 'other', label: '其他' },
]

interface ImageForm {
  url: string
  category: string
  caption: string
  sort_order: number
  is_active: boolean
}

const emptyForm: ImageForm = {
  url: '',
  category: 'factory',
  caption: '',
  sort_order: 0,
  is_active: true,
}

export default function CompanyImageAdmin() {
  const [images, setImages] = useState<CompanyImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ImageForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadImages = useCallback(() => {
    setLoading(true)
    companyImageApi.adminList().then((r) => setImages(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadImages() }, [loadImages])

  const handleCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleEdit = (img: CompanyImage) => {
    setEditingId(img.id)
    setForm({
      url: img.url,
      category: img.category,
      caption: img.caption || '',
      sort_order: img.sort_order,
      is_active: img.is_active,
    })
    setShowForm(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data: result } = await uploadApi.image(file)
      setForm((prev) => ({ ...prev, url: result.url }))
      toast.success('上传成功')
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.url) return toast.error('请先上传图片')
    setSaving(true)
    try {
      const payload = { ...form, caption: form.caption || null }
      if (editingId) {
        await companyImageApi.update(editingId, payload)
        toast.success('更新成功')
      } else {
        await companyImageApi.create(payload)
        toast.success('添加成功')
      }
      setShowForm(false)
      loadImages()
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
      await companyImageApi.delete(deleteTarget.id)
      toast.success('已删除')
      setDeleteTarget(null)
      loadImages()
    } catch {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"

  const groupedImages = CATEGORY_OPTIONS.reduce<Record<string, CompanyImage[]>>((acc, cat) => {
    acc[cat.value] = images.filter((img) => img.category === cat.value)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="公司图片管理"
        subtitle="管理工厂实力、品牌故事等展示图片，在产品详情页 About Us 区块展示"
        actions={
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all">
            <FiPlus size={16} /> 添加图片
          </button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? '编辑图片' : '添加图片'}
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
          {/* Upload */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">图片</label>
            {form.url ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={form.url} className="w-full h-full object-cover" alt="" />
                <button onClick={() => setForm({ ...form, url: '' })} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiX size={20} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors">
                <FiUpload size={22} className="text-gray-300 mb-2" />
                <span className="text-[12px] text-gray-400">{uploading ? '上传中...' : '点击上传图片'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">分类</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">图片说明（选填）</label>
            <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className={inputCls} placeholder="图片描述文字" />
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">排序（数字越小越靠前）</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="peer sr-only" />
              <div className="w-9 h-5 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500" />
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.is_active ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
            <span className="text-[13px] font-medium text-gray-600">显示</span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除图片"
        message="确定要删除这张图片吗？"
        confirmLabel="确认删除"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">加载中...</div>
      ) : images.length === 0 ? (
        <EmptyState
          icon={<FiImage size={28} />}
          title="暂无图片"
          description="添加工厂、品牌等展示图片"
          action={
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark transition-colors">
              <FiPlus size={16} /> 添加图片
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {CATEGORY_OPTIONS.map((cat) => {
            const imgs = groupedImages[cat.value] || []
            if (imgs.length === 0) return null
            return (
              <div key={cat.value}>
                <h3 className="text-[13px] font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand/60" />
                  {cat.label}
                  <span className="text-gray-400 font-normal">({imgs.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imgs.map((img) => (
                    <div key={img.id} className={`relative group rounded-xl overflow-hidden border ${img.is_active ? 'border-gray-100' : 'border-gray-200 opacity-50'} bg-gray-50`}>
                      <div className="aspect-video">
                        <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover" />
                      </div>
                      {img.caption && (
                        <p className="text-[11px] text-gray-500 px-2 py-1.5 truncate">{img.caption}</p>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(img)} className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-brand transition-colors">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget({ id: img.id })} className="w-7 h-7 rounded-lg bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-white font-medium">{img.sort_order}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
