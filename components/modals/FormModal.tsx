'use client'

import { useEffect, useState } from 'react'

import { Modal } from '@/components/ui/modal'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Modal title='' description='' isOpen={isOpen} onClose={onClose}>
      <div className='flex justify-center items-center w-full'>{children}</div>
    </Modal>
  )
}
