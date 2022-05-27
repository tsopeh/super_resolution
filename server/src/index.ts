import { spawn } from 'child_process'
import cors from 'cors'
import express from 'express'
import * as path from 'path'

const mainPy = path.join(__dirname, 'scripts', 'main.py')

const app = express()
app.use(cors())

app.get('/', async (req, res) => {
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

const port = 5100
app.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}.`)
})
