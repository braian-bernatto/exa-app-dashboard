'use client'
import React, { useState } from 'react'
import { Input } from '../../../../../components/ui/input'
import PreviewImageFile from '../../../../../components/PreviewImageFile'
import { Trash, Trophy } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'

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
import { useParams, useRouter } from 'next/navigation'
import { Exas } from '@/types'
import { AlertModal } from '@/components/modals/AlertModal'
import PreviewImageUrl from '@/components/PreviewImageUrl'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  logo_url: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .or(z.string())
    .optional()
})

type ExaType = Pick<Exas, 'name' | 'logo_url'> & {
  public_logo_url: string
}

interface ExaFormProps {
  initialData: ExaType | undefined
}

const ExaForm = ({ initialData }: ExaFormProps) => {
  const router = useRouter()
  const params = useParams()
  const { supabase } = useSupabase()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? 'Editar Exa' : 'Agregar Exa'
  const toastMessage = initialData ? 'Exa modificado' : 'Exa agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', logo_url: '' }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const { name, logo_url } = values
      if (!name) {
        return toast.error('Faltan datos')
      }

      const uniqueID = uniqid()
      let imagePath = ''

      // upload image
      if (typeof logo_url !== 'string') {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('exas')
          .upload(`image-${name}-${uniqueID}`, logo_url, {
            cacheControl: '3600',
            upsert: false
          })
        if (imageError) {
          setLoading(false)
          return toast.error('No se pudo alzar la imagen')
        }
        imagePath = imageData?.path!
      }

      if (initialData) {
        //update
        const { error: supabaseError } = await supabase
          .from('exas')
          .update({
            name,
            logo_url: imagePath || logo_url
          })
          .eq('id', +params.exaId)

        if (supabaseError) {
          console.log(supabaseError)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      } else {
        //insert
        const { error: supabaseError } = await supabase.from('exas').insert({
          name,
          logo_url: imagePath
        })
        if (supabaseError) {
          console.log(supabaseError)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      }

      router.refresh()
      router.push('/exas')
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    try {
      setLoading(true)

      const { error: supabaseError } = await supabase
        .from('exas')
        .delete()
        .eq('id', params.exaId)

      if (supabaseError) {
        console.log(supabaseError)
        setLoading(false)
        return toast.error(`No se pudo Borrar`)
      }
      router.refresh()
      router.push('/exas')
      toast.success('Borrado con éxito')
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
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
              {title}
            </h1>
            {initialData && (
              <Button
                type='button'
                className='ml-auto'
                disabled={loading}
                variant='destructive'
                size='icon'
                onClick={() => setOpen(true)}
              >
                <Trash className='h-4 w-4' />
              </Button>
            )}
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
            name='logo_url'
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
                    {typeof field.value === 'string' &&
                    initialData?.public_logo_url.length ? (
                      <PreviewImageUrl url={initialData?.public_logo_url} />
                    ) : (
                      <PreviewImageFile file={field.value} />
                    )}
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
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default ExaForm
