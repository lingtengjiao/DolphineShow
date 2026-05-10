import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { useAuthStore } from '../store/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company_name: z.string().min(1, 'Please enter your company name'),
  contact_person: z.string().min(1, 'Please enter a contact name'),
  phone: z.string().optional(),
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isRegister, setIsRegister] = useState(false)

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) })

  const handleLogin = async (data: LoginData) => {
    try {
      const res = await authApi.login(data.email, data.password)
      setAuth(res.data.user, res.data.access_token)
      toast.success('Signed in successfully!')
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    } catch {
      toast.error('Incorrect email or password')
    }
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      const res = await authApi.register(data)
      setAuth(res.data.user, res.data.access_token)
      toast.success('Account created successfully!')
      navigate('/')
    } catch {
      toast.error('Registration failed. This email may already be in use.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-bold text-gray-800">🧸 DolphineShow. Monnca</h1>
          <p className="text-gray-500 mt-2">B2B Client Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Tabs */}
          <div className="flex mb-8 border-b">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${!isRegister ? 'border-brand text-brand' : 'border-transparent text-gray-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${isRegister ? 'border-brand text-brand' : 'border-transparent text-gray-400'}`}
            >
              Register
            </button>
          </div>

          {!isRegister ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...loginForm.register('email')} type="email" className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="your@email.com" />
                {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input {...loginForm.register('password')} type="password" className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Enter your password" />
                {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
              </div>
              <button type="submit" disabled={loginForm.formState.isSubmitting} className="w-full py-3 bg-brand text-white rounded-full font-medium hover:bg-brand/90 transition-colors disabled:opacity-50">
                {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input {...registerForm.register('company_name')} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Your company name" />
                {registerForm.formState.errors.company_name && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.company_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input {...registerForm.register('contact_person')} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Your full name" />
                {registerForm.formState.errors.contact_person && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.contact_person.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input {...registerForm.register('email')} type="email" className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="your@email.com" />
                {registerForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input {...registerForm.register('password')} type="password" className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Minimum 6 characters" />
                {registerForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...registerForm.register('phone')} className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand" placeholder="Phone number (optional)" />
              </div>
              <button type="submit" disabled={registerForm.formState.isSubmitting} className="w-full py-3 bg-brand text-white rounded-full font-medium hover:bg-brand/90 transition-colors disabled:opacity-50">
                {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/" className="hover:text-brand">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
