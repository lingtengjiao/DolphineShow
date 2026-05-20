import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiSearch, FiBox, FiChevronLeft, FiChevronRight, FiVideo } from 'react-icons/fi'
import { productApi, productLineApi, uploadApi } from '../../api'
import type { ProductLine, PaginatedProducts, PriceTier } from '../../types'
import PageHeader from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import TableSkeleton from '../../components/admin/TableSkeleton'

const CERT_OPTIONS = ['CE', 'EN71', 'REACH', 'CPC', 'ASTM F963', 'CPSIA', 'ISO 8124', 'BSCI', 'SEDEX', 'Oeko-Tex']

// Price tier uses string for `price` so users can freely type decimals;
// converted to number only on save.
interface PriceTierForm {
  min_qty: number
  max_qty: number | null
  price: string
}

interface ProductForm {
  product_line_id: number | ''
  name: string
  sku: string
  description: string
  detail_html: string
  main_image: string
  video_url: string
  images: string[]
  price: string
  sample_price: string
  price_tiers: PriceTierForm[]
  min_order_qty: number
  material: string
  filling: string
  size: string
  weight: string
  age_range: string
  certifications: string[]
  support_customization: boolean
  support_logo: boolean
  intl_url: string
  is_featured: boolean
  is_new: boolean
  is_active: boolean
}

const emptyForm: ProductForm = {
  product_line_id: '',
  name: '',
  sku: '',
  description: '',
  detail_html: '',
  main_image: '',
  video_url: '',
  images: [],
  price: '',
  sample_price: '',
  price_tiers: [],
  min_order_qty: 100,
  material: '',
  filling: '',
  size: '',
  weight: '',
  age_range: '',
  certifications: [],
  support_customization: true,
  support_logo: true,
  intl_url: '',
  is_featured: false,
  is_new: false,
  is_active: true,
}

