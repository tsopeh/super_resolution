import axios from 'axios'
import qs from 'qs'
import { ContentType, EntryModel } from './Entry'


// Keep in sync with the Server codebase.
export enum ResourceStatus {
  Uploading = 'Uploading',
  UploadingErrored = 'UploadingErrored',
  Processing = 'Processing',
  ProcessingErrored = 'ProcessingErrored',
  Finished = 'Finished'
}

// Keep in sync with the Server codebase.
export interface ResourceStatusOutput {
  resourceId: string
  status:
    | { type: ResourceStatus.Uploading }
    | { type: ResourceStatus.UploadingErrored }
    | { type: ResourceStatus.Processing, total: number, done: number }
    | { type: ResourceStatus.ProcessingErrored }
    | { type: ResourceStatus.Finished, resultUrl: string }
}

export const checkStatus = async (resourceIds: ReadonlyArray<string>) => {
  return axios
    .request<ReadonlyArray<ResourceStatusOutput | null>>({
      url: 'http://localhost:5100/status',
      params: {
        resourceIds,
      },
      paramsSerializer: params => {
        return qs.stringify(params)
      },
    })
    .then(res => res.data)
}

export const resourceStatusOutputToEntryModel = (existing: EntryModel, output: ResourceStatusOutput): EntryModel => {
  switch (output.status.type) {
    case ResourceStatus.Uploading:
      return existing
    case ResourceStatus.UploadingErrored:
      return {
        ...existing,
        content: {
          type: ContentType.Errored,
          message: 'Failed to upload the file.',
        },
      }
    case ResourceStatus.Processing:
      return {
        ...existing,
        content: {
          type: ContentType.Processing,
          progress: output.status.done / output.status.total,
          text: `${output.status.done} / ${output.status.total}`,
        },
      }
    case ResourceStatus.ProcessingErrored:
      return {
        ...existing,
        content: {
          type: ContentType.Errored,
          message: 'Failed to process the file.',
        },
      }
    case ResourceStatus.Finished:
      return {
        ...existing,
        content: {
          type: ContentType.Results,
          url: output.status.resultUrl,
        },
      }
  }
}