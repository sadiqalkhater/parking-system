'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { CalendarClock, Plus, Search } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Reservation {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  user: { name: string }
  vehicle: { plateNumber: string; brand: string; model: string }
  slot: { slotNumber: string; zone: { name: string } }
}
interface Vehicle { id: string; plateNumber: string; brand: string }
interface Slot { id: string; slotNumber: string; status: string; zone: { name: string } }
interface Zone { id: string; name: string; slots: Slot[] }

export default function ReservationsPage() {
  const { token } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', slotId: '', startTime: '', endTime: '', totalPrice: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch_ = () => {
    fetch('/api/reservations', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setReservations)
    fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setVehicles)
    fetch('/api/parking-zones').then(r => r.json()).then(setZones)
  }
  useEffect(() => { fetch_() }, [token])

  const availableSlots = zones.flatMap(z => z.slots.filter(s => s.status === 'AVAILABLE').map(s => ({ ...s, zoneName: z.name })))
  const filtered = reservations.filter(r =>
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, totalPrice: parseFloat(form.totalPrice) }),
    })
    if (res.ok) { setShowForm(false); fetch_() }
    else { const d = await res.json(); setError(d.error) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحجوزات</h1>
          <p className="text-gray-500 text-sm mt-1">{reservations.length} حجز</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> حجز جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">حجز جديد</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">الموقف</label>
                <select value={form.slotId} onChange={e => setForm({...form, slotId: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">اختر الموقف</option>
                  {availableSlots.map((s: Slot & { zoneName: string }) => <option key={s.id} value={s.id}>{s.zoneName} - {s.slotNumber}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وقت البدء</label>
                  <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وقت الانتهاء</label>
                  <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الإجمالي (ريال)</label>
                <input type="number" value={form.totalPrice} onChange={e => setForm({...form, totalPrice: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" required />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الحجز...' : 'تأكيد الحجز'}
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
          placeholder="بحث..." />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-6 py-3">المستخدم</th>
              <th className="text-right px-6 py-3">المركبة</th>
              <th className="text-right px-6 py-3">الموقف</th>
              <th className="text-right px-6 py-3">من</th>
              <th className="text-right px-6 py-3">إلى</th>
              <th className="text-right px-6 py-3">السعر</th>
              <th className="text-right px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <CalendarClock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد حجوزات</p>
              </td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.user?.name}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">{r.vehicle?.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{r.slot?.zone?.name} - {r.slot?.slotNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(r.startTime).toLocaleString('ar-SA')}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(r.endTime).toLocaleString('ar-SA')}</td>
                <td className="px-6 py-4 text-sm font-medium">{r.totalPrice} ر.س</td>
                <td className="px-6 py-4"><Badge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
