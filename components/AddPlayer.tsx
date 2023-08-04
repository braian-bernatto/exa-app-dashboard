'use client'
import React, { useState } from 'react'
import { Input } from './ui/input'
import PreviewImage from './PreviewImage'
import { Shield } from 'lucide-react'
import { Separator } from './ui/separator'
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

const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const formSchema = z.object({
  name: z.string().min(2),
  image: z
    .any()
    .refine(files => files?.size <= MAX_FILE_SIZE, `Límite de tamaño es 5MB.`)
    .refine(
      files => ACCEPTED_IMAGE_TYPES.includes(files?.type),
      'Sólo se aceptan los formatos .jpg .jpeg .png .webp'
    ),
  country: z.string(),
  position: z.string(),
  team: z.number(),
  foot: z.string(),
  attributes: z.object({
    rit: z.number(),
    tir: z.number(),
    pas: z.number(),
    reg: z.number(),
    def: z.number(),
    fís: z.number()
  }),
  statistics: z.object({
    goals: z.number(),
    yellowCards: z.number(),
    redCards: z.number()
  })
})

const AddPlayer = () => {
  const [image, setImage] = useState<any>('')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      image: undefined
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid w-full max-w-xs items-center gap-2 rounded bg-white py-3 px-4 shadow'
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
            <FormItem className='rounded bg-white py-3 space-y-2'>
              <FormLabel>Nombre</FormLabel>
              <FormControl className='flex flex-col items-center gap-2'>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        {/* image */}
        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem className='rounded bg-white py-3 space-y-2'>
              <FormLabel>image</FormLabel>
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
        <div className='my-4 w-full'>
          <Button type='submit' variant={'default'} className='w-full'>
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AddPlayer
