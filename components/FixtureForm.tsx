'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Locations, Players, Teams } from '@/types'
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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ChevronsUpDownIcon,
  MapPin,
  Shield,
  Swords
} from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from './ui/calendar'
import { format, set, subDays } from 'date-fns'
import { es } from 'date-fns/esm/locale'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from './ui/command'
import Image from 'next/image'
import { DataTable } from '@/app/(table)/DataTable'
import { columns } from '@/app/(table)/columns'
import { Separator } from './ui/separator'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  team_1: z.coerce.number(),
  team_2: z.coerce.number(),
  date: z.date({ required_error: 'Obligatorio' }),
  location_id: z.coerce.number().optional(),
  cancha_nro: z.coerce.number().optional()
})

interface FixtureFormProps {
  teams: Teams[]
  players: Players[]
  locations: Locations[]
}

const FixtureForm = ({ teams, players, locations }: FixtureFormProps) => {
  const router = useRouter()
  const supabase = useSupabase()
  const [loading, setLoading] = useState<boolean>(false)
  const [hour, setHour] = useState<string>('')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      team_1: undefined,
      team_2: undefined,
      date: undefined,
      location_id: undefined,
      cancha_nro: 0
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

        <div className='grid grid-cols-2 gap-1 overflow-hidden'>
          {/* team 1 */}
          <FormField
            control={form.control}
            name='team_1'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo 1</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between text-xs',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? teams.find(team => team.id === field.value)?.name
                          : 'Elige un equipo'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 max-h-[500px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de equipos...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {teams.map(team => (
                          <CommandItem
                            value={team.name!}
                            key={team.id}
                            onSelect={() => {
                              form.setValue('team_1', team.id)
                            }}
                          >
                            <>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  team.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {team.logo_url?.length ? (
                                <Image
                                  src={team.logo_url}
                                  width={30}
                                  height={30}
                                  alt='team logo'
                                  className='mr-2'
                                />
                              ) : (
                                <Shield className='mr-2' size={30} />
                              )}
                              {team.name}
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
          {/* team 2 */}
          <FormField
            control={form.control}
            name='team_2'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo 2</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between text-xs',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? teams.find(team => team.id === field.value)?.name
                          : 'Elige un equipo'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 max-h-[500px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de equipos...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {teams.map(team => (
                          <CommandItem
                            value={team.name!}
                            key={team.id}
                            onSelect={() => {
                              form.setValue('team_2', team.id)
                            }}
                          >
                            <>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  team.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {team.logo_url?.length ? (
                                <Image
                                  src={team.logo_url}
                                  width={30}
                                  height={30}
                                  alt='team logo'
                                  className='mr-2'
                                />
                              ) : (
                                <Shield className='mr-2' size={30} />
                              )}
                              {team.name}
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
        </div>

        {/* Date */}
        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y Hora</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value!, 'PP | HH:mm', {
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
                          hours: hour.length ? +hour.split(':')[0] : 0,
                          minutes: hour.length ? +hour.split(':')[1] : 0
                        })
                      )
                    }}
                    disabled={date => date < subDays(new Date(), 1)}
                    initialFocus
                    locale={es}
                  />
                  <div className='flex justify-center items-center pb-4 px-20'>
                    <Input
                      className='shadow-md text-xl font-semibold'
                      type='time'
                      defaultValue={
                        field.value ? format(field.value, 'HH:mm') : undefined
                      }
                      onChange={e => {
                        setHour(e.target.value) // keeps the time when date changes
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

        <div className='flex w-full gap-1'>
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
                        )}
                      >
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
                  <PopoverContent className='max-w-[220px] p-0 max-h-[500px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de posiciones...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {locations.map(location => (
                          <CommandItem
                            value={location.name!}
                            key={location.id}
                            onSelect={() => {
                              form.setValue('location_id', location.id)
                            }}
                          >
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
          {/* Cancha nro */}
          <FormField
            control={form.control}
            name='cancha_nro'
            render={({ field }) => (
              <FormItem className='rounded bg-white w-[75px] shrink-0'>
                <FormLabel>Cancha N°</FormLabel>
                <FormControl>
                  <Input
                    className='font-semibold text-center'
                    type='number'
                    min={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Table */}
        <div className='w-full relative overflow-hidden'>
          <div className='w-full flex justify-center items-center gap-2 h-6 text-xs relative'>
            <Separator />
            <p className='flex-none'>Equipo 1</p>
            <Separator />
          </div>
          <DataTable columns={columns} data={players} />
        </div>
        <div className='w-full relative overflow-hidden'>
          <div className='w-full flex justify-center items-center gap-2 h-6 text-xs relative'>
            <Separator />
            <p className='flex-none'>Equipo 2</p>
            <Separator />
          </div>
          <DataTable columns={columns} data={players} />
        </div>

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
