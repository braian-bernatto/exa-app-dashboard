import { FixtureDetailsColumn } from './columns'
import { LocateFixed } from 'lucide-react'

interface CellCanchaProps {
  data: FixtureDetailsColumn
}

const CellCancha = ({ data }: CellCanchaProps) => {
  return (
    <span className="flex gap-2">
      {data.cancha_nro}
      <LocateFixed width={18} className="text-muted-foreground" />
    </span>
  )
}

export default CellCancha
