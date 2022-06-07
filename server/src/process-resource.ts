import { spawn } from 'child_process'

export const processResource = (resourceSrcPath: string): Promise<string> => {

  return new Promise((resolve, reject) => {

    const command = spawn(
      'bash',
      [
        './src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/script.sh',
        `${resourceSrcPath}`,
      ],
    )

    let resultFilePath: string | null = null
    command.stdout.on('data', (data) => {
      const stringified = data.toString()
      console.log('STDOUT:', stringified)
      resultFilePath = stringified
    })

    command.stdout.on('close', (exitCode: unknown) => {
      if (resultFilePath != null) {
        // Seems that `resultFilePath` has '\n' at the end, se use `trim()` to
        // remove it.
        resolve(resultFilePath.trim())
      } else {
        reject()
      }
    })

    command.stderr.on('data', (error) => {
      const message = 'The following error has occurred while processing the video: '
      try {
        console.error(message, error.toString())
      } catch (_) {
        console.error(message, error)
      }
      reject()
    })

  })

}