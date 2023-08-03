import { Database } from '@/types_db'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createPagesBrowserClient<Database>()
