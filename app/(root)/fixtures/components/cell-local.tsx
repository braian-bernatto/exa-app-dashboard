import { LocateFixed, MapPin, MapPinOff } from 'lucide-react'
import { FixtureColumn } from './columns'

interface CellLocalProps {
  data: FixtureColumn
}

const CellLocal = ({ data }: CellLocalProps) => {
  return (
    <span className="flex gap-2">
      {data.locations ? (
        <>
          <MapPin className="text-muted-foreground" />
          {data.locations.name}
        </>
      ) : (
        <MapPinOff className="text-muted-foreground" />
      )}
    </span>
  )
}

export default CellLocal
