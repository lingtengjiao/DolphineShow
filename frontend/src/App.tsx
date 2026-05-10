import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/auth'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ProductLines from './pages/ProductLines'
import Products from './pages/Products'
import ProductLineDetail from './pages/ProductLineDetail'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Inquiry from './pages/Inquiry'
import Login from './pages/Login'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProductLineAdmin from './pages/admin/ProductLineAdmin'
import ProductAdmin from './pages/admin/ProductAdmin'
import InquiryAdmin from './pages/admin/InquiryAdmin'
import UserAdmin from './pages/admin/UserAdmin'
import BannerAdmin from './pages/admin/BannerAdmin'

export default function App() {
  const { loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product-lines" element={<ProductLines />} />
          <Route path="product-lines/:slug" element={<ProductLineDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="about" element={<About />} />
          <Route path="inquiry" element={<Inquiry />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Admin routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="product-lines" element={<ProductLineAdmin />} />
          <Route path="products" element={<ProductAdmin />} />
          <Route path="inquiries" element={<InquiryAdmin />} />
          <Route path="users" element={<UserAdmin />} />
          <Route path="banners" element={<BannerAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
