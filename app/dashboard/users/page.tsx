'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, Plus, Search } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface User { id: string; name: string; email: string; role: string; phone?: string; createdAt: string }

export default function UsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'USER' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch_ = () => {
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setUsers)
  }
  useEffect(() => { fetch_() }, [token])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { setShowForm(false); setForm({ name: '', email: '', password: '', phone: '', role: 'USER' }); fetch_() }
    else { const d = await res.json(); setError(d.error) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المستخدمون</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} مستخدم</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> إضافة مستخدم
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">إضافة مستخدم جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name', label: 'الاسم', type: 'text', placeholder: 'أحمد محمد' },
                { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'ahmed@example.com' },
                { key: 'password', label: 'كلمة المرور', type: 'password', placeholder: '••••••••' },
                { key: 'phone', label: 'الهاتف (اختياري)', type: 'text', placeholder: '05xxxxxxxx' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm({...form, [key]: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder} required={key !== 'phone'} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="USER">مستخدم</option>
                  <option value="MANAGER">مدير</option>
                  <option value="ADMIN">مدير عام</option>
                </select>
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="بحث بالاسم أو البريد الإلكتروني..." />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-6 py-3">الاسم</th>
              <th className="text-right px-6 py-3">البريد الإلكتروني</th>
              <th className="text-right px-6 py-3">الهاتف</th>
              <th className="text-right px-6 py-3">الصلاحية</th>
              <th className="text-right px-6 py-3">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا يوجد مستخدمون</p>
              </td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '—'}</td>
                <td className="px-6 py-4"><Badge status={u.role} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString('ar-SA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
