import { AsyncLocalStorage } from 'node:async_hooks'

export interface AppContext {
  businessProcessId: string
  requestId: string
}

export const asyncLocalStorage = new AsyncLocalStorage<AppContext>()

export function getBusinessProcessId(): string | undefined {
  return asyncLocalStorage.getStore()?.businessProcessId
}

export function getRequestId(): string | undefined {
  return asyncLocalStorage.getStore()?.requestId
}
