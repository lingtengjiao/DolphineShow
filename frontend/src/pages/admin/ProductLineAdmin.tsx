import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiLayers } from 'react-icons/fi'
import { productLineApi, uploadApi } from '../../api'
import type { ProductLine } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import TableSkeleton from '../../components/admin/TableSkeleton'

interface PLForm {
  id?: number
  name: string
  description: string
  cover_image: string
  sort_order: number
  is_active: boolean
}

const emptyForm: PLForm = { name: '', description: '', cover_image: '', sort_order: 0, is_active: true }

export default function ProductLineAdmin() {
  const [lines, setLines] = useState<ProductLine[]>([])
  const [editing, setEditing] = useState<PLForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    productLineApi.adminList().then((r) => setLines(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleEdit = (pl: ProductLine) => {
    setEditing({
      id: pl.id,
      name: pl.name,
      description: pl.description || '',
      cover_image: pl.cover_image || '',
      sort_order: pl.sort_order,
      is_active: pl.is_active,
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    setUploading(true)
    try {
      const { data: result } = await uploadApi.image(file)
      setEditing({ ...editing, cover_image: result.url })
      toast.success('上传成功')
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!editing?.name) return toast.error('名称不能为空')
    setSaving(true)
    try {
      if (editing.id) {
        await productLineApi.update(editing.id, editing)
        toast.success('更新成功')
      } else {
        await productLineApi.create(editing)
        toast.success('创建成功')
      }
      setEditing(null)
      load()
    } catch {
      toast.error('操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productLineApi.delete(deleteTarget.id)
      toast.success('已删除')
      setDeleteTarget(null)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || '删除失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="产品线管理"
        subtitle={`共 ${lines.length} 个产品线`}
        actions={
          <button onClick={() => setEditing(emptyForm)} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all">
            <FiPlus size={16} /> 新增产品线
          </button>
        }
      />

      {/* Form Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? '编辑产品线' : '新增产品线'}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              取消
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">产品线名称 *</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  placeholder="输入名称"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">排序权重</label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  placeholder="数字越小越靠前"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1.5">描述</label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
                rows={3}
                placeholder="简短描述该产品线"
              />
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1">封面图片</label>
              <p className="text-[11px] text-gray-400 mb-2">建议尺寸 <span className="font-medium text-gray-500">800 × 600 px</span>，比例 4:3，JPG / PNG / WebP，大小 ≤ 2 MB</p>
              <div className="flex items-center gap-4">
                {editing.cover_image ? (
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={editing.cover_image} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setEditing({ ...editing, cover_image: '' })} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiX size={18} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-28 h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors">
                    <FiUpload size={18} className="text-gray-400 mb-1" />
                    <span className="text-[11px] text-gray-400">{uploading ? '上传中...' : '点击上传'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-10 h-[22px] rounded-full transition-colors ${editing.is_active ? 'bg-brand' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all ${editing.is_active ? 'left-[19px]' : 'left-0.5'}`} />
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="sr-only" />
              </div>
              <span className="text-[13px] font-medium text-gray-600">{editing.is_active ? '已启用' : '已禁用'}</span>
            </label>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除产品线"
        message={`确定要删除「${deleteTarget?.name}」吗？此操作不可恢复，且需要确保该产品线下没有关联产品。`}
        confirmLabel="确认删除"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : lines.length === 0 ? (
        <EmptyState
          icon={<FiLayers size={28} />}
          title="暂无产品线"
          description="创建产品线来组织和分类您的毛绒玩具产品"
          action={
            <button onClick={() => setEditing(emptyForm)} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark transition-colors">
              <FiPlus size={16} /> 新增产品线
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100/80">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">排序</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">封面</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">名称</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">产品数</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">状态</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lines.map((pl) => (
                <tr key={pl.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-mono text-gray-400">{pl.sort_order}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                      {pl.cover_image ? <img src={pl.cover_image} className="w-full h-full object-cover" alt="" /> : <FiLayers size={16} className="text-gray-300" />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-gray-700">{pl.name}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <code className="text-[12px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{pl.slug}</code>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-gray-600">{pl.product_count}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${pl.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${pl.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {pl.is_active ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(pl)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand/5 transition-colors" title="编辑">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: pl.id, name: pl.name })} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="删除">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
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
