import { Checkbox } from '@/components/ui/checkbox'
import { useEffect, useState } from 'react'

const TableCellRedCard = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onCheckedChange = () => {
    table.options.meta?.updateData(row.index, column.id, !value)
    table.options.meta?.addModifiedRows({ ...row.original, red_cards: !value })
  }

  return <Checkbox checked={value} onCheckedChange={onCheckedChange} />
}

export default TableCellRedCard
