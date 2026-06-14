'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Phone, Mail, Shield, Car, Calendar, Hash } from 'lucide-react'

interface PermitData {
  id: string
  permitNumber: string
  type: string
  status: string
  startDate: string
  endDate: string
  price: number
  zoneAccess?: string
  userName: string
  userEmail?: string
  phone?: string
  plateNumber: string
  brand: string
  model: string
  color: string
}

const typeLabels: Record<string, string> = { DAILY: 'يومي', MONTHLY: 'شهري', YEARLY: 'سنوي', VISITOR: 'زائر' }

export default function PermitPublicPage() {
  const { id } = useParams()
  const [permit, setPermit] = useState<PermitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/permits/${id}/public`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setPermit(data)
      })
      .catch(() => setError('حدث خطأ في تحميل البيانات'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500">جارٍ التحقق من التصريح...</p>
      </div>
    </div>
  )

  if (error || !permit) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">تصريح غير موجود</h1>
        <p className="text-gray-500 text-sm">لم يتم العثور على هذا التصريح في النظام</p>
      </div>
    </div>
  )

  const now = new Date()
  const endDate = new Date(permit.endDate)
  const startDate = new Date(permit.startDate)
  const isActive = permit.status === 'ACTIVE' && endDate >= now && startDate <= now
  const isExpired = permit.status === 'ACTIVE' && endDate < now
  const isPending = permit.status === 'ACTIVE' && startDate > now
  const isCancelled = permit.status === 'CANCELLED' || permit.status === 'SUSPENDED'

  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">

        {/* Status Banner */}
        <div className={`rounded-2xl p-5 mb-4 text-center ${
          isActive ? 'bg-green-500' :
          isExpired ? 'bg-red-500' :
          isPending ? 'bg-amber-500' :
          'bg-gray-500'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {isActive && <CheckCircle className="w-8 h-8 text-white" />}
            {(isExpired || isCancelled) && <XCircle className="w-8 h-8 text-white" />}
            {isPending && <Clock className="w-8 h-8 text-white" />}
            <span className="text-white text-2xl font-bold">
              {isActive ? 'تصريح ساري ✓' :
               isExpired ? 'تصريح منتهي' :
               isPending ? 'لم يبدأ بعد' :
               'تصريح ملغي'}
            </span>
          </div>
          {isActive && daysLeft > 0 && (
            <p className="text-white/80 text-sm">متبقي {daysLeft} يوم</p>
          )}
          {isExpired && (
            <p className="text-white/80 text-sm">انتهى في {endDate.toLocaleDateString('ar-SA')}</p>
          )}
        </div>

        {/* Permit Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-slate-900 p-5 text-white">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base">نظام إدارة المواقف</h1>
                <p className="text-slate-400 text-xs">تصريح وقوف السيارات</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* Holder Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">صاحب التصريح</p>
              <p className="text-lg font-bold text-slate-900">{permit.userName}</p>
              {permit.phone && (
                <a href={`tel:${permit.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 mt-1">
                  <Phone className="w-3.5 h-3.5" /> {permit.phone}
                </a>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-600 font-medium">بيانات المركبة</p>
              </div>
              <p className="text-2xl font-bold text-blue-700 mb-1">{permit.plateNumber}</p>
              <p className="text-sm text-blue-600">{permit.brand} {permit.model} — {permit.color}</p>
            </div>

            {/* Permit Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500">نوع التصريح</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{typeLabels[permit.type] || permit.type}</p>
              </div>
              {permit.zoneAccess && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">المنطقة المسموحة</p>
                  <p className="text-sm font-bold text-slate-900">{permit.zoneAccess}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500">تاريخ البدء</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{startDate.toLocaleDateString('ar-SA')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500">تاريخ الانتهاء</p>
                </div>
                <p className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                  {endDate.toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>

            {/* Permit Number */}
            <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">رقم التصريح</p>
              <p className="text-xs font-mono text-slate-600 break-all">{permit.permitNumber}</p>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-600 rounded-xl p-4 text-white text-center">
              <p className="text-sm font-bold mb-1">هل تحتاج مساعدة؟</p>
              <p className="text-xs text-blue-100 mb-3">تواصل مع إدارة المواقف</p>
              <div className="flex gap-2">
                <a href="tel:+966500000000"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white text-blue-600 py-2 rounded-lg text-xs font-bold">
                  <Phone className="w-3.5 h-3.5" /> اتصال
                </a>
                <a href="mailto:info@parking.com"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 text-white py-2 rounded-lg text-xs font-bold">
                  <Mail className="w-3.5 h-3.5" /> بريد
                </a>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-5 py-3 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">تم التطوير بواسطة</p>
            <p className="text-xs font-medium text-slate-600">صادق الخاطر — فكرتي للاستشارات</p>
          </div>
        </div>

      </div>
    </div>
  )
}
