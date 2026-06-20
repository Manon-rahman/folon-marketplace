'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { setError('Invalid email or password'); return }
      router.replace('/admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">
            Folon <span className="text-[#4CA771]">Admin</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your marketplace</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
          <Input id="password" label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">Sign In</Button>
        </form>
      </div>
    </div>
  )
}
