import { UserError } from './index'
import date from 'date-and-time'

export const getFormatValue = v => {
  if ('valueType' in v) {
    const format = getFormat(v)
    const value = getValue(v)
    if (format) {
      if (v.valueType === 'money') {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          currencyDisplay: 'symbol',
          useGrouping: false
        }).format(value)
      } else if (v.valueType === 'numeric') {
        const [, c = ''] = format.split('.')
        return new Intl.NumberFormat('ru-RU', {
          style: 'decimal',
          useGrouping: false,
          minimumFractionDigits: c.length,
          maximumFractionDigits: c.length
        }).format(value)
      } else if (v.valueType === 'date') {
        let newFormat
        if (format.slice(-2) === 'mm') {
          newFormat = `${format.slice(0, format.length - 2).toUpperCase()}hh`
        } else {
          newFormat = format.toUpperCase()
        }
        return date.format(value, newFormat)
      } else {
        return `${value}`
      }
    } else {
      return value
    }
  } else {
    return v.value
  }
}

export const getValue = v => {
  if ('valueType' in v) {
    let value = v.value
    if (v.valueType === 'integer') {
      try {
        value = parseInt(v.value, 10)
      } catch (e) {
        throw new UserError(`Невозможно привести тип данных ${v.value} к целому типу`)
      }
    } else if (v.valueType === 'money' || v.valueType === 'numeric') {
      try {
        value = +v.value
      } catch (e) {
        throw new UserError(`Невозможно привести тип данных ${v.value} к числовому типу`)
      }
    } else if (v.valueType === 'date') {
      try {
        value = new Date(v.value)
      } catch (e) {
        throw new UserError(`Невозможно привести тип данных ${v.value} к типу дата`)
      }
    }
    return value
  } else {
    return v.value || ''
  }
}

export const getFormat = v => {
  if ('valueType' in v) {
    if (v.valueType === 'integer') {
      return '0'
    } else if (v.valueType === 'money') {
      return '0.00'
    } else if (v.valueType === 'numeric') {
      return v.format || '0.00'
    } else if (v.valueType === 'date') {
      return v.format || 'dd.mm.yyyy'
    } else {
      return v.format || ''
    }
  } else {
    return v.format || ''
  }
}
