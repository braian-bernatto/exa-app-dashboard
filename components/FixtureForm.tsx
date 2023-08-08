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
import { useRouter } from 'next/navigation'
import { CalendarIcon, Swords } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from './ui/calendar'
import { format, getHours, getMinutes, parseISO, set, subDays } from 'date-fns'
import { es } from 'date-fns/esm/locale'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  date: z.date().optional()
})

interface FixtureFormProps {
  teams: Teams[]
  players: Players[]
}

const FixtureForm = ({ teams, players }: FixtureFormProps) => {
  const router = useRouter()
  const supabase = useSupabase()
  const [loading, setLoading] = useState<boolean>(false)
  const [hour, setHour] = useState<string>('--:--')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date: undefined
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    form.reset()
    // try {
    //   setLoading(true)
    //   const { name, logo } = values
    //   if (!name) {
    //     return toast.error('Faltan datos')
    //   }
    //   const uniqueID = uniqid()
    //   let imagePath = ''
    //   // upload image
    //   if (logo) {
    //     const { data: imageData, error: imageError } = await supabase.storage
    //       .from('torneos')
    //       .upload(`image-${name}-${uniqueID}`, logo, {
    //         cacheControl: '3600',
    //         upsert: false
    //       })
    //     if (imageError) {
    //       setLoading(false)
    //       return toast.error('No se pudo alzar la imagen')
    //     }
    //     imagePath = imageData?.path!
    //   }
    //   const { error: supabaseError } = await supabase.from('torneos').insert({
    //     name,
    //     logo_url: imagePath
    //   })
    //   if (supabaseError) {
    //     setLoading(false)
    //     return toast.error('No se pudo grabar')
    //   }
    //   router.refresh()
    //   setLoading(false)
    //   form.reset()
    //   toast.success('Torneo creado!')
    // } catch (error) {
    //   toast.error('Hubo un error')
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'
      >
        <div className='flex gap-2'>
          <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
            <Swords className='text-white' size={30} />
          </span>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            Agregar Fixture
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
        {/* Date */}
        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Fecha y Hora</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PP | HH:mm', {
                          locale: es
                        })
                      ) : (
                        <span>Elige una fecha</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={e => {
                      field.onChange(
                        set(e!, {
                          hours: +hour.split(':')[0],
                          minutes: +hour.split(':')[1]
                        })
                      )
                    }}
                    disabled={date => date < subDays(new Date(), 1)}
                    initialFocus
                    locale={es}
                  />
                  <div className='flex justify-center pb-4 px-20'>
                    <Input
                      className='shadow-md text-xl font-semibold'
                      type='time'
                      defaultValue={
                        field.value ? format(field.value, 'HH:mm') : hour
                      }
                      onChange={e => {
                        setHour(e.target.value)
                        field.onChange(
                          set(field.value ? field.value : new Date(), {
                            hours: +e.target.value.split(':')[0],
                            minutes: +e.target.value.split(':')[1]
                          })
                        )
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Logo */}
        {/* <FormField
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
        /> */}
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

export default FixtureForm
