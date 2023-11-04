'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabaseBrowser'
import FixtureDetailsClient from './fixtureClient'
import { Fases, Fixtures, Locations, TiposPartido } from '@/types'
import FixtureForm from './FixtureForm'
import { Plus } from 'lucide-react'
import { FormModal } from '@/components/modals/FormModal'
import FixtureActions from './fixtureActions'
import FaseForm from './FaseForm'
import { getTorneoFasesClient } from '@/actions/getTorneoFasesClient'
import FaseActions from './faseActions'

export const revalidate = 0

interface TorneoClientProps {
  id: string
  teams: any[]
  torneoFases: any[]
  locations: Locations[]
  fases: Fases[]
  tiposPartido: TiposPartido[]
}

const TorneoClient = ({
  id,
  teams,
  torneoFases,
  locations,
  fases,
  tiposPartido
}: TorneoClientProps) => {
  const supabase = createClient()
  const [faseSelected, setFaseSelected] = useState()
  const [fasesList, setFasesList] = useState<any[]>(torneoFases)
  const [fixtures, setFixtures] = useState<any[]>([])
  const [fixtureDetails, setFixtureDetails] = useState<any[]>([])
  const [fixtureSelected, setFixtureSelected] = useState<Fixtures>()
  const [openFaseForm, setOpenFaseForm] = useState(false)
  const [openFixtureForm, setOpenFixtureForm] = useState(false)

  const getFixtures = async () => {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*, locations(id, name)')
      .eq('torneo_id', id)
      .eq('fase_nro', faseSelected)
      .order('order', { ascending: true })

    if (data) {
      setFixtures(data)
    }
  }

  const getFases = async () => {
    const data = await getTorneoFasesClient(id)
    if (data) {
      setFasesList(data)
    }
  }

  const getFixtureDetails = async (fixtureId: string) => {
    const { data: fixtureDetails } = await supabase
      .rpc('get_fixture_teams_by_fixture_id', { fixture: fixtureId })
      .order('date', { ascending: false })
    if (fixtureDetails) {
      setFixtureDetails(fixtureDetails)
    }
  }

  useEffect(() => {
    if (torneoFases.length > 0) {
      setFaseSelected(torneoFases[0].fase_nro)
    }
  }, [])

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

      <FormModal isOpen={openFaseForm} onClose={() => setOpenFaseForm(false)}>
        <FaseForm
          faseNro={
            torneoFases.length > 0
              ? torneoFases[torneoFases.length - 1].fase_nro + 1
              : 1
          }
          torneoId={id}
          fases={fases}
          tiposPartido={tiposPartido}
          getFases={getFases}
          setFaseSelected={setFaseSelected}
          setOpenFaseForm={setOpenFaseForm}
        />
      </FormModal>

      {fasesList.length > 0 && (
        <div className='flex flex-col gap-2 w-[150px]'>
          <h2 className='w-full text-center px-2 rounded shadow bg-white relative'>
            Fases
            <button
              className='rounded-full bg-white shadow-md p-1 absolute top-[50%] translate-y-[-50%] -right-4'
              onClick={() => {
                setOpenFaseForm(!openFaseForm)
              }}>
              <Plus />
            </button>
          </h2>
          <div className='flex flex-col gap-5'>
            {fasesList.length > 0 &&
              fasesList.map(fase => (
                <article
                  key={fase.fase_nro}
                  onClick={() => setFaseSelected(fase.fase_nro)}
                  className={`flex items-center h-full gap-5 text-xs relative cursor-pointer rounded-md p-3 px-4 bg-white text-center border transition hover:opacity-90 ${
                    faseSelected === fase.fase_nro
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-100'
                  }`}>
                  <span className='absolute top-[50%] translate-y-[-50%] -right-7 border bg-white rounded-full overflow-hidden'>
                    <FaseActions
                      data={fase}
                      setFormOpen={setOpenFixtureForm}
                      getFases={getFases}
                    />
                  </span>
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
                </article>
              ))}
          </div>
        </div>
      )}

      {/* fixtures */}
      {faseSelected && (
        <FormModal
          isOpen={openFixtureForm}
          onClose={() => setOpenFixtureForm(false)}>
          <FixtureForm
            faseNro={faseSelected}
            torneoId={id}
            initialData={fixtureSelected}
            locations={locations}
            getFixtures={getFixtures}
            setFixtureSelected={setFixtureSelected}
            setOpenFixtureForm={setOpenFixtureForm}
          />
        </FormModal>
      )}

      {fixtures.length > 0 && (
        <div className='flex flex-col gap-2 w-[150px] relative'>
          <h2 className='w-full text-center px-2 rounded shadow bg-white relative'>
            Fixtures
            <button
              className='rounded-full bg-white shadow-md p-1 absolute top-[50%] translate-y-[-50%] -right-4'
              onClick={() => {
                setFixtureSelected(undefined)
                setOpenFixtureForm(!openFixtureForm)
              }}>
              <Plus />
            </button>
          </h2>
          <div className='flex flex-col gap-5'>
            {fixtures.length > 0 &&
              fixtures.map(fixture => (
                <article
                  key={fixture.id}
                  onClick={() => {
                    setFixtureSelected(fixture)
                    getFixtureDetails(fixture.id)
                  }}
                  className={`flex flex-col h-full cursor-pointer gap-1 text-xs relative rounded-md p-3 px-4 bg-white text-center border transition hover:opacity-90 ${
                    fixtureSelected && fixtureSelected.id === fixture.id
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-100'
                  }`}>
                  <span className='absolute top-0 right-0'>
                    <FixtureActions
                      data={fixture}
                      setFormOpen={setOpenFixtureForm}
                      getFixtures={getFixtures}
                    />
                  </span>
                  <h2 className='capitalize text-center text-md rounded-full'>
                    {fixture.name}
                  </h2>
                  <ul className='flex flex-1 flex-col gap-1 justify-center uppercase text-[8px]'>
                    <li className='px-2 rounded shadow border'>
                      {fixture.locations
                        ? fixture.locations.name
                        : 'Local no definido'}
                    </li>
                  </ul>
                </article>
              ))}
          </div>
        </div>
      )}

      {/* fixtureClient */}
      {faseSelected && <FixtureDetailsClient fixtureDetails={fixtureDetails} />}
    </div>
  )
}

export default TorneoClient
