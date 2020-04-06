import XlsxPopulate from 'xlsx-populate'
import { UserError } from '../../Helpers/'
import { getFormatValue, getValue, getFormat } from '../utils'

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
