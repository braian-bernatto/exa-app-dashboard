'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Fases, TiposPartido, TorneoFase, Torneos } from '@/types'
import { useEffect, useState } from 'react'
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
import { useParams, useRouter } from 'next/navigation'
import {
  Check,
  ChevronsUpDown,
  ChevronsUpDownIcon,
  MapPin,
  Shield,
  Swords,
  Trash
} from 'lucide-react'

import { cn } from '@/lib/utils'

import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/AlertModal'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'

export const revalidate = 0

export type TorneoFaseType = TorneoFase

interface TorneoFaseFormProps {
  initialData: TorneoFaseType | undefined
  torneos: Torneos[]
  fases: Fases[] | []
  tiposPartido: TiposPartido[] | []
}

const TorneoFaseForm = ({
  initialData,
  torneos,
  fases,
  tiposPartido
}: TorneoFaseFormProps) => {
  const router = useRouter()
  const params = useParams()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [faseNro, setFaseNro] = useState<number | null>()

  const title = initialData ? 'Editar Fase' : 'Agregar Fase'
  const toastMessage = initialData ? 'Fase modificado' : 'Fase agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const formSchema = z.object({
    torneo_id: z.coerce.string({
      required_error: 'Obligatorio',
      invalid_type_error: 'Obligatorio'
    }),
    fase_id: z.coerce.number({
      required_error: 'Obligatorio',
      invalid_type_error: 'Obligatorio'
    }),
    tipo_partido_id: z.coerce.number({
      required_error: 'Obligatorio',
      invalid_type_error: 'Obligatorio'
    })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      torneo_id: undefined,
      fase_id: undefined,
      tipo_partido_id: undefined
    }
  })

  async function generateTorneoFaseNro(torneoId: string) {
    const { data, count } = await supabase
      .from('torneo_fase')
      .select('*', { count: 'exact', head: true })
      .eq('torneo_id', torneoId)

    setFaseNro(count ? count + 1 : 1)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { torneo_id, fase_id, tipo_partido_id } = values

    try {
      setLoading(true)

      if (!torneo_id || !faseNro || tipo_partido_id) {
        return toast.error('Faltan cargar datos')
      }

      // fixture
      // if (initialData) {
      //   const { error } = await supabase
      //     .from('fixtures')
      //     .update({})
      //     .eq('id', params.fixtureId)

      //   if (error) {
      //     console.log(error)
      //     setLoading(false)
      //     return toast.error(`No se pudo ${action}`)
      //   }

      //   const { error: torneoFaseError } = await supabase
      //     .from('torneo_fase')
      //     .update({ tipo_partido_id })
      //     .eq('torneo_id', torneo_id)
      //     .eq('fase_id', fase_id)

      //   if (torneoFaseError) {
      //     console.log(torneoFaseError)
      //     setLoading(false)
      //     return toast.error(`No se pudo ${action} tipo partido`)
      //   }
      // } else {
      //   // const { error } = await supabase.from('fixtures').insert({
      //   //   name: name.toLowerCase(),
      //   //   torneo_id,
      //   //   fase_id,
      //   //   location_id
      //   // })

      //   if (error) {
      //     console.log(error)
      //     setLoading(false)
      //     return toast.error(`No se pudo ${action}`)
      //   }

      //   const { error: torneoFaseError } = await supabase
      //     .from('torneo_fase')
      //     .update({ tipo_partido_id })
      //     .eq('torneo_id', torneo_id)
      //     .eq('fase_id', fase_id)

      //   if (torneoFaseError) {
      //     console.log(torneoFaseError)
      //     setLoading(false)
      //     return toast.error(`No se pudo ${action} tipo partido`)
      //   }
      // }

      router.refresh()
      router.push('/fixtures')
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
        .from('fixtures')
        .delete()
        .eq('id', params.fixtureId)

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo borrar`)
      }
      router.refresh()
      router.push('/fixtures')
      toast.success('Borrado con éxito')
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      generateTorneoFaseNro(initialData.torneo_id)
    }
  }, [])

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
          className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5'>
          <div className='flex gap-2'>
            <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
              <Swords
                className='text-white'
                size={30}
                onClick={() => console.log(form.getValues())}
              />
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

          {/* torneo */}
          <FormField
            control={form.control}
            name='torneo_id'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Torneo</FormLabel>
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
                        {field.value
                          ? torneos.find(torneo => torneo.id === field.value)
                              ?.name
                          : 'Elige un torneo'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de torneos...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {torneos.map(torneo => (
                          <CommandItem
                            value={torneo.name!}
                            key={torneo.id}
                            onSelect={() => {
                              form.setValue('torneo_id', torneo.id)
                              generateTorneoFaseNro(torneo.id)
                            }}>
                            <>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  torneo.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {torneo.image_url?.length ? (
                                <Image
                                  src={torneo.image_url}
                                  width={30}
                                  height={30}
                                  alt='torneo logo'
                                  className='mr-2'
                                />
                              ) : (
                                <Shield className='mr-2' size={30} />
                              )}
                              {torneo.name}
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

          {/* fases */}
          <FormField
            control={form.control}
            name='fase_id'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel>Fase</FormLabel>
                <FormControl>
                  <RadioGroup
                    disabled={initialData ? true : false}
                    onValueChange={field.onChange}
                    defaultValue={`${field.value}`}
                    className='flex flex-col space-y-1'>
                    {fases.map(fase => (
                      <FormItem
                        key={fase.id}
                        className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value={fase.id.toString()} />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          {fase.name}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* tipo partido */}
          <FormField
            control={form.control}
            name='tipo_partido_id'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel>Tipo Partido</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={`${field.value}`}
                    className='flex flex-col space-y-1'>
                    {tiposPartido.map(tipo => (
                      <FormItem
                        key={tipo.id}
                        className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value={tipo.id.toString()} />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          {tipo.name}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name='location_id'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Local</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}>
                        <MapPin className='mr-2 shrink-0 opacity-50' />
                        {field.value
                          ? locations.find(
                              location => location.id === field.value
                            )?.name
                          : 'Elige un local'}
                        <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de canchas...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {locations.map(location => (
                          <CommandItem
                            value={location.name!}
                            key={location.id}
                            onSelect={() => {
                              form.setValue('location_id', location.id)
                            }}>
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                location.id === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {location.name}
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

export default TorneoFaseForm
