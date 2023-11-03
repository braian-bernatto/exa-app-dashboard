'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import FixtureClient from './fixtureClient'
import { createClient } from '@/utils/supabaseBrowser'
import { useRouter } from 'next/navigation'

export const revalidate = 0

interface TorneoClientProps {
  id: string
  teams: any[]
  fases: any[]
}

const TorneoClient = ({ id, teams, fases }: TorneoClientProps) => {
  const supabase = createClient()
  const router = useRouter()
  const [faseSelected, setFaseSelected] = useState(fases[0].fase_nro)
  const [fixtures, setFixtures] = useState<any[]>([])
  const [fixtureSelected, setFixtureSelected] = useState()

  const getFixtures = async () => {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*, locations(id, name)')
      .eq('torneo_id', id)
      .eq('fase_nro', faseSelected)
      .order('order', { ascending: true })

    console.log({ data, id, faseSelected })
    if (data) {
      setFixtures(data)
    }
  }

  useEffect(() => {
    if (faseSelected) {
      getFixtures()
    }
  }, [faseSelected])

  return (
    <div className='flex flex-wrap gap-20 w-full'>
      {/* teams */}
      {teams.length > 0 && (
        <div className='flex flex-col gap-2 w-[150px]'>
          <h2 className='w-full text-center px-2 rounded shadow bg-white'>
            Equipos
          </h2>
          <div className='grid grid-cols-2 gap-5'>
            {teams.map(team => (
              <div
                key={team.id}
                className='flex-1 flex flex-col jutify-center items-center'>
                <span className='w-10 h-10 relative'>
                  {team.image_url && (
                    <Image
                      src={team.image_url}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
                <h2 className='text-xs capitalize text-center text-muted-foreground'>
                  {team.name}
                </h2>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* fases */}
      {fases.length > 0 && (
        <div className='flex flex-col gap-2 w-[150px]'>
          <h2 className='w-full text-center px-2 rounded shadow bg-white'>
            Fases
          </h2>
          <div className='flex flex-col gap-5'>
            {fases.length > 0 &&
              fases.map(fase => (
                <Button
                  key={fase.fase_nro}
                  variant={
                    faseSelected === fase.fase_nro ? 'default' : 'outline'
                  }
                  onClick={() => setFaseSelected(fase.fase_nro)}
                  className='flex h-full gap-5 text-xs'>
                  <h2 className='capitalize text-center text-xl rounded-full'>
                    {fase.fase_nro}
                  </h2>
                  <ul className='flex flex-1 flex-col gap-1 justify-center uppercase text-[8px]'>
                    <li className='px-2 rounded shadow border'>
                      {fase.fases!.name}
                    </li>
                    <li className='px-2 rounded shadow border'>
                      {fase.tipo_partido!.name}
                    </li>
                  </ul>
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* fixtures */}
      {fixtures.length > 0 && (
        <div className='flex flex-col gap-2 w-[150px]'>
          <h2 className='w-full text-center px-2 rounded shadow bg-white'>
            Fixtures
          </h2>
          <div className='flex flex-col gap-5'>
            {fixtures.length > 0 &&
              fixtures.map(fixture => (
                <Button
                  key={fixture.id}
                  variant={
                    fixtureSelected === fixture.id ? 'default' : 'outline'
                  }
                  onClick={() => setFixtureSelected(fixture.id)}
                  className='flex flex-col h-full gap-1 text-xs'>
                  <h2 className='capitalize text-center text-md rounded-full'>
                    {fixture.name}
                  </h2>
                  <ul className='flex flex-1 flex-col gap-1 justify-center uppercase text-[8px]'>
                    <li className='px-2 rounded shadow border'>
                      {fixture.locations.name}
                    </li>
                  </ul>
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TorneoClient
