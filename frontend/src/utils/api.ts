const configuredBase = import.meta.env.VITE_API_BASE?.trim() || ''
const defaultBase = `${window.location.protocol}//${window.location.hostname}:5000`

const isLocalhostTarget = (value: string) =>
  value.includes('localhost') || value.includes('127.0.0.1')

const isHostLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

export const API_BASE = (() => {
  if (!configuredBase) {
    return defaultBase
  }

  if (isLocalhostTarget(configuredBase) && !isHostLocal) {
    return defaultBase
  }

  return configuredBase
})()
