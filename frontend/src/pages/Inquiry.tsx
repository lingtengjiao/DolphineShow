import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { inquiryApi } from '../api'
import { useAuthStore } from '../store/auth'

const schema = z.object({
  company_name: z.string().min(1, 'Please enter your company name'),
  contact_person: z.string().min(1, 'Please enter a contact name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function Inquiry() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('product_id')
  const productName = searchParams.get('product_name')
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: user?.company_name || '',
      contact_person: user?.contact_person || '',
      email: user?.email || '',
      phone: user?.phone || '',
      message: productName ? `Hello, I am interested in the following product and would like to request a detailed quote and lead time:\n\nProduct: ${productName}\n\n` : '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await inquiryApi.create({
        ...data,
        product_ids: productId ? [Number(productId)] : [],
      })
      setSubmitted(true)
      toast.success('Inquiry submitted! We will get back to you shortly.')
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-extrabold font-bold text-gray-800 mb-4">Inquiry Submitted!</h1>
        <p className="text-gray-600 mb-8">Thank you for your inquiry. Our sales team will contact you within 24 hours.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="px-6 py-3 bg-brand text-white rounded-full hover:bg-brand/90 transition-colors">
            Back to Home
          </Link>
          <Link to="/products" className="px-6 py-3 border border-brand text-brand rounded-full hover:bg-brand hover:text-white transition-colors">
            Continue Browsing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">Inquiry</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-6 md:gap-10">
        {/* Form */}
        <div className="md:col-span-2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-bold text-gray-800 mb-2">Contact Us</h1>
          <p className="text-gray-500 mb-8">Fill in the form below and our team will respond within 24 hours.</p>

          {productName && (
            <div className="bg-brand-light/10 border border-brand-light/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">
                📦 You are inquiring about: <strong className="text-gray-800">{productName}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input {...register('company_name')} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Your company name" />
                {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input {...register('contact_person')} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Your name" />
                {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person.message}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input {...register('email')} type="email" className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="your@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Phone number (optional)" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea {...register('message')} rows={6} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand resize-none" placeholder="Please describe your requirements, including product type, quantity, lead time, etc." />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-accent text-white rounded-full font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 shadow-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm md:sticky md:top-32">
            <h3 className="font-bold text-gray-700 mb-6">Other Ways to Reach Us</h3>
            <div className="space-y-5">
              <div className="flex gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Sales Contact</p>
                  <p className="text-sm text-gray-500">Jeckey Song（Sales Dept）</p>
                  <p className="text-sm text-gray-500">DolphineShow. Monnca</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">📞</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone / Mobile</p>
                  <p className="text-sm text-gray-500">Tel: +86-579-85373662</p>
                  <p className="text-sm text-gray-500">Mob: +86-18657997522</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">🎧</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Customer Support</p>
                  <p className="text-sm text-gray-500">Mob: +86-13454985122</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-500">admin@dolphineshow.com</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">🏢</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Office Address</p>
                  <p className="text-sm text-gray-500">Room 805, Building T6, Global Digital Trade Center, Zone 6, Yiwu International Trade City, Zhejiang Province, China</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">🏭</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Factory Address</p>
                  <p className="text-sm text-gray-500">No.8 Siyuan Road, NianSan Li Industrial, YiWu City, ZheJiang Province</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">🕐</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Business Hours</p>
                  <p className="text-sm text-gray-500">Mon–Fri 9:00–18:00 (GMT+8)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
