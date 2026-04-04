const USERNAME_MAX_LENGTH = 32
const USERNAME_MIN_LENGTH = 3

export function normalizeUsername(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, USERNAME_MAX_LENGTH)
}

export function isValidUsername(value: string) {
  return value.length >= USERNAME_MIN_LENGTH && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function createFallbackUsername(seed: string, userId: string) {
  const base = normalizeUsername(seed) || 'perfil'
  const suffix = userId.replace(/-/g, '').slice(0, 8)
  const prefix = base.slice(0, Math.max(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH - suffix.length - 1))

  return `${prefix}-${suffix}`
}

export function buildPublicProfilePath(username: string) {
  return `/u/${username}`
}

export function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'BB'
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
