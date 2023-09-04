import { format, parseISO } from 'date-fns'
import { FixtureDetailsColumn } from './columns'
import { Clock3 } from 'lucide-react'

interface CellDateProps {
  data: FixtureDetailsColumn
}

const CellDate = ({ data }: CellDateProps) => {
  return (
    <span className="flex gap-2 items-center">
      {format(parseISO(data.date), 'dd/MM/yyyy')}
      <span className="bg-white flex flex-col justify-center items-center shadow px-2 rounded border">
        {format(parseISO(data.date), 'HH:mm')}
        <Clock3 width={18} className="text-muted-foreground" />
      </span>
    </span>
  )
}

export default CellDate
