import XLSXtemplate from '../../Helpers/XlsxTemplates'
import HTMLtemplate from '../../Helpers/HtmlTemplates'
import { UserError } from '../../Helpers'
import generate from 'nanoid/async/generate'
import path from 'path'
const UPLOAD_PATH = 'uploads/'
const PUBLIC_PATH = 'public/'

export const formXlsReport = async (req) => {
  const data = req.body || {}
  const template = new XLSXtemplate()
  if (data.name) {
    await template.loadTemplate(path.join(UPLOAD_PATH, data.name))
    template.applyData(data)
    const outputFileName = await generate('1234567890abcdef', 21)
    await template.toFile(path.join(PUBLIC_PATH, `${outputFileName}.xlsx`))
    return { link: `${outputFileName}.xlsx` }
  } else {
    throw new UserError('Не указано имя шаблона')
  }
}

export const formHtmlReport = async (req) => {
  const data = req.body || {}
  const template = new HTMLtemplate()
  if (data.name) {
    await template.loadTemplate(path.join(UPLOAD_PATH, data.name))
    template.applyData(data)
    const outputFileName = await generate('1234567890abcdef', 21)
    const link = await template.toFile({
      filePath: PUBLIC_PATH,
      fileName: outputFileName,
      landscape: !!data.landscape
    })
    return { link }
  } else {
    throw new UserError('Не указано имя шаблона')
  }
}
