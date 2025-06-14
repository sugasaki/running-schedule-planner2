import { useRef, useEffect } from 'react'
import { HotTable } from '@handsontable/react'
import Handsontable from 'handsontable'
import { HotTableClass } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import { LocationCategory, ScheduleRow } from '../types'
import { useScheduleData } from '../hooks/useScheduleData'

// Register all Handsontable modules
registerAllModules()

const LOCATION_CATEGORIES: LocationCategory[] = [
  '集合', 'スタート', 'トイレ', 'コンビニ', '観光', '休憩', 'ゴール', '銭湯', '打上げ'
]

const getCategoryClassName = (category: LocationCategory): string => {
  switch (category) {
    case '集合': return 'bg-green-50'
    case 'スタート': return 'bg-blue-50'
    case 'ゴール': return 'bg-yellow-50'
    case 'トイレ': return 'bg-pink-50'
    default: return ''
  }
}

const RunningSchedulePlanner = () => {
  const hotRef = useRef<HotTableClass>(null)
  const { data, updateCell, addRow, removeRow, moveRow } = useScheduleData()

  const columns = [
    {
      data: 'location',
      title: '場所',
      type: 'text',
      width: 150,
    },
    {
      data: 'category',
      title: '区分',
      type: 'dropdown',
      source: LOCATION_CATEGORIES,
      width: 100,
    },
    {
      data: 'distance',
      title: '距離(km)',
      type: 'numeric',
      numericFormat: {
        pattern: '0.00'
      },
      width: 100,
    },
    {
      data: 'pace',
      title: 'ペース(分/km)',
      type: 'numeric',
      numericFormat: {
        pattern: '0.0'
      },
      width: 120,
    },
    {
      data: 'interval',
      title: '間隔(km)',
      type: 'numeric',
      readOnly: true,
      numericFormat: {
        pattern: '0.00'
      },
      width: 100,
      className: 'bg-gray-50',
    },
    {
      data: 'restTime',
      title: '休憩(分)',
      type: 'numeric',
      width: 100,
    },
    {
      data: 'date',
      title: '日付',
      type: 'text',
      readOnly: true,
      width: 80,
      className: 'bg-gray-50',
    },
    {
      data: 'arrivalTime',
      title: '到着',
      type: 'text',
      readOnly: true,
      width: 80,
      className: 'bg-gray-50',
    },
    {
      data: 'departureTime',
      title: '出発',
      type: 'text',
      readOnly: true,
      width: 80,
      className: 'bg-gray-50',
    },
  ]

  const handleAfterChange = (changes: Handsontable.CellChange[] | null) => {
    if (!changes) return

    changes.forEach(([row, prop, , newValue]) => {
      if (typeof row === 'number' && typeof prop === 'string') {
        updateCell(row, prop as keyof ScheduleRow, newValue)
      }
    })
  }

  const handleAfterRowMove = (movedRows: number[], finalIndex: number) => {
    if (movedRows.length === 1 && movedRows[0] !== undefined) {
      moveRow(movedRows[0], finalIndex)
    }
  }

  const handleBeforeRowMove = (movedRows: number[]) => {
    return !movedRows.some(row => row < 2)
  }

  const handleAfterContextMenuShow = () => {
    // Context menu shown
  }

  useEffect(() => {
    const hot = hotRef.current?.hotInstance
    if (hot) {
      hot.loadData(data)
    }
  }, [data])

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          ※ 最初の2行（集合・スタート）は移動できません
        </p>
        <p className="text-sm text-gray-600">
          ※ 右クリックで行の追加・削除ができます
        </p>
      </div>
      
      <div className="overflow-auto border border-gray-300 rounded-lg">
        <HotTable
          ref={hotRef}
          data={data}
          columns={columns}
          rowHeaders={true}
          colHeaders={true}
          contextMenu={{
            items: {
              'row_above': {
                name: '上に行を追加',
                callback: () => {
                  const selected = hotRef.current?.hotInstance?.getSelected()
                  if (selected && selected[0]) {
                    const row = selected[0][0]
                    addRow(row - 1)
                  }
                }
              },
              'row_below': {
                name: '下に行を追加',
                callback: () => {
                  const selected = hotRef.current?.hotInstance?.getSelected()
                  if (selected && selected[0]) {
                    const row = selected[0][0]
                    addRow(row)
                  }
                }
              },
              'sep1': '---------',
              'remove_row': {
                name: '行を削除',
                disabled: function() {
                  const selected = this.getSelected()
                  return !selected || !selected[0] || selected[0][0] < 2
                },
                callback: () => {
                  const selected = hotRef.current?.hotInstance?.getSelected()
                  if (selected && selected[0] && selected[0][0] >= 2) {
                    const row = selected[0][0]
                    removeRow(row)
                  }
                }
              }
            }
          }}
          manualRowMove={true}
          beforeRowMove={handleBeforeRowMove}
          afterRowMove={handleAfterRowMove}
          afterChange={handleAfterChange}
          afterContextMenuShow={handleAfterContextMenuShow}
          cells={(row) => {
            const cellProperties: Partial<Handsontable.CellProperties> = {}
            const rowData = data[row]
            
            if (rowData) {
              if (rowData.hasError) {
                cellProperties.className = 'bg-red-100'
              } else {
                const categoryClass = getCategoryClassName(rowData.category)
                if (categoryClass) {
                  cellProperties.className = categoryClass
                }
              }
            }
            
            return cellProperties
          }}
          licenseKey="non-commercial-and-evaluation"
          height="auto"
          width="100%"
          stretchH="all"
        />
      </div>
    </div>
  )
}

export default RunningSchedulePlanner