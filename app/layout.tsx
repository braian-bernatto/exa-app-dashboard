import SupabaseProvider from '@/providers/SupabaseProvider'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { createClient } from '@/utils/supabaseServer'
import SupabaseAuthProvider from '@/providers/SupabaseAuthProvider'
import ToasterProvider from '@/providers/ToasterProvider'
import ModalProvider from '@/providers/ModalProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Exa App Dashboard',
  description:
    'Gestiona tus equipos y resultados para replicarlos en el Exa App!'
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  return (
    <html lang='es'>
      <body className={inter.className}>        
        <ToasterProvider />
        <SupabaseProvider>
          <SupabaseAuthProvider serverSession={session}>
            <ModalProvider />
            {children}
          </SupabaseAuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
