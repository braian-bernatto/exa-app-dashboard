import Navbar from '@/components/Navbar'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className='px-8 xl:px-0'>
      <Navbar />
      <div className='w-full bg-neutral-100 my-10 rounded-md max-w-7xl min-h-[75vh] overflow-auto p-4 sm:p-10 gap-10 flex flex-wrap justify-center items-start mx-auto'>
        {children}
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
