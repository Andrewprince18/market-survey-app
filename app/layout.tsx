import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '傳統市場商品調查',
  description: '商家自填商品與食材來源調查表',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
