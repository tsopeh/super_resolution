import React from 'react'
import './UpsampleOptions.scss'

// Keep in sync with Server.
export enum NNModels {
  RealSrAnimeVideoV3 = 'realesr-animevideov3',
  RealSrGanX4Plus = 'realesrgan-x4plus',
  RealSrGanX4PlusAnime = 'realesrgan-x4plus-anime',
}

// Keep in sync with Server.
export type UpsampleOptionsModel =
  | { model: NNModels.RealSrAnimeVideoV3, scale: 2 | 3 | 4 }
  | { model: NNModels.RealSrGanX4Plus }
  | { model: NNModels.RealSrGanX4PlusAnime }

const allModels = [NNModels.RealSrAnimeVideoV3, NNModels.RealSrGanX4Plus, NNModels.RealSrGanX4PlusAnime]

export const modelPronounceableNames = {
  [NNModels.RealSrAnimeVideoV3]: 'realesr-animevideov3',
  [NNModels.RealSrGanX4Plus]: 'realesrgan-x4plus',
  [NNModels.RealSrGanX4PlusAnime]: 'realesrgan-x4plus-anime',
}


export type UpsampleOptionsProps = {
  options: UpsampleOptionsModel,
  updateForm: (newOptions: UpsampleOptionsModel) => void
  submit: (options: UpsampleOptionsModel) => void
}


export const UpsampleOptions: React.FC<UpsampleOptionsProps> = (props: UpsampleOptionsProps) => {
  const {options, updateForm, submit} = props
  return <div className="content upsample-options">
    <label className="model">Model
      <select
        value={options.model}
        onChange={(event) => {
          const newModel = getDefaultOptionsForModel(event.target.value)
          updateForm(newModel)
        }}>
        {
          allModels.map(model => {
            return <option key={modelPronounceableNames[model]} value={model}>{modelPronounceableNames[model]}</option>
          })
        }
      </select>
    </label>
    {
      options.model === NNModels.RealSrAnimeVideoV3
        ? <fieldset>
          <legend>Upsampling</legend>
          <div className="options"> {
            ['2', '3', '4'].map(scale => {
              return <label key={scale}>
                <input
                  type="radio"
                  value={scale}
                  checked={options.scale.toString() === scale}
                  onChange={(event) => {
                    const newScale = parseInt(event.target.value) as 2 | 3 | 4
                    updateForm({
                      ...options,
                      scale: newScale,
                    })
                  }}
                />
                {`??${scale}`}
              </label>
            })
          }
          </div>
        </fieldset>
        : null
    }
    {
      <button onClick={() => {
        submit(options)
      }}>
        Upscale
      </button>
    }
  </div>
}

const getDefaultOptionsForModel = (model: unknown): UpsampleOptionsModel => {
  switch (model) {
    case NNModels.RealSrAnimeVideoV3:
      return {model: NNModels.RealSrAnimeVideoV3, scale: 2}
    case NNModels.RealSrGanX4Plus:
      return {model: NNModels.RealSrGanX4Plus}
    case NNModels.RealSrGanX4PlusAnime:
      return {model: NNModels.RealSrGanX4PlusAnime}
    default:
      throw new Error('Unknown model name')
  }
}