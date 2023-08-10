'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Locations, Players, Teams } from '@/types'
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
  ChevronsUpDownIcon,
  MapPin,
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

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Obligatorio' }),
    team_1: z.coerce.number(),
    team_2: z.coerce.number(),
    date: z.date({ required_error: 'Obligatorio' }),
    location_id: z.coerce.number().optional(),
    cancha_nro: z.coerce.number().optional()
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

interface FixtureFormProps {
  teams: Teams[]
  players: Players[]
  locations: Locations[]
}

interface PlayersFixture extends Players {
  goals: number
  yellow_cards: number
  red_cards: boolean
  motivo: string
}

const FixtureForm = ({ teams, players, locations }: FixtureFormProps) => {
  const router = useRouter()
  const supabase = useSupabase()
  const [loading, setLoading] = useState<boolean>(false)
  const [hour, setHour] = useState<string>('')
  const [goals, setGoals] = useState()
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      team_1: undefined,
      team_2: undefined,
      date: undefined,
      location_id: undefined,
      cancha_nro: 0
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
        prev.push({ [curr.team_id]: curr.goals })
        return prev
      }

      // Busca si existe el item en el array y suma los goles
      if (prev[0].hasOwnProperty([curr.team_id])) {
        prev[0][curr.team_id] = prev[0][curr.team_id] + curr.goals
      } else {
        // Si no encontro el dato en el array entonces se agrega como nuevo
        prev = [{ ...prev[0], [curr.team_id]: curr.goals }]
      }

      return prev
    }, [])

    setGoals(totalCount[0])
  }

  useEffect(() => {
    countGoals()
  }, [modifiedRows])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Quitamos datos modificados de tabla del equipo sancionado
    // dejar el dato solo del portero si el otro equipo tuvo sancion

    console.log(values, modifiedRows)
    form.reset()
    // try {
    //   setLoading(true)
    //   const { name, logo } = values
    //   if (!name) {
    //     return toast.error('Faltan datos')
    //   }
    //   const uniqueID = uniqid()
    //   let imagePath = ''
    //   // upload image
    //   if (logo) {
    //     const { data: imageData, error: imageError } = await supabase.storage
    //       .from('torneos')
    //       .upload(`image-${name}-${uniqueID}`, logo, {
    //         cacheControl: '3600',
    //         upsert: false
    //       })
    //     if (imageError) {
    //       setLoading(false)
    //       return toast.error('No se pudo alzar la imagen')
    //     }
    //     imagePath = imageData?.path!
    //   }
    //   const { error: supabaseError } = await supabase.from('torneos').insert({
    //     name,
    //     logo_url: imagePath
    //   })
    //   if (supabaseError) {
    //     setLoading(false)
    //     return toast.error('No se pudo grabar')
    //   }
    //   router.refresh()
    //   setLoading(false)
    //   form.reset()
    //   toast.success('Torneo creado!')
    // } catch (error) {
    //   toast.error('Hubo un error')
    // } finally {
    //   setLoading(false)
    // }
  }

  const getTeamLogo = (filteredPlayers: Players[]) => {
    const url = teams.filter(team => team.id === filteredPlayers[0].team_id)[0]
      .logo_url

    if (url) {
      return <Image src={url} width={50} height={50} alt='team logo' />
    }
  }

  const handleToggle = (toggled: boolean, listado: PlayersFixture[]) => {
    if (toggled) {
      setWalkover([...walkover, listado[0].team_id!])
      return
    }

    const filtered = walkover.filter(id => id !== listado[0].team_id!)

    setWalkover(filtered)
  }

  const updatePlayersList = (
    bool: boolean,
    setPlayers: (list: PlayersFixture[] | undefined) => void,
    initialList: PlayersFixture[],
    targetWalkover: boolean
  ) => {
    bool
      ? setPlayers(initialList.filter(player => player.position_id === 'POR'))
      : targetWalkover
      ? setPlayers(undefined)
      : setPlayers(initialList)
  }

  const checkWalkoverId = (id: number) => {
    const exists = walkover.indexOf(id)
    if (exists === -1) return false

    return true
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full max-w-xs rounded bg-white py-3 px-4 shadow gap-5 justify-center'
      >
        <div className='flex gap-2'>
          <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
            <Swords
              className='text-white'
              size={30}
              onClick={() => {
                console.log({ modifiedRows, walkover, filteredPlayersTeam_1 })
              }}
            />
          </span>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            Agregar Fixture
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
                              form.setValue('team_1', team.id)
                              setPlayersTeam_1(
                                players
                                  .filter(player => player.team_id === team.id)
                                  .map(players => ({
                                    ...players,
                                    goals: 0,
                                    yellow_cards: 0,
                                    red_cards: false,
                                    motivo: 'tembolos'
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
                            className={`text-xs ${
                              form.getValues('team_1') === team.id
                                ? 'opacity-50 bg-slate-50'
                                : ''
                            }`}
                            disabled={form.getValues('team_1') === team.id}
                            value={team.name!}
                            key={team.id}
                            onSelect={() => {
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

        <div className='flex w-full gap-1'>
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
                        )}
                      >
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
                  <PopoverContent className='max-w-[220px] p-0 sm:max-h-[500px] max-h-[300px] overflow-y-auto'>
                    <Command>
                      <CommandInput placeholder='Buscador de posiciones...' />
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {locations.map(location => (
                          <CommandItem
                            value={location.name!}
                            key={location.id}
                            onSelect={() => {
                              form.setValue('location_id', location.id)
                            }}
                          >
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
                <Separator />
                {playersTeam_1?.length ? (
                  <span className='flex flex-col items-center'>
                    <Toggle
                      variant={'outline'}
                      size={'sm'}
                      className='left-0 top-0 h-5 text-muted-foreground'
                      onPressedChange={e => {
                        handleToggle(e, playersTeam_1) // agregamos el id del equipo en el array de walkover
                        updatePlayersList(
                          e,
                          setFilteredPlayersTeam_2,
                          playersTeam_2!,
                          playersTeam_2?.length
                            ? checkWalkoverId(playersTeam_2[0].team_id!)
                            : false
                        ) // filtramos solo porteros
                      }}
                    >
                      Walkover
                    </Toggle>
                    {getTeamLogo(playersTeam_1)}
                  </span>
                ) : (
                  <p className='flex-none'>Equipo 1</p>
                )}
                <Separator />
              </div>
              {(filteredPlayersTeam_1 ||
                !checkWalkoverId(playersTeam_1[0].team_id!)) && (
                <div className={`relative -top-5`}>
                  <DataTable
                    columns={Columns}
                    intialValues={filteredPlayersTeam_1 || playersTeam_1}
                    addModifiedRows={addModifiedRows}
                  />
                </div>
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
                <Separator />
                {playersTeam_2?.length ? (
                  <span className='flex flex-col items-center'>
                    <Toggle
                      variant={'outline'}
                      size={'sm'}
                      className='left-0 top-0 h-5 text-muted-foreground'
                      onPressedChange={e => {
                        handleToggle(e, playersTeam_2) // agregamos el id del equipo en el array de walkover
                        updatePlayersList(
                          e,
                          setFilteredPlayersTeam_1,
                          playersTeam_1!,
                          playersTeam_1?.length
                            ? checkWalkoverId(playersTeam_1[0].team_id!)
                            : false
                        ) // filtramos solo porteros
                      }}
                    >
                      Walkover
                    </Toggle>
                    {getTeamLogo(playersTeam_2)}
                  </span>
                ) : (
                  <p className='flex-none'>Equipo 2</p>
                )}
                <Separator />
              </div>
              {(filteredPlayersTeam_2 ||
                !checkWalkoverId(playersTeam_2[0].team_id!)) && (
                <div className={`relative -top-5`}>
                  <DataTable
                    columns={Columns}
                    intialValues={filteredPlayersTeam_2 || playersTeam_2}
                    addModifiedRows={addModifiedRows}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Resultado */}
        <div className='flex justify-center items-center overflow-hidden w-full'>
          <div
            className={`w-full flex justify-center items-center gap-2 text-xs relative`}
          >
            {playersTeam_1?.length ? (
              getTeamLogo(playersTeam_1)
            ) : (
              <p className='flex-none'>Equipo 1</p>
            )}
          </div>
          <h2 className='text-4xl text-muted-foreground text-center flex-none'>
            {goals && playersTeam_1?.length
              ? goals[playersTeam_1[0].team_id!] || 0
              : 0}
            -
            {goals && playersTeam_2?.length
              ? goals[playersTeam_2[0].team_id!] || 0
              : 0}
          </h2>
          <div
            className={`w-full flex justify-center items-center gap-2 text-xs relative `}
          >
            {playersTeam_2?.length ? (
              getTeamLogo(playersTeam_2)
            ) : (
              <p className='flex-none'>Equipo 2</p>
            )}
          </div>
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

export default FixtureForm
