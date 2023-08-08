'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Players, Teams } from '@/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  team_id: z.coerce.number({ invalid_type_error: 'Ingrese un número' }),
  image: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .optional(),
  country_iso2: z.string().optional(),
  position_id: z.string().optional(),
  rating: z.coerce.number().optional(),
  foot_id: z.coerce.number().optional()
})

interface FixtureFormProps {
  teams: Teams[]
  players: Players[]
}

const FixtureForm = ({ teams, players }: FixtureFormProps) => {
  const supabase = useSupabase()
  const [loading, setLoading] = useState(false)

  return <div>FixtureForm</div>
}

export default FixtureForm
