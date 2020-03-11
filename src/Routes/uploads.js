import express from 'express'
import { Helper } from '../Helpers'
import { uploadSingle, resultFile } from '../Controllers/Uploads'
const router = express.Router()
router.post('/', uploadSingle, Helper.requestHandler.call(null, resultFile))
export default router
