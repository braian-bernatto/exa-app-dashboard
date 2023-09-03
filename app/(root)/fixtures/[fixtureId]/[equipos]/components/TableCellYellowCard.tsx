import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

const TableCellYellowCard = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState<number>(0)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.addModifiedRows({
      ...row.original,
      yellow_cards: value
    })
  }

  return (
    <Input
      type='number'
      min={0}
      max={2}
      value={value}
      onChange={e => setValue(parseInt(e.target.value))}
      onBlur={onBlur}
      onClick={e => e.currentTarget.select()}
      className={`w-[70px] text-center text-xs h-[30px] ${
        value === 0 ? 'text-muted-foreground' : ''
      }`}
    />
  )
}

export default TableCellYellowCard
