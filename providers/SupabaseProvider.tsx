'use client'

import { createClient } from '@/utils/supabaseBrowser'
import { createContext, useContext } from 'react'
import { Database } from '@/types_db'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

interface SupabaseProviderProps {
  children: React.ReactNode
}

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [supabase] = useState(() => createClient())
  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}

export default SupabaseProvider

export const useSupabase = () => {
  let context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  } else {
    return context
  }
}
