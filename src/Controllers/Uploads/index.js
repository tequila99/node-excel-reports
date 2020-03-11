import multer from 'multer'
import { UserError } from '../../Helpers'

const UPLOAD_PATH = 'uploads/'

const storageConfig = multer.diskStorage({
  destination: UPLOAD_PATH,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage: storageConfig })

export const uploadSingle = async (req, res, next) => upload.single('filename')(req, res, next)

export const resultFile = async req => {
  if (!req.file) {
    throw new UserError('Произошла ошибка при загрузке файла')
  }
  return req.file
}
