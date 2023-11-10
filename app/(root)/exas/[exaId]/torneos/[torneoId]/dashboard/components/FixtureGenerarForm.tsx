'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Fases, Locations, Teams, TiposPartido } from '@/types'
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
import { useParams, useRouter } from 'next/navigation'
import { Check, ChevronsUpDownIcon, MapPin, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/AlertModal'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  generarFixtureEliminacion,
  generarFixtureTodosContraTodos
} from '@/utils/generateFixture'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { useStore } from '@/hooks/store'
import { shuffle } from '@/utils/shuffle'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import Team from './team'
import Llaves from './llaves'

export const revalidate = 0

interface FixtureGenerarFormProps {
  teams: Teams[]
  fases: Fases[] | []
  tiposPartido: TiposPartido[] | []
  locations: Locations[]
  setOpenFixtureGenerarForm: (bool: boolean) => void
}

const TeamsNumber = [4, 8, 16, 32, 64, 128]

const FixtureGenerarForm = ({
  teams,
  fases,
  tiposPartido,
  locations,
  setOpenFixtureGenerarForm
}: FixtureGenerarFormProps) => {
  const router = useRouter()
  const params = useParams()

  const faseName = fases.find(
    tipo => tipo.id === useStore.getState().fase
  )?.name
  const tipoPartidoName = tiposPartido.find(
    tipo => tipo.id === useStore.getState().tipoPartido
  )?.name

  const shufleResult = shuffle([...teams])
  const [shuffledTeams, setShuffledTeams] = useState(shufleResult)

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [faseId, setFaseId] = useState<number | undefined>(
    useStore.getState().fase
  )
  const [tipoPartidoId, setTipoPartidoId] = useState(
    useStore.getState().tipoPartido
  )
  const [faseNro, setFaseNro] = useState<number | null>()
  const [fixtures, setFixtures] = useState<any>()
  const [TeamsQuantity, setTeamsQuantity] = useState<number>()

  const title = 'Generar Fixture'
  const toastMessage = 'Fixture generado'
  const action = 'Guardar'

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Obligatorio' }),
    torneo_id: z.coerce.string({
      required_error: 'Obligatorio',
      invalid_type_error: 'Obligatorio'
    }),
    fase_id: z.coerce.number({
      required_error: 'Obligatorio',
      invalid_type_error: 'Obligatorio'
    }),
    tipo_partido_id: z.coerce.number({
      required_error: 'Obligatorio',
      invalid_type_error: 'Obligatorio'
    }),
    location_id: z.number().nullable().optional()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      torneo_id: undefined,
      fase_id: faseId,
      tipo_partido_id: tipoPartidoId,
      location_id: undefined
    }
  })

  async function generateTorneoFaseNro(torneoId: string) {
    const { data, count } = await supabase
      .from('torneo_fase')
      .select('*', { count: 'exact', head: true })
      .eq('torneo_id', torneoId)

    setFaseNro(count ? count + 1 : 1)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, torneo_id, fase_id, location_id, tipo_partido_id } = values

    try {
      setLoading(true)

      if (!name || !torneo_id || !faseNro) {
        return toast.error('Faltan cargar datos')
      }

      // fixture
      if (true) {
        const { error } = await supabase
          .from('fixtures')
          .update({
            name: name.toLowerCase(),
            location_id
          })
          .eq('id', params.fixtureId)

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }

        const { error: torneoFaseError } = await supabase
          .from('torneo_fase')
          .update({ tipo_partido_id })
          .eq('torneo_id', torneo_id)
          .eq('fase_id', fase_id)

        if (torneoFaseError) {
          console.log(torneoFaseError)
          setLoading(false)
          return toast.error(`No se pudo ${action} tipo partido`)
        }
      } else {
        const { error } = await supabase.from('fixtures').insert({
          name: name.toLowerCase(),
          torneo_id,
          fase_id,
          location_id
        })

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo ${action}`)
        }

        const { error: torneoFaseError } = await supabase
          .from('torneo_fase')
          .update({ tipo_partido_id })
          .eq('torneo_id', torneo_id)
          .eq('fase_id', fase_id)

        if (torneoFaseError) {
          console.log(torneoFaseError)
          setLoading(false)
          return toast.error(`No se pudo ${action} tipo partido`)
        }
      }

      router.refresh()
      router.push('/fixtures')
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
        .eq('id', params.fixtureId)

      if (error) {
        console.log(error)
        setLoading(false)
        return toast.error(`No se pudo borrar`)
      }
      router.refresh()
      router.push('/fixtures')
      toast.success('Borrado con éxito')
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleDrag = (event: any) => {
    const { active, over } = event
    const oldIndex = shuffledTeams.findIndex(team => team.id === active.id)
    const newIndex = shuffledTeams.findIndex(team => team.id === over.id)

    setShuffledTeams([...arrayMove(shuffledTeams, oldIndex, newIndex)])
  }

  useEffect(() => {
    if (faseName === 'eliminatorias') {
      setTeamsQuantity(TeamsNumber[0])
    }
  }, [])

  useEffect(() => {
    if (faseName && tipoPartidoName) {
      if (faseName === 'puntos') {
        const fixtures = generarFixtureTodosContraTodos(
          shuffledTeams.slice(0, TeamsQuantity),
          tipoPartidoName
        )
        setFixtures(fixtures)
      }

      if (faseName === 'eliminatorias') {
        const fixtures = generarFixtureEliminacion(
          shuffledTeams.slice(0, TeamsQuantity || TeamsNumber[0]),
          tipoPartidoName
        )
        setFixtures(fixtures)
      }
    }
  }, [shuffledTeams, TeamsQuantity])

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
          className='flex flex-wrap rounded py-3 px-4 gap-10 z-40 w-full'>
          {/* select */}
          <article className='w-full sm:w-[280px] flex flex-col gap-5 sm:border-r p-2 sm:pr-7'>
            <div className='flex gap-2 items-center'>
              <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
                <Swords className='text-white' size={30} />
              </span>
              <h1 className='text-xl font-semibold flex items-center gap-2'>
                {title}
              </h1>
            </div>

            <div className='w-full flex-wrap flex gap-5'>
              {/* fases */}
              <FormField
                control={form.control}
                name='fase_id'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel>Fase</FormLabel>
                    <FormControl>
                      <RadioGroup
                        disabled={true}
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
                        disabled={true}
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
            </div>

            {/* cantidad de equipos */}
            {faseName === 'eliminatorias' && (
              <FormItem className='space-y-3'>
                <FormLabel>Cantidad de Equipos</FormLabel>
                <FormControl>
                  <RadioGroup
                    defaultValue={`${TeamsNumber[0]}`}
                    className='flex flex-col space-y-1'>
                    {TeamsNumber.filter(number => number <= teams.length).map(
                      cantidad => (
                        <FormItem
                          key={cantidad}
                          className='flex items-center space-x-3 space-y-0'>
                          <FormControl>
                            <RadioGroupItem
                              onClick={() => {
                                setTeamsQuantity(cantidad)
                              }}
                              value={cantidad.toString()}
                            />
                          </FormControl>
                          <FormLabel className='font-normal'>{`${cantidad} Equipos`}</FormLabel>
                        </FormItem>
                      )
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}

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

            {/* teams */}
            {shuffledTeams.length > 0 && (
              <div className='flex flex-col gap-2'>
                <FormLabel>Equipos</FormLabel>
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDrag}>
                  <ol className='flex flex-col gap-2 p-2'>
                    <SortableContext
                      items={shuffledTeams}
                      strategy={verticalListSortingStrategy}>
                      {shuffledTeams.map((team, index) => (
                        <Team
                          key={team.id}
                          team={team}
                          pass={TeamsQuantity ? index >= TeamsQuantity : false}
                        />
                      ))}
                    </SortableContext>
                  </ol>
                </DndContext>
              </div>
            )}
          </article>

          {/* fixtures puntos */}
          {faseName === 'puntos' && fixtures && (
            <article className='flex-1 flex flex-wrap min-w-[280px] max-h-[800px] items-center justify-center overflow-y-auto sm:p-2 sm:pb-7'>
              {fixtures.ida.map((teams: any, index: number) => (
                <div
                  key={`ida-${index}`}
                  className='flex flex-col gap-2 justify-center border-b p-5 py-7 sm:py-10 w-[280px]'>
                  <h2 className='text-center font-semibold text-muted-foreground shadow-xl'>
                    Fecha {index + 1}
                  </h2>
                  {teams.map((team: any) => (
                    <div
                      key={`${team.local.id}-${team.visitante.id}`}
                      className='grid grid-cols-3 justify-center items-center shadow-lg rounded p-2'>
                      {/* local */}
                      {team.local.id ? (
                        <div className='flex flex-col items-center justify-center'>
                          <span className='w-10 h-10 relative'>
                            {team.local.image_url && (
                              <Image
                                src={team.local.image_url}
                                fill
                                className='object-contain'
                                alt='team logo'
                              />
                            )}
                          </span>
                          <h2 className='text-xs capitalize text-center text-muted-foreground'>
                            {team.local.name}
                          </h2>
                        </div>
                      ) : (
                        <p className='text-xs capitalize text-center text-muted-foreground'>
                          {team.local}
                        </p>
                      )}
                      <p className='px-2 shadow rounded text-center'>vs</p>
                      {/* visitante */}
                      {team.visitante.id ? (
                        <div className='flex flex-col items-center'>
                          <span className='w-10 h-10 relative'>
                            {team.visitante.image_url && (
                              <Image
                                src={team.visitante.image_url}
                                fill
                                className='object-contain'
                                alt='team logo'
                              />
                            )}
                          </span>
                          <h2 className='text-xs capitalize text-center text-muted-foreground'>
                            {team.visitante.name}
                          </h2>
                        </div>
                      ) : (
                        <p className='text-xs capitalize text-center text-muted-foreground'>
                          {team.visitante}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* vuelta */}
              {fixtures.vuelta &&
                fixtures.vuelta.map((teams: any, index: number) => (
                  <div
                    key={`vuelta-${index}`}
                    className='flex flex-col gap-2 justify-center border-b p-5 py-7 sm:py-10 w-[280px] relative'>
                    <h2 className='text-center font-semibold text-muted-foreground shadow-xl relative'>
                      Fecha {fixtures.vuelta.length + index + 1}
                      <span className='rounded shadow px-2 absolute top-0 right-0 text-xs border border-emerald-600 animate animate-pulse'>
                        vuelta
                      </span>
                    </h2>
                    {teams.map((team: any) => (
                      <div
                        key={`${team.local.id}-${team.visitante.id}`}
                        className='grid grid-cols-3 justify-center items-center shadow-lg rounded p-2'>
                        {/* local */}
                        {team.local.id ? (
                          <div className='flex flex-col items-center justify-center'>
                            <span className='w-10 h-10 relative'>
                              {team.local.image_url && (
                                <Image
                                  src={team.local.image_url}
                                  fill
                                  className='object-contain'
                                  alt='team logo'
                                />
                              )}
                            </span>
                            <h2 className='text-xs capitalize text-center text-muted-foreground'>
                              {team.local.name}
                            </h2>
                          </div>
                        ) : (
                          <p className='text-xs capitalize text-center text-muted-foreground'>
                            {team.local}
                          </p>
                        )}
                        <p className='px-2 shadow rounded text-center'>vs</p>
                        {/* visitante */}
                        {team.visitante.id ? (
                          <div className='flex flex-col items-center'>
                            <span className='w-10 h-10 relative'>
                              {team.visitante.image_url && (
                                <Image
                                  src={team.visitante.image_url}
                                  fill
                                  className='object-contain'
                                  alt='team logo'
                                />
                              )}
                            </span>
                            <h2 className='text-xs capitalize text-center text-muted-foreground'>
                              {team.visitante.name}
                            </h2>
                          </div>
                        ) : (
                          <p className='text-xs capitalize text-center text-muted-foreground'>
                            {team.visitante}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </article>
          )}

          {/* fixtures eliminatorias */}
          {faseName === 'eliminatorias' && fixtures && (
            <article className='flex-1 flex flex-wrap min-w-[280px] max-h-[800px] items-center justify-center overflow-y-auto sm:p-2 sm:pb-10'>
              {/* llaves */}
              <Llaves
                teams={[
                  ...shuffledTeams.slice(0, TeamsQuantity),
                  ...shuffledTeams.slice(0, TeamsQuantity).reverse()
                ]}
              />
            </article>
          )}

          {/* boton */}
          <div className='sm:col-span-2 w-full flex justify-center gap-5'>
            <Button
              type='button'
              variant={'ghost'}
              disabled={loading}
              className='flex-1'
              onClick={() => {
                setOpenFixtureGenerarForm(false)
              }}>
              Cancelar
            </Button>
            <Button
              type='submit'
              variant={'default'}
              className='flex-1'
              disabled={loading}>
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default FixtureGenerarForm
