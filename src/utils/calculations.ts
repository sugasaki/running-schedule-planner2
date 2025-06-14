import { ScheduleRow, ValidationResult, CalculationOptions } from '../types'

export const calculateIntervals = (rows: ScheduleRow[]): ScheduleRow[] => {
  return rows.map((row, index) => {
    if (index === 0) {
      return { ...row, interval: 0 }
    }
    const previousDistance = rows[index - 1]?.distance ?? 0
    const interval = Math.max(0, row.distance - previousDistance)
    return { ...row, interval: parseFloat(interval.toFixed(2)) }
  })
}

export const calculateTimes = (rows: ScheduleRow[], options: CalculationOptions): ScheduleRow[] => {
  const { startDateTime, recalculateFrom = 0 } = options
  let currentTime = new Date(startDateTime)
  
  return rows.map((row, index) => {
    if (index < recalculateFrom) {
      const existingDepartureTime = new Date(`${row.date} ${row.departureTime}`)
      if (!isNaN(existingDepartureTime.getTime())) {
        currentTime = existingDepartureTime
      }
      return row
    }

    if (index === 0) {
      const arrivalTime = formatTime(currentTime)
      const departureTime = formatTime(currentTime)
      return {
        ...row,
        date: formatDate(currentTime),
        arrivalTime,
        departureTime
      }
    }

    const travelTimeMinutes = row.interval * row.pace
    currentTime = new Date(currentTime.getTime() + travelTimeMinutes * 60000)
    
    const arrivalTime = formatTime(currentTime)
    
    currentTime = new Date(currentTime.getTime() + row.restTime * 60000)
    const departureTime = formatTime(currentTime)

    return {
      ...row,
      date: formatDate(currentTime),
      arrivalTime,
      departureTime
    }
  })
}

export const validateDistances = (rows: ScheduleRow[]): ValidationResult => {
  const errors: Array<{ rowId: string; message: string }> = []
  
  for (let i = 1; i < rows.length; i++) {
    const currentRow = rows[i]
    const previousRow = rows[i - 1]
    
    if (currentRow && previousRow && currentRow.distance < previousRow.distance) {
      errors.push({
        rowId: currentRow.id,
        message: '距離が前の行より小さくなっています'
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  })
}

export const generateRowId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}