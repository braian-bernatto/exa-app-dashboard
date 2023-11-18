import { format, parseISO } from 'date-fns'
import { FixtureDetailsColumn } from './columns'
import { Calendar, CalendarOff, Clock3 } from 'lucide-react'

interface CellDateProps {
  data: FixtureDetailsColumn
}

const CellDate = ({ data }: CellDateProps) => {
  return (
    <span className='flex flex-col gap-1'>
      {data.date ? (
        <>
          <span className='bg-white flex items-center text-xs gap-2 px-2 rounded'>
            <Calendar width={18} className='text-muted-foreground' />
            {format(parseISO(data.date), 'dd/MM/yyyy')}
          </span>
          <span className='bg-white flex items-center text-xs gap-2 px-2 rounded'>
            <Clock3 width={18} className='text-muted-foreground' />
            {format(parseISO(data.date), 'HH:mm')}
          </span>
        </>
      ) : (
        <span className='bg-white flex items-center text-xs gap-2 px-2 rounded'>
          <CalendarOff width={18} className='text-muted-foreground' /> A definir
        </span>
      )}
    </span>
  )
}

export default CellDate
