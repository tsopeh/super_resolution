import { spawn } from 'child_process'

export const processVideo = (videoPath: string): Promise<void> => {

  return new Promise((resolve, reject) => {

    const command = spawn(
      'bash',
      [
        './src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/script.sh',
        `${videoPath}`,
      ],
    )

    command.stdout.on('data', (data) => {
      console.log('STDOUT:')
      console.log(data.toString())
    })

    command.stdout.on('close', (exitCode: unknown) => {
      console.log('Command finished with an exit code: ', exitCode)
      resolve()
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