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

interface PlayersFixture extends Players {
  goals: number | undefined
  yellow_cards: number | undefined
  red_card: boolean
  motivo: string
}

const FixtureTeamsForm = ({
  initialData,
  teams,
  players
}: FixtureTeamsFormProps) => {
  const router = useRouter()
  const params = useParams()
  console.log({ initialData })

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(false)

  const [walkoverTeam1, setWalkoverTeam1] = useState(false)
  const [walkoverTeam2, setWalkoverTeam2] = useState(false)

  const [teamIdsInFixture, setTeamIdsInFixture] = useState<number[]>([])

  const [hour, setHour] = useState('')
  const [allowPreviousDates, setAllowPreviousDates] = useState(false)
  const [goals, setGoals] = useState<
    { id: number; goals: number }[] | undefined
  >(undefined)
  const [playersTeam_local, setPlayersTeam_local] = useState<
    GetFixturesPlayers | Players[] | undefined
  >(undefined)
  const [playersTeam_visit, setPlayersTeamVisit] = useState<
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
      goals: z
        .object(
          {
            id: z.number(),
            goals: z.number().min(0)
          },
          {
            required_error: 'Faltan cargar los goles',
            invalid_type_error: 'Faltan cargar los goles'
          }
        )
        .array()
        .max(2),
      walkover_local: z.boolean(),
      walkover_visit: z.boolean()
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
        const bothWalkover = val.walkover_local && val.walkover_visit

        // if none of the teams are in walkover omit this refine
        if (!val.walkover_local && !val.walkover_visit) return true

        // if there is walkover there must be goals to the other team
        if (!goals) return false
        if (goals?.length === 0) return false
        if (bothWalkover && goals?.length < 2) return false

        if (bothWalkover && (goals[0].goals === 0 || goals[1].goals === 0))
          return false
        if (val.walkover_local && goals[0].goals > 0) return true
        if (val.walkover_visit && goals[0].goals > 0) return true
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
      goals: undefined,
      walkover_local: false,
      walkover_visit: false
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
        <h2 className='text-xl font-semibold absolute text-emerald-700'>
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
        motivo: '',
        is_present: true,
        is_local:
          players.team_id === form.getValues('team_local') ? true : false
      }))

    return filtered
  }

  const setPlayers = async () => {
    if (initialData) {
      setLoading(true)
      const players_1 = initialData.fixturePlayers.filter(
        player => player.team_id === player.team_local
      )
      const players_2 = initialData.fixturePlayers.filter(
        player => player.team_id === player.team_visit
      )
      setPlayersTeam_local(players_1)
      setPlayersTeamVisit(players_2)
      setFilteredPlayersTeamLocal(players_1)
      setFilteredPlayersTeamVisit(players_2)
      setModifiedRows([...players_1, ...players_2])
      setLoading(false)
    }
  }

  const setTeamWalkover = async () => {
    if (initialData) {
      setLoading(true)
      setToggle1(initialData.walkover_local)
      setToggle2(initialData.walkover_visit)
      hideTeamsToggle_1(initialData.walkover_local, initialData.walkover_visit)
      hideTeamsToggle_2(initialData.walkover_visit, initialData.walkover_local)
      setLoading(false)
    }
  }

  const countGoals = () => {
    const totalCount = modifiedRows.reduce((prev, curr) => {
      // Inicia el array con el primer item
      if (!prev.length) {
        prev.push({
          id: curr.team_id,
          goals: +curr.goals
        })
        return prev
      }

      // Busca si existe el item en el array y suma los goles
      const teamIndex = prev.findIndex(
        (team: any) => +team.id === +curr.team_id
      )

      if (teamIndex !== -1) {
        const filteredList = prev.filter(
          (team: any) => team.id !== curr.team_id
        )
        const foundItem = prev.filter((team: any) => team.id === curr.team_id)

        prev = [
          ...filteredList,
          { id: foundItem[0].id, goals: +foundItem[0].goals + +curr.goals }
        ]
        return prev
      } else {
        // Si no encontro el dato en el array entonces se agrega como nuevo
        prev = [
          ...prev,
          {
            id: curr.team_id,
            goals: +curr.goals
          }
        ]
      }

      return prev
    }, [])

    setGoals(totalCount)
  }

  const clearWalkover = () => {
    setWalkoverTeam1(false)
    setWalkoverTeam2(false)
  }

  const updatePlayersList = (
    teamWalkover: boolean,
    teamPlayers: GetFixturesPlayers | Players[],
    setTeamPlayers: (list: GetFixturesPlayers | Players[] | []) => void,
    vsTeamWalkover: boolean,
    vsTeamPlayers: GetFixturesPlayers | Players[],
    setVsTeamPlayers: (list: GetFixturesPlayers | Players[] | []) => void
  ) => {
    const vsTeamPorteros = vsTeamPlayers.filter(
      player => player.position_id === 'POR'
    )
    const teamPorteros = teamPlayers.filter(
      player => player.position_id === 'POR'
    )

    // filtramos los jugadores del equipo contrario
    teamWalkover
      ? setVsTeamPlayers(vsTeamPorteros)
      : vsTeamWalkover
      ? setVsTeamPlayers([])
      : setVsTeamPlayers(vsTeamPlayers)

    // filtramos equipo en walkover si el otro equipo tambien esta sancionado
    vsTeamWalkover
      ? setTeamPlayers(teamPorteros)
      : teamWalkover
      ? setTeamPlayers([])
      : setTeamPlayers(teamPlayers)
  }

  const addModifiedRows = (data: any) => {
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
    const filteredData = modifiedRows.filter(team => team.team_id !== id)
    setModifiedRows(filteredData)
  }

  const hideTeamsToggle_1 = (e: boolean, vs: boolean) => {
    if (playersTeam_local) {
      // agregamos el id del equipo en el array de walkover
      setWalkoverTeam1(e)

      // filtramos el listado del otro equipo a solo porteros
      updatePlayersList(
        e,
        playersTeam_local,
        setFilteredPlayersTeamLocal,
        vs,
        playersTeam_visit!,
        setFilteredPlayersTeamVisit
      )
    }
  }

  const hideTeamsToggle_2 = (e: boolean, vs: boolean) => {
    if (playersTeam_visit) {
      // agregamos el id del equipo en el array de walkover
      setWalkoverTeam2(e)

      // filtramos el listado del otro equipo a solo porteros
      updatePlayersList(
        e,
        playersTeam_visit,
        setFilteredPlayersTeamVisit,
        vs,
        playersTeam_local!,
        setFilteredPlayersTeamLocal
      )
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const {
        fixture_id,
        team_local,
        team_visit,
        date,
        cancha_nro,
        walkover_local,
        walkover_visit
      } = values

      if (!fixture_id || !team_local || !team_visit || !date) {
        return toast.error('Faltan cargar datos')
      }

      if (initialData) {
        // fixture details
        const { error: supabaseFixtureTeamsError } = await supabase
          .from('fixture_details')
          .update({
            cancha_nro,
            date: date.toISOString()
          })
          .eq('fixture_id', fixture_id)
          .eq('team_local', team_local)
          .eq('team_visit', team_visit)

        if (supabaseFixtureTeamsError) {
          setLoading(false)
          console.log(supabaseFixtureTeamsError)
          return toast.error('No se pudo grabar Fixture Detalle')
        }

        // cargamos datos si es que se modificaron datos de las tablas
        if (modifiedRows.length) {
          const playerIds = modifiedRows.map(player => player.id)

          const notGoalsArray = [...playersTeam_local!, ...playersTeam_visit!]
            .filter(player => playerIds.indexOf(player.id) === -1)
            .filter(player => player.goals && player.goals > 0)
            .map(player => player.id)

          notGoalsArray.push(
            ...modifiedRows
              .filter(player => player.goals === 0)
              .map(player => player.id)
          )

          const notYellowCardsArray = [
            ...playersTeam_local!,
            ...playersTeam_visit!
          ]
            .filter(player => playerIds.indexOf(player.id) === -1)
            .filter(player => player.yellow_cards && player.yellow_cards > 0)
            .map(player => player.id)

          notYellowCardsArray.push(
            ...modifiedRows
              .filter(player => player.yellow_cards === 0)
              .map(player => player.id)
          )

          const notRedCardsArray = [
            ...playersTeam_local!,
            ...playersTeam_visit!
          ]
            .filter(player => playerIds.indexOf(player.id) === -1)
            .filter(player => player.red_card)
            .map(player => player.id)

          notRedCardsArray.push(
            ...modifiedRows
              .filter(player => !player.red_cards)
              .map(player => player.id)
          )

          // upsert goals
          const goalsArray = modifiedRows
            .filter(player => player.goals > 0)
            .map(player => ({
              fixture_id,
              team_id: player.team_id,
              player_id: player.id,
              quantity: player.goals
            }))

          if (goalsArray.length) {
            const { error: supabaseGoalsError } = await supabase
              .from('goals')
              .upsert(goalsArray)

            if (supabaseGoalsError) {
              setLoading(false)
              console.log(supabaseGoalsError)
              return toast.error('No se pudieron grabar los Goles')
            }
          }
          // yellow cards
          const yellowCardsArray = modifiedRows
            .filter(player => player.yellow_cards > 0)
            .map(player => ({
              fixture_id,
              team_id: player.team_id,
              player_id: player.id,
              quantity: player.yellow_cards
            }))
          if (yellowCardsArray.length) {
            const { error: supabaseYellowCardsError } = await supabase
              .from('yellow_cards')
              .upsert(yellowCardsArray)

            if (supabaseYellowCardsError) {
              setLoading(false)
              return toast.error('No se pudieron grabar las Tarjetas Amarillas')
            }
          }
          // red cards
          const redCardsArray = modifiedRows
            .filter(player => player.red_cards)
            .map(player => ({
              fixture_id,
              team_id: player.team_id,
              player_id: player.id,
              motivo: player.motivo
            }))

          if (redCardsArray.length) {
            const { error: supabaseRedCardError } = await supabase
              .from('red_cards')
              .upsert(redCardsArray)

            if (supabaseRedCardError) {
              setLoading(false)
              return toast.error('No se pudieron grabar las Tarjetas Rojas')
            }
          }
        }

        // walkover
        if (walkover_local || walkover_visit) {
          const walkoverArray =
            walkover_local && walkover_visit
              ? [
                  {
                    fixture_id,
                    team_id: team_local
                  },
                  {
                    fixture_id,
                    team_id: team_visit
                  }
                ]
              : walkover_local
              ? [
                  {
                    fixture_id,
                    team_id: team_local
                  }
                ]
              : [
                  {
                    fixture_id,
                    team_id: team_visit
                  }
                ]

          const { error: supabaseWalkoverError } = await supabase
            .from('walkover')
            .upsert(walkoverArray)

          if (supabaseWalkoverError) {
            setLoading(false)
            return toast.error('No se pudo guardar datos de Walkover')
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
            date: date.toISOString()
          })

        if (supabaseFixtureTeamsError) {
          setLoading(false)
          console.log(supabaseFixtureTeamsError)
          return toast.error('No se pudo grabar Fixture Equipo')
        }

        // fixture players
        if (modifiedRows.length) {
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
            red_card_motive: player.motivo
          }))

          const { error: supabaseFixturePlayersError } = await supabase
            .from('fixture_players')
            .insert(formattedPlayers)

          if (supabaseFixturePlayersError) {
            setLoading(false)
            console.log(supabaseFixturePlayersError)
            return toast.error('No se pudo grabar Fixture Jugadores')
          }
        }

        // walkover
        if (walkoverTeam1 || walkoverTeam2) {
          const { error: supabaseWalkoverError } = await supabase
            .from('fixture_teams')
            .update({
              walkover_local: walkoverTeam1,
              walkover_visit: walkoverTeam2
            })

          if (supabaseWalkoverError) {
            setLoading(false)
            return toast.error('No se pudo guardar datos de Walkover')
          }
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
      }
    } else {
      getTeamIdsFixture()
    }
  }, [])

  useEffect(() => {
    if (initialData && filteredPlayersTeamLocal?.length) {
      setTeamWalkover()
    }
  }, [playersTeam_local])

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
                    filteredPlayersTeamLocal,
                    filteredPlayersTeamVisit,
                    modifiedRows,
                    walkoverTeam1,
                    walkoverTeam2,
                    goals
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
                            'w-full justify-between text-xs',
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
                              className={`text-xs ${
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
                                // reseteo walkovers
                                setToggle1(false)
                                setToggle2(false)
                                clearWalkover()
                                filterModifiedRows(form.getValues('team_local'))

                                form.setValue('team_local', team.id)

                                const filtered = getResetedPlayersDetails(
                                  team.id
                                )
                                setPlayersTeam_local(filtered)
                                setModifiedRows([...modifiedRows, ...filtered])
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
                            'w-full justify-between text-xs',
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
                              className={`tex t-xs ${
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
                                // reseteo walkovers
                                setToggle1(false)
                                setToggle2(false)
                                clearWalkover()
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
                            console.log(field.value)
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
                          className={`font-semibold text-center w-[75px] ${
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

          {/* players team 1 table */}
          <div className='w-full relative overflow-hidden'>
            {playersTeam_local && (
              <>
                <div
                  className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}>
                  {playersTeam_local?.length > 0 ? (
                    <>
                      <Separator />
                      <span
                        className={`flex flex-col items-center relative ${
                          filteredPlayersTeamLocal.length > 0 && 'top-5'
                        }`}>
                        <Toggle
                          variant={'outline'}
                          size={'sm'}
                          pressed={toggle1}
                          className='left-0 top-0 h-5 text-muted-foreground'
                          onPressedChange={e => {
                            setToggle1(!toggle1)
                            hideTeamsToggle_1(e, walkoverTeam2)
                          }}>
                          Walkover
                        </Toggle>
                        {getTeamLogo(playersTeam_local, 1)}
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
          {/* players team 2 table */}
          <div className='w-full relative overflow-hidden'>
            {playersTeam_visit && (
              <>
                <div
                  className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}>
                  {playersTeam_visit?.length > 0 ? (
                    <>
                      <Separator />
                      <span
                        className={`flex flex-col items-center relative ${
                          filteredPlayersTeamVisit.length > 0 && 'top-5'
                        }`}>
                        <Toggle
                          variant={'outline'}
                          size={'sm'}
                          pressed={toggle2}
                          className='left-0 top-0 h-5 text-muted-foreground'
                          onPressedChange={e => {
                            setToggle2(!toggle2)
                            hideTeamsToggle_2(e, walkoverTeam1)
                            // if (e && initialData) {
                            //   const resetPlayers = getResetedPlayersDetails(
                            //     playersTeam_visit[0].team_id
                            //   )
                            //   setFilteredPlayersTeamVisit(resetPlayers)

                            //   if (playersTeam_local?.length) {
                            //     const resetPlayers = getResetedPlayersDetails(
                            //       playersTeam_local[0].team_id
                            //     )
                            //     setFilteredPlayersTeamLocal(resetPlayers)
                            //   }
                            // } else {
                            //   setModifiedRows([])
                            // }
                          }}>
                          Walkover
                        </Toggle>
                        {getTeamLogo(playersTeam_visit, 2)}
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
          <div className='flex justify-center items-center overflow-hidden w-full'>
            <div
              className={`w-full flex justify-center items-center gap-2 text-xs relative`}>
              {getTeamLogo(playersTeam_local ?? playersTeam_local, 1)}
            </div>
            <h2 className='text-4xl text-muted-foreground text-center flex-none'>
              {playersTeam_local?.length &&
                goals !== undefined &&
                goals.filter(item => item.id === playersTeam_local[0].team_id!)
                  .length &&
                goals.filter(
                  item => item.id === playersTeam_local[0].team_id!
                )[0].goals}
              -
              {playersTeam_visit?.length &&
                goals !== undefined &&
                goals.filter(item => item.id === playersTeam_visit[0].team_id!)
                  .length &&
                goals.filter(
                  item => item.id === playersTeam_visit[0].team_id!
                )[0].goals}
            </h2>
            <div
              className={`w-full flex justify-center items-center gap-2 text-xs relative `}>
              {getTeamLogo(playersTeam_visit ?? playersTeam_visit, 2)}
            </div>
          </div>

          {/* goals */}
          <FormField
            control={form.control}
            name='goals'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormMessage />
              </FormItem>
            )}
          />

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
              disabled={loading}
              onClick={() => {
                form.setValue('goals', goals!)
                form.setValue('walkover_local', walkoverTeam1)
                form.setValue('walkover_visit', walkoverTeam2)
              }}>
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default FixtureTeamsForm
