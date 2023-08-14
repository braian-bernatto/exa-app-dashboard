'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Locations, Torneos } from '@/types'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from './ui/command'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  torneo_id: z.coerce.number({
    required_error: 'Obligatorio',
    invalid_type_error: 'Obligatorio'
  }),
  location_id: z.coerce.number().optional()
})

interface FixtureFormProps {
  torneos: Torneos[]
  locations: Locations[]
}

const FixtureForm = ({ torneos, locations }: FixtureFormProps) => {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      torneo_id: undefined,
      location_id: undefined
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const { name, torneo_id, location_id } = values

      if (!name || !torneo_id) {
        return toast.error('Faltan datos')
      }

      // fixture
      const { error: supabaseFixtureError } = await supabase
        .from('fixtures')
        .insert({
          name,
          torneo_id,
          location_id
        })

      if (supabaseFixtureError) {
        setLoading(false)
        return toast.error('No se pudo grabar Fixture Cabecera')
      }

      router.refresh()
      setLoading(false)

      form.reset()

      toast.success('Fixture creado!')
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
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
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
                          }}
                        >
                          <>
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                torneo.id === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {torneo.logo_url?.length ? (
                              <Image
                                src={torneo.logo_url}
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
