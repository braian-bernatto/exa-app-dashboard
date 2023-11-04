'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Fases, TiposPartido } from '@/types'
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
import { Swords } from 'lucide-react'

import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const revalidate = 0

interface FaseFormProps {
  torneoId: string
  faseNro: number
  fases: Fases[]
  tiposPartido: TiposPartido[]
  getFases: () => void
  setFaseSelected: (value: any) => void
  setOpenFaseForm: (bool: boolean) => void
}

const FaseForm = ({
  torneoId,
  faseNro,
  fases,
  tiposPartido,
  getFases,
  setFaseSelected,
  setOpenFaseForm
}: FaseFormProps) => {
  const router = useRouter()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)

  const title = `Agregar Fase N° ${faseNro}`
  const toastMessage = 'Fase agregado'
  const action = 'Agregar'

  const formSchema = z.object({
    fase_id: z.coerce.number(),
    tipo_partido_id: z.coerce.number()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fase_id: undefined,
      tipo_partido_id: undefined
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { fase_id, tipo_partido_id } = values

    try {
      setLoading(true)

      if (!torneoId || !faseNro || !fase_id || !tipo_partido_id) {
        return toast.error('Faltan cargar datos')
      }

      // Fase
      const { error } = await supabase.from('torneo_fase').insert({
        torneo_id: torneoId,
        fase_nro: faseNro,
        fase_id,
        tipo_partido_id
      })

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo ${action}`)
      }

      router.refresh()
      getFases()
      setFaseSelected(undefined)
      setOpenFaseForm(false)
      toast.success(toastMessage)
      form.reset()
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 gap-5'>
          <div className='flex gap-2'>
            <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
              <Swords className='text-white' size={30} />
            </span>
            <h1 className='text-xl font-semibold flex items-center gap-2'>
              {title}
            </h1>
          </div>

          {/* fases */}
          <FormField
            control={form.control}
            name='fase_id'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel>Fase</FormLabel>
                <FormControl>
                  <RadioGroup
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

export default FaseForm
