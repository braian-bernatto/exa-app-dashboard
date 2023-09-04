'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Fixtures, Players, Teams } from '@/types'
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
import { FixtureDetailsColumn } from '@/app/(root)/fixtures/[fixtureId]/components/columns'
import { AlertModal } from '@/components/modals/AlertModal'
import Spinner from '@/components/Spinner'

interface FixtureTeamsFormProps {
  initialData: FixtureDetailsColumn | undefined
  fixtures: Fixtures[]
  teams: Teams[]
  players: Players[]
}

interface PlayersFixture extends Players {
  goals: number | undefined
  yellow_cards: number | undefined
  red_cards: boolean
  motivo: string
}

const FixtureTeamsForm = ({
  initialData,
  fixtures,
  teams,
  players
}: FixtureTeamsFormProps) => {
  const router = useRouter()
  const params = useParams()

  if (initialData) {
    initialData = {
      ...initialData,
      date: new Date(initialData.date)
    }
  }

  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(false)

  const [walkoverTeam1, setWalkoverTeam1] = useState(false)
  const [walkoverTeam2, setWalkoverTeam2] = useState(false)

  const [hour, setHour] = useState('')
  const [goals, setGoals] = useState<
    { id: number; goals: number }[] | undefined
  >(undefined)
  const [playersTeam_1, setPlayersTeam_1] = useState<
    PlayersFixture[] | undefined
  >(undefined)
  const [playersTeam_2, setPlayersTeam_2] = useState<
    PlayersFixture[] | undefined
  >(undefined)
  const [filteredPlayersTeam_1, setFilteredPlayersTeam_1] = useState<
    PlayersFixture[] | undefined
  >(undefined)
  const [filteredPlayersTeam_2, setFilteredPlayersTeam_2] = useState<
    PlayersFixture[] | undefined
  >(undefined)
  const [modifiedRows, setModifiedRows] = useState<any[]>([])

  const title = initialData ? 'Editar Versus' : 'Agregar Versus'
  const toastMessage = initialData ? 'Versus modificado' : 'Versus agregado'
  const action = initialData ? 'Modificar' : 'Agregar'

  const formSchema = z
    .object({
      fixture_id: z.coerce.number({
        required_error: 'Obligatorio',
        invalid_type_error: 'Obligatorio'
      }),
      team_1: z.coerce.number({
        required_error: 'Obligatorio',
        invalid_type_error: 'Obligatorio'
      }),
      team_2: z.coerce.number({
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
      walkover_team_1: z.boolean(),
      walkover_team_2: z.boolean()
    })
    .refine(
      val => {
        if (val.team_1 !== val.team_2) return true
      },
      {
        message: 'No pueden ser el mismo equipo',
        path: ['team_2']
      }
    )
    .refine(
      async val => {
        if (initialData) return true
        const { data } = await supabase
          .from('fixture_details')
          .select('*', { count: 'exact' })
          .eq('fixture_id', val.fixture_id)
          .or(`team_1.eq.${val.team_1},team_2.eq.${val.team_1}`)

        if (data?.length) {
          return false
        }
        return true
      },
      {
        message: 'Equipo ya existe en este Fixture',
        path: ['team_1']
      }
    )
    .refine(
      async val => {
        if (initialData) return true
        const { data } = await supabase
          .from('fixture_details')
          .select('*', { count: 'exact' })
          .eq('fixture_id', val.fixture_id)
          .or(`team_1.eq.${val.team_2},team_2.eq.${val.team_2}`)

        if (data?.length) {
          return false
        }
        return true
      },
      {
        message: 'Equipo ya existe en este Fixture',
        path: ['team_2']
      }
    )
    .refine(
      val => {
        const bothWalkover = val.walkover_team_1 && val.walkover_team_2

        // if none of the teams are in walkover omit this refine
        if (!val.walkover_team_1 && !val.walkover_team_2) return true

        // if there is walkover there must be goals to the other team
        if (!goals) return false
        if (goals?.length === 0) return false
        if (bothWalkover && goals?.length < 2) return false

        if (bothWalkover && goals[0].goals > 0 && goals[1].goals > 0)
          return true
        if (val.walkover_team_1 && goals[1].goals > 0) return true
        if (val.walkover_team_2 && goals[0].goals > 0) return true
      },
      {
        message: 'Goles por walkover deben ser mayores que cero',
        path: ['walkover_team_1']
      }
    )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      fixture_id: +params.fixtureId,
      team_1: undefined,
      team_2: undefined,
      date: undefined,
      cancha_nro: 0,
      goals: undefined,
      walkover_team_1: false,
      walkover_team_2: false
    }
  })

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const {
        fixture_id,
        team_1,
        team_2,
        date,
        cancha_nro,
        walkover_team_1,
        walkover_team_2
      } = values

      if (!fixture_id || !team_1 || !team_2 || !date) {
        return toast.error('Faltan cargar datos')
      }

      if (initialData) {
        // fixture details
        const { error: supabaseFixtureDetailError } = await supabase
          .from('fixture_details')
          .update({
            cancha_nro,
            date: date.toISOString()
          })
          .eq('fixture_id', fixture_id)
          .eq('team_1', team_1)
          .eq('team_2', team_2)

        if (supabaseFixtureDetailError) {
          setLoading(false)
          console.log(supabaseFixtureDetailError)
          return toast.error('No se pudo grabar Fixture Detalle')
        }

        // cargamos datos si es que se modificaron datos de las tablas
        if (modifiedRows.length) {
          // clear all tables
          const { error: deleteGoalsError } = await supabase.rpc(
            'delete_goals',
            {
              fixture: fixture_id,
              team_1,
              team_2
            }
          )
          const { error: deleteYellowCardsError } = await supabase.rpc(
            'delete_yellow_cards',
            {
              fixture: fixture_id,
              team_1,
              team_2
            }
          )
          const { error: deleteRedCardsError } = await supabase.rpc(
            'delete_red_cards',
            {
              fixture: fixture_id,
              team_1,
              team_2
            }
          )
          // delete previous walkover
          const { data, error: deleteWalkoversError } = await supabase.rpc(
            'delete_walkovers',
            {
              fixture: fixture_id,
              team_1,
              team_2
            }
          )

          // goals
          const goalsArray = modifiedRows
            .filter(player => player.goals > 0)
            .map(player => ({
              fixture_id,
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
        if (walkover_team_1 || walkover_team_2) {
          const walkoverArray =
            walkover_team_1 && walkover_team_2
              ? [
                  {
                    fixture_id,
                    team_id: team_1
                  },
                  {
                    fixture_id,
                    team_id: team_2
                  }
                ]
              : walkover_team_1
              ? [
                  {
                    fixture_id,
                    team_id: team_1
                  }
                ]
              : [
                  {
                    fixture_id,
                    team_id: team_2
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
        // fixture details
        const { error: supabaseFixtureDetailError } = await supabase
          .from('fixture_details')
          .insert({
            fixture_id,
            team_1,
            team_2,
            cancha_nro,
            date: date.toISOString()
          })

        if (supabaseFixtureDetailError) {
          setLoading(false)
          console.log(supabaseFixtureDetailError)
          return toast.error('No se pudo grabar Fixture Detalle')
        }

        // cargamos datos si es que se modificaron datos de las tablas
        if (modifiedRows.length) {
          // goals
          const goalsArray = modifiedRows
            .filter(player => player.goals > 0)
            .map(player => ({
              fixture_id,
              player_id: player.id,
              quantity: player.goals
            }))

          if (goalsArray.length) {
            const { error: supabaseGoalsError } = await supabase
              .from('goals')
              .insert(goalsArray)

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
              player_id: player.id,
              quantity: player.yellow_cards
            }))
          if (yellowCardsArray.length) {
            const { error: supabaseYellowCardsError } = await supabase
              .from('yellow_cards')
              .insert(yellowCardsArray)

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
              player_id: player.id,
              motivo: player.motivo
            }))

          if (redCardsArray.length) {
            const { error: supabaseRedCardError } = await supabase
              .from('red_cards')
              .insert(redCardsArray)

            if (supabaseRedCardError) {
              setLoading(false)
              return toast.error('No se pudieron grabar las Tarjetas Rojas')
            }
          }
        }

        // walkover
        if (walkoverTeam1 || walkoverTeam2) {
          const walkoverArray =
            walkoverTeam1 && walkoverTeam2
              ? [
                  {
                    fixture_id,
                    team_id: team_1
                  },
                  {
                    fixture_id,
                    team_id: team_2
                  }
                ]
              : walkoverTeam1
              ? [
                  {
                    fixture_id,
                    team_id: team_1
                  }
                ]
              : [
                  {
                    fixture_id,
                    team_id: team_2
                  }
                ]
          const { error: supabaseWalkoverError } = await supabase
            .from('walkover')
            .insert(walkoverArray)

          if (supabaseWalkoverError) {
            setLoading(false)
            return toast.error('No se pudo guardar datos de Walkover')
          }
        }
      }

      setLoading(false)

      // limpiamos los datos modificados
      router.back()
      router.refresh()
      // form.reset()
      // setModifiedRows([])
      // setPlayersTeam_1(undefined)
      // setPlayersTeam_2(undefined)
      // clearWalkover()
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

      const { error } = await supabase.rpc('delete_versus', {
        fixture: +params.fixtureId,
        team_one: initialData.team_1,
        team_two: initialData.team_2
      })

      // clear all tables
      const { error: deleteGoalsError } = await supabase.rpc('delete_goals', {
        fixture: +params.fixtureId,
        team_1: initialData.team_1,
        team_2: initialData.team_2
      })
      const { error: deleteYellowCardsError } = await supabase.rpc(
        'delete_yellow_cards',
        {
          fixture: +params.fixtureId,
          team_1: initialData.team_1,
          team_2: initialData.team_2
        }
      )
      const { error: deleteRedCardsError } = await supabase.rpc(
        'delete_red_cards',
        {
          fixture: +params.fixtureId,
          team_1: initialData.team_1,
          team_2: initialData.team_2
        }
      )
      // delete previous walkover
      const { data, error: deleteWalkoversError } = await supabase.rpc(
        'delete_walkovers',
        {
          fixture: +params.fixtureId,
          team_1: initialData.team_1,
          team_2: initialData.team_2
        }
      )

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

  const getTeamLogo = (filteredPlayers?: Players[], teamNumber?: number) => {
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

  const updatePlayersList = (
    teamWalkover: boolean,
    teamPlayers: PlayersFixture[],
    setTeamPlayers: (list: PlayersFixture[] | undefined) => void,
    vsTeamWalkover: boolean,
    vsTeamPlayers: PlayersFixture[],
    setVsTeamPlayers: (list: PlayersFixture[] | undefined) => void
  ) => {
    // filtramos los jugadores del equipo contrario
    teamWalkover
      ? setVsTeamPlayers(
          vsTeamPlayers.filter(player => player.position_id === 'POR')
        )
      : vsTeamWalkover
      ? setVsTeamPlayers(undefined)
      : setVsTeamPlayers(vsTeamPlayers)

    // filtramos equipo en walkover si el otro equipo tambien esta sancionado
    vsTeamWalkover
      ? setTeamPlayers(
          teamPlayers.filter(player => player.position_id === 'POR')
        )
      : teamWalkover
      ? setTeamPlayers(undefined)
      : setTeamPlayers(teamPlayers)
  }

  const getPlayerGoals = async (id: number) => {
    const { data } = await supabase
      .from('goals')
      .select()
      .eq('fixture_id', +params.fixtureId)
      .eq('player_id', id)

    if (data?.length) {
      return data[0].quantity
    }
    return 0
  }

  const getPlayerYellowCards = async (id: number) => {
    const { data } = await supabase
      .from('yellow_cards')
      .select()
      .eq('fixture_id', +params.fixtureId)
      .eq('player_id', id)

    if (data?.length) {
      return data[0].quantity
    }
    return 0
  }

  const getPlayerRedCard = async (id: number) => {
    const { data } = await supabase
      .from('red_cards')
      .select()
      .eq('fixture_id', +params.fixtureId)
      .eq('player_id', id)

    if (data?.length) {
      return data[0]
    }
    return false
  }

  const getTeamWalkover = async (id: number) => {
    const { data } = await supabase
      .from('walkover')
      .select()
      .eq('fixture_id', +params.fixtureId)
      .eq('team_id', id)

    if (data?.length) {
      return true
    }
    return false
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

  const filterModifiedRows = (id: number) => {
    const filteredData = modifiedRows.filter(team => team.team_id !== id)
    setModifiedRows(filteredData)
  }

  const hideTeamsToggle_1 = (e: boolean, vs: boolean) => {
    if (playersTeam_1) {
      // agregamos el id del equipo en el array de walkover
      setWalkoverTeam1(e)

      // filtramos el listado del otro equipo a solo porteros
      updatePlayersList(
        e,
        playersTeam_1,
        setFilteredPlayersTeam_1,
        vs,
        playersTeam_2!,
        setFilteredPlayersTeam_2
      )
    }
  }

  const hideTeamsToggle_2 = (e: boolean, vs: boolean) => {
    if (playersTeam_2) {
      // agregamos el id del equipo en el array de walkover
      setWalkoverTeam2(e)

      // filtramos el listado del otro equipo a solo porteros
      updatePlayersList(
        e,
        playersTeam_2,
        setFilteredPlayersTeam_2,
        vs,
        playersTeam_1!,
        setFilteredPlayersTeam_1
      )
    }
  }

  const getPlayersDetails = async (id: number) => {
    //filtro los jugadores del equipo seleccionado y agrego los detalles de cada uno
    const result = await Promise.all(
      players
        .filter(player => player.team_id === id)
        .map(async players => {
          const redData = await getPlayerRedCard(players.id)

          return {
            ...players,
            goals: await getPlayerGoals(players.id),
            yellow_cards: await getPlayerYellowCards(players.id),
            red_cards: redData ? true : false,
            motivo: redData ? redData.motivo! : ''
          }
        })
    )

    return result
  }

  const setPlayers = async () => {
    setLoading(true)
    const players_1 = await getPlayersDetails(initialData.team_1)
    const players_2 = await getPlayersDetails(initialData.team_2)
    setModifiedRows([...players_1, ...players_2])
    setPlayersTeam_1(players_1)
    setPlayersTeam_2(players_2)
    setFilteredPlayersTeam_1(players_1)
    setFilteredPlayersTeam_2(players_2)
    setLoading(false)
  }

  const setTeamWalkover = async () => {
    setLoading(true)
    const team_1 = await getTeamWalkover(initialData.team_1)
    const team_2 = await getTeamWalkover(initialData.team_2)
    setToggle1(team_1)
    setToggle2(team_2)
    hideTeamsToggle_1(team_1, team_2)
    hideTeamsToggle_2(team_2, team_1)
    setLoading(false)
  }

  useEffect(() => {
    if (initialData) {
      setPlayers()
    }
  }, [])

  useEffect(() => {
    if (initialData && filteredPlayersTeam_1?.length) {
      setTeamWalkover()
    }
  }, [playersTeam_1])

  useEffect(() => {
    countGoals()
  }, [modifiedRows])

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
                onClick={() =>
                  console.log({
                    modifiedRows,
                    walkoverTeam1,
                    walkoverTeam2,
                    goals
                  })
                }
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

          {/* fixture */}
          <FormField
            control={form.control}
            name='fixture_id'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormLabel>Fixture</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={true}
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}>
                        {field.value
                          ? fixtures.find(fixture => fixture.id === field.value)
                              ?.name
                          : 'Elige un fixture'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='max-w-[300px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de fixtures...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {fixtures.map(fixture => (
                          <CommandItem
                            value={fixture.name!}
                            key={fixture.id}
                            onSelect={() => {
                              form.setValue('fixture_id', fixture.id)
                            }}>
                            <>
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  fixture.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {fixture.name}
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

          <div className='grid grid-cols-2 gap-1 overflow-hidden'>
            {/* team 1 */}
            <FormField
              control={form.control}
              name='team_1'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipo 1</FormLabel>
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
                                form.getValues('team_2') === team.id
                                  ? 'opacity-50 bg-slate-50'
                                  : ''
                              }`}
                              disabled={form.getValues('team_2') === team.id}
                              value={team.name!}
                              key={team.id}
                              onSelect={() => {
                                // reseteo walkovers
                                setToggle1(false)
                                setToggle2(false)
                                clearWalkover()
                                filterModifiedRows(form.getValues('team_1'))

                                form.setValue('team_1', team.id)

                                const filtered = players
                                  .filter(player => player.team_id === team.id)
                                  .map(players => ({
                                    ...players,
                                    goals: 0,
                                    yellow_cards: 0,
                                    red_cards: false,
                                    motivo: ''
                                  }))

                                setPlayersTeam_1(filtered)
                                setFilteredPlayersTeam_1(filtered)
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
            {/* team 2 */}
            <FormField
              control={form.control}
              name='team_2'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipo 2</FormLabel>
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
                                form.getValues('team_1') === team.id
                                  ? 'opacity-50 bg-slate-50'
                                  : ''
                              }`}
                              disabled={form.getValues('team_1') === team.id}
                              value={team.name!}
                              key={team.id}
                              onSelect={() => {
                                // reseteo walkovers
                                setToggle1(false)
                                setToggle2(false)
                                clearWalkover()
                                filterModifiedRows(form.getValues('team_2'))

                                form.setValue('team_2', team.id)

                                const filtered = players
                                  .filter(player => player.team_id === team.id)
                                  .map(players => ({
                                    ...players,
                                    goals: 0,
                                    yellow_cards: 0,
                                    red_cards: false,
                                    motivo: ''
                                  }))

                                setPlayersTeam_2(filtered)
                                setFilteredPlayersTeam_2(filtered)
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

          <div className='flex w-full gap-1'>
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
                            format(field.value!, 'PP | HH:mm', {
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
                          field.onChange(
                            set(e!, {
                              hours: hour.length ? +hour.split(':')[0] : 0,
                              minutes: hour.length ? +hour.split(':')[1] : 0
                            })
                          )
                        }}
                        disabled={date => date < subDays(new Date(), 1)}
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
                            console.log(field.value)
                            setHour(e.target.value) // keeps the time when date changes
                            field.onChange(
                              set(field.value ? field.value : new Date(), {
                                hours: +e.target.value.split(':')[0],
                                minutes: +e.target.value.split(':')[1]
                              })
                            )
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
                <FormItem className='rounded bg-white w-[75px] shrink-0'>
                  <FormLabel>Cancha N°</FormLabel>
                  <FormControl>
                    <Input
                      className={`font-semibold text-center ${
                        field.value !== undefined && field.value > 0
                          ? ''
                          : 'text-muted-foreground'
                      }`}
                      type='number'
                      min={1}
                      {...field}
                      onClick={e => e.currentTarget.select()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Table */}
          <div className='w-full relative overflow-hidden'>
            {playersTeam_1 && (
              <>
                <div
                  className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}>
                  {playersTeam_1?.length > 0 ? (
                    <>
                      <Separator />
                      <span
                        className={`flex flex-col items-center relative ${
                          filteredPlayersTeam_1 && 'top-5'
                        }`}>
                        <Toggle
                          variant={'outline'}
                          size={'sm'}
                          pressed={toggle1}
                          className='left-0 top-0 h-5 text-muted-foreground'
                          onPressedChange={e => {
                            setToggle1(!toggle1)
                            setModifiedRows([])
                            hideTeamsToggle_1(e, walkoverTeam2)
                          }}>
                          Walkover
                        </Toggle>
                        {getTeamLogo(playersTeam_1, 1)}
                      </span>
                      <Separator />
                    </>
                  ) : (
                    <p className='bg-pink-600 px-2 py-1 text-white rounded relative top-3 animate-pulse'>
                      Equipo aún no tiene jugadores cargados
                    </p>
                  )}
                </div>
                {filteredPlayersTeam_1 && (
                  <DataTable
                    columns={Columns}
                    intialValues={filteredPlayersTeam_1 || []}
                    addModifiedRows={addModifiedRows}
                  />
                )}
              </>
            )}
          </div>

          <div className='w-full relative overflow-hidden'>
            {playersTeam_2 && (
              <>
                <div
                  className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}>
                  {playersTeam_2?.length > 0 ? (
                    <>
                      <Separator />
                      <span
                        className={`flex flex-col items-center relative ${
                          filteredPlayersTeam_2 && 'top-5'
                        }`}>
                        <Toggle
                          variant={'outline'}
                          size={'sm'}
                          pressed={toggle2}
                          className='left-0 top-0 h-5 text-muted-foreground'
                          onPressedChange={e => {
                            setToggle2(!toggle2)
                            setModifiedRows([])
                            hideTeamsToggle_2(e, walkoverTeam1)
                          }}>
                          Walkover
                        </Toggle>
                        {getTeamLogo(playersTeam_2, 2)}
                      </span>
                      <Separator />
                    </>
                  ) : (
                    <p className='bg-pink-600 px-2 py-1 text-white rounded relative top-3 animate-pulse'>
                      Equipo aún no tiene jugadores cargados
                    </p>
                  )}
                </div>
                {filteredPlayersTeam_2 && (
                  <DataTable
                    columns={Columns}
                    intialValues={filteredPlayersTeam_2 || []}
                    addModifiedRows={addModifiedRows}
                  />
                )}
              </>
            )}
          </div>

          {/* Resultado */}
          <div className='flex justify-center items-center overflow-hidden w-full'>
            <div
              className={`w-full flex justify-center items-center gap-2 text-xs relative`}>
              {getTeamLogo(playersTeam_1 ?? playersTeam_1, 1)}
            </div>
            <h2 className='text-4xl text-muted-foreground text-center flex-none'>
              {playersTeam_1?.length &&
                goals !== undefined &&
                goals.filter(item => item.id === playersTeam_1[0].team_id!)
                  .length &&
                goals.filter(item => item.id === playersTeam_1[0].team_id!)[0]
                  .goals}
              -
              {playersTeam_2?.length &&
                goals !== undefined &&
                goals.filter(item => item.id === playersTeam_2[0].team_id!)
                  .length &&
                goals.filter(item => item.id === playersTeam_2[0].team_id!)[0]
                  .goals}
            </h2>
            <div
              className={`w-full flex justify-center items-center gap-2 text-xs relative `}>
              {getTeamLogo(playersTeam_2 ?? playersTeam_2, 2)}
            </div>
          </div>

          {/* Goals */}
          <FormField
            control={form.control}
            name='goals'
            render={({ field }) => (
              <FormItem className='rounded bg-white'>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Walkovers */}
          <FormField
            control={form.control}
            name='walkover_team_1'
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
                form.setValue('walkover_team_1', walkoverTeam1)
                form.setValue('walkover_team_2', walkoverTeam2)
              }}>
              {action}
            </Button>
          </div>
        </form>
      </Form>{' '}
    </>
  )
}

export default FixtureTeamsForm
