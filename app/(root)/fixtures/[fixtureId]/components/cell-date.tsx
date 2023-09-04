import { format, parseISO } from 'date-fns'
import { FixtureDetailsColumn } from './columns'
import { Clock3 } from 'lucide-react'

interface CellDateProps {
  data: FixtureDetailsColumn
}

const CellDate = ({ data }: CellDateProps) => {
  return (
    <span className="flex gap-1">
      {format(parseISO(data.date), 'dd/MM/yyyy | HH:mm')}
      <Clock3 width={18} className="text-muted-foreground" />
    </span>
  )
}

export default CellDate
