import { spawn } from 'child_process'
import connectBusboy from 'connect-busboy'
import cors from 'cors'
import express from 'express'
import * as fs from 'fs'
import * as path from 'path'

// region Express setup
const app = express()
app.use(cors())
app.use(connectBusboy({
  highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
}))
// endregion Express setup

// region Environment setup
const uploadPath = path.join(path.resolve(__dirname, '..'), '.tmp')
const publicPath = path.join(path.resolve(__dirname, '..'), 'public')
;[uploadPath, publicPath].forEach(somePath => {
  if (!fs.existsSync(somePath)) {
    fs.mkdirSync(somePath)
  }
})

// endregion Environment setup

app.route('/').get((req, res) => {
  const mainPy = path.join(__dirname, 'scripts', 'main.py')
  const command = spawn('python3', [mainPy])
  const stdoutBuffer: Array<unknown> = []
  command.stdout.on('data', (data) => {
    const stringified = data.toString()
    console.log('Pipe data from python script:', String(data))
    stdoutBuffer.push(stringified)
  })
  command.stderr.on('data', (error) => {
    console.error('The following error has occurred: ', error)
  })
  command.stdout.on('close', (exitCode: unknown) => {
    console.log('Process closed with code:', exitCode)
    res.send(stdoutBuffer)
  })
})

app.route('/upload_video').post((req, res) => {
  req.pipe(req.busboy)
  req.busboy.on('file', (name, stream, info) => {
    console.log(`Upload started for: "${info.filename}".`)
    const writeStream = fs.createWriteStream(path.join(uploadPath, info.filename))
    writeStream.on('error', (err) => {
      console.error(`Error occurred during upload of: "${info.filename}".`)
    })
    writeStream.on('close', () => {
      console.log(`Upload finished for: "${info.filename}".`)
      res.send(true) // TODO: Why?
    })
    stream.pipe(writeStream)
  })
})

const port = 5100
app.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}.`)
})
