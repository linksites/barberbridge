import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BarberBridge',
  description: 'Marketplace e SaaS para conectar barbeiros e barbearias.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
