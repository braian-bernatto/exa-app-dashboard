import { Checkbox } from '@/components/ui/checkbox'
import { useEffect, useState } from 'react'

const TableCellPresent = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState(true)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onCheckedChange = () => {
    table.options.meta?.updateData(row.index, column.id, !value)
    table.options.meta?.addModifiedRows({ ...row.original, is_present: !value })
  }

  return <Checkbox checked={value} onCheckedChange={onCheckedChange} />
}

export default TableCellPresent
