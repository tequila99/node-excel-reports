import express from 'express'
import bodyParser from 'body-parser'
import health from './Routes/health'
import uploads from './Routes/uploads'
import templates from './Routes/templates'
const app = express()
const API_PATH = '/api'
const API_VERSION = 'v1'

app.use(bodyParser.json())
app.use(express.static('public'))
// app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.status(200).send('Test service!')
})

app.use(`${API_PATH}/${API_VERSION}/health`, health)
app.use(`${API_PATH}/${API_VERSION}/upload`, uploads)
app.use(`${API_PATH}/${API_VERSION}/template`, templates)

export default app
