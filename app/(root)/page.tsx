import AuthForm from '@/components/AuthForm'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className='px-8 xl:px-0'>
      <Navbar />
      <div className='w-full mx-auto bg-neutral-100 my-10 rounded-md max-w-7xl flex items-center justify-center h-[80vh]'>
        Main Page
      </div>
      <footer className='flex items-center w-full justify-between mx-auto max-w-7xl'>
        <div className=''>
          <strong>Bernatto Inc</strong> |{' '}
          <span>&copy; Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
