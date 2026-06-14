'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Car, FileText, CalendarClock,
  ParkingSquare, Users, BarChart3, LogOut, Shield, Menu, X, UserCheck
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/beneficiaries', icon: UserCheck, label: 'المستفيدون', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/vehicles', icon: Car, label: 'المركبات', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/permits', icon: FileText, label: 'التصاريح', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/reservations', icon: CalendarClock, label: 'الحجوزات', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/parking-zones', icon: ParkingSquare, label: 'مواقف السيارات', roles: ['ADMIN', 'MANAGER'] },
  { href: '/dashboard/users', icon: Users, label: 'المستخدمون', roles: ['ADMIN'] },
  { href: '/dashboard/reports', icon: BarChart3, label: 'التقارير', roles: ['ADMIN', 'MANAGER'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const filtered = navItems.filter(item => user && item.roles.includes(user.role))

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">نظام المواقف</h1>
            <p className="text-slate-400 text-xs">إدارة التصاريح والحجوزات</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {filtered.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
        <div className="mt-4 pt-3 border-t border-slate-700 text-center">
          <p className="text-slate-500 text-xs">تم التطوير بواسطة</p>
          <p className="text-slate-300 text-xs font-medium mt-0.5">صادق الخاطر</p>
          <p className="text-blue-400 text-xs">فكرتي للاستشارات</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className="md:hidden fixed top-0 right-0 left-0 z-40 bg-slate-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">نظام المواقف</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />}

      <aside className={`md:hidden fixed top-0 right-0 z-40 h-full w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} dir="rtl">
        <NavContent />
      </aside>

      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col min-h-screen shrink-0" dir="rtl">
        <NavContent />
      </aside>
    </>
  )
}
