// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import Navbar from './components/Navpar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';

export const metadata = {
  title: 'Clothing Store',
  description: 'Trendy clothing and fashion online shop.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
        <Navbar />
        <main className="pt-4">{children}</main>
        <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
