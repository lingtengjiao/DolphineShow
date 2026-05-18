export interface User {
  id: number
  email: string
  company_name: string | null
  contact_person: string | null
  phone: string | null
  role: 'admin' | 'b2b_client'
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ProductLine {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string | null
  cover_image: string | null
  sort_order: number
  is_active: boolean
  product_count: number
  created_at: string
  children?: ProductLine[]
}

export interface Product {
  id: number
  product_line_id: number
  product_line_name: string
  name: string
  sku: string
  description: string | null
  main_image: string | null
  price: number | null
  is_featured: boolean
  is_new: boolean
  created_at: string
}

export interface ProductDetail extends Product {
  detail_html: string | null
  images: string[]
  min_order_qty: number
  material: string | null
  size: string | null
  weight: string | null
  intl_url: string | null
  is_active: boolean
}

export interface PaginatedProducts {
  items: Product[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface InquiryCreate {
  company_name: string
  contact_person: string
  email: string
  phone?: string
  message: string
  product_ids: number[]
}

export interface Inquiry {
  id: number
  user_id: number | null
  company_name: string
  contact_person: string
  email: string
  phone: string | null
  message: string
  product_ids: number[]
  status: 'pending' | 'replied' | 'closed'
  admin_reply: string | null
  created_at: string
}

export interface Banner {
  id: number
  tag: string | null
  title: string
  subtitle: string | null
  cta_text: string | null
  cta_link: string | null
  image_url: string | null
  bg_gradient: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface DashboardStats {
  product_lines: number
  products: number
  inquiries_total: number
  inquiries_pending: number
  b2b_clients: number
}
