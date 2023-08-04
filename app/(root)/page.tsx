import Navbar from '@/components/Navbar'
import PlayerForm from '@/components/PlayerForm'
import TeamForm from '@/components/TeamForm'

export default function Home() {
  return (
    <div className='px-8 xl:px-0'>
      <Navbar />
      <div className='w-full mx-auto bg-neutral-100 my-10 rounded-md max-w-7xl min-h-[75vh] overflow-auto p-4 sm:p-10 grid sm:grid-cols-2 gap-2 place-items-center'>
        <TeamForm />
        <PlayerForm />
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
