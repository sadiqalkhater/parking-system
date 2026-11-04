import type { Metadata } from 'next'

// Permit verification pages are reached via QR codes only and must never appear in search results.
export const metadata: Metadata = {
  title: 'التحقق من التصريح',
  robots: { index: false, follow: false, nocache: true },
}

export default function PermitLayout({ children }: { children: React.ReactNode }) {
  return children
}
