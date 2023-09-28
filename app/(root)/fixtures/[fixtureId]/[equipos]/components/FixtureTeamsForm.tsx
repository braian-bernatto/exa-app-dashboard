'use client'

import { useSupabase } from '@/providers/SupabaseProvider'
import { FixtureTeams, GetFixturesPlayers, Players, Teams } from '@/types'
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
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  MinusCircle,
  PlusCircle,
  Shield,
  Swords,
  Trash
} from 'lucide-react'
import { Input } from '../../../../../../components/ui/input'
import { Button } from '../../../../../../components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../../../../components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '../../../../../../components/ui/calendar'
import { format, set, subDays } from 'date-fns'
import { es } from 'date-fns/esm/locale'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '../../../../../../components/ui/command'
import Image from 'next/image'
import { DataTable } from './DataTable'
import { Columns } from '@/app/(root)/fixtures/[fixtureId]/[equipos]/components/Columns'
import { Separator } from '../../../../../../components/ui/separator'
import { Toggle } from '../../../../../../components/ui/toggle'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/AlertModal'
import Spinner from '@/components/Spinner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface FixtureTeamsFormProps {
  initialData:
    | ({ fixturePlayers: GetFixturesPlayers } & FixtureTeams)
    | undefined
  teams: Teams[]
  players: Players[]
}

