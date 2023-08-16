'use client'
import Image from 'next/image'
import React, { useState } from 'react'

interface PreviewImageFileProps {
  file: Blob
}

const PreviewImageFile = ({ file }: PreviewImageFileProps) => {
  const [preview, setPreview] = useState<any>('')
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setPreview(reader.result)
    }
  }
  return (
    file && (
      <div className='flex flex-col items-center justify-between text-xs shadow rounded border px-1 py-1 w-32'>
        <Image width={100} height={100} alt='image preview' src={preview} />
      </div>
    )
  )
}

export default PreviewImageFile
