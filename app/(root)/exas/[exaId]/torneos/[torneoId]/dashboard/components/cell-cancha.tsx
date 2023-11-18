import { FixtureDetailsColumn } from './columns'
import { LocateFixed, LocateOff } from 'lucide-react'

interface CellCanchaProps {
  data: FixtureDetailsColumn
}

const CellCancha = ({ data }: CellCanchaProps) => {
  return (
    <span className='flex gap-2 items-center'>
      {data.cancha_nro ? (
        <>
          {data.cancha_nro}
          <LocateFixed width={18} className='text-muted-foreground' />
        </>
      ) : (
        <LocateOff width={18} className='text-muted-foreground' />
      )}
    </span>
  )
}

export default CellCancha
