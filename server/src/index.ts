import connectBusboy from 'connect-busboy'
import cors from 'cors'
import express from 'express'
import * as fs from 'fs'
import md5 from 'md5'
import * as path from 'path'
import { processResource } from './process-resource'


interface ResourceStatus {
  isFinished: boolean
  hasError: boolean
  directoryPath: string
}

/**
 * Key — resource id
 * Value — resource path
 */
const processed = new Map<string, ResourceStatus>()

// region Express setup
const app = express()
app.use(cors())
app.use(connectBusboy({
  highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
}))
// endregion Express setup

// region Environment setup
const uploadPath = path.join(process.cwd(), '.tmp')
const publicPath = path.join(process.cwd(), 'public')
;[uploadPath, publicPath].forEach(somePath => {
  if (!fs.existsSync(somePath)) {
    fs.mkdirSync(somePath)
  }
})

// endregion Environment setup

app.route('/ping').get((req, res) => {
  res.send('pong')
})

app.route('/upload').post((req, res) => {
  req.pipe(req.busboy)

  req.busboy.on('file', (name, stream, info) => {

    console.log(`Upload started for: "${info.filename}".`)

    const fileName = info.filename
    const filePath = path.join(uploadPath, fileName)

    const writeStream = fs.createWriteStream(filePath)

    writeStream.on('error', (err) => {
      console.error(`Error occurred during upload of: "${fileName}".`)
    })

    writeStream.on('close', () => {
      console.log(`Upload finished for: "${fileName}".`)
      const hash = md5(fileName)
      processed.set(hash, {directoryPath: filePath, isFinished: false, hasError: false})
      processResource(filePath)
        .then(() => {
          processed.set(hash, {directoryPath: filePath, isFinished: true, hasError: false})
        })
        .catch(() => {
          processed.set(hash, {directoryPath: filePath, isFinished: false, hasError: true})
        })
      res.send(hash)
    })

    stream.pipe(writeStream)

  })
})

const port = 5100
app.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}.`)
})
