'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '../../../../../components/ui/input'
import { Check, ChevronsUpDown, Shield, Trash, Trophy } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'

import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import uniqid from 'uniqid'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useParams, useRouter } from 'next/navigation'
import { Exas, Fases, Teams, Torneos } from '@/types'
import { AlertModal } from '@/components/modals/AlertModal'
import PreviewImageUrl from '@/components/PreviewImageUrl'
import PreviewImageFile from '../../../../../components/PreviewImageFile'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import Image from 'next/image'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  exa_id: z.coerce.number({ invalid_type_error: 'Obligatorio' }),
  image_url: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .or(z.string())
    .optional()
    .nullable(),
  teams: z.array(z.number()).refine(value => value.some(item => item), {
    message: 'Selecciona al menos una opción.'
  }),
  points_victory: z.coerce.number().optional(),
  points_tie: z.coerce.number().optional(),
  points_defeat: z.coerce.number().optional()
})

type TorneoType = Torneos & {
  teams: number[]
  public_image_url: string
}

interface TorneoFormProps {
  initialData: TorneoType | undefined
  exas: Exas[]
}

const TorneoForm = ({ initialData, exas }: TorneoFormProps) => {
  const router = useRouter()
  const params = useParams()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [teamsList, setTeamsList] = useState<Teams[]>([])

  const title = initialData ? 'Editar Torneo' : 'Agregar Torneo'
  const toastMessage = initialData ? 'Torneo modificado' : 'Torneo agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      image_url: '',
      teams: [],
      points_victory: 3,
      points_tie: 1,
      points_defeat: 0
    }
  })

  const getTeams = async (id: number) => {
    try {
      const { data, error } = await supabase.rpc('get_teams_by_exa_id', {
        exa_id: id
      })

      if (error) {
        console.log(error)
      }

      const dataWithImage = data?.map(data => {
        if (data.image_url?.length) {
          const { data: imageData } = supabase.storage
            .from('teams')
            .getPublicUrl(data.image_url!)
          return { ...data, image_url: imageData.publicUrl }
        }
        return data
      })

      setTeamsList((dataWithImage as any) || [])
    } catch (error) {
      console.log(error)
      return toast.error('No pudieron obtener equipos del Exa seleccionado')
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)

      const {
        name,
        image_url,
        exa_id,
        teams,
        points_victory,
        points_tie,
        points_defeat
      } = values

      if (!name || !exa_id) {
        return toast.error('Faltan datos')
      }

      const uniqueID = uniqid()
      let imagePath = ''

      // upload image
      if (image_url && typeof image_url !== 'string') {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('torneos')
          .upload(`image-${name}-${uniqueID}`, image_url, {
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
        const { error } = await supabase
          .from('torneos')
          .update({
            name: name.toLowerCase(),
            image_url: imagePath || image_url,
            points_victory,
            points_tie,
            points_defeat
          })
          .eq('id', params.torneoId)

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }

        // update torneo teams
        // check if a team was deleted
        const deletedTeams = initialData.teams.filter(team => {
          if (!teams.includes(team)) {
            return teams
          }
        })

        if (deletedTeams.length) {
          const { error } = await supabase
            .from('torneo_teams')
            .delete()
            .eq('torneo_id', params.torneoId)
            .in('team_id', deletedTeams)

          if (error) {
            console.log(error)
            setLoading(false)
            return toast.error(`No se pudo borrar equipo de torneo`)
          }
        }

        // check if new teams was added
        const newTeams = teams.filter(team => {
          if (!initialData.teams.includes(team)) {
            return team
          }
        })

        //insert torneo teams
        if (newTeams.length > 0) {
          const teamsFormatted = teams.map(team => ({
            torneo_id: initialData.id,
            team_id: team
          }))

          const { error: supabaseError } = await supabase
            .from('torneo_teams')
            .upsert(teamsFormatted)

          if (supabaseError) {
            console.log(supabaseError)
            setLoading(false)
            return toast.error(`No se pudo ${action} en Torneo Teams`)
          }
        }
      } else {
        //insert torneos
        const { data, error } = await supabase
          .from('torneos')
          .insert({
            name: name.toLowerCase(),
            image_url: imagePath,
            exa_id,
            points_victory,
            points_tie,
            points_defeat
          })
          .select()

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }

        //insert torneo teams
        if (data && teams.length > 0) {
          const teamsFormatted = teams.map(team => ({
            torneo_id: data[0].id,
            team_id: team
          }))

          const { error: teamsError } = await supabase
            .from('torneo_teams')
            .insert(teamsFormatted)

          if (teamsError) {
            console.log(teamsError)
            setLoading(false)
            return toast.error(`No se pudo ${action} en Torneo Teams`)
          }
        }
      }

      router.refresh()
      router.push('/torneos')
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
        .from('torneos')
        .delete()
        .eq('id', params.torneoId)

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo borrar`)
      }

      router.refresh()
      router.push('/torneos')
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
      getTeams(initialData.exa_id)
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
          className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'>
          <div className='flex gap-2'>
            <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
              <Trophy
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
                          'w-full justify-between uppercase',
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
                              className='uppercase'
                              onSelect={() => {
                                form.setValue('exa_id', exa.id)
                                getTeams(exa.id)
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
          {/* Teams */}
          <FormField
            control={form.control}
            name='teams'
            render={() => (
              <FormItem>
                <div className='mb-2'>
                  <FormLabel className='text-base'>Equipos</FormLabel>
                  <FormDescription>
                    Selecciona los equipos a formar parte del torneo
                  </FormDescription>
                </div>
                {teamsList.map(item => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name='teams'
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Checkbox
                              // disabled={initialData ? true : false}
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={checked => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        value => value !== item.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className='font-normal capitalize'>
                            {item.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
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
          {/* Puntos */}
          <div className='grid grid-cols-3 gap-2'>
            <div className='col-span-3 flex justify-center items-center gap-2 overflow-hidden text-xs text-neutral-400'>
              <Separator />
              Puntos
              <Separator />
            </div>
            <FormField
              control={form.control}
              name='points_victory'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Victoria</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('points_victory', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='points_tie'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Empate</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('points_tie', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='points_defeat'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Derrota</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('points_defeat', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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

export default TorneoForm
