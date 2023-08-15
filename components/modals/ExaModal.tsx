'use client'
import { useExaModal } from '@/hooks/useExaModal'
import Modal from '../Modal'

const ExaModal = () => {
  const ExaModal = useExaModal()
  return (
    <Modal
      title='Crear Jugador'
      description='Agregar un pysatronco mas a la lista'
      isOpen={ExaModal.isOpen}
      onClose={ExaModal.onClose}
    >
      some thing
    </Modal>
  )
}

export default ExaModal
