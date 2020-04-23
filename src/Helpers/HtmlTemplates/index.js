import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import { pipe, gotenberg, convert, html, please, to, a4, portrait, landscape } from 'gotenberg-js-client'

import { UserError } from '../../Helpers/'
import { getFormatValue } from '../utils'
// import { promises } from 'dns'

const TEMPLATE_ROW = '.data-table-row'
const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:17000'
// const GOTENBERG_URL = ''

class HTMLTemplate {
  constructor (orientation = 'landscape') {
    this.dom = null
    this.document = null
    this.tableRow = null
    this.templateRow = null
    this.textHtml = null
    this.orientation = orientation
  }

  async loadTemplate (template) {
    const dom = await JSDOM.fromFile(template)
    const { window: { document } } = dom
    this.dom = dom
    this.document = document
    this.tableRow = document.querySelector(TEMPLATE_ROW)
    if (this.tableRow) {
      this.templateRow = this.tableRow.innerHTML
    }
  }

  async toPdf ({ filePath, fileName, landscape, width, height }) {
    console.log(width)
    console.log(height)
    const fullPath = path.join(filePath, `${fileName}.pdf`)
    const translateToPDF = pipe(
      gotenberg(GOTENBERG_URL),
      convert,
      html,
      to({
        paperWidth: width || 8.27,
        paperHeight: height || 11.69,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        landscape
      }),
      please
    )
    const pdf = await translateToPDF(this.textHtml)
    pdf.pipe(fs.createWriteStream(fullPath))
    pdf.on('end', () => Promise.resolve(`${fileName}.pdf`))
    pdf.on('error', (error) => Promise.reject(error))
  }

  async toHtml ({ filePath, fileName }) {
    const fullPath = path.join(filePath, `${fileName}.html`)
    return new Promise((resolve, reject) => {
      fs.writeFile(fullPath, this.textHtml, error => {
        if (error) {
          console.log(error)
          reject(error)
        } else {
          resolve(`${filePath}.html`)
        }
      })
    })
  }

  async toFile ({ filePath, fileName, landscape, width, height }) {

    let link = `${fileName}.html`
    if (GOTENBERG_URL) {
      try {
        await this.toPdf({ filePath, fileName, landscape, width, height })
        link = `${fileName}.pdf`
      } catch (error) {
        console.error(error)
        await this.toHtml({ filePath, fileName })
      }
    } else {
      await this.toHtml({ filePath, fileName })
    }
    return Promise.resolve(link)
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
