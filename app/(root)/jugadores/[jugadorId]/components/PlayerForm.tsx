'use client'
import React, { useState } from 'react'
import { Input } from '../../../../../components/ui/input'
import { Shield, Trash, UserPlus } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import uniqid from 'uniqid'
import { Separator } from '@/components/ui/separator'
import { Countries, Foot, Players, Positions, Teams } from '@/types'

import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useParams, useRouter } from 'next/navigation'
import PreviewImageUrl from '@/components/PreviewImageUrl'
import PreviewImageFile from '../../../../../components/PreviewImageFile'
import { AlertModal } from '@/components/modals/AlertModal'
import { Switch } from '@/components/ui/switch'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

type PlayerType = Pick<
  Players,
  | 'name'
  | 'team_id'
  | 'image_url'
  | 'position_id'
  | 'foot_id'
  | 'rating'
  | 'rit'
  | 'def'
  | 'fis'
  | 'pas'
  | 'reg'
  | 'tir'
  | 'active'
  | 'country_iso2'
> & {
  public_image_url: string
}

interface PlayerFormlProps {
  initialData: PlayerType | undefined
  teams: Teams[]
  positions: Positions[]
  countries: Countries[]
  foot: Foot[]
}

const PlayerForm = ({
  initialData,
  teams,
  positions,
  countries,
  foot
}: PlayerFormlProps) => {
  const router = useRouter()
  const params = useParams()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const title = initialData ? 'Editar Jugador' : 'Agregar Jugador'
  const toastMessage = initialData ? 'Jugador modificado' : 'Jugador agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Obligatorio' }),
    team_id: z.coerce.number({ invalid_type_error: 'Ingrese un número' }),
    image_url: z
      .any()
      .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
      .refine(
        files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
        'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
      )
      .or(z.string())
      .optional(),
    country_iso2: z.string().optional().nullable(),
    position_id: z.string(),
    rating: z.coerce.number().nullable(),
    foot_id: z.coerce.number().nullable(),
    active: z.coerce.boolean(),
    rit: z.coerce.number().nullable(),
    tir: z.coerce.number().nullable(),
    pas: z.coerce.number().nullable(),
    reg: z.coerce.number().nullable(),
    def: z.coerce.number().nullable(),
    fis: z.coerce.number().nullable()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      team_id: undefined,
      image_url: undefined,
      country_iso2: undefined,
      position_id: undefined,
      foot_id: undefined,
      rating: 0,
      rit: 0,
      tir: 0,
      pas: 0,
      reg: 0,
      def: 0,
      fis: 0,
      active: true
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {
      name,
      team_id,
      image_url,
      country_iso2,
      position_id,
      rating,
      foot_id,
      rit,
      tir,
      pas,
      reg,
      def,
      fis,
      active
    } = values
    try {
      setLoading(true)

      if (!name || !team_id || !position_id) {
        return toast.error('Faltan cargar datos')
      }

      const uniqueID = uniqid()
      let imagePath = ''

      // upload image
      if (image_url && typeof image_url !== 'string') {
        // background removal
        const url = 'https://sdk.photoroom.com/v1/segment'
        const formImage = new FormData()
        formImage.append('image_file', image_url)
        formImage.append('format', 'png')
        formImage.append('channels', '')
        formImage.append('bg_color', '')
        formImage.append('size', 'preview')
        formImage.append('crop', 'true')

        const options = {
          method: 'POST',
          headers: {
            Accept: 'image/png, application/json',
            'x-api-key': process.env.NEXT_PUBLIC_PHOTOROOM_API_KEY || ''
          },
          body: formImage
        }

        try {
          const response = await fetch(url, options)
          if (response.ok) {
            const dataFromApi = await response.blob()
            const file = new File([dataFromApi], 'player.png', {
              type: 'image/png'
            })

            console.log({ dataFromApi, file })

            // upload to supabase the edited image
            const { data: imageData, error: imageError } =
              await supabase.storage
                .from('players')
                .upload(`image-${name}-${uniqueID}`, file, {
                  cacheControl: '3600',
                  upsert: false
                })

            if (imageError) {
              setLoading(false)
              return toast.error('No se pudo agregar la imagen')
            }
            imagePath = imageData?.path!
          } else {
            throw new Error('Hubo un error en photoroom api')
          }
        } catch (error) {
          console.error(error)

          // upload to supabase the original image
          const { data: imageData, error: imageError } = await supabase.storage
            .from('players')
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
      }

      // upload player
      if (initialData) {
        //update
        const { error: supabaseError } = await supabase
          .from('players')
          .update({
            name: name.toLowerCase(),
            team_id,
            image_url: imagePath || image_url,
            country_iso2,
            position_id,
            rating,
            foot_id,
            rit: rit,
            tir: tir,
            pas: pas,
            reg: reg,
            def: def,
            fis: fis,
            active
          })
          .eq('id', +params.jugadorId)

        if (supabaseError) {
          console.log(supabaseError)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      } else {
        //insert
        const { error: supabaseError } = await supabase.from('players').insert({
          name: name.toLowerCase(),
          team_id,
          image_url: imagePath,
          country_iso2,
          position_id,
          rating,
          foot_id,
          rit: rit,
          tir: tir,
          pas: pas,
          reg: reg,
          def: def,
          fis: fis,
          active
        })

        if (supabaseError) {
          console.log(supabaseError)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }
      }

      router.refresh()
      router.push('/jugadores')
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
        .from('players')
        .delete()
        .eq('id', +params.jugadorId)

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo borrar`)
      }
      router.refresh()
      router.push('/jugadores')
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
              <UserPlus className='text-white' size={30} />
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
          {/* Team */}
          <FormField
            control={form.control}
            name='team_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo</FormLabel>
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
                        {field.value
                          ? teams.find(team => team.id === field.value)?.name
                          : 'Elige un equipo'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de equipos...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {teams.map(team => (
                          <CommandItem
                            value={team.name!}
                            key={team.id}
                            onSelect={() => {
                              form.setValue('team_id', team.id)
                            }}>
                            <>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  team.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {team.image_url?.length ? (
                                <Image
                                  src={team.image_url}
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
          {/* Active */}
          <FormField
            control={form.control}
            name='active'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Activo</FormLabel>
                <FormControl>
                  <div className='flex items-center'>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Image */}
          <FormField
            control={form.control}
            name='image_url'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Imagen</FormLabel>
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
          {/* Position */}
          <FormField
            control={form.control}
            name='position_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posición</FormLabel>
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
                        {field.value
                          ? positions.find(
                              position => position.id === field.value
                            )?.name
                          : 'Elige una posición'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de posiciones...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {positions.map(position => (
                          <CommandItem
                            value={position.name!}
                            key={position.id}
                            onSelect={() => {
                              form.setValue('position_id', position.id)
                            }}>
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                position.id === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {position.name}
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
          {/* Country */}
          <FormField
            control={form.control}
            name='country_iso2'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad</FormLabel>
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
                        {field.value
                          ? countries.find(
                              country => country.iso2 === field.value
                            )?.name
                          : 'Elige un país'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de paises...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {countries.map(country => (
                          <CommandItem
                            value={country.name!}
                            key={country.id}
                            onSelect={() => {
                              form.setValue('country_iso2', country.iso2)
                            }}>
                            <>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 flex-none',
                                  country.iso2 === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <Image
                                src={`https://flagcdn.com/${country.iso2.toLowerCase()}.svg`}
                                width={20}
                                height={20}
                                alt='country flag'
                                className='mr-2 flex-none'
                              />
                              {country.name}
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
          {/* Foot */}
          <FormField
            control={form.control}
            name='foot_id'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel>Pie</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                    className='flex flex-col space-y-1'>
                    {foot.map(f => (
                      <FormItem
                        className='flex items-center space-x-3 space-y-0'
                        key={f.id}>
                        <FormControl>
                          <RadioGroupItem value={f.id.toString()} />
                        </FormControl>
                        <FormLabel className='font-normal capitalize'>
                          {f.name}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-2 gap-2'>
            <div className='col-span-2 flex justify-center items-center gap-2 overflow-hidden text-xs text-neutral-400'>
              <Separator />
              Atributos
              <Separator />
            </div>
            {/* rit */}
            <FormField
              control={form.control}
              name='rit'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Ritmo</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('rit', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* tir */}
            <FormField
              control={form.control}
              name='tir'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Tiro</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('tir', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* pas */}
            <FormField
              control={form.control}
              name='pas'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Pase</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('pas', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* reg */}
            <FormField
              control={form.control}
              name='reg'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Regate</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('reg', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* def */}
            <FormField
              control={form.control}
              name='def'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Defensa</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('def', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* fís */}
            <FormField
              control={form.control}
              name='fis'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Físico</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('fis', +e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Rating */}
            <FormField
              control={form.control}
              name='rating'
              render={({ field }) => (
                <FormItem className='rounded bg-white'>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                      value={field.value === null ? 0 : field.value}
                      onBlur={e => {
                        form.setValue('rating', +e.target.value)
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

export default PlayerForm
