'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BarChart3, TrendingUp, DollarSign, Car } from 'lucide-react'

export default function ReportsPage() {
  const { token } = useAuth()
  const [data, setData] = useState<{ stats: { totalUsers: number; totalVehicles: number; totalPermits: number; activePermits: number; totalReservations: number; todayReservations: number; totalSlots: number; occupiedSlots: number; availableSlots: number } } | null>(null)

  useEffect(() => {
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData)
  }, [token])

  if (!data) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>

  const { stats } = data
  const occupancyRate = stats.totalSlots > 0 ? ((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصاءات</h1>
        <p className="text-gray-500 text-sm mt-1">نظرة عامة على أداء النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-xl"><Car className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-bold text-gray-900">إحصاءات المركبات</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">إجمالي المركبات</span>
              <span className="font-bold text-gray-900">{stats.totalVehicles}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">إجمالي المستخدمين</span>
              <span className="font-bold text-gray-900">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-bold text-gray-900">إحصاءات التصاريح</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">إجمالي التصاريح</span>
              <span className="font-bold text-gray-900">{stats.totalPermits}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">التصاريح النشطة</span>
              <span className="font-bold text-green-600">{stats.activePermits}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">نسبة النشاط</span>
              <span className="font-bold text-gray-900">{stats.totalPermits > 0 ? ((stats.activePermits / stats.totalPermits) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-xl"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-bold text-gray-900">إحصاءات الحجوزات</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">إجمالي الحجوزات</span>
              <span className="font-bold text-gray-900">{stats.totalReservations}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">حجوزات اليوم</span>
              <span className="font-bold text-purple-600">{stats.todayReservations}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-xl"><BarChart3 className="w-5 h-5 text-orange-600" /></div>
            <h3 className="font-bold text-gray-900">إشغال المواقف</h3>
          </div>
          <div className="text-center my-4">
            <p className="text-4xl font-bold text-orange-600">{occupancyRate}%</p>
            <p className="text-gray-500 text-sm mt-1">نسبة الإشغال الحالية</p>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${occupancyRate}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{stats.availableSlots} متاح</span>
            <span>{stats.occupiedSlots} مشغول</span>
          </div>
        </div>
      </div>
    </div>
  )
}
