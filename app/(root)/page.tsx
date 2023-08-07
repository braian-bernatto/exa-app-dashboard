import getCountries from '@/actions/getCountries'
import getExas from '@/actions/getExas'
import getFoot from '@/actions/getFoot'
import getPositions from '@/actions/getPositions'
import getTeams from '@/actions/getTeams'
import ExaForm from '@/components/ExaForm'
import Navbar from '@/components/Navbar'
import PlayerForm from '@/components/PlayerForm'
import TeamForm from '@/components/TeamForm'

export default async function Home() {
  const teams = await getTeams()
  const positions = await getPositions()
  const countries = await getCountries()
  const exas = await getExas()
  const foot = await getFoot()

  return (
    <div className='px-8 xl:px-0'>
      <Navbar />
      <div className='w-full bg-neutral-100 my-10 rounded-md max-w-7xl min-h-[75vh] overflow-auto p-4 sm:p-10 gap-2 flex flex-wrap justify-center items-start'>
        {/* <ExaForm /> */}
        {/* <TeamForm exas={exas} /> */}
        <PlayerForm
          teams={teams}
          positions={positions}
          countries={countries}
          foot={foot}
        />
      </div>
      <footer className='flex items-center w-full justify-between mx-auto max-w-7xl'>
        <div className='text-sm'>
          <strong>Bernatto Inc</strong> |{' '}
          <span>&copy; Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
