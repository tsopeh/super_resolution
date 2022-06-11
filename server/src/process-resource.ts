import { spawn } from 'child_process'
import { ResourceInfo } from './status'

// Keep in sync with Server.
export enum NNModels {
  RealSrAnimeVideoV3 = 'realesr-animevideov3',
  RealSrGanX4Plus = 'realesrgan-x4plus',
  RealSrGanX4PlusAnime = 'realesrgan-x4plus-anime',
}

// Keep in sync with Server.
export type UpsampleOptionsModel =
  | { model: NNModels.RealSrAnimeVideoV3, scale: 2 | 3 | 4 }
  | { model: NNModels.RealSrGanX4Plus, scale: 4 }
  | { model: NNModels.RealSrGanX4PlusAnime, scale: 4 }

export const parseUpsampleOptions = (raw: unknown): UpsampleOptionsModel => {
  if (raw != null && raw instanceof Object) {
    // @ts-ignore
    switch (raw['model']) {
      case NNModels.RealSrAnimeVideoV3:
        // @ts-ignore
        const parsedScale = parseInt(raw['scale'])
        const scale = isNaN(parsedScale) ? 2 : parsedScale as 2 | 3 | 4
        return {model: NNModels.RealSrAnimeVideoV3, scale}
      case NNModels.RealSrGanX4Plus:
        return {model: NNModels.RealSrGanX4Plus, scale: 4}
      case NNModels.RealSrGanX4PlusAnime:
        return {model: NNModels.RealSrGanX4PlusAnime, scale: 4}
    }
  }
  return {model: NNModels.RealSrAnimeVideoV3, scale: 2}
}

export const processResource = (info: ResourceInfo): Promise<string> => {

  const {resourceId, sourceFilePath, upsampleOptions} = info

  return new Promise((resolve, reject) => {

    const model = upsampleOptions.model
    const scale = upsampleOptions.model == NNModels.RealSrAnimeVideoV3
      ? upsampleOptions.scale.toString()
      : '4'

    console.log(`Processing "${resourceId}", using "${model}" to ×${scale} scale.`)

    const command = spawn(
      'bash',
      [
        './src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/script.sh',
        /* $1 */ sourceFilePath,
        /* $2 */ model,
        /* $3 */ scale,
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