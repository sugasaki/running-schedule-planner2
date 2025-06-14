export type LocationCategory = 
  | '集合'
  | 'スタート'
  | 'トイレ'
  | 'コンビニ'
  | '観光'
  | '休憩'
  | 'ゴール'
  | '銭湯'
  | '打上げ'

export interface ScheduleRow {
  id: string
  location: string
  category: LocationCategory
  distance: number
  pace: number
  interval: number
  restTime: number
  date: string
  arrivalTime: string
  departureTime: string
  hasError?: boolean
}

export interface ScheduleData {
  startDateTime: Date
  rows: ScheduleRow[]
}

export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    rowId: string
    message: string
  }>
}

export interface CalculationOptions {
  startDateTime: Date
  recalculateFrom?: number
}