export default function ProductAdmin() {
  const [data, setData] = useState<PaginatedProducts | null>(null)
  const [lines, setLines] = useState<ProductLine[]>([])
  const [page, setPage] = useState(1)
  const [filterLine, setFilterLine] = useState<string>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    productLineApi.adminList().then((r) => setLines(r.data)).catch(() => {})
  }, [])

  const loadProducts = useCallback(() => {
    setLoading(true)
    const params: Record<string, string | number | undefined> = { page, page_size: 20 }
    if (filterLine) params.product_line_id = Number(filterLine)
    if (search) params.search = search
    productApi.adminList(params).then((r) => setData(r.data)).finally(() => setLoading(false))
  }, [page, filterLine, search])

  useEffect(() => { loadProducts() }, [loadProducts])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleEdit = async (id: number) => {
    try {
      const { data: product } = await productApi.adminGet(id)
      setEditingId(id)
      setForm({
        product_line_id: product.product_line_id,
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        detail_html: product.detail_html || '',
        main_image: product.main_image || '',
        video_url: product.video_url || '',
        images: product.images || [],
        price: product.price != null ? String(product.price) : '',
        sample_price: product.sample_price != null ? String(product.sample_price) : '',
        price_tiers: (product.price_tiers || []).map((t: PriceTier) => ({
          min_qty: t.min_qty,
          max_qty: t.max_qty,
          price: String(t.price),
        })),
        min_order_qty: product.min_order_qty,
        material: product.material || '',
        filling: product.filling || '',
        size: product.size || '',
        weight: product.weight || '',
        age_range: product.age_range || '',
        certifications: product.certifications || [],
        support_customization: product.support_customization ?? true,
        support_logo: product.support_logo ?? true,
        intl_url: product.intl_url || '',
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_active: product.is_active,
      })
      setShowForm(true)
    } catch {
      toast.error('获取产品详情失败')
    }
  }

  const addPriceTier = () => {
    setForm((prev) => ({
      ...prev,
      price_tiers: [...prev.price_tiers, { min_qty: 1, max_qty: null, price: '' }],
    }))
  }

  const updatePriceTier = (index: number, field: 'min_qty' | 'max_qty' | 'price', value: string) => {
    setForm((prev) => {
      const tiers = [...prev.price_tiers]
      if (field === 'min_qty') tiers[index] = { ...tiers[index], min_qty: Number(value) || 1 }
      else if (field === 'max_qty') tiers[index] = { ...tiers[index], max_qty: value === '' ? null : Number(value) }
      else if (field === 'price') tiers[index] = { ...tiers[index], price: value }
      return { ...prev, price_tiers: tiers }
    })
  }

  const removePriceTier = (index: number) => {
    setForm((prev) => ({ ...prev, price_tiers: prev.price_tiers.filter((_, i) => i !== index) }))
  }

  const toggleCertification = (cert: string) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }))
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main_image' | 'images') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data: result } = await uploadApi.image(file)
      if (field === 'main_image') {
        setForm((prev) => ({ ...prev, main_image: result.url }))
      } else {
        setForm((prev) => ({ ...prev, images: [...prev.images, result.url] }))
      }
      toast.success('上传成功')
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingVideo(true)
    try {
      const { data: result } = await uploadApi.video(file)
      setForm((prev) => ({ ...prev, video_url: result.url }))
      toast.success('视频上传成功')
    } catch {
      toast.error('视频上传失败')
    } finally {
      setUploadingVideo(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('产品名称不能为空')
    if (!form.sku) return toast.error('SKU不能为空')
    if (!form.product_line_id) return toast.error('请选择产品线')

    const priceTiers: { min_qty: number; max_qty: number | null; price: number }[] = []
    for (const t of form.price_tiers) {
      if (t.price.trim() === '') continue
      const unitPrice = Number(t.price)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        toast.error('请填写有效的批发阶梯单价（数字）')
        return
      }
      priceTiers.push({ min_qty: t.min_qty, max_qty: t.max_qty, price: unitPrice })
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        product_line_id: Number(form.product_line_id),
        price: form.price ? Number(form.price) : null,
        sample_price: form.sample_price ? Number(form.sample_price) : null,
        price_tiers: priceTiers,
        filling: form.filling || null,
        age_range: form.age_range || null,
        intl_url: form.intl_url || null,
        video_url: form.video_url || null,
        detail_html: form.detail_html || null,
      }
      if (editingId) {
        await productApi.update(editingId, payload)
        toast.success('产品更新成功')
      } else {
        await productApi.create(payload)
        toast.success('产品创建成功')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      loadProducts()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      if (typeof detail === 'string') {
        toast.error(detail)
      } else if (Array.isArray(detail)) {
        toast.error(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('；') || '操作失败')
      } else {
        toast.error('操作失败')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productApi.delete(deleteTarget.id)
      toast.success('已删除')
      setDeleteTarget(null)
      loadProducts()
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
        title="产品管理"
        subtitle={`共 ${data?.total || 0} 个产品`}
        actions={
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all">
            <FiPlus size={16} /> 新增产品
          </button>
        }
      />

      {/* Product Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? '编辑产品' : '新增产品'}
        maxWidth="max-w-3xl"
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark shadow-sm shadow-brand/20 transition-all disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Section: basic info */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-brand rounded-full" /> 基本信息
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">产品名称 *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="输入产品名称" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">SKU *</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} placeholder="输入SKU编号" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">所属产品线 *</label>
                <select value={form.product_line_id} onChange={(e) => setForm({ ...form, product_line_id: e.target.value ? Number(e.target.value) : '' })} className={inputCls}>
                  <option value="">请选择产品线</option>
                  {lines.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">批发单价 (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={`${inputCls} pl-7`} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
                  样品价格 (USD)
                  <span className="ml-2 text-[11px] font-normal text-gray-400">（选填）</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                  <input type="number" step="0.01" value={form.sample_price} onChange={(e) => setForm({ ...form, sample_price: e.target.value })} className={`${inputCls} pl-7`} placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: specs */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-accent rounded-full" /> 产品规格
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">起订量 (MOQ)</label>
                <input type="number" value={form.min_order_qty} onChange={(e) => setForm({ ...form, min_order_qty: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">尺寸</label>
                <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={inputCls} placeholder="30cm" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">重量</label>
                <input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className={inputCls} placeholder="200g" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">外壳材质</label>
                <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={inputCls} placeholder="短毛绒" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">填充料</label>
                <input value={form.filling} onChange={(e) => setForm({ ...form, filling: e.target.value })} className={inputCls} placeholder="PP棉" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1.5">适龄范围</label>
                <input value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} className={inputCls} placeholder="3岁以上 / 0+" />
              </div>
            </div>

            {/* Customization toggles */}
            <div className="flex flex-wrap gap-6 mt-4">
              {[
                { key: 'support_customization' as const, label: '支持 OEM 定制', color: 'peer-checked:bg-brand' },
                { key: 'support_logo' as const, label: '支持印制 Logo', color: 'peer-checked:bg-brand' },
              ].map((flag) => (
                <label key={flag.key} className="flex items-center gap-2.5 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" checked={form[flag.key]} onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })} className="peer sr-only" />
                    <div className={`w-9 h-5 rounded-full bg-gray-200 transition-colors ${flag.color}`} />
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form[flag.key] ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                  <span className="text-[13px] font-medium text-gray-600">{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">产品简介</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} rows={3} placeholder="简短产品描述，展示在详情页顶部" />
          </div>

          {/* Detail HTML */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
              详细描述
              <span className="ml-2 text-[11px] font-normal text-gray-400">（支持 HTML，展示在详情页底部；留空则不展示）</span>
            </label>
            <textarea
              value={form.detail_html}
              onChange={(e) => setForm({ ...form, detail_html: e.target.value })}
              className={`${inputCls} resize-y font-mono text-[12px]`}
              rows={5}
              placeholder="<p>输入 HTML 内容，或留空</p>"
            />
          </div>

          {/* Price Tiers */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-400 rounded-full" /> 批发价格阶梯
              <span className="text-[11px] font-normal text-gray-400">（按订货量设置不同单价）</span>
            </h4>
            {form.price_tiers.length > 0 && (
              <div className="mb-2 grid grid-cols-[1fr_12px_1fr_auto_auto] gap-x-2 gap-y-1 items-center text-[11px] text-gray-400 font-medium uppercase tracking-wider px-0.5">
                <span>最小量 (pcs)</span>
                <span />
                <span>最大量 (pcs，空=不限)</span>
                <span className="text-center">单价 (USD)</span>
                <span />
              </div>
            )}
            <div className="space-y-2">
              {form.price_tiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-[1fr_12px_1fr_auto_auto] gap-x-2 items-center">
                  <input
                    type="number"
                    value={tier.min_qty}
                    onChange={(e) => updatePriceTier(i, 'min_qty', e.target.value)}
                    className={inputCls}
                    placeholder="例：100"
                    min={1}
                  />
                  <span className="text-gray-300 text-center">—</span>
                  <input
                    type="number"
                    value={tier.max_qty ?? ''}
                    onChange={(e) => updatePriceTier(i, 'max_qty', e.target.value)}
                    className={inputCls}
                    placeholder="留空 = 无上限"
                    min={1}
                  />
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={tier.price}
                      onChange={(e) => updatePriceTier(i, 'price', e.target.value)}
                      className={`${inputCls} pl-7`}
                      placeholder="0.00"
                    />
                  </div>
                  <button type="button" onClick={() => removePriceTier(i)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <FiX size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPriceTier}
                className="flex items-center gap-1.5 text-[12px] text-brand hover:text-brand-dark transition-colors mt-1"
              >
                <FiPlus size={14} /> 添加价格阶梯
              </button>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-400 rounded-full" /> 产品认证
            </h4>
            <div className="flex flex-wrap gap-2">
              {CERT_OPTIONS.map((cert) => {
                const checked = form.certifications.includes(cert)
                return (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCertification(cert)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                      checked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-brand/50'
                    }`}
                  >
                    {checked && <span className="mr-1">✓</span>}{cert}
                  </button>
                )
              })}
            </div>
          </div>

          {/* International site link */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
              国际站链接
              <span className="ml-2 text-[11px] font-normal text-gray-400">（如阿里国际站、Made-in-China 等，选填）</span>
            </label>
            <input
              value={form.intl_url}
              onChange={(e) => setForm({ ...form, intl_url: e.target.value })}
              className={inputCls}
              placeholder="https://www.alibaba.com/product-detail/..."
              type="url"
            />
          </div>

          {/* Images */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-mint rounded-full" /> 产品图片
            </h4>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1">主图</label>
                <p className="text-[11px] text-gray-400 mb-2">建议 <span className="font-medium text-gray-500">1000 × 1000 px</span>（1:1 正方形，与国际站共用），JPG / PNG / WebP，≤ 3 MB</p>
                {form.main_image ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={form.main_image} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setForm({ ...form, main_image: '' })} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiX size={20} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors">
                    <FiUpload size={22} className="text-gray-300 mb-2" />
                    <span className="text-[12px] text-gray-400">{uploading ? '上传中...' : '点击上传主图'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'main_image')} disabled={uploading} />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-1">图库</label>
                <p className="text-[11px] text-gray-400 mb-2">建议 <span className="font-medium text-gray-500">800 × 800 px</span>（1:1 正方形），每张 ≤ 2 MB，最多 10 张</p>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiX size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors">
                    <FiPlus size={16} className="text-gray-400" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'images')} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-[13px] font-medium text-gray-500 mb-1">产品视频</label>
              <p className="text-[11px] text-gray-400 mb-2">可选，上传后与主图、图库在同一轮播中展示（默认排在主图后）。MP4 / WebM / MOV，≤ 50 MB</p>
              {form.video_url ? (
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 group">
                  <video src={form.video_url} controls className="w-full max-h-48 object-contain bg-black" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, video_url: '' })}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors">
                  <FiVideo size={22} className="text-gray-300 mb-2" />
                  <span className="text-[12px] text-gray-400">{uploadingVideo ? '上传中...' : '点击上传视频'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    className="hidden"
                    onChange={handleUploadVideo}
                    disabled={uploadingVideo}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { key: 'is_featured' as const, label: '精选产品', color: 'peer-checked:bg-amber-500' },
              { key: 'is_new' as const, label: '新品', color: 'peer-checked:bg-blue-500' },
              { key: 'is_active' as const, label: '启用', color: 'peer-checked:bg-emerald-500' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={form[flag.key]} onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })} className="peer sr-only" />
                  <div className={`w-9 h-5 rounded-full bg-gray-200 transition-colors ${flag.color}`} />
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form[flag.key] ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <span className="text-[13px] font-medium text-gray-600">{flag.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除产品"
        message={`确定要删除「${deleteTarget?.name}」吗？此操作不可恢复。`}
        confirmLabel="确认删除"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索名称或SKU..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
          />
        </div>
        <select
          value={filterLine}
          onChange={(e) => { setFilterLine(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
        >
          <option value="">全部产品线</option>
          {lines.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : data && data.items.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100/80">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">产品</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">产品线</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">价格</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">标签</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.map((p) => (
                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                        {p.main_image ? <img src={p.main_image} className="w-full h-full object-cover" alt="" /> : <FiBox size={16} className="text-gray-300" />}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700 truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <code className="text-[12px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{p.sku}</code>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-[13px] text-gray-500">{p.product_line_name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] font-semibold text-gray-700">{p.price ? `$${p.price}` : <span className="text-gray-300">-</span>}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <div className="flex gap-1.5">
                      {p.is_featured && <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-600">精选</span>}
                      {p.is_new && <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600">新品</span>}
                      {!p.is_featured && !p.is_new && <span className="text-gray-300 text-[11px]">-</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand/5 transition-colors" title="编辑">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: p.id, name: p.name })} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="删除">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100/80">
              <span className="text-[12px] text-gray-400">第 {data.page} / {data.total_pages} 页</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(data.total_pages, 7) }, (_, i) => {
                  let pageNum: number
                  if (data.total_pages <= 7) {
                    pageNum = i + 1
                  } else if (page <= 4) {
                    pageNum = i + 1
                  } else if (page >= data.total_pages - 3) {
                    pageNum = data.total_pages - 6 + i
                  } else {
                    pageNum = page - 3 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                        pageNum === page
                          ? 'bg-brand text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<FiBox size={28} />}
          title="暂无产品"
          description={search ? '没有找到匹配的产品' : '添加第一个产品开始运营'}
          action={!search ? (
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[13px] font-medium hover:bg-brand-dark transition-colors">
              <FiPlus size={16} /> 新增产品
            </button>
          ) : undefined}
        />
      )}
    </div>
  )
}
