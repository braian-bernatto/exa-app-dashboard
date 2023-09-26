import { Input } from '@/components/ui/input'
import { MinusCircle, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const TableCellYellowCard = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState<number>(0)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const updateModifyRows = (value: number) => {
    table.options.meta?.updateData(row.index, column.id, value)
    table.options.meta?.addModifiedRows({
      ...row.original,
      yellow_cards: value
    })
  }

  return (
    <span className='relative flex items-center w-[70px] justify-center mr-5'>
      <button
        disabled={value === 0}
        type='button'
        onClick={() => {
          if (value > 0) {
            setValue(value - 1)
            updateModifyRows(value - 1)
          }
        }}>
        <MinusCircle className='text-muted-foreground' />
      </button>
      <Input
        type='number'
        min={0}
        max={2}
        value={value}
        onChange={e => {
          setValue(parseInt(e.target.value))
          updateModifyRows(parseInt(e.target.value))
        }}
        onClick={e => e.currentTarget.select()}
        className={`w-[70px] text-center text-xs h-[30px] ${
          value === 0 ? 'text-muted-foreground' : ''
        }`}
      />
      <button
        type='button'
        disabled={value === 2}
        onClick={() => {
          if (value < 2) {
            setValue(value + 1)
            updateModifyRows(value + 1)
          }
        }}>
        <PlusCircle className='text-muted-foreground' />
      </button>
    </span>
  )
}

export default TableCellYellowCard
