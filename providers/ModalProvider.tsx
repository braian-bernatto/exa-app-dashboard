'use client'

import { useEffect, useState } from 'react'

import ExaModal from '@/components/modals/ExaModal'

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <ExaModal />
    </>
  )
}

export default ModalProvider
