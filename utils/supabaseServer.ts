import 'server-only'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import type { Database } from '@/types_db'

export const createClient = () =>
  createServerComponentClient<Database>({ cookies })
