'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FileText, Plus, Search, QrCode, X, Download, Printer, RefreshCw } from 'lucide-react'
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
  parkingSlot?: string
  userName: string
  userPhone?: string
  plateNumber: string
  vehicleBrand: string
  vehicleModel: string
  vehicleColor: string
}

const permitTypes = [
  { value: 'DAILY', label: 'يومي', price: 50 },
  { value: 'MONTHLY', label: 'شهري', price: 300 },
  { value: 'YEARLY', label: 'سنوي', price: 2000 },
  { value: 'VISITOR', label: 'زائر', price: 20 },
]

const typeLabels: Record<string, string> = { DAILY: 'يومي', MONTHLY: 'شهري', YEARLY: 'سنوي', VISITOR: 'زائر' }
const statusLabels: Record<string, string> = { ACTIVE: 'نشط', EXPIRED: 'منتهي', SUSPENDED: 'معلق', CANCELLED: 'ملغي' }

const defaultPrices: Record<string, number> = { DAILY: 50, MONTHLY: 300, YEARLY: 2000, VISITOR: 20 }

export default function PermitsPage() {
  const { token } = useAuth()
  const [permits, setPermits] = useState<Permit[]>([])
  const [zones, setZones] = useState<Array<{ id: string; name: string; slots: Array<{ id: string; slotNumber: string; status: string }> }>>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showQR, setShowQR] = useState<{ permit: Permit; qr: string; url: string } | null>(null)
  const [showRenew, setShowRenew] = useState<Permit | null>(null)
  const [loadingQR, setLoadingQR] = useState<string | null>(null)
  const [form, setForm] = useState({
    // Beneficiary info
    beneficiaryName: '',
    beneficiaryPhone: '',
    beneficiaryId: '',
    department: '',
    // Vehicle info
    plateNumber: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    // Permit info
    type: 'MONTHLY',
    startDate: '',
    endDate: '',
    price: '300',
    zoneId: '',
    slotId: '',
  })
  const [renewForm, setRenewForm] = useState({ startDate: '', endDate: '', price: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch_ = () => {
    fetch('/api/permits/full', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setPermits(d) })
    fetch('/api/parking-zones')
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setZones(d) })
  }
  useEffect(() => { fetch_() }, [token])

  const filtered = permits.filter(p =>
    p.userName?.toLowerCase().includes(search.toLowerCase()) ||
    p.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.userPhone?.includes(search)
  )

  const selectedZone = zones.find(z => z.id === form.zoneId)
  const availableSlots = selectedZone?.slots.filter(s => s.status === 'AVAILABLE') || []

  const handleTypeChange = (type: string) => {
    setForm({ ...form, type, price: String(defaultPrices[type] || 0) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/permits/full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ beneficiaryName: '', beneficiaryPhone: '', beneficiaryId: '', department: '', plateNumber: '', vehicleBrand: '', vehicleModel: '', vehicleColor: '', type: 'MONTHLY', startDate: '', endDate: '', price: '300', zoneId: '', slotId: '' })
      fetch_()
    } else {
      const d = await res.json(); setError(d.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/permits/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ permitId: showRenew?.id, ...renewForm, price: parseFloat(renewForm.price) }),
    })
    if (res.ok) { setShowRenew(null); fetch_() }
    setLoading(false)
  }

  const handleShowQR = async (permit: Permit) => {
    setLoadingQR(permit.id)
    try {
      const res = await fetch(`/api/permits/${permit.id}/qr`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setShowQR({ permit, qr: data.qr, url: data.url })
    } catch {}
    setLoadingQR(null)
  }

  const handlePrint = () => {
    if (!showQR) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl"><head><meta charset="UTF-8"><title>تصريح - ${showQR.permit.plateNumber}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;background:#f1f5f9;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px}
        .card{background:white;border-radius:20px;overflow:hidden;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.15)}
        .header{background:#0f172a;color:white;padding:20px;text-align:center}
        .header h1{font-size:18px;margin-top:8px}
        .header p{font-size:12px;opacity:0.6;margin-top:4px}
        .status{padding:12px 20px;text-align:center;font-weight:bold;font-size:15px}
        .active{background:#dcfce7;color:#166534}
        .expired{background:#fee2e2;color:#991b1b}
        .qr-section{padding:20px;text-align:center;background:#f8fafc}
        .qr-section img{border-radius:12px;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
        .body{padding:20px}
        .name{font-size:22px;font-weight:bold;color:#0f172a;margin-bottom:4px}
        .plate{font-size:28px;font-weight:bold;color:#2563eb;background:#eff6ff;padding:8px 16px;border-radius:10px;display:inline-block;margin:8px 0}
        .car{color:#64748b;font-size:13px;margin-bottom:16px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
        .item{background:#f8fafc;padding:12px;border-radius:10px}
        .item-label{font-size:10px;color:#94a3b8;margin-bottom:4px}
        .item-value{font-size:13px;font-weight:bold;color:#1e293b}
        .divider{border:none;border-top:1px dashed #e2e8f0;margin:16px 0}
        .permit-num{font-size:10px;color:#94a3b8;text-align:center;font-family:monospace}
        .footer{background:#0f172a;color:#94a3b8;padding:12px 20px;text-align:center;font-size:11px}
        .footer span{color:#60a5fa}
      </style></head>
      <body><div class="card">
        <div class="header">
          <div style="font-size:32px">🅿️</div>
          <h1>نظام إدارة المواقف</h1>
          <p>تصريح وقوف السيارات الرسمي</p>
        </div>
        <div class="status ${new Date(showQR.permit.endDate) >= new Date() && showQR.permit.status === 'ACTIVE' ? 'active' : 'expired'}">
          ${new Date(showQR.permit.endDate) >= new Date() && showQR.permit.status === 'ACTIVE' ? '✓ تصريح ساري المفعول' : '✗ تصريح منتهي أو ملغي'}
        </div>
        <div class="qr-section">
          <img src="${showQR.qr}" width="180" height="180"/>
          <p style="font-size:11px;color:#94a3b8;margin-top:8px">امسح للتحقق من التصريح</p>
        </div>
        <div class="body">
          <div class="name">${showQR.permit.userName}</div>
          <div class="plate">${showQR.permit.plateNumber}</div>
          <div class="car">${showQR.permit.vehicleBrand} ${showQR.permit.vehicleModel} — ${showQR.permit.vehicleColor}</div>
          <div class="grid">
            <div class="item"><div class="item-label">نوع التصريح</div><div class="item-value">${typeLabels[showQR.permit.type]}</div></div>
            <div class="item"><div class="item-label">الموقف</div><div class="item-value">${showQR.permit.parkingSlot || showQR.permit.zoneAccess || '—'}</div></div>
            <div class="item"><div class="item-label">تاريخ البدء</div><div class="item-value">${new Date(showQR.permit.startDate).toLocaleDateString('ar-SA')}</div></div>
            <div class="item"><div class="item-label">تاريخ الانتهاء</div><div class="item-value">${new Date(showQR.permit.endDate).toLocaleDateString('ar-SA')}</div></div>
            <div class="item"><div class="item-label">الرسوم</div><div class="item-value">${showQR.permit.price} ر.س</div></div>
            ${showQR.permit.userPhone ? `<div class="item"><div class="item-label">الجوال</div><div class="item-value">${showQR.permit.userPhone}</div></div>` : ''}
          </div>
          <hr class="divider"/>
          <div class="permit-num">رقم التصريح: ${showQR.permit.permitNumber?.slice(0, 24)}...</div>
        </div>
        <div class="footer">تم التطوير بواسطة <span>صادق الخاطر — فكرتي للاستشارات</span></div>
      </div>
      <script>window.onload=()=>{window.print()}</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">التصاريح</h1>
          <p className="text-gray-500 text-sm mt-0.5">{permits.length} تصريح</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إصدار تصريح</span>
          <span className="sm:hidden">إصدار</span>
        </button>
      </div>

      {/* Issue Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">إصدار تصريح جديد</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Section: Beneficiary */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">١</span>
                  بيانات المستفيد
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">الاسم الكامل <span className="text-red-500">*</span></label>
                    <input value={form.beneficiaryName} onChange={e => setForm({...form, beneficiaryName: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أحمد محمد العلي" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">رقم الجوال</label>
                      <input value={form.beneficiaryPhone} onChange={e => setForm({...form, beneficiaryPhone: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="05xxxxxxxx" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">رقم الهوية</label>
                      <input value={form.beneficiaryId} onChange={e => setForm({...form, beneficiaryId: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1xxxxxxxxx" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">الجهة / القسم</label>
                    <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="الإدارة العامة" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section: Vehicle */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">٢</span>
                  بيانات المركبة
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">رقم اللوحة <span className="text-red-500">*</span></label>
                    <input value={form.plateNumber} onChange={e => setForm({...form, plateNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-center"
                      placeholder="أ ب ج 1234" required />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">الماركة</label>
                      <input value={form.vehicleBrand} onChange={e => setForm({...form, vehicleBrand: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="تويوتا" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">الموديل</label>
                      <input value={form.vehicleModel} onChange={e => setForm({...form, vehicleModel: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="كامري" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">اللون</label>
                      <input value={form.vehicleColor} onChange={e => setForm({...form, vehicleColor: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أبيض" />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section: Permit Details */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">٣</span>
                  تفاصيل التصريح
                </h3>
                <div className="space-y-3">
                  {/* Permit Type */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">نوع التصريح</label>
                    <div className="grid grid-cols-4 gap-2">
                      {permitTypes.map(t => (
                        <button key={t.value} type="button"
                          onClick={() => handleTypeChange(t.value)}
                          className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-colors ${
                            form.type === t.value
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-blue-300'
                          }`}>
                          <div>{t.label}</div>
                          <div className={`text-xs mt-0.5 ${form.type === t.value ? 'text-blue-100' : 'text-gray-400'}`}>{t.price} ر.س</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">تاريخ البدء <span className="text-red-500">*</span></label>
                      <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">تاريخ الانتهاء <span className="text-red-500">*</span></label>
                      <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">الرسوم (ريال سعودي) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 pl-16"
                        placeholder="0" required />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ر.س</span>
                    </div>
                  </div>

                  {/* Parking Zone & Slot */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">منطقة الموقف</label>
                      <select value={form.zoneId} onChange={e => setForm({...form, zoneId: e.target.value, slotId: ''})}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">اختر المنطقة</option>
                        {zones.map(z => <option key={z.id} value={z.id}>منطقة {z.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">رقم الموقف</label>
                      <select value={form.slotId} onChange={e => setForm({...form, slotId: e.target.value})}
                        disabled={!form.zoneId}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                        <option value="">اختر الموقف</option>
                        {availableSlots.map(s => <option key={s.id} value={s.id}>{s.slotNumber}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-colors">
                {loading ? 'جارٍ إصدار التصريح...' : 'إصدار التصريح'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-5 text-white text-center">
              <p className="text-xs text-slate-400 mb-0.5">نظام إدارة المواقف</p>
              <h2 className="text-lg font-bold">{showQR.permit.userName}</h2>
              <p className="text-blue-400 font-bold text-xl mt-1">{showQR.permit.plateNumber}</p>
            </div>
            <div className="p-5">
              <div className="flex justify-center mb-3">
                <img src={showQR.qr} alt="QR" className="w-52 h-52 rounded-xl border-4 border-slate-100" />
              </div>
              <p className="text-center text-xs text-gray-400 mb-4">امسح الكود للتحقق من التصريح</p>
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">النوع</p>
                  <p className="text-sm font-bold">{typeLabels[showQR.permit.type]}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">الرسوم</p>
                  <p className="text-sm font-bold text-green-600">{showQR.permit.price} ر.س</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">الموقف</p>
                  <p className="text-sm font-bold">{showQR.permit.parkingSlot || showQR.permit.zoneAccess || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">الانتهاء</p>
                  <p className="text-sm font-bold">{new Date(showQR.permit.endDate).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-medium">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                <button onClick={() => { const a = document.createElement('a'); a.href = showQR.qr; a.download = `permit-${showQR.permit.plateNumber}.png`; a.click() }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium">
                  <Download className="w-4 h-4" /> تنزيل
                </button>
                <button onClick={() => setShowQR(null)} className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenew && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6">
            <h2 className="text-lg font-bold mb-1">تجديد التصريح</h2>
            <p className="text-sm text-gray-500 mb-4">{showRenew.userName} — <span className="font-bold text-blue-600">{showRenew.plateNumber}</span></p>
            <form onSubmit={handleRenew} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">تاريخ البدء الجديد</label>
                  <input type="date" value={renewForm.startDate} onChange={e => setRenewForm({...renewForm, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">تاريخ الانتهاء الجديد</label>
                  <input type="date" value={renewForm.endDate} onChange={e => setRenewForm({...renewForm, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">الرسوم (ريال)</label>
                <div className="relative">
                  <input type="number" value={renewForm.price} onChange={e => setRenewForm({...renewForm, price: e.target.value})}
                    placeholder={String(showRenew.price)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 pl-16" required />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ر.س</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                ⚠️ سيتم إلغاء التصريح الحالي وإصدار تصريح جديد تلقائياً
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60">
                  {loading ? 'جارٍ التجديد...' : 'تجديد التصريح'}
                </button>
                <button type="button" onClick={() => setShowRenew(null)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-sm font-medium">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="بحث بالاسم أو رقم اللوحة أو الجوال..." />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>لا توجد تصاريح</p>
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900">{p.userName}</p>
                <p className="text-blue-600 font-bold text-lg">{p.plateNumber}</p>
                <p className="text-xs text-gray-400">{p.vehicleBrand} {p.vehicleModel}</p>
              </div>
              <Badge status={p.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs my-3 bg-slate-50 rounded-xl p-3">
              <div><p className="text-gray-400">النوع</p><p className="font-medium text-gray-900">{typeLabels[p.type]}</p></div>
              <div><p className="text-gray-400">الموقف</p><p className="font-medium text-gray-900">{p.parkingSlot || p.zoneAccess || '—'}</p></div>
              <div><p className="text-gray-400">الرسوم</p><p className="font-medium text-green-600">{p.price} ر.س</p></div>
              <div className="col-span-3"><p className="text-gray-400">الانتهاء</p><p className="font-medium text-gray-900">{new Date(p.endDate).toLocaleDateString('ar-SA')}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleShowQR(p)} disabled={loadingQR === p.id}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white py-2 rounded-xl text-xs font-medium disabled:opacity-50">
                <QrCode className="w-3.5 h-3.5" /> QR وطباعة
              </button>
              <button onClick={() => { setShowRenew(p); setRenewForm({ startDate: '', endDate: '', price: String(p.price) }) }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 rounded-xl text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5" /> تجديد
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-5 py-3">المستفيد</th>
              <th className="text-right px-5 py-3">المركبة</th>
              <th className="text-right px-5 py-3">النوع</th>
              <th className="text-right px-5 py-3">الموقف</th>
              <th className="text-right px-5 py-3">الرسوم</th>
              <th className="text-right px-5 py-3">الانتهاء</th>
              <th className="text-right px-5 py-3">الحالة</th>
              <th className="text-right px-5 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد تصاريح</p>
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">{p.userName}</p>
                  {p.userPhone && <p className="text-xs text-gray-400">{p.userPhone}</p>}
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm font-bold text-blue-600">{p.plateNumber}</p>
                  <p className="text-xs text-gray-400">{p.vehicleBrand} {p.vehicleModel}</p>
                </td>
                <td className="px-5 py-3"><Badge status={p.type} /></td>
                <td className="px-5 py-3 text-sm text-gray-600">{p.parkingSlot || p.zoneAccess || '—'}</td>
                <td className="px-5 py-3 text-sm font-medium text-green-600">{p.price} ر.س</td>
                <td className="px-5 py-3 text-sm text-gray-600">{new Date(p.endDate).toLocaleDateString('ar-SA')}</td>
                <td className="px-5 py-3"><Badge status={p.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleShowQR(p)} disabled={loadingQR === p.id}
                      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50">
                      <QrCode className="w-3.5 h-3.5" /> QR
                    </button>
                    <button onClick={() => { setShowRenew(p); setRenewForm({ startDate: '', endDate: '', price: String(p.price) }) }}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium">
                      <RefreshCw className="w-3.5 h-3.5" /> تجديد
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
