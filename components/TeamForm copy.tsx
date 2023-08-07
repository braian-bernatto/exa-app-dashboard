'use client'
import React, { useState } from 'react'
import { Input } from './ui/input'
import PreviewImage from './PreviewImage'
import { Shield } from 'lucide-react'
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

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Obligatorio' }),
    logo: z
      .any()
      .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
      .refine(
        files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
        'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
      )
      .optional(),
    partidosJugados: z.coerce
      .number({ invalid_type_error: 'Ingrese un número' })
      .refine(n => n > -1, { message: 'No debe ser menor a cero' }),
    ganados: z.coerce
      .number({ invalid_type_error: 'Ingrese un número' })
      .refine(n => n > -1, { message: 'No debe ser menor a cero' }),
    empatados: z.coerce
      .number({ invalid_type_error: 'Ingrese un número' })
      .refine(n => n > -1, { message: 'No debe ser menor a cero' }),
    perdidos: z.coerce
      .number({ invalid_type_error: 'Ingrese un número' })
      .refine(n => n > -1, { message: 'No debe ser menor a cero' }),
    golesFavor: z.coerce
      .number({ invalid_type_error: 'Ingrese un número' })
      .refine(n => n > -1, { message: 'No debe ser menor a cero' }),
    golesContra: z.coerce
      .number({ invalid_type_error: 'Ingrese un número' })
      .refine(n => n > -1, { message: 'No debe ser menor a cero' })
  })
  .refine(
    val => {
      if (val.ganados <= val.partidosJugados) return true
    },
    {
      message: 'Partidos Ganados no puede ser mayor que los Partidos Jugados',
      path: ['ganados']
    }
  )
  .refine(
    val => {
      if (val.empatados <= val.partidosJugados) return true
    },
    {
      message: 'Partidos Empatados no puede ser mayor que los Partidos Jugados',
      path: ['empatados']
    }
  )
  .refine(
    val => {
      if (val.perdidos <= val.partidosJugados) return true
    },
    {
      message: 'Partidos Perdidos no puede ser mayor que los Partidos Jugados',
      path: ['perdidos']
    }
  )
  .refine(
    val => {
      if (val.ganados + val.perdidos + val.empatados === val.partidosJugados)
        return true
    },
    {
      message:
        'Partidos Jugados no coincide con la suma de Ganados + Empatados + Perdidos',
      path: ['partidosJugados']
    }
  )

const TeamForm = () => {
  const [image, setImage] = useState<any>('')
  const [diferencia, setDiferencia] = useState<number | undefined>(undefined)
  const [puntos, setPuntos] = useState<number | undefined>(undefined)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: undefined,
      partidosJugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      golesFavor: 0,
      golesContra: 0
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  function calculatePoints(values: z.infer<typeof formSchema>) {
    setDiferencia(values.golesFavor - values.golesContra)
    setPuntos(values.ganados * 3 + +values.empatados)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'
      >
        <div className='flex gap-2'>
          <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
            <Shield className='text-white' size={30} />
          </span>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            Agregar Equipo
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
        {/* Logo */}
        <FormField
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
        <div className='grid grid-cols-2 gap-2'>
          {/* partidosJugados */}
          <FormField
            control={form.control}
            name='partidosJugados'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Partidos Jugados</FormLabel>
                <FormControl>
                  <Input type='number' min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ganados */}
          <FormField
            control={form.control}
            name='ganados'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Ganados</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={e => {
                      field.onChange(e.target.value)
                      calculatePoints(form.getValues())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* empatados */}
          <FormField
            control={form.control}
            name='empatados'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Empatados</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={e => {
                      field.onChange(e.target.value)
                      calculatePoints(form.getValues())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* perdidos */}
          <FormField
            control={form.control}
            name='perdidos'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Perdidos</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={e => {
                      field.onChange(e.target.value)
                      calculatePoints(form.getValues())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* golesFavor */}
          <FormField
            control={form.control}
            name='golesFavor'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Goles a favor</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={e => {
                      field.onChange(e.target.value)
                      calculatePoints(form.getValues())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* golesContra */}
          <FormField
            control={form.control}
            name='golesContra'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Goles en contra</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={e => {
                      field.onChange(e.target.value)
                      calculatePoints(form.getValues())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='mt-2 flex flex-col border rounded overflow-hidden'>
            <label
              htmlFor='diferencia'
              className='bg-neutral-400 text-center text-white'
            >
              Diferencia
            </label>
            <Input
              type='number'
              className={`text-2xl font-semibold border-none text-center appearance-none ${
                diferencia! < 0 ? 'text-pink-800' : 'text-emerald-800'
              }`}
              id='diferencia'
              value={diferencia}
              disabled
            />
          </div>
          <div className='mt-2 flex flex-col border rounded overflow-hidden'>
            <label
              htmlFor='puntos'
              className='bg-neutral-400 text-center text-white'
            >
              Puntos
            </label>
            <Input
              type='number'
              className={`text-2xl font-semibold border-none text-center appearance-none`}
              id='puntos'
              value={puntos}
              disabled
            />
          </div>
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

export default TeamForm