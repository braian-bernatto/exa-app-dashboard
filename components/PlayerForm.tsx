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

import { Separator } from '@/components/ui/separator'
import { Countries, Positions, Teams } from '@/types'

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

const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(1, { message: 'Obligatorio' }),
  team: z.coerce.number({ invalid_type_error: 'Ingrese un número' }),
  image: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    )
    .optional(),
  country: z.string().optional(),
  position: z.string().optional(),
  rating: z.coerce.number().optional(),
  foot: z.string().optional(),
  attributes: z.object({
    rit: z.coerce.number().optional(),
    tir: z.coerce.number().optional(),
    pas: z.coerce.number().optional(),
    reg: z.coerce.number().optional(),
    def: z.coerce.number().optional(),
    fís: z.coerce.number().optional()
  }),
  statistics: z.object({
    goals: z.coerce.number({ required_error: 'Obligatorio' }),
    yellowCards: z.coerce.number({ required_error: 'Obligatorio' }),
    redCards: z.coerce.number({ required_error: 'Obligatorio' })
  })
})

interface PlayerFormlProps {
  teams: Teams[]
  positions: Positions[]
  countries: Countries[]
}

const PlayerForm = ({ teams, positions, countries }: PlayerFormlProps) => {
  const [image, setImage] = useState<any>('')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      team: undefined,
      image: undefined,
      country: undefined,
      position: undefined,
      rating: undefined,
      foot: undefined,
      attributes: {
        rit: undefined,
        tir: undefined,
        pas: undefined,
        reg: undefined,
        def: undefined,
        fís: undefined
      },
      statistics: {
        goals: 0,
        yellowCards: 0,
        redCards: 0
      }
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
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
          name='team'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Equipo</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[200px] justify-between',
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
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Buscador de equipos...' />
                    <CommandEmpty>No hay coincidencias.</CommandEmpty>
                    <CommandGroup>
                      {teams.map(team => (
                        <CommandItem
                          value={team.name!}
                          key={team.id}
                          onSelect={() => {
                            form.setValue('team', team.id)
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
                    value={image}
                    onChange={e => {
                      setImage(e.target.value)
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
          name='position'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Posición</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[200px] justify-between',
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
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Buscador de posiciones...' />
                    <CommandEmpty>No hay coincidencias.</CommandEmpty>
                    <CommandGroup>
                      {positions.map(position => (
                        <CommandItem
                          value={position.description!}
                          key={position.id}
                          onSelect={() => {
                            form.setValue('position', position.id)
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
          name='country'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Nacionalidad</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[200px] justify-between',
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
                <PopoverContent className='w-[200px] p-0 max-h-[500px] overflow-y-auto relative'>
                  <Command>
                    <CommandInput placeholder='Buscador de paises...' />
                    <CommandEmpty>No hay coincidencias.</CommandEmpty>
                    <CommandGroup>
                      {countries.map(country => (
                        <CommandItem
                          value={country.name!}
                          key={country.id}
                          onSelect={() => {
                            form.setValue('country', country.iso2)
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
          name='foot'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>Pie</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex flex-col space-y-1'
                >
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='derecho' />
                    </FormControl>
                    <FormLabel className='font-normal capitalize'>
                      derecho
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='izquierdo' />
                    </FormControl>
                    <FormLabel className='font-normal capitalize'>
                      izquierdo
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-3 space-y-0'>
                    <FormControl>
                      <RadioGroupItem value='ambidiestro' />
                    </FormControl>
                    <FormLabel className='font-normal capitalize'>
                      ambidiestro
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Statistics */}
        <div className='grid grid-cols-2 gap-2'>
          <div className='col-span-2 flex justify-center items-center gap-2 overflow-hidden text-xs text-neutral-400'>
            <Separator />
            Estadísticas
            <Separator />
          </div>
          {/* goals */}
          <FormField
            control={form.control}
            name='statistics.goals'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Goles</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* yellowCards */}
          <FormField
            control={form.control}
            name='statistics.yellowCards'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Tarjetas Amarillas</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* redCards */}
          <FormField
            control={form.control}
            name='statistics.redCards'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Tarjetas Rojas</FormLabel>
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
            name='attributes.fís'
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
        </div>
        <div className='w-full'>
          <Button type='submit' variant={'default'} className='w-full'>
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PlayerForm
