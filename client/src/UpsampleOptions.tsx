import React from 'react'
import './UpsampleOptions.scss'

export enum NNModels {
  RealSrAnimeVideoV3 = 'realesr-animevideov3',
  RealSrNetX4Plus = 'realesrnet-x4plus',
  RealSrGanX4Plus = 'realesrgan-x4plus',
  RealSrGanX4PlusAnime = 'realesrgan-x4plus-anime',
}

const allModels = [NNModels.RealSrAnimeVideoV3, NNModels.RealSrNetX4Plus, NNModels.RealSrGanX4Plus, NNModels.RealSrGanX4PlusAnime]

const modelPronounceableNames = {
  [NNModels.RealSrAnimeVideoV3]: 'realesr-animevideov3',
  [NNModels.RealSrNetX4Plus]: 'realesrnet-x4plus',
  [NNModels.RealSrGanX4Plus]: 'realesrgan-x4plus',
  [NNModels.RealSrGanX4PlusAnime]: 'realesrgan-x4plus-anime',
}

export type UpsampleOptionsModel =
  | { model: NNModels.RealSrAnimeVideoV3, scale: 2 | 3 | 4 }
  | { model: NNModels.RealSrNetX4Plus }
  | { model: NNModels.RealSrGanX4Plus }
  | { model: NNModels.RealSrGanX4PlusAnime }


export type UpsampleOptionsProps = {
  options: UpsampleOptionsModel,
  updateForm: (newOptions: UpsampleOptionsModel) => void
  submit: () => void
}


export const UpsampleOptions: React.FC<UpsampleOptionsProps> = (props: UpsampleOptionsProps) => {
  const {options, updateForm, submit} = props
  return <form className="content" onSubmit={(event) => event.preventDefault()}>
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
    {
      options.model === NNModels.RealSrAnimeVideoV3
        ? <fieldset>
          <legend>Up-scaling factor:</legend>
          {
            ['2', '3', '4'].map(scale => {
              return <div key={scale}>
                <input type="radio" id={`${scale}`} name="factor" value={`${scale}`}
                       checked={options.scale.toString() === scale}
                       onChange={(event) => {
                         const newScale = parseInt(event.target.value) as 2 | 3 | 4
                         updateForm({
                           ...options,
                           scale: newScale,
                         })
                       }}
                />
                <label htmlFor={`${scale}`}>{scale}</label>
              </div>
            })
          }
        </fieldset>
        : null
    }
    {
      <button onClick={() => {
        submit()
      }
      }>
        Upscale
      </button>
    }
  </form>
}

const getDefaultOptionsForModel = (model: unknown): UpsampleOptionsModel => {
  switch (model) {
    case NNModels.RealSrAnimeVideoV3:
      return {model: NNModels.RealSrAnimeVideoV3, scale: 2}
    case NNModels.RealSrNetX4Plus:
      return {model: NNModels.RealSrNetX4Plus}
    case NNModels.RealSrGanX4Plus:
      return {model: NNModels.RealSrGanX4Plus}
    case NNModels.RealSrGanX4PlusAnime:
      return {model: NNModels.RealSrGanX4PlusAnime}
    default:
      throw new Error('Unknown model name')
  }
}