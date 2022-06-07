const LOCAL_STORAGE_IDS = 'LOCAL_STORAGE_IDS' as const

export interface PersistedResourceInfo {
  resourceId: string
  fileName: string
}

export const getPersistedResourceInfo = (): ReadonlyArray<PersistedResourceInfo> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IDS) ?? '')
    if (Array.isArray(parsed)) {
      return parsed
    } else {
      throw new Error('Result of parsing must be an array of ids.')
    }
  } catch (err) {
    // console.warn('Failed to read locale-storage.', err)
    return []
  }
}

export const persistResourceInfo = (infos: ReadonlyArray<PersistedResourceInfo>): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_IDS, JSON.stringify(infos))
  } catch (err) {
    // console.warn('Failed to write locale-storage.', err)
  }
}