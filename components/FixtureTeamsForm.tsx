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
import { useRouter } from 'next/navigation'
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Shield,
  Swords
} from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from './ui/calendar'
import { format, set, subDays } from 'date-fns'
import { es } from 'date-fns/esm/locale'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from './ui/command'
import Image from 'next/image'
import { DataTable } from '@/components/Fixture/DataTable'
import { Columns } from '@/components/Fixture/Columns'
import { Separator } from './ui/separator'
import { Toggle } from './ui/toggle'
import { toast } from 'react-hot-toast'

interface FixtureTeamsFormProps {
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
  fixtures,
  teams,
  players
}: FixtureTeamsFormProps) => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [toggle1, setToggle1] = useState<boolean>(false)
  const [toggle2, setToggle2] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [hour, setHour] = useState<string>('')
  const [goals, setGoals] = useState<
    { id: number; goals: number }[] | undefined
  >(undefined)
  const [walkover, setWalkover] = useState<number[]>([])
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
      walkover: z.coerce
        .number({
          required_error: 'Falta cargar walkover',
          invalid_type_error: 'Falta cargar walkover'
        })
        .array()
        .max(2)
        .optional()
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
        if (val.walkover?.length === 0) return true
        if (val.walkover?.length === 2) return true

        const vsTeamMinGoals =
          val.walkover?.length &&
          val.goals.length &&
          val.walkover[0] !== val.goals[0].id &&
          val.goals[0].goals > 0

        if (val.walkover?.length === 1 && vsTeamMinGoals) return true
      },
      {
        message: 'Goles por walkover deben ser mayores que cero',
        path: ['walkover']
      }
    )
    .refine(
      val => {
        if (val.walkover?.length === 0 || val.walkover?.length === 1)
          return true

        const bothTeamsWalkover = val.walkover!.length === 2
        const bothTeamsGoals = val.goals.length === 2

        if (bothTeamsWalkover && bothTeamsGoals) return true
      },
      {
        message:
          'Goles por walkover deben ser mayores que cero para ambos equipos',
        path: ['walkover']
      }
    )
    .refine(
      val => {
        if (val.walkover?.length === 0 || val.walkover?.length === 1)
          return true
        if (val.goals.length < 1) return false

        const bothTeamsWalkover = val.walkover!.length === 2
        const bothTeamsMinGoals =
          +val.goals[0].goals > 0 && +val.goals[1]?.goals > 0

        if (bothTeamsWalkover && bothTeamsMinGoals) return true
      },
      {
        message: 'Goles por walkover deben ser mayores que cero',
        path: ['walkover']
      }
    )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fixture_id: undefined,
      team_1: undefined,
      team_2: undefined,
      date: undefined,
      cancha_nro: 0,
      goals: undefined,
      walkover: []
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ values })

    try {
      setLoading(true)
      const { fixture_id, team_1, team_2, date, cancha_nro, walkover } = values

      if (!fixture_id || !team_1 || !team_2 || !date) {
        return toast.error('Faltan datos')
      }

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
      if (walkover?.length) {
        const walkoverArray = walkover.map((item: any) => ({
          fixture_id,
          team_id: item
        }))
        const { error: supabaseWalkoverError } = await supabase
          .from('walkover')
          .insert(walkoverArray)

        if (supabaseWalkoverError) {
          setLoading(false)
          return toast.error('No se pudo guardar datos de Walkover')
        }
      }

      router.refresh()
      setLoading(false)

      // limpiamos los datos modificados
      setModifiedRows([])
      setWalkover([])
      setPlayersTeam_1(undefined)
      setPlayersTeam_2(undefined)
      form.reset()

      toast.success('Fixture creado!')
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
    }
  }

  const getTeamLogo = (filteredPlayers?: Players[], teamNumber?: number) => {
    if (filteredPlayers && filteredPlayers.length > 0) {
      const url = teams.filter(
        team => team.id === filteredPlayers[0].team_id
      )[0].logo_url

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
    targetTeamWalkover: boolean,
    targetTeamPlayers: PlayersFixture[],
    setTargetTeamPlayers: (list: PlayersFixture[] | undefined) => void,
    vsTeamPlayers: PlayersFixture[],
    setVsTeamPlayers: (list: PlayersFixture[] | undefined) => void
  ) => {
    // revisamos si el equipo contrario esta en walkover
    const vsTeamWalkover = checkWalkoverId(vsTeamPlayers[0].team_id!)

    // filtramos los equipos contrarios
    targetTeamWalkover
      ? setVsTeamPlayers(
          vsTeamPlayers.filter(player => player.position_id === 'POR')
        )
      : vsTeamWalkover
      ? setVsTeamPlayers(undefined)
      : setVsTeamPlayers(vsTeamPlayers)

    // filtramos equipo en walkover si el otro equipo tambien esta sancionado
    vsTeamWalkover
      ? setTargetTeamPlayers(
          targetTeamPlayers.filter(player => player.position_id === 'POR')
        )
      : targetTeamWalkover
      ? setTargetTeamPlayers(undefined)
      : setTargetTeamPlayers(targetTeamPlayers)
  }

  const checkWalkoverId = (id: number) => {
    const exists = walkover.indexOf(id)
    if (exists === -1) return false

    return true
  }

  useEffect(() => {
    countGoals()
  }, [modifiedRows])

  useEffect(() => {
    form.setValue('goals', goals!)
  }, [goals])

  useEffect(() => {
    setFilteredPlayersTeam_1(playersTeam_1)
    setFilteredPlayersTeam_2(playersTeam_2) // si estaba en walkover reinicia el listado automaticamente
  }, [playersTeam_1])

  useEffect(() => {
    setFilteredPlayersTeam_2(playersTeam_2)
    setFilteredPlayersTeam_1(playersTeam_1) // si estaba en walkover reinicia el listado automaticamente
  }, [playersTeam_2])

  useEffect(() => {
    form.setValue('walkover', walkover!)
  }, [walkover])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'
      >
        <div className='flex items-center gap-2'>
          <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
            <Swords className='text-white' size={30} />
          </span>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            Agregar Equipos Fixture
          </h1>
        </div>

        {/* torneo */}
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
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
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
                          }}
                        >
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
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between text-xs',
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
                              setWalkover([])

                              form.setValue('team_1', team.id)
                              setPlayersTeam_1(
                                players
                                  .filter(player => player.team_id === team.id)
                                  .map(players => ({
                                    ...players,
                                    goals: 0,
                                    yellow_cards: 0,
                                    red_cards: false,
                                    motivo: ''
                                  }))
                              )
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
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between text-xs',
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
                              setWalkover([])

                              form.setValue('team_2', team.id)
                              setPlayersTeam_2(
                                players
                                  .filter(player => player.team_id === team.id)
                                  .map(players => ({
                                    ...players,
                                    goals: 0,
                                    yellow_cards: 0,
                                    red_cards: false,
                                    motivo: ''
                                  }))
                              )
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
                        )}
                      >
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
                          field.value ? format(field.value, 'HH:mm') : undefined
                        }
                        onChange={e => {
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
                className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}
              >
                {playersTeam_1?.length > 0 ? (
                  <>
                    <Separator />
                    <span
                      className={`flex flex-col items-center relative ${
                        filteredPlayersTeam_1 && 'top-5'
                      }`}
                    >
                      <Toggle
                        variant={'outline'}
                        size={'sm'}
                        pressed={toggle1}
                        className='left-0 top-0 h-5 text-muted-foreground'
                        onPressedChange={e => {
                          setToggle1(!toggle1)

                          // agregamos el id del equipo en el array de walkover
                          e
                            ? setWalkover([
                                ...walkover,
                                playersTeam_1[0].team_id!
                              ])
                            : setWalkover([
                                ...walkover.filter(
                                  id => id !== playersTeam_1[0].team_id
                                )
                              ])

                          // filtramos el listado del otro equipo a solo porteros
                          updatePlayersList(
                            e,
                            playersTeam_1,
                            setFilteredPlayersTeam_1,
                            playersTeam_2!,
                            setFilteredPlayersTeam_2
                          )

                          // limpiamos los datos modificados
                          setModifiedRows([])
                        }}
                      >
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
                className={`w-full flex justify-center items-center gap-2 text-xs relative z-10`}
              >
                {playersTeam_2?.length > 0 ? (
                  <>
                    <Separator />
                    <span
                      className={`flex flex-col items-center relative ${
                        filteredPlayersTeam_2 && 'top-5'
                      }`}
                    >
                      <Toggle
                        variant={'outline'}
                        size={'sm'}
                        pressed={toggle2}
                        className='left-0 top-0 h-5 text-muted-foreground'
                        onPressedChange={e => {
                          setToggle2(!toggle2)

                          // agregamos el id del equipo en el array de walkover
                          e
                            ? setWalkover([
                                ...walkover,
                                playersTeam_2[0].team_id!
                              ])
                            : setWalkover([
                                ...walkover.filter(
                                  id => id !== playersTeam_2[0].team_id
                                )
                              ])

                          // filtramos el listado del otro equipo a solo porteros
                          updatePlayersList(
                            e,
                            playersTeam_2,
                            setFilteredPlayersTeam_2,
                            playersTeam_1!,
                            setFilteredPlayersTeam_1
                          )

                          // limpiamos los datos modificados
                          setModifiedRows([])
                        }}
                      >
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
            className={`w-full flex justify-center items-center gap-2 text-xs relative`}
          >
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
            className={`w-full flex justify-center items-center gap-2 text-xs relative `}
          >
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
          name='walkover'
          render={({ field }) => (
            <FormItem className='rounded bg-white'>
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
          >
            Agregar
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default FixtureTeamsForm