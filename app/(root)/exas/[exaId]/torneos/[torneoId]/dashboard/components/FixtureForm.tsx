'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Fixtures, Locations } from '@/types'
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
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDownIcon, MapPin, Swords, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/AlertModal'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export const revalidate = 0

interface FixtureFormProps {
  torneoId: string
  faseNro: number
  initialData: Fixtures | undefined
  locations: Locations[]
  getFixtures: () => void
  setFixtureSelected: (value: any) => void
  setOpenFixtureForm: (bool: boolean) => void
}

const FixtureForm = ({
  torneoId,
  faseNro,
  initialData,
  locations,
  getFixtures,
  setFixtureSelected,
  setOpenFixtureForm
}: FixtureFormProps) => {
  const router = useRouter()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const title = initialData ? 'Editar Fixture' : 'Agregar Fixture'
  const toastMessage = initialData ? 'Fixture modificado' : 'Fixture agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Obligatorio' }),
    location_id: z.number().nullable().optional(),
    is_vuelta: z.boolean().nullable().default(false)
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      location_id: undefined,
      is_vuelta: false
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, location_id, is_vuelta } = values

    try {
      setLoading(true)

      if (!name || !torneoId || !faseNro) {
        return toast.error('Faltan cargar datos')
      }

      // fixture
      if (initialData) {
        const { error } = await supabase
          .from('fixtures')
          .update({
            name: name.toLowerCase(),
            location_id,
            is_vuelta
          })
          .eq('id', initialData.id)

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      } else {
        const { error } = await supabase.from('fixtures').insert({
          name: name.toLowerCase(),
          torneo_id: torneoId,
          fase_nro: faseNro,
          location_id,
          is_vuelta
        })

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      }
      getFixtures()
      setFixtureSelected(undefined)
      setOpenFixtureForm(false)
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
        .eq('id', initialData?.id!)

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo borrar`)
      }
      getFixtures()
      setFixtureSelected(undefined)
      setOpenFixtureForm(false)
      setOpen(false)
      router.refresh()
      toast.success('Borrado con éxito')
      form.reset()
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      form.setValue('name', initialData.name)
      form.setValue('location_id', initialData.location_id)
    }
  }, [initialData])

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
          className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 gap-5'>
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

          {/* Vuelta */}
          <FormField
            control={form.control}
            name='is_vuelta'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormControl>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='is-vuelta'
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor='is-vuelta'>Partido Vuelta</Label>
                  </div>
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

export default FixtureForm
