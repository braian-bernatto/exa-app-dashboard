import { MapPin, MapPinOff } from 'lucide-react'
import { FixtureColumn } from './columns'

interface CellLocalProps {
  data: FixtureColumn
}

const CellLocal = ({ data }: CellLocalProps) => {
  return (
    <span className='flex gap-2 items-center'>
      {data.locations ? (
        <>
          <span className='flex-none'>
            <MapPin className='text-muted-foreground' />
          </span>
          {data.locations.name}
        </>
      ) : (
        <MapPinOff className='text-muted-foreground' />
      )}
    </span>
  )
}

export default CellLocal
