import { useState, useCallback, useRef } from 'react'
import { ScheduleRow } from '../types'
import { calculateIntervals, calculateTimes, validateDistances, generateRowId } from '../utils/calculations'

const INITIAL_DATA: ScheduleRow[] = [
  {
    id: '1',
    location: '日比谷',
    category: '集合',
    distance: 0,
    pace: 0,
    interval: 0,
    restTime: 0,
    date: '',
    arrivalTime: '9:00',
    departureTime: '9:00',
  },
  {
    id: '2',
    location: '日比谷公園',
    category: 'スタート',
    distance: 0,
    pace: 10,
    interval: 0,
    restTime: 30,
    date: '',
    arrivalTime: '9:30',
    departureTime: '9:30',
  },
  {
    id: '3',
    location: 'コンビニ',
    category: 'コンビニ',
    distance: 5,
    pace: 10,
    interval: 5,
    restTime: 5,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '4',
    location: '根津神社のつつじ祭り',
    category: '観光',
    distance: 6.36,
    pace: 10,
    interval: 1.36,
    restTime: 15,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '5',
    location: '谷中銀座',
    category: '観光',
    distance: 7.59,
    pace: 10,
    interval: 1.23,
    restTime: 5,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '6',
    location: '肉まん研究所',
    category: '休憩',
    distance: 9.4,
    pace: 11,
    interval: 1.81,
    restTime: 10,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '7',
    location: 'ブレーキ博物館',
    category: '観光',
    distance: 13.4,
    pace: 11,
    interval: 4,
    restTime: 15,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '8',
    location: '向島百花園のつつじ',
    category: '観光',
    distance: 13.47,
    pace: 11,
    interval: 0.07,
    restTime: 15,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '9',
    location: 'コンビニ',
    category: 'コンビニ',
    distance: 15,
    pace: 11,
    interval: 1.53,
    restTime: 10,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '10',
    location: '亀戸天神社の藤棚',
    category: '観光',
    distance: 16.64,
    pace: 10,
    interval: 1.64,
    restTime: 10,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '11',
    location: '両国メンチ',
    category: '休憩',
    distance: 19.83,
    pace: 10,
    interval: 3.19,
    restTime: 10,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '12',
    location: '銀座',
    category: '観光',
    distance: 23.4,
    pace: 10,
    interval: 3.57,
    restTime: 5,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '13',
    location: '日比谷公園',
    category: 'ゴール',
    distance: 24.79,
    pace: 10,
    interval: 1.39,
    restTime: 0,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '14',
    location: 'シャワー',
    category: '銭湯',
    distance: 24.79,
    pace: 0,
    interval: 0,
    restTime: 60,
    date: '',
    arrivalTime: '',
    departureTime: '',
  },
  {
    id: '15',
    location: '打上げ',
    category: '打上げ',
    distance: 24.79,
    pace: 0,
    interval: 0,
    restTime: 0,
    date: '',
    arrivalTime: '',
    departureTime: '',
  }
]

export const useScheduleData = () => {
  const [data, setData] = useState<ScheduleRow[]>(INITIAL_DATA)
  const [startDateTime] = useState<Date>(new Date(2025, 5, 14, 9, 0))
  const debounceTimerRef = useRef<number | null>(null)

  const recalculateData = useCallback((newData: ScheduleRow[], from = 0) => {
    const withIntervals = calculateIntervals(newData)
    const withTimes = calculateTimes(withIntervals, { 
      startDateTime, 
      recalculateFrom: from 
    })
    const validation = validateDistances(withTimes)
    
    const finalData = withTimes.map(row => ({
      ...row,
      hasError: validation.errors.some(error => error.rowId === row.id)
    }))
    
    setData(finalData)
    return finalData
  }, [startDateTime])

  const updateCell = useCallback((rowIndex: number, field: keyof ScheduleRow, value: unknown) => {
    const newData = [...data]
    const row = newData[rowIndex]
    if (!row) return
    
    const updatedRow = { ...row, [field]: value }
    newData[rowIndex] = updatedRow
    
    if (field === 'distance') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      debounceTimerRef.current = setTimeout(() => {
        recalculateData(newData, rowIndex)
      }, 200)
    } else if (field === 'pace' || field === 'restTime') {
      recalculateData(newData, rowIndex)
    } else {
      setData(newData)
    }
  }, [data, recalculateData])

  const addRow = useCallback((afterIndex?: number) => {
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : data.length
    const newRow: ScheduleRow = {
      id: generateRowId(),
      location: '',
      category: 'コンビニ',
      distance: insertIndex > 0 ? data[insertIndex - 1]?.distance ?? 0 : 0,
      pace: 10,
      interval: 0,
      restTime: 5,
      date: '',
      arrivalTime: '',
      departureTime: '',
    }
    
    const newData = [...data]
    newData.splice(insertIndex, 0, newRow)
    recalculateData(newData)
  }, [data, recalculateData])

  const removeRow = useCallback((index: number) => {
    if (index < 2) return
    
    const newData = data.filter((_, i) => i !== index)
    recalculateData(newData)
  }, [data, recalculateData])

  const moveRow = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 2 || toIndex < 2) return
    
    const newData = [...data]
    const [movedRow] = newData.splice(fromIndex, 1)
    if (movedRow) {
      newData.splice(toIndex, 0, movedRow)
      recalculateData(newData)
    }
  }, [data, recalculateData])

  return {
    data,
    updateCell,
    addRow,
    removeRow,
    moveRow,
    startDateTime
  }
}