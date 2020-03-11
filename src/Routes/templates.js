import express from 'express'
import { Helper } from '../Helpers'
import { formXlsReport  } from '../Controllers/Templates'
const router = express.Router()
router.post('/xls', Helper.requestHandler.call(null, formXlsReport))
export default router
