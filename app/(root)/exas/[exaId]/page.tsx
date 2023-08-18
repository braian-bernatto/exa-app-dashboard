import ExaForm from './components/ExaForm'
import { createClient } from '@/utils/supabaseServer'

export const revalidate = 0

const ExaPage = async ({
  params
}: {
  params: {
    exaId: string
  }
}) => {
  const supabase = createClient()

  const { data: exa } = await supabase
    .from('exas')
    .select('name, image_url')
    .eq('id', params.exaId)
    .single()

  let data

  if (exa) {
    const { data: storage } = supabase.storage
      .from('exas')
      .getPublicUrl(exa.image_url!)
    if (storage) {
      data = { ...exa, public_image_url: storage.publicUrl }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <ExaForm initialData={data} />
    </div>
  )
}

export default ExaPage
