import * as bodyParser from 'body-parser'
import connectBusboy from 'connect-busboy'
import cors from 'cors'
import express from 'express'
import * as fs from 'fs'
import md5 from 'md5'
import * as path from 'path'
import { processResource } from './process-resource'
import { getResourceStatusOutput, infoMap, ResourceStatus, ResourceStatusOutput } from './status'

// region Express setup
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
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

app.route('/upload').post((req, res) => {
  req.pipe(req.busboy)

  req.busboy.on('file', (name, stream, info) => {

    console.log(`Upload started for: "${info.filename}".`)

    const fileName = info.filename
    const resourceId = `${fileName}_${md5(fileName)}`
    const workDirPath = path.join(uploadPath, resourceId)
    const srcDirPath = path.join(workDirPath, 'src')
    fs.mkdirSync(srcDirPath, {recursive: true})
    const sourceFilePath = path.join(srcDirPath, fileName)
    infoMap.set(resourceId, {resourceId, workDirPath, sourceFilePath, status: {type: ResourceStatus.Uploading}})
    const writeStream = fs.createWriteStream(sourceFilePath)

    writeStream.on('error', (err) => {
      console.error(`Error occurred during upload of: "${fileName}".`)
      infoMap.set(resourceId, {
        ...infoMap.get(resourceId)!,
        status: {type: ResourceStatus.UploadingErrored},
      })
    })

    writeStream.on('close', () => {
      console.log(`Upload finished for: "${fileName}".`)
      infoMap.set(resourceId, {
        ...infoMap.get(resourceId)!,
        status: {type: ResourceStatus.Processing},
      })
      processResource(sourceFilePath)
        .then((resultFilePath) => {
          infoMap.set(resourceId, {
            ...infoMap.get(resourceId)!,
            status: {type: ResourceStatus.Finished, resultFilePath},
          })
        })
        .catch(() => {
          infoMap.set(resourceId, {
            ...infoMap.get(resourceId)!,
            status: {type: ResourceStatus.ProcessingErrored},
          })
        })
      res.send(resourceId)
    })

    stream.pipe(writeStream)

  })
})

app.route('/status').get((req, res) => {
  const resourceIds = (req.query.resourceIds ?? []) as ReadonlyArray<string>
  const response: ReadonlyArray<ResourceStatusOutput | null> = resourceIds.map(getResourceStatusOutput)
  res.send(response)
})

app.route('/finished/:resourceId').get((req, res) => {
  const resourceId = req.params.resourceId
  const status = infoMap.get(resourceId)
  if (status != null && status.status.type == ResourceStatus.Finished) {
    res.sendFile(status.status.resultFilePath)
  } else {
    res.status(404).send()
  }
})

app.route('/ping').get((req, res) => {
  res.send('pong')
})

const port = 5100
app.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}.`)
})
