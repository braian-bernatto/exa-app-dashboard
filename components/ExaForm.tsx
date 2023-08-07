'use client'
import React, { useState } from 'react'
import { Input } from './ui/input'
import PreviewImage from './PreviewImage'
import { Trophy } from 'lucide-react'
import { Button } from './ui/button'

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
import uniqid from 'uniqid'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  logo: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .optional()
})

const ExaForm = () => {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState<boolean>(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: undefined
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const { name, logo } = values
      if (!name) {
        return toast.error('Faltan datos')
      }

      const uniqueID = uniqid()
      let imagePath = ''

      // upload image
      if (logo) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('exas')
          .upload(`image-${name}-${uniqueID}`, logo, {
            cacheControl: '3600',
            upsert: false
          })
        if (imageError) {
          setLoading(false)
          return toast.error('No se pudo alzar la imagen')
        }
        imagePath = imageData?.path!
      }

      const { error: supabaseError } = await supabase.from('exas').insert({
        name,
        logo_url: imagePath
      })
      if (supabaseError) {
        setLoading(false)
        return toast.error('No se pudo grabar')
      }

      router.refresh()
      setLoading(false)
      form.reset()
      toast.success('Exa creado!')
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'
      >
        <div className='flex gap-2'>
          <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
            <Trophy className='text-white' size={30} />
          </span>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            Agregar Exa
          </h1>
        </div>
        {/* Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='rounded bg-white'>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Logo */}
        <FormField
          control={form.control}
          name='logo'
          render={({ field }) => (
            <FormItem className='rounded bg-white'>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <div className='flex flex-col items-center gap-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={e => {
                      field.onChange(e.target.files?.[0])
                    }}
                  />
                  <PreviewImage file={field.value} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='w-full'>
          <Button
            type='submit'
            variant={'default'}
            className='w-full'
            disabled={loading}
          >
            Agregar
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ExaForm
