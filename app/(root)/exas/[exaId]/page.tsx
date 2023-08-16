import ExaForm from './components/ExaForm'
import { createClient } from '@/utils/supabaseBrowser'

const ExaPage = async ({
  params
}: {
  params: {
    exaId: string
  }
}) => {
  const supabase = createClient()

  const { data: exa, error } = await supabase
    .from('exas')
    .select('name, logo_url')
    .eq('id', params.exaId)
    .single()

  let data

  if (exa) {
    const { data: storage } = supabase.storage
      .from('exas')
      .getPublicUrl(exa.logo_url!)
    if (storage) {
      data = { ...exa, public_logo_url: storage.publicUrl }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <ExaForm initialData={data} />
    </div>
  )
}

export default ExaPage
