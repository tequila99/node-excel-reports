import XlsxPopulate from 'xlsx-populate'
import { UserError } from '../../Helpers/'
import date from 'date-and-time'
// const DEFAULT_LINK_COLOR = '0563c1'
// const STR = '^str\\((.+)\\)$'
// const RAW = '^\\{(.+)\\}$'
// const NUMBER = '^number\\((\\S+)\\s?(\\S+)?\\)$'
// const DATE = '^date\\((\\S+)\\s?([\\S|\\s]+)?\\)$'
// const LINK = '^link\\((.+)\\)$'

const getFormatValue = v => {
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

const getValue = v => {
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

const getFormat = v => {
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

class XLSXtemplate {
  constructor () {
    this.wb = null
  }

  get workbook () {
    return this.wb
  }

  async loadTemplate (template) {
    if (typeof template === 'undefined') {
      this.wb = await XlsxPopulate.fromBlankAsync()
    } else if (typeof template === 'string') {
      this.wb = await XlsxPopulate.fromFileAsync(template)
    } else {
      this.wb = await XlsxPopulate.fromDataAsync(template)
    }
  }

  async toBuffer () {
    return this.wb.outputAsync()
  }

  async toFile (filePath) {
    return this.wb.toFileAsync(filePath)
  }

  applyData (data = {}) {
    if (!this.wb) {
      throw new UserError('Шаблон XLSX не загружен')
    }
    if (!Object.keys(data).length) {
      throw new UserError('Отсутсвуют данные для заполнения шаблона XLSX')
    }

    const { params = [], data: table = [] } = data

    params.forEach(param => this.applyParam(param))

    if (table.length) {
      this.wb.find('<TABLE>').slice(0, 1).forEach(startCell => {
        table.forEach((row, i) => {
          row.forEach((item, j) => {
            const updateCell = startCell.relativeCell(i, j)
            const value = getValue(item)
            const format = getFormat(item)
            updateCell.value(value)
            if (format) {
              updateCell.style('numberFormat', format)
            }
            updateCell.style('border', item.border || true)
            this.applyStyle(updateCell, item)
          })
        })
      })
    }

    this.clearUnusedParam()
  }

  applyParam (param = {}) {
    this.wb.find(`<${param.key}>`).forEach(cell => {
      if (cell.value() === `<${param.key}>`) {
        const value = getValue(param)
        const format = getFormat(param)
        cell.value(value)
        if (format) {
          cell.style('numberFormat', format)
        }
        this.applyStyle(cell, param)
      } else {
        const value = getFormatValue(param)
        const REG = new RegExp(`<${param.key}>`, 'g')
        cell.value(cell.value().replace(REG, value))
      }
    })
  }

  clearUnusedParam () {
    this.wb.find(/<.*>/).forEach(cell => {
      cell.value(cell.value().replace(/<.*>/g, ''))
    })
  }

  applyStyle (cell, v) {
    if ('styles' in v) {
      Object.keys(v).forEach(k => {
        cell.style(k, v[k])
      })
    }
  }
}

export default XLSXtemplate
