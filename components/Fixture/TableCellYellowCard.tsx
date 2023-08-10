import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

const TableCellYellowCard = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.addModifiedRows({
      ...row.original,
      yellow_cards: parseInt(value)
    })
  }

  return (
    <Input
      value={value}
      type='number'
      min={0}
      max={2}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
      className='min-w-[60px] w-full text-center text-xs h-[30px]'
    />
  )
}

export default TableCellYellowCard
