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

  const { data, error } = await supabase
    .from('exas')
    .select('name, logo_url')
    .eq('id', params.exaId)
    .single()

  return (
    <div className='flex flex-col items-center'>
      <ExaForm initialData={data} />
    </div>
  )
}

export default ExaPage
