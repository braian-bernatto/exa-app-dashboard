import ExaClient from './components/client'

export default async function ExasPage() {
  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <ExaClient />
      </div>
    </div>
  )
}
