import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

const TableCellGoals = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.setModifiedRows({
      ...row.original,
      goals: parseInt(value)
    })
  }

  return (
    <Input
      type='number'
      min={0}
      className='min-w-[60px] w-full text-center text-xs h-[30px]'
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  )
}

export default TableCellGoals
