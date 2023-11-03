import Image from 'next/image'
import { useSupabase } from '@/providers/SupabaseProvider'
import Link from 'next/link'
import Actions from '../../../../../../components/actions'

interface TorneoProps {
  data: any
}

const Torneo = ({ data }: TorneoProps) => {
  const { supabase } = useSupabase()

  const { data: url } = supabase.storage
    .from('torneos')
    .getPublicUrl(data.image_url!)

  return (
    <article className='relative'>
      <Link
        href={`torneos/${data.id}/dashboard`}
        className='rounded bg-white relative h-[150px] w-[150px] shadow flex flex-col items-center justify-center p-2 gap-2'>
        <span className='relative h-[100px] w-[100px]'>
          <Image
            src={url.publicUrl}
            fill
            className='object-contain'
            alt='logo'
          />
        </span>
        <span className='h-10 flex items-center justify-center w-full overflow-x-auto relative'>
          <h2 className='text-xs text-center uppercase'>{data.name}</h2>
        </span>
      </Link>
      <span className='absolute -top-2 -right-2 shadow rounded bg-white z-40'>
        <Actions
          data={data}
          table='torneos'
          url={`/exas/${data.exa_id}/torneos`}
        />
      </span>
    </article>
  )
}

export default Torneo
