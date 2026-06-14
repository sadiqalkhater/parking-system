'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FileText, Plus, Search } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Permit {
  id: string
  permitNumber: string
  type: string
  status: string
  startDate: string
  endDate: string
  price: number
  zoneAccess?: string
  user: { name: string; email: string }
  vehicle: { plateNumber: string; brand: string; model: string }
}
interface Vehicle { id: string; plateNumber: string; brand: string; model: string }

const permitTypes = [
  { value: 'DAILY', label: 'يومي' },
  { value: 'MONTHLY', label: 'شهري' },
  { value: 'YEARLY', label: 'سنوي' },
  { value: 'VISITOR', label: 'زائر' },
]

export default function PermitsPage() {
  const { token } = useAuth()
  const [permits, setPermits] = useState<Permit[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', type: 'MONTHLY', startDate: '', endDate: '', zoneAccess: '', price: '' })
  const [loading, setLoading] = useState(false)

  const fetch_ = () => {
    fetch('/api/permits', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setPermits)
    fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setVehicles)
  }
  useEffect(() => { fetch_() }, [token])

  const filtered = permits.filter(p =>
    p.permitNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    })
    if (res.ok) { setShowForm(false); fetch_() }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التصاريح</h1>
          <p className="text-gray-500 text-sm mt-1">{permits.length} تصريح</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> إصدار تصريح
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">إصدار تصريح جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المركبة</label>
                <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">اختر المركبة</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع التصريح</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {permitTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ريال)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الحفظ...' : 'إصدار'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="بحث برقم التصريح أو المستخدم..." />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-6 py-3">رقم التصريح</th>
              <th className="text-right px-6 py-3">المركبة</th>
              <th className="text-right px-6 py-3">المالك</th>
              <th className="text-right px-6 py-3">النوع</th>
              <th className="text-right px-6 py-3">الانتهاء</th>
              <th className="text-right px-6 py-3">السعر</th>
              <th className="text-right px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد تصاريح</p>
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-gray-500">{p.permitNumber.slice(0, 8)}...</td>
                <td className="px-6 py-4 text-sm font-medium text-blue-600">{p.vehicle?.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.user?.name}</td>
                <td className="px-6 py-4"><Badge status={p.type} /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.endDate).toLocaleDateString('ar-SA')}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.price.toLocaleString('ar')} ر.س</td>
                <td className="px-6 py-4"><Badge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
