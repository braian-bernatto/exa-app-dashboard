import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

const TableCellGoals = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState<number>(0)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.addModifiedRows({
      ...row.original,
      goals: value
    })
  }

  return (
    <Input
      type='number'
      min={0}
      value={value}
      onChange={e => setValue(parseInt(e.target.value))}
      onBlur={onBlur}
      className={`min-w-[60px] w-full text-center text-xs h-[30px] ${
        value === 0 ? 'text-white' : ''
      }`}
    />
  )
}

export default TableCellGoals
