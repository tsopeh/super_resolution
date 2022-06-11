import * as fs from 'fs'
import * as path from 'path'
import { NNModels, UpsampleOptionsModel } from './process-resource'

/**
 * Key — resource id
 * Value — resource path
 */
export const infoMap = new Map<string, ResourceInfo>()

// Keep in sync with the Client codebase.
export enum ResourceStatus {
  Uploading = 'Uploading',
  UploadingErrored = 'UploadingErrored',
  Processing = 'Processing',
  ProcessingErrored = 'ProcessingErrored',
  Finished = 'Finished'
}

// Keep in sync with the client codebase.
export interface ResourceStatusOutput {
  resourceId: string
  status:
    | { type: ResourceStatus.Uploading }
    | { type: ResourceStatus.UploadingErrored }
    | { type: ResourceStatus.Processing, total: number, done: number, model: NNModels, scale: 2 | 3 | 4 }
    | { type: ResourceStatus.ProcessingErrored, model: NNModels, scale: 2 | 3 | 4 }
    | { type: ResourceStatus.Finished, resultUrl: string, model: NNModels, scale: 2 | 3 | 4 }
}

export interface ResourceInfo {
  resourceId: string
  workDirPath: string
  sourceFilePath: string
  upsampleOptions: UpsampleOptionsModel
  status:
    | { type: ResourceStatus.Uploading }
    | { type: ResourceStatus.UploadingErrored }
    | { type: ResourceStatus.Processing }
    | { type: ResourceStatus.ProcessingErrored }
    | { type: ResourceStatus.Finished, resultFilePath: string }
}

export const getResourceStatusOutput = (resourceId: string): ResourceStatusOutput | null => {
  if (infoMap.has(resourceId)) {
    const status = infoMap.get(resourceId)!
    return {
      resourceId,
      status: resourceInfoStatusToResourceStatusOutputStatus(status),
    }
  } else {
    return null
  }
}

const resourceInfoStatusToResourceStatusOutputStatus = (info: ResourceInfo): ResourceStatusOutput['status'] => {

  const common = {
    model: info.upsampleOptions.model,
    scale: info.upsampleOptions.model == NNModels.RealSrAnimeVideoV3
      ? info.upsampleOptions.scale
      : 4,
  }
  switch (info.status.type) {
    case ResourceStatus.Processing:
      return {type: ResourceStatus.Processing, ...getProgress(info.workDirPath), ...common}
    case ResourceStatus.Finished:
      return {
        type: ResourceStatus.Finished,
        resultUrl: `http://localhost:5100/finished/${info.resourceId}`,
        ...common,
      }
    default:
      return {...info.status, ...common}
  }
}

const getProgress = (resourceWorkDirPath: string): { total: number, done: number } => {
  const tmp_frames_dir = path.join(resourceWorkDirPath, 'tmp_frames')
  const out_frames_dir = path.join(resourceWorkDirPath, 'out_frames')
  if (fs.existsSync(tmp_frames_dir) && fs.existsSync(out_frames_dir)) {
    const total = fs.readdirSync(tmp_frames_dir).length
    const done = fs.readdirSync(out_frames_dir).length
    if (total > 0)
      return {total, done}
  }
  return {total: 1, done: 0}
}