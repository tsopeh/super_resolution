import * as fs from 'fs'
import * as path from 'path'

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

export interface ResourceInfo {
  resourceId: string
  workDirPath: string
  sourceFilePath: string
  status:
    | { type: ResourceStatus.Uploading }
    | { type: ResourceStatus.UploadingErrored }
    | { type: ResourceStatus.Processing }
    | { type: ResourceStatus.ProcessingErrored }
    | { type: ResourceStatus.Finished, resultFilePath: string }
}

// Keep in sync with the client codebase.
export interface ResourceStatusOutput {
  resourceId: string
  status:
    | { type: ResourceStatus.Uploading }
    | { type: ResourceStatus.UploadingErrored }
    | { type: ResourceStatus.Processing, total: number, done: number }
    | { type: ResourceStatus.ProcessingErrored }
    | { type: ResourceStatus.Finished, resultUrl: string }
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
  switch (info.status.type) {
    case ResourceStatus.Processing:
      return {type: ResourceStatus.Processing, ...getProgress(info.workDirPath)}
    case ResourceStatus.Finished:
      return {type: ResourceStatus.Finished, resultUrl: `http://localhost:5100/finished/${info.resourceId}`}
    default:
      return info.status
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