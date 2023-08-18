import Image from 'next/image'
import { PlayerColumn } from './columns'

interface CellCountryImageProps {
  data: PlayerColumn
}

const CellCountryImage = ({ data }: CellCountryImageProps) => {
  if (!data.country_iso2) {
    return data.country_iso2
  }
  return (
    <>
      <Image
        src={`https://flagcdn.com/w20/${data.country_iso2.toLowerCase()}.png`}
        width={20}
        height={20}
        alt='country flag'
        className='mr-2 flex-none'
      />
      {data.country_iso2}
    </>
  )
}

export default CellCountryImage
