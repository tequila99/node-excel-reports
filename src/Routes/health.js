import express from 'express'
import { Helper } from '../Helpers'
import { handlePing } from '../Controllers/Health'
const router = express.Router()
router.get('/ping', Helper.requestHandler.call(null, handlePing))

export default router
