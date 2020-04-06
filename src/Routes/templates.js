import express from 'express'
import { Helper } from '../Helpers'
import { formXlsReport, formHtmlReport } from '../Controllers/Templates'
const router = express.Router()
router.post('/xls', Helper.requestHandler.call(null, formXlsReport))
router.post('/html', Helper.requestHandler.call(null, formHtmlReport))
export default router
