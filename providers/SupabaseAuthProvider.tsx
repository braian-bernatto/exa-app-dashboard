'use client'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect } from 'react'
import useSWR from 'swr'
import { useSupabase } from './SupabaseProvider'
import { Profile } from '@/types'

interface ContextI {
  user: Profile | null | undefined
  error: any
  isLoading: boolean
  signOut: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<string | null>
}

const Context = createContext<ContextI>({
  user: null,
  error: null,
  isLoading: true,
  signOut: async () => {},
  signInWithEmail: async (email: string, password: string) => null
})

const SupabaseAuthProvider = ({
  serverSession,
  children
}: {
  serverSession?: Session | null
  children: React.ReactNode
}) => {
  const { supabase } = useSupabase()
  const router = useRouter()

  // Get User
  const getUser = async () => {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', serverSession?.user?.id)
      .single()

    if (error) {
      console.log(error)
      return null
    } else {
      return user
    }
  }

  const {
    data: user,
    error,
    isLoading
  } = useSWR(serverSession ? 'profile-context' : null, getUser)

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Sign In with email
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return error.message
    }

    return null
  }

  // Refresh the page to sync server and client
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverSession?.access_token) {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, serverSession?.access_token])

  const exposed: ContextI = {
    user,
    error,
    isLoading,
    signOut,
    signInWithEmail
  }

  return <Context.Provider value={exposed}>{children}</Context.Provider>
}

export default SupabaseAuthProvider

export const useAuth = () => {
  let context = useContext(Context)
  if (context === undefined) {
    throw new Error('useAuth must be used inside SupabaseAuthProvider')
  } else {
    return context
  }
}
