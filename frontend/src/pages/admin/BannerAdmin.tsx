import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiImage, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { bannerApi, uploadApi } from '../../api'
import type { Banner } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import TableSkeleton from '../../components/admin/TableSkeleton'

interface BannerForm {
  id?: number
  tag: string
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_url: string
  bg_gradient: string
  sort_order: number
  is_active: boolean
}

const GRADIENT_PRESETS = [
  { label: '玫瑰粉', value: 'from-rose-50 via-pink-50 to-amber-50' },
  { label: '紫罗兰', value: 'from-purple-50 via-violet-50 to-pink-50' },
  { label: '琥珀橙', value: 'from-amber-50 via-orange-50 to-rose-50' },
  { label: '天蓝', value: 'from-sky-50 via-blue-50 to-indigo-50' },
  { label: '薄荷绿', value: 'from-emerald-50 via-teal-50 to-cyan-50' },
  { label: '奶油白', value: 'from-stone-50 via-neutral-50 to-zinc-50' },
]

const emptyForm: BannerForm = {
  tag: '',
  title: '',
  subtitle: '',
  cta_text: '',
  cta_link: '',
  image_url: '',
  bg_gradient: GRADIENT_PRESETS[0].value,
  sort_order: 0,
  is_active: true,
}

export default function BannerAdmin() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [editing, setEditing] = useState<BannerForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await bannerApi.adminList()
      setBanners(r.data)
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => setEditing({ ...emptyForm })
  const openEdit = (b: Banner) =>
    setEditing({
      id: b.id,
      tag: b.tag ?? '',
      title: b.title,
      subtitle: b.subtitle ?? '',
      cta_text: b.cta_text ?? '',
      cta_link: b.cta_link ?? '',
      image_url: b.image_url ?? '',
      bg_gradient: b.bg_gradient ?? GRADIENT_PRESETS[0].value,
      sort_order: b.sort_order,
      is_active: b.is_active,
    })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    setUploading(true)
    try {
      const r = await uploadApi.image(file)
      setEditing({ ...editing, image_url: r.data.url })
      toast.success('图片上传成功')
    } catch {
      toast.error('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title.trim()) { toast.error('标题不能为空'); return }
    setSaving(true)
    try {
      const payload = {
        tag: editing.tag || null,
        title: editing.title,
        subtitle: editing.subtitle || null,
        cta_text: editing.cta_text || null,
        cta_link: editing.cta_link || null,
        image_url: editing.image_url || null,
        bg_gradient: editing.bg_gradient || null,
        sort_order: editing.sort_order,
        is_active: editing.is_active,
      }
      if (editing.id) {
        await bannerApi.update(editing.id, payload)
        toast.success('Banner 已更新')
      } else {
        await bannerApi.create(payload)
        toast.success('Banner 已创建')
      }
      setEditing(null)
      load()
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await bannerApi.delete(deleteTarget.id)
      toast.success('Banner 已删除')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (b: Banner) => {
    try {
      await bannerApi.update(b.id, { is_active: !b.is_active })
      toast.success(b.is_active ? '已停用' : '已启用')
      load()
    } catch {
      toast.error('操作失败')
    }
  }

  return (
    <div>
      <PageHeader
        title="Banner 管理"
        subtitle="管理首页轮播 Banner，支持标题、副标题、按钮、背景图和渐变色。"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
          >
            <FiPlus size={16} /> 添加 Banner
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={3} />
      ) : banners.length === 0 ? (
        <EmptyState
          icon={<FiImage size={28} />}
          title="暂无 Banner"
          description="点击「添加 Banner」创建第一条轮播内容"
          action={
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors">
              <FiPlus size={15} /> 添加 Banner
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className={`bg-gradient-to-r ${b.bg_gradient ?? 'from-gray-50 to-white'} rounded-2xl border border-white/80 shadow-sm overflow-hidden`}>
              <div className="flex items-center gap-4 p-4">
                {/* Preview image */}
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-white/60 flex-shrink-0 border border-white">
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">无图</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {b.tag && (
                      <span className="inline-block px-2 py-0.5 bg-white/70 text-brand text-xs font-semibold rounded-full">
                        {b.tag}
                      </span>
                    )}
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? '启用' : '停用'}
                    </span>
                    <span className="text-xs text-gray-400">排序 {b.sort_order}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 truncate">{b.title}</h3>
                  {b.subtitle && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{b.subtitle.replace('\n', ' · ')}</p>
                  )}
                  {b.cta_text && (
                    <p className="text-xs text-gray-400 mt-0.5">按钮：{b.cta_text} → {b.cta_link}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand hover:bg-white/70 transition-all"
                    title={b.is_active ? '停用' : '启用'}
                  >
                    {b.is_active ? <FiToggleRight size={20} className="text-green-500" /> : <FiToggleLeft size={20} />}
                  </button>
                  <button
                    onClick={() => openEdit(b)}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand hover:bg-white/70 transition-all"
                    title="编辑"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: b.id, title: b.title })}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="删除"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <Modal
          open
          title={editing.id ? '编辑 Banner' : '添加 Banner'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">标签文字 <span className="font-normal text-gray-400">（如"全新上市"）</span></label>
                <input
                  value={editing.tag}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="可选"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">排序</label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">标题 <span className="text-red-400">*</span></label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                placeholder="Banner 主标题"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">副标题 <span className="font-normal text-gray-400">（换行用 \n）</span></label>
              <textarea
                value={editing.subtitle}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                placeholder="两行说明文字，用 \n 换行"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">按钮文字</label>
                <input
                  value={editing.cta_text}
                  onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="如：立即询盘"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">按钮链接</label>
                <input
                  value={editing.cta_link}
                  onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="如：/inquiry"
                />
              </div>
            </div>

            {/* Banner image */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Banner 图片</label>
              <p className="text-[11px] text-gray-400 mb-2">建议尺寸 <span className="font-medium text-gray-500">1200 × 480 px</span>，比例 5:2 宽横幅，JPG / PNG / WebP，≤ 3 MB</p>
              <div className="flex items-center gap-3">
                {editing.image_url && (
                  <img src={editing.image_url} alt="preview" className="w-24 h-14 object-cover rounded-lg border border-gray-200" />
                )}
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:text-brand hover:border-brand cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <FiUpload size={15} />
                  {uploading ? '上传中...' : '上传图片'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
                {editing.image_url && (
                  <button
                    onClick={() => setEditing({ ...editing, image_url: '' })}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    移除
                  </button>
                )}
              </div>
            </div>

            {/* Gradient preset */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">背景渐变色</label>
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setEditing({ ...editing, bg_gradient: preset.value })}
                    className={`h-10 rounded-lg bg-gradient-to-r ${preset.value} border-2 transition-all text-xs font-medium ${editing.bg_gradient === preset.value ? 'border-brand shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
              </label>
              <span className="text-sm text-gray-600">启用此 Banner</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          open
          title="删除 Banner"
          message={`确定要删除「${deleteTarget.title}」吗？删除后无法恢复。`}
          confirmLabel="删除"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
