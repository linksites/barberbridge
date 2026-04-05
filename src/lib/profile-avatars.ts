export const PROFILE_AVATAR_BUCKET = 'profile-avatars'
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024

const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function getAvatarUploadError(file: File) {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return 'Envie uma imagem JPG, PNG ou WEBP.'
  }

  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return 'A foto deve ter no maximo 5 MB.'
  }

  return null
}

export function buildAvatarObjectPath(userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || file.type.split('/')[1] || 'jpg'
  const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${userId}/avatar-${Date.now()}.${safeExtension}`
}

export function extractAvatarObjectPath(avatarUrl: string | null | undefined) {
  if (!avatarUrl) {
    return null
  }

  try {
    const url = new URL(avatarUrl)
    const marker = `/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/`
    const markerIndex = url.pathname.indexOf(marker)

    if (markerIndex === -1) {
      return null
    }

    const encodedPath = url.pathname.slice(markerIndex + marker.length)
    return decodeURIComponent(encodedPath)
  } catch {
    return null
  }
}
