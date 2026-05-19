import client from './client'
import type {
  Banner,
  DashboardStats,
  Inquiry,
  InquiryCreate,
  PaginatedProducts,
  ProductDetail,
  ProductLine,
  Product,
  TokenResponse,
  User,
} from '../types'

export const authApi = {
  login: (email: string, password: string) =>
    client.post<TokenResponse>('/api/auth/login', { email, password }),
  register: (data: { email: string; password: string; company_name: string; contact_person: string; phone?: string }) =>
    client.post<TokenResponse>('/api/auth/register', data),
  me: () => client.get<User>('/api/auth/me'),
}

export const productLineApi = {
  list: () => client.get<ProductLine[]>('/api/product-lines'),
  tree: () => client.get<ProductLine[]>('/api/product-lines/tree'),
  get: (slug: string) => client.get<ProductLine>(`/api/product-lines/${slug}`),
  adminList: () => client.get<ProductLine[]>('/api/product-lines/admin/all'),
  create: (data: Partial<ProductLine>) => client.post<ProductLine>('/api/product-lines/admin', data),
  update: (id: number, data: Partial<ProductLine>) => client.put<ProductLine>(`/api/product-lines/admin/${id}`, data),
  delete: (id: number) => client.delete(`/api/product-lines/admin/${id}`),
}

export const productApi = {
  list: (params: Record<string, string | number | boolean | undefined>) =>
    client.get<PaginatedProducts>('/api/products', { params }),
  get: (id: number) => client.get<ProductDetail>(`/api/products/${id}`),
  featured: (limit = 10) => client.get<Product[]>('/api/products/featured', { params: { limit } }),
  newProducts: (limit = 10) => client.get<Product[]>('/api/products/new', { params: { limit } }),
  related: (id: number, limit = 6) => client.get<Product[]>(`/api/products/${id}/related`, { params: { limit } }),
  adminList: (params: Record<string, string | number | undefined>) =>
    client.get<PaginatedProducts>('/api/products/admin/all', { params }),
  adminGet: (id: number) => client.get<ProductDetail>(`/api/products/admin/${id}`),
  create: (data: Partial<ProductDetail>) => client.post<ProductDetail>('/api/products/admin', data),
  update: (id: number, data: Partial<ProductDetail>) => client.put<ProductDetail>(`/api/products/admin/${id}`, data),
  delete: (id: number) => client.delete(`/api/products/admin/${id}`),
}

export const inquiryApi = {
  create: (data: InquiryCreate) => client.post<Inquiry>('/api/inquiries', data),
  adminList: (params?: Record<string, string | number | undefined>) =>
    client.get<Inquiry[]>('/api/inquiries/admin/all', { params }),
  adminStats: () => client.get<{ total: number; pending: number; replied: number }>('/api/inquiries/admin/stats'),
  reply: (id: number, data: { admin_reply: string; status: string }) =>
    client.put<Inquiry>(`/api/inquiries/admin/${id}`, data),
}

export const adminApi = {
  dashboard: () => client.get<DashboardStats>('/api/admin/dashboard'),
  users: (params?: Record<string, string | number | undefined>) =>
    client.get<User[]>('/api/admin/users', { params }),
  toggleUserActive: (id: number) => client.put<User>(`/api/admin/users/${id}/toggle-active`),
}

export const bannerApi = {
  list: () => client.get<Banner[]>('/api/banners'),
  adminList: () => client.get<Banner[]>('/api/banners/admin/all'),
  create: (data: Partial<Banner>) => client.post<Banner>('/api/banners/admin', data),
  update: (id: number, data: Partial<Banner>) => client.put<Banner>(`/api/banners/admin/${id}`, data),
  delete: (id: number) => client.delete(`/api/banners/admin/${id}`),
}

export const uploadApi = {
  image: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<{ url: string; thumbnail: string; filename: string }>('/api/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  video: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post<{ url: string; filename: string }>('/api/upload/video', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