const FixtureTeamsForm = ({
  initialData,
  teams,
  players
}: FixtureTeamsFormProps) => {
  const router = useRouter()
  const params = useParams()

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [toggleLocal, setToggleLocal] = useState(false)
  const [toggleVisit, setToggleVisit] = useState(false)

  const [teamIdsInFixture, setTeamIdsInFixture] = useState<number[]>([])

  const [hour, setHour] = useState('')
  const [allowPreviousDates, setAllowPreviousDates] = useState(false)
  const [goalsLocal, setGoalsLocal] = useState(0)
  const [goalsVisit, setGoalsVisit] = useState(0)
  const [playersTeamLocal, setPlayersTeamLocal] = useState<
    GetFixturesPlayers | Players[] | undefined
  >(undefined)
  const [playersTeamVisit, setPlayersTeamVisit] = useState<
    GetFixturesPlayers | Players[] | undefined
  >(undefined)
  const [filteredPlayersTeamLocal, setFilteredPlayersTeamLocal] = useState<
    GetFixturesPlayers | Players[] | []
  >([])
  const [filteredPlayersTeamVisit, setFilteredPlayersTeamVisit] = useState<
    GetFixturesPlayers | Players[] | []
  >([])
  const [modifiedRows, setModifiedRows] = useState<any[]>([])

  const title = initialData ? 'Editar Versus' : 'Agregar Versus'
  const toastMessage = initialData ? 'Versus modificado' : 'Versus agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  if (initialData) {
    initialData = {
      ...initialData,
      date: new Date(initialData.date)
    }
  }

  const formSchema = z
    .object({
      fixture_id: z.coerce.string({
        required_error: 'Obligatorio',
        invalid_type_error: 'Obligatorio'
      }),
      team_local: z.coerce.number({
        required_error: 'Obligatorio',
        invalid_type_error: 'Obligatorio'
      }),
      team_visit: z.coerce.number({
        required_error: 'Obligatorio',
        invalid_type_error: 'Obligatorio'
      }),
      date: z.date({ required_error: 'Obligatorio' }),
      cancha_nro: z.coerce.number().optional(),
      goals_local: z.coerce.number().optional(),
      goals_visit: z.coerce.number().optional(),
      walkover_local: z.boolean(),
      walkover_visit: z.boolean(),
      walkover_local_goals: z.coerce.number().optional().nullable(),
      walkover_visit_goals: z.coerce.number().optional().nullable()
    })
    .refine(
      val => {
        if (val.team_local !== val.team_visit) return true
      },
      {
        message: 'No pueden ser el mismo equipo',
        path: ['team_visit']
      }
    )
    .refine(
      async val => {
        if (initialData) return true
        const { data } = await supabase
          .from('fixture_details')
          .select('*', { count: 'exact' })
          .eq('fixture_id', val.fixture_id)
          .or(`team_local.eq.${val.team_local},team_visit.eq.${val.team_local}`)

        if (data?.length) {
          return false
        }
        return true
      },
      {
        message: 'Equipo ya existe en este Fixture',
        path: ['team_local']
      }
    )
    .refine(
      async val => {
        if (initialData) return true
        const { data } = await supabase
          .from('fixture_details')
          .select('*', { count: 'exact' })
          .eq('fixture_id', val.fixture_id)
          .or(`team_local.eq.${val.team_visit},team_visit.eq.${val.team_visit}`)

        if (data?.length) {
          return false
        }
        return true
      },
      {
        message: 'Equipo ya existe en este Fixture',
        path: ['team_visit']
      }
    )
    .refine(
      val => {
        // if none of the teams are in walkover omit this refine
        if (!val.walkover_local && !val.walkover_visit) return true

        // if there is walkover there must be goals to the other team
        if (val.walkover_local && !val.walkover_visit_goals) return false
        if (val.walkover_visit && !val.walkover_local_goals) return false

        if (
          val.walkover_local &&
          val.walkover_visit_goals &&
          val.walkover_visit_goals > 0
        )
          return true
        if (
          val.walkover_visit &&
          val.walkover_local_goals &&
          val.walkover_local_goals > 0
        )
          return true
      },
      {
        message: 'Goles por walkover deben ser mayores que cero',
        path: ['walkover_local']
      }
    )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      fixture_id: params.fixtureId,
      team_local: undefined,
      team_visit: undefined,
      date: undefined,
      cancha_nro: 0,
      goals_local: 0,
      goals_visit: 0,
      walkover_local: false,
      walkover_visit: false,
      walkover_local_goals: undefined,
      walkover_local_visit: undefined
    }
  })

  const getTeamLogo = (
    filteredPlayers?: Players[] | GetFixturesPlayers,
    teamNumber?: number
  ) => {
    if (filteredPlayers && filteredPlayers.length > 0) {
      const url = teams.filter(
        team => team.id === filteredPlayers[0].team_id
      )[0].image_url

      if (url) {
        return <Image src={url} width={50} height={50} alt='team logo' />
      }
    }
    return (
      <div className='flex items-center justify-center relative'>
        <Shield strokeWidth={1} size={50} className='bg-white' />
        <h2 className='text-md font-semibold absolute text-emerald-700'>
          {teamNumber}
        </h2>
      </div>
    )
  }

  const getTeamIdsFixture = async () => {
    // disabled all the used teams
    const { data } = await supabase.rpc('get_team_ids_fixture', {
      fixture: `${params.fixtureId}`
    })
    if (data?.length) {
      setTeamIdsInFixture(data)
      return
    }
    setTeamIdsInFixture([])
  }

  const getResetedPlayersDetails = (id: number) => {
    const filtered = players
      .filter(player => player.team_id === id)
      .map(players => ({
        ...players,
        goals: 0,
        yellow_cards: 0,
        red_card: false,
        red_card_motive: '',
        is_present: true,
        is_local:
          players.team_id === form.getValues('team_local') ? true : false
      }))

    return filtered
  }

  const setPlayers = async () => {
    if (initialData) {
      setLoading(true)
      const players_1 = initialData.fixturePlayers.length
        ? initialData.fixturePlayers.filter(
            player => player.team_id === player.team_local
          )
        : getResetedPlayersDetails(initialData?.team_local)

      const players_2 = initialData.fixturePlayers.length
        ? initialData.fixturePlayers.filter(
            player => player.team_id === player.team_visit
          )
        : getResetedPlayersDetails(initialData?.team_visit)

      setPlayersTeamLocal(players_1)
      setPlayersTeamVisit(players_2)
      setFilteredPlayersTeamLocal(players_1)
      setFilteredPlayersTeamVisit(players_2)
      setModifiedRows([...players_1, ...players_2])
      setLoading(false)
    }
  }

  const setTeamWalkover = async () => {
    if (initialData) {
      setToggleLocal(initialData.walkover_local)
      setToggleVisit(initialData.walkover_visit)
      if (initialData.walkover_local || initialData.walkover_visit) {
        setFilteredPlayersTeamLocal([])
        setFilteredPlayersTeamVisit([])
      }
    }
  }

  const countGoals = () => {
    const sumLocalGoals = modifiedRows.reduce((acc, curr) => {
      if (curr.team_id === form.getValues('team_local')) {
        acc = acc + curr.goals
      }
      return acc
    }, 0)
    setGoalsLocal(sumLocalGoals)

    const sumVisitGoals = modifiedRows.reduce((acc, curr) => {
      if (curr.team_id === form.getValues('team_visit')) {
        acc = acc + curr.goals
      }
      return acc
    }, 0)
    setGoalsVisit(sumVisitGoals)
  }

  const addModifiedRows = (data: any) => {
    // this is the function that we pass to the players table
    let exists = false

    const newData = modifiedRows?.map(item => {
      if (item.id === data.id) {
        exists = true
        return {
          ...data
        }
      }
      return item
    })

    if (exists) {
      setModifiedRows(newData)
    } else {
      setModifiedRows([...newData, data])
    }
  }

  const filterModifiedRows = (id: number) => {
    // keep the players list of the team that doesn't change
    const filteredData = modifiedRows.filter(team => team.team_id !== id)
    setModifiedRows(filteredData)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      let {
        fixture_id,
        team_local,
        team_visit,
        date,
        cancha_nro,
        walkover_local,
        walkover_visit,
        walkover_local_goals,
        walkover_visit_goals
      } = values

      if (!fixture_id || !team_local || !team_visit || !date) {
        return toast.error('Faltan cargar datos')
      }

      // clear walkover goals if not selected
      if (!walkover_local) {
        walkover_visit_goals = null
      }

      if (!walkover_visit) {
        walkover_local_goals = null
      }

      const formattedPlayers = modifiedRows.map(player => ({
        fixture_id,
        team_local,
        team_visit,
        team_id: player.team_id,
        player_id: player.id,
        is_local: player.is_local,
        is_present: player.is_present,
        goals: player.goals,
        yellow_cards: player.yellow_cards,
        red_card: player.red_card,
        red_card_motive: player.red_card_motive
      }))

      if (initialData) {
        // fixture details
        const { error: supabaseFixtureTeamsError } = await supabase
          .from('fixture_teams')
          .update({
            cancha_nro,
            date: date.toISOString(),
            walkover_local,
            walkover_visit,
            walkover_local_goals,
            walkover_visit_goals
          })
          .eq('fixture_id', fixture_id)
          .eq('team_local', team_local)
          .eq('team_visit', team_visit)

        if (supabaseFixtureTeamsError) {
          setLoading(false)
          console.log(supabaseFixtureTeamsError)
          return toast.error('No se pudo grabar Fixture Detalle')
        }

        // fixture players
        if (walkover_local || walkover_visit) {
          // if (initialData.fixturePlayers.length){
          const { error } = await supabase.rpc('delete_fixture_players', {
            fixture: fixture_id,
            local: team_local,
            visit: team_visit
          })

          if (error) {
            setLoading(false)
            console.log(error)
            return toast.error('No se pudo borrar Fixture Jugadores')
          }
          // }
        } else {
          const { error: supabaseFixturePlayersError } = await supabase
            .from('fixture_players')
            .upsert(formattedPlayers)
            .eq('fixture_id', fixture_id)
            .eq('team_local', team_local)
            .eq('team_visit', team_visit)

          if (supabaseFixturePlayersError) {
            setLoading(false)
            console.log(supabaseFixturePlayersError)
            return toast.error('No se pudo grabar Fixture Jugadores')
          }
        }
      } else {
        // fixture teams
        const { error: supabaseFixtureTeamsError } = await supabase
          .from('fixture_teams')
          .insert({
            fixture_id,
            team_local,
            team_visit,
            cancha_nro,
            walkover_local,
            walkover_visit,
            walkover_local_goals,
            walkover_visit_goals,
            date: date.toISOString()
          })

        if (supabaseFixtureTeamsError) {
          setLoading(false)
          console.log(supabaseFixtureTeamsError)
          return toast.error('No se pudo grabar Fixture Equipo')
        }

        // fixture players
        const { error: supabaseFixturePlayersError } = await supabase
          .from('fixture_players')
          .insert(formattedPlayers)

        if (supabaseFixturePlayersError) {
          setLoading(false)
          console.log(supabaseFixturePlayersError)
          return toast.error('No se pudo grabar Fixture Jugadores')
        }
      }

      setLoading(false)

      router.back()
      router.refresh()
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (initialData) {
      try {
        setLoading(true)

        const { error } = await supabase.rpc('delete_versus', {
          fixture: initialData.fixture_id,
          local: initialData.team_local,
          visit: initialData.team_visit
        })

        if (error) {
          console.log(error)
          setLoading(false)
          return toast.error(`No se pudo borrar`)
        }
        router.refresh()
        router.back()
        toast.success('Borrado con éxito')
      } catch (error) {
        toast.error('Hubo un error')
      } finally {
        setLoading(false)
        setOpen(false)
      }
    }
  }

  useEffect(() => {
    if (initialData) {
      setPlayers()
      if (initialData.date) {
        setHour(format(new Date(initialData.date), 'HH:mm'))
        setTeamWalkover()
      }
    } else {
      getTeamIdsFixture()
    }
  }, [])

  useEffect(() => {
    countGoals()
  }, [modifiedRows])

  useEffect(() => {
    setModifiedRows([...filteredPlayersTeamLocal, ...filteredPlayersTeamVisit])
  }, [filteredPlayersTeamLocal, filteredPlayersTeamVisit])

  return (
    <>
      {loading && <Spinner />}
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col w-full max-w-xs sm:max-w-[800px] rounded bg-white py-3 px-4 shadow gap-5 justify-center'>
          <div className='flex items-center gap-2'>
            <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
              <Swords
                className='text-white'
                size={30}
                onClick={() => {
                  console.log(form.getValues())
                  console.log({
                    initialData,
                    playersTeamLocal,
                    playersTeamVisit,
                    filteredPlayersTeamLocal,
                    filteredPlayersTeamVisit,
                    modifiedRows,
                    goalsLocal,
                    goalsVisit
                  })
                }}
              />
            </span>
            <h1 className='text-xl font-semibold flex items-center justify-between w-full gap-2'>
              {title}
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
            </h1>
          </div>

          <div className='grid grid-cols-2 gap-1 overflow-hidden'>
            {/* team local */}
            <FormField
              control={form.control}
              name='team_local'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={initialData ? true : false}
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'uppercase w-full justify-between text-xs',
                            !field.value && 'text-muted-foreground'
                          )}>
                          {field.value
                            ? teams.find(team => team.id === field.value)?.name
                            : 'Elige un equipo'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='max-w-[200px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto text-xs'>
                      <Command>
                        <CommandInput
                          className='text-xs'
                          placeholder='Buscador de equipos...'
                        />
                        <CommandEmpty>No hay coincidencias.</CommandEmpty>
                        <CommandGroup>
                          {teams.map(team => (
                            <CommandItem
                              className={`text-xs uppercase ${
                                form.getValues('team_visit') === team.id ||
                                teamIdsInFixture.includes(team.id)
                                  ? 'opacity-50 bg-slate-50'
                                  : ''
                              }`}
                              disabled={
                                form.getValues('team_visit') === team.id ||
                                teamIdsInFixture.includes(team.id)
                              }
                              value={team.name!}
                              key={team.id}
                              onSelect={() => {
                                filterModifiedRows(form.getValues('team_local'))

                                form.setValue('team_local', team.id)

                                const filtered = getResetedPlayersDetails(
                                  team.id
                                )
                                setPlayersTeamLocal(filtered)
                                setFilteredPlayersTeamLocal(filtered)
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
            {/* team visit */}
            <FormField
              control={form.control}
              name='team_visit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visitante</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={initialData ? true : false}
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'uppercase w-full justify-between text-xs',
                            !field.value && 'text-muted-foreground'
                          )}>
                          {field.value
                            ? teams.find(team => team.id === field.value)?.name
                            : 'Elige un equipo'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='max-w-[200px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                      <Command>
                        <CommandInput
                          className='text-xs'
                          placeholder='Buscador de equipos...'
                        />
                        <CommandEmpty>No hay coincidencias.</CommandEmpty>
                        <CommandGroup>
                          {teams.map(team => (
                            <CommandItem
                              className={`uppercase tex t-xs ${
                                form.getValues('team_local') === team.id ||
                                teamIdsInFixture.includes(team.id)
                                  ? 'opacity-50 bg-slate-50'
                                  : ''
                              }`}
                              disabled={
                                form.getValues('team_local') === team.id ||
                                teamIdsInFixture.includes(team.id)
                              }
                              value={team.name!}
                              key={team.id}
                              onSelect={() => {
                                filterModifiedRows(form.getValues('team_visit'))

                                form.setValue('team_visit', team.id)

                                const filtered = getResetedPlayersDetails(
                                  team.id
                                )
                                setPlayersTeamVisit(filtered)
                                setFilteredPlayersTeamVisit(filtered)
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
          </div>

          {/* date - time - cancha */}
          <div className='grid sm:grid-cols-2 w-full gap-4 items-center'>
            <div className='flex gap-4'>
              {/* Date */}
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y Hora</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}>
                            {field.value ? (
                              format(field.value, 'PP | HH:mm', {
                                locale: es
                              })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={e => {
                            if (e) {
                              field.onChange(
                                set(e, {
                                  hours: hour.length ? +hour.split(':')[0] : 0,
                                  minutes: hour.length ? +hour.split(':')[1] : 0
                                })
                              )
                            }
                          }}
                          disabled={
                            allowPreviousDates
                              ? undefined
                              : date => date < subDays(new Date(), 1)
                          }
                          initialFocus
                          locale={es}
                        />
                        <div className='flex justify-center items-center pb-4 px-20'>
                          <Input
                            className='shadow-md text-xl font-semibold'
                            type='time'
                            defaultValue={
                              field.value
                                ? format(field.value, 'HH:mm')
                                : undefined
                            }
                            onChange={e => {
                              if (e.target.value) {
                                setHour(e.target.value) // keeps the time when date changes
                                field.onChange(
                                  set(field.value ? field.value : new Date(), {
                                    hours: +e.target.value.split(':')[0],
                                    minutes: +e.target.value.split(':')[1]
                                  })
                                )
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Cancha nro */}
              <FormField
                control={form.control}
                name='cancha_nro'
                render={({ field }) => (
                  <FormItem className='rounded bg-white shrink-0'>
                    <FormLabel>Cancha N°</FormLabel>
                    <FormControl>
                      <span className='relative flex items-center justify-center mr-5'>
                        <button
                          disabled={field.value === 0}
                          type='button'
                          {...field}
                          onClick={() => {
                            if (field.value) {
                              form.setValue(
                                'cancha_nro',
                                field.value > 0 ? +field.value - 1 : 0
                              )
                            }
                          }}>
                          <MinusCircle className='text-muted-foreground' />
                        </button>
                        <Input
                          className={`font-semibold text-center w-[50px] ${
                            field.value !== undefined && field.value > 0
                              ? ''
                              : 'text-muted-foreground'
                          }`}
                          type='number'
                          min={1}
                          {...field}
                          onClick={e => e.currentTarget.select()}
                        />
                        <button
                          type='button'
                          {...field}
                          onClick={() => {
                            form.setValue('cancha_nro', +field.value! + 1)
                          }}>
                          <PlusCircle className='text-muted-foreground' />
                        </button>
                      </span>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Switch Calendar */}
            <div className='flex items-center justify-center space-x-2'>
              <Switch
                id='enable-all-dates'
                checked={allowPreviousDates}
                onCheckedChange={() =>
                  setAllowPreviousDates(!allowPreviousDates)
                }
              />
              <Label htmlFor='enable-all-dates'>
                Habilitar Fechas Anteriores
              </Label>
            </div>
          </div>

          {/* players team local table */}
          <div className='w-full relative overflow-hidden'>
            {playersTeamLocal && (
              <>
                <div
                  className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}>
                  {playersTeamLocal?.length > 0 ? (
                    <>
                      <Separator />
                      <span
                        className={`flex flex-col items-center relative ${
                          filteredPlayersTeamLocal.length > 0 && 'top-5'
                        }`}>
                        <Toggle
                          variant={'outline'}
                          size={'sm'}
                          pressed={toggleLocal}
                          className={`left-0 top-0 h-5 text-muted-foreground ${
                            toggleLocal && 'border border-pink-400'
                          }`}
                          onPressedChange={e => {
                            setToggleLocal(e)
                            form.setValue('walkover_local', e)

                            if (e) {
                              setFilteredPlayersTeamLocal([])
                              setFilteredPlayersTeamVisit([])
                            } else {
                              if (toggleVisit) return // si el otro equipo esta en walkover no mostramos nada
                              setFilteredPlayersTeamLocal(playersTeamLocal)
                              if (playersTeamVisit?.length) {
                                setFilteredPlayersTeamVisit(playersTeamVisit)
                              }
                            }
                          }}>
                          Walkover
                        </Toggle>
                        {getTeamLogo(playersTeamLocal, 1)}
                      </span>
                      <Separator />
                    </>
                  ) : (
                    <p className='bg-pink-600 px-2 py-1 text-white rounded relative top-3 animate-pulse'>
                      Equipo aún no tiene jugadores cargados
                    </p>
                  )}
                </div>
                {filteredPlayersTeamLocal.length > 0 && (
                  <DataTable
                    columns={Columns}
                    intialValues={filteredPlayersTeamLocal || []}
                    addModifiedRows={addModifiedRows}
                  />
                )}
              </>
            )}
          </div>
          {/* players team visit table */}
          <div className='w-full relative overflow-hidden'>
            {playersTeamVisit && (
              <>
                <div
                  className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}>
                  {playersTeamVisit?.length > 0 ? (
                    <>
                      <Separator />
                      <span
                        className={`flex flex-col items-center relative ${
                          filteredPlayersTeamVisit.length > 0 && 'top-5'
                        }`}>
                        <Toggle
                          variant={'outline'}
                          size={'sm'}
                          pressed={toggleVisit}
                          className={`left-0 top-0 h-5 text-muted-foreground ${
                            toggleVisit && 'border border-pink-400'
                          }`}
                          onPressedChange={e => {
                            setToggleVisit(e)
                            form.setValue('walkover_visit', e)

                            if (e) {
                              setFilteredPlayersTeamVisit([])
                              setFilteredPlayersTeamLocal([])
                            } else {
                              if (toggleLocal) return // si el otro equipo esta en walkover no mostramos nada
                              setFilteredPlayersTeamVisit(playersTeamVisit)
                              if (playersTeamLocal?.length) {
                                setFilteredPlayersTeamLocal(playersTeamLocal)
                              }
                            }
                          }}>
                          Walkover
                        </Toggle>
                        {getTeamLogo(playersTeamVisit, 2)}
                      </span>
                      <Separator />
                    </>
                  ) : (
                    <p className='bg-pink-600 px-2 py-1 text-white rounded relative top-3 animate-pulse'>
                      Equipo aún no tiene jugadores cargados
                    </p>
                  )}
                </div>
                {filteredPlayersTeamVisit.length > 0 && (
                  <DataTable
                    columns={Columns}
                    intialValues={filteredPlayersTeamVisit || []}
                    addModifiedRows={addModifiedRows}
                  />
                )}
              </>
            )}
          </div>

          {/* resultado */}
          <div className='flex justify-center items-center w-full py-1'>
            <div
              className={`w-full flex flex-col justify-center items-center gap-2 text-xs relative`}>
              {getTeamLogo(playersTeamLocal ?? playersTeamLocal, 1)}
              {/* walkover local goals */}
              {toggleVisit && (
                <FormField
                  control={form.control}
                  name='walkover_local_goals'
                  render={({ field }) => (
                    <FormItem className='rounded bg-white shrink-0'>
                      <FormControl>
                        <span className='relative flex items-center justify-center'>
                          <button
                            disabled={field.value === 0}
                            type='button'
                            {...field}
                            value={field.value === null ? 0 : field.value}
                            onClick={() => {
                              form.setValue(
                                'walkover_local_goals',
                                field.value
                                  ? field.value > 0
                                    ? +field.value - 1
                                    : 0
                                  : 0
                              )
                            }}>
                            <MinusCircle
                              className='text-muted-foreground'
                              size={30}
                            />
                          </button>
                          <Input
                            className={`font-semibold text-xl text-center w-[50px] text-muted-foreground ${
                              field.value !== (null || undefined) &&
                              field.value &&
                              field.value > 0
                                ? ''
                                : 'text-muted-foreground'
                            }`}
                            type='number'
                            min={1}
                            defaultValue={0}
                            {...field}
                            value={field.value === null ? 0 : field.value}
                            onClick={e => e.currentTarget.select()}
                          />
                          <button
                            type='button'
                            {...field}
                            value={field.value === null ? 0 : field.value}
                            onClick={() => {
                              form.setValue(
                                'walkover_local_goals',
                                field.value ? +field.value + 1 : 1
                              )
                            }}>
                            <PlusCircle
                              className='text-muted-foreground'
                              size={30}
                            />
                          </button>
                        </span>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {!toggleLocal && !toggleVisit && (
              <h2 className='text-4xl text-muted-foreground text-center flex-none'>
                {goalsLocal}-{goalsVisit}
              </h2>
            )}
            <div
              className={`w-full flex flex-col justify-center items-center gap-2 text-xs relative`}>
              {getTeamLogo(playersTeamVisit ?? playersTeamVisit, 2)}
              {/* walkover visit goals */}
              {toggleLocal && (
                <FormField
                  control={form.control}
                  name='walkover_visit_goals'
                  render={({ field }) => (
                    <FormItem className='rounded bg-white shrink-0'>
                      <FormControl>
                        <span className='relative flex items-center justify-center'>
                          <button
                            disabled={field.value === 0}
                            type='button'
                            {...field}
                            value={field.value === null ? 0 : field.value}
                            onClick={() => {
                              form.setValue(
                                'walkover_visit_goals',
                                field.value
                                  ? field.value > 0
                                    ? +field.value - 1
                                    : 0
                                  : 0
                              )
                            }}>
                            <MinusCircle
                              className='text-muted-foreground'
                              size={30}
                            />
                          </button>
                          <Input
                            className={`font-semibold text-xl text-center w-[50px] text-muted-foreground ${
                              field.value !== (null || undefined) &&
                              field.value &&
                              field.value > 0
                                ? ''
                                : 'text-muted-foreground'
                            }`}
                            type='number'
                            min={1}
                            defaultValue={0}
                            {...field}
                            value={field.value === null ? 0 : field.value}
                            onClick={e => e.currentTarget.select()}
                          />
                          <button
                            type='button'
                            {...field}
                            value={field.value === null ? 0 : field.value}
                            onClick={() => {
                              form.setValue(
                                'walkover_visit_goals',
                                field.value ? +field.value + 1 : 1
                              )
                            }}>
                            <PlusCircle
                              className='text-muted-foreground'
                              size={30}
                            />
                          </button>
                        </span>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* walkovers */}
          <FormField
            control={form.control}
            name='walkover_local'
            render={({ field }) => (
              <FormItem className='rounded bg-white w-full text-center'>
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

export default FixtureTeamsForm
