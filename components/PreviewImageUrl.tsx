'use client'
import Image from 'next/image'

interface PreviewImageUrlProps {
  url: string
}

const PreviewImageUrl = ({ url }: PreviewImageUrlProps) => {
  return (
    <div className='flex flex-col items-center justify-between text-xs shadow rounded border px-1 py-1 w-32'>
      <Image width={100} height={100} alt='image preview' src={url} />
    </div>
  )
}

export default PreviewImageUrl
