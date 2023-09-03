import { format, parseISO } from 'date-fns'
import { FixtureDetailsColumn } from './columns'

interface CellDateProps {
  data: FixtureDetailsColumn
}

const CellDate = ({ data }: CellDateProps) => {
  return format(parseISO(data.date), 'dd/MM/yyyy | HH:mm') + ' Hs'
}

export default CellDate
