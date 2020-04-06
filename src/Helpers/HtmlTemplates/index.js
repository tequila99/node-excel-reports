import { JSDOM } from 'jsdom'
import fs from 'fs'

import { UserError } from '../../Helpers/'
import { getFormatValue, getValue } from '../utils'

const TEMPLATE_ROW = '.data-table-row'

class HTMLTemplate {
  constructor () {
    this.dom = null
    this.document = null
    this.tableRow = null
    this.templateRow = null
    this.textHtml = null
  }

  /* get dom () {
    return this.dom
  }

  get document () {
    return this.document
  }

  get tableRow () {
    return this.tableRow
  }

  get templateRow () {
    return this.templateRow
  }

  get textHtml () {
    return this.textHtml
  } */

  async loadTemplate (template) {
    const dom = await JSDOM.fromFile(template)
    const { window: { document } } = dom
    this.dom = dom
    this.document = document
    this.tableRow = document.querySelector(TEMPLATE_ROW)
    this.templateRow = this.tableRow.innerHTML
  }

  async toFile (filePath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, this.textHtml, error => {
        if (error) {
          reject(error)
        } else {
          resolve(true)
        }
      })
    })
  }

  applyData (data = {}) {
    if (!this.dom) {
      throw new UserError('Шаблон HTML не загружен')
    }
    if (!Object.keys(data).length) {
      throw new UserError('Отсутсвуют данные для заполнения шаблона HTML')
    }

    const { params = [], data: table = [] } = data
    if (table.length) {
      this.applyTable(table)
    }
    this.textHtml = this.dom.serialize()
    params.forEach(param => this.applyParam(param))
    const rg = new RegExp('{{.*}}', 'gi')
    this.textHtml = this.textHtml.replace(rg, '')
  }

  applyParam (param = {}) {
    const value = getFormatValue(param)
    const rg = new RegExp(`{{\\s*${param.key}\\s*}}`, 'gi')
    this.textHtml = this.textHtml.replace(rg, value)
  }

  applyTable (table = []) {
    if (!table.length) {
      throw new UserError('Отстутсвуют данные таблицы для заполнения шаблна HTML')
    }
    if (!this.tableRow) {
      throw new UserError('В шаблоне HTML отсутсвует таблица для заполнения')
    }
    table.forEach((row, i) => {
      let elementHtml = this.templateRow
      row.forEach((item, j) => {
        const value = getFormatValue(item)
        const str = `{{\s*col-${j + 1}\s*}}`
        const rg = new RegExp(`{{\\s*col-${j + 1}\\s*}}`, 'i')
        elementHtml = elementHtml.replace(rg, value)
      })
      if (i) {
        const el = this.document.createElement('tr')
        el.innerHTML = elementHtml
        this.tableRow.parentNode.insertBefore(el, this.tableRow.nextSibling)
      } else {
        this.tableRow.innerHTML = elementHtml
      }
    })
  }
}

export default HTMLTemplate
