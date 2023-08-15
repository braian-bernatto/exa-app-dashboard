import getExas from '@/actions/getExas'
import TeamForm from '@/components/TeamForm'

export default async function EquiposPage() {
  const exas = await getExas()
  return <TeamForm exas={exas} />
}
