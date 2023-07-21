import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className='flex justify-center flex-col gap-2 items-center'>
      <h1>Hello</h1>{' '}
      <Button variant='default' size={'sm'}>
        Button
      </Button>
    </div>
  )
}
