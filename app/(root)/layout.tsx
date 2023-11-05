import Navbar from '@/components/Navbar'

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className='px-8 xl:px-0 overflow-hidden relative'>
      <Navbar />
      <div className='w-full bg-neutral-100 my-28 rounded-md max-w-7xl min-h-[75vh] overflow-auto p-4 sm:p-10 mx-auto'>
        {children}
      </div>
      <footer className='flex items-center w-full justify-between mx-auto max-w-7xl'>
        <div className='text-sm'>
          <a
            href='https://braian-bernatto.github.io/portfolio/'
            target='_blank'
            className='font-bold hover:underline'>
            Bernatto Inc.
          </a>{' '}
          | <span>&copy; Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
