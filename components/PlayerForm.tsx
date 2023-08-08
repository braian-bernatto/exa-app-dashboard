'use client'
import React, { useState } from 'react'
import { Input } from './ui/input'
import PreviewImage from './PreviewImage'
import { Shield, UserPlus } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import uniqid from 'uniqid'
import { Separator } from '@/components/ui/separator'
import { Countries, Foot, Positions, Teams } from '@/types'

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
  team_id: z.coerce.number({ invalid_type_error: 'Ingrese un número' }),
  image: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .optional(),
  country_iso2: z.string().optional(),
  position_id: z.string().optional(),
  rating: z.coerce.number().optional(),
  foot_id: z.coerce.number().optional(),
  attributes: z.object({
    rit: z.coerce.number().optional(),
    tir: z.coerce.number().optional(),
    pas: z.coerce.number().optional(),
    reg: z.coerce.number().optional(),
    def: z.coerce.number().optional(),
    fis: z.coerce.number().optional()
  })
})

interface PlayerFormlProps {
  teams: Teams[]
  positions: Positions[]
  countries: Countries[]
  foot: Foot[]
}

const PlayerForm = ({
  teams,
  positions,
  countries,
  foot
}: PlayerFormlProps) => {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState<boolean>(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      team_id: undefined,
      image: undefined,
      country_iso2: undefined,
      position_id: undefined,
      foot_id: undefined,
      rating: 0,
      attributes: {
        rit: 0,
        tir: 0,
        pas: 0,
        reg: 0,
        def: 0,
        fis: 0
      }
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const {
      name,
      team_id,
      image,
      country_iso2,
      position_id,
      rating,
      foot_id,
      attributes
    } = values
    try {
      setLoading(true)
      if (!name || !team_id || !position_id) {
        return toast.error('Faltan cargar datos')
      }

      // upload image
      const uniqueID = uniqid()
      let imagePath = ''
      if (image) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('players')
          .upload(`image-${name}-${uniqueID}`, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (imageError) {
          setLoading(false)
          return toast.error('No se pudo agregar la imagen')
        }

        imagePath = imageData?.path!
      }

      // upload player
      const { error: supabaseError } = await supabase.from('players').insert({
        name,
        team_id,
        image_url: imagePath,
        country_iso2,
        position_id,
        rating,
        foot_id,
        rit: attributes.rit,
        tir: attributes.tir,
        pas: attributes.pas,
        reg: attributes.reg,
        def: attributes.def,
        fis: attributes.fis
      })

      if (supabaseError) {
        setLoading(false)
        console.log(supabaseError)

        return toast.error('No se pudo agregar el equipo')
      }

      router.refresh()
      setLoading(false)
      form.reset()
      toast.success('Jugador agregado con éxito')
    } catch (error) {
      console.log(error)
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
            <UserPlus className='text-white' size={30} />
          </span>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            Agregar Jugador
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
                            form.setValue('team_id', team.id)
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
        {/* Image */}
        <FormField
          control={form.control}
          name='image'
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
                  <PreviewImage file={field.value} />
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
                      )}
                    >
                      {field.value
                        ? positions.find(
                            position => position.id === field.value
                          )?.description
                        : 'Elige una posición'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='max-w-[300px] p-0 max-h-[500px] overflow-y-auto'>
                  <Command>
                    <CommandInput placeholder='Buscador de posiciones...' />
                    <CommandEmpty>No hay coincidencias.</CommandEmpty>
                    <CommandGroup>
                      {positions.map(position => (
                        <CommandItem
                          value={position.description!}
                          key={position.id}
                          onSelect={() => {
                            form.setValue('position_id', position.id)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              position.id === field.value
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {position.description}
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
                      )}
                    >
                      {field.value
                        ? countries.find(
                            country => country.iso2 === field.value
                          )?.name
                        : 'Elige un país'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='max-w-[300px] p-0 max-h-[500px] overflow-y-auto'>
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
                          }}
                        >
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
                              src={`https://flagcdn.com/w20/${country.iso2.toLowerCase()}.png`}
                              width={20}
                              height={20}
                              alt='team logo'
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
                  className='flex flex-col space-y-1'
                >
                  {foot.map(f => (
                    <FormItem
                      className='flex items-center space-x-3 space-y-0'
                      key={f.id}
                    >
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
            name='attributes.rit'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Ritmo</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* tir */}
          <FormField
            control={form.control}
            name='attributes.tir'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Tiro</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* pas */}
          <FormField
            control={form.control}
            name='attributes.pas'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Pase</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* reg */}
          <FormField
            control={form.control}
            name='attributes.reg'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Regate</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* def */}
          <FormField
            control={form.control}
            name='attributes.def'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Defensa</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* fís */}
          <FormField
            control={form.control}
            name='attributes.fis'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Físico</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
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
                  <Input type='number' min={0} {...field} />
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
            disabled={loading}
          >
            Agregar
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PlayerForm
