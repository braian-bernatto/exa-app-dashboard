'use client'
import React, { useState } from 'react'
import { Input } from '../../../../../components/ui/input'
import { Check, ChevronsUpDown, Shield, Trash } from 'lucide-react'
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
import { Exas, Teams } from '@/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../../../components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '../../../../../components/ui/command'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useParams, useRouter } from 'next/navigation'
import { AlertModal } from '@/components/modals/AlertModal'
import PreviewImageUrl from '@/components/PreviewImageUrl'
import PreviewImageFile from '../../../../../components/PreviewImageFile'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  image_url: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .or(z.string())
    .optional(),
  exa_id: z.coerce.number({ invalid_type_error: 'Obligatorio' }).nullable()
})

type TeamType = Teams & {
  public_image_url: string
}

interface TeamFormProps {
  initialData: TeamType | undefined
  exas: Exas[]
}

const TeamForm = ({ initialData, exas }: TeamFormProps) => {
  const router = useRouter()
  const params = useParams()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const title = initialData ? 'Editar Equipo' : 'Agregar Equipo'
  const toastMessage = initialData ? 'Equipo modificado' : 'Equipo agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      image_url: undefined,
      exa_id: undefined
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const { name, image_url, exa_id } = values
      if (!name || !exa_id) {
        return toast.error('Faltan datos')
      }

      const uniqueID = uniqid()
      let imagePath = ''

      // upload image
      if (image_url && typeof image_url !== 'string') {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('teams')
          .upload(`image-${name}-${uniqueID}`, image_url, {
            cacheControl: '3600',
            upsert: false
          })

        if (imageError) {
          setLoading(false)
          return toast.error('No se pudo agregar la imagen')
        }

        imagePath = imageData?.path!
      }

      if (initialData) {
        //update
        const { error } = await supabase
          .from('teams')
          .update({
            name: name.toLowerCase(),
            image_url: imagePath || image_url,
            exa_id
          })
          .eq('id', +params.equipoId)

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      } else {
        //insert
        const { error } = await supabase.from('teams').insert({
          name,
          image_url: imagePath,
          exa_id
        })

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      }

      router.refresh()
      router.push('/equipos')
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', +params.equipoId)

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo borrar`)
      }

      router.refresh()
      router.push('/equipos')
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
          className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'>
          <div className='flex gap-2'>
            <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
              <Shield className='text-white' size={30} />
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
                onClick={() => setOpen(true)}>
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
            name='image_url'
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
                    initialData?.public_image_url.length ? (
                      <PreviewImageUrl url={initialData?.public_image_url} />
                    ) : (
                      <PreviewImageFile file={field.value} />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Exa */}
          <FormField
            control={form.control}
            name='exa_id'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Exa</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={initialData ? true : false}
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}>
                        {field.value && exas
                          ? exas.find(exa => exa.id === field.value)?.name
                          : 'Elige un exa'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de equipos...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {exas &&
                          exas.map(exa => (
                            <CommandItem
                              value={exa.name!}
                              key={exa.id}
                              onSelect={() => {
                                form.setValue('exa_id', exa.id)
                              }}>
                              <>
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    exa.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {exa.image_url?.length ? (
                                  <Image
                                    src={exa.image_url}
                                    width={30}
                                    height={30}
                                    alt='exa logo'
                                    className='mr-2'
                                  />
                                ) : (
                                  <Shield className='mr-2' size={30} />
                                )}
                                {exa.name}
                              </>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='w-full'>
            <Button
              type='submit'
              variant={'default'}
              className='w-full'
              disabled={loading}>
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default TeamForm
