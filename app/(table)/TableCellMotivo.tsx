import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

const TableCellMotivo = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.setModifiedRows({ ...row.original, motivo: value })
  }

  return (
    <Input
      className='min-w-[150px] text-xs h-[30px]'
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  )
}

export default TableCellMotivo
