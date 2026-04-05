'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  PROFILE_AVATAR_BUCKET,
  buildAvatarObjectPath,
  extractAvatarObjectPath,
  getAvatarUploadError
} from '@/lib/profile-avatars'
import { normalizeUsername } from '@/lib/public-profiles'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  role: 'barber' | 'shop'
  initialValues: {
    full_name: string
    username: string
    avatar_url: string
    city: string
    state: string
    phone: string
    instagram: string
    bio: string
    neighborhood: string
    specialties: string
    availability_status: string
  }
}

export function ProfileForm({ role, initialValues }: ProfileFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fullName, setFullName] = useState(initialValues.full_name)
  const [username, setUsername] = useState(initialValues.username)
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatar_url)
  const [city, setCity] = useState(initialValues.city)
  const [state, setState] = useState(initialValues.state)
  const [phone, setPhone] = useState(initialValues.phone)
  const [instagram, setInstagram] = useState(initialValues.instagram)
  const [bio, setBio] = useState(initialValues.bio)
  const [neighborhood, setNeighborhood] = useState(initialValues.neighborhood)
  const [specialties, setSpecialties] = useState(initialValues.specialties)
  const [availabilityStatus, setAvailabilityStatus] = useState(initialValues.availability_status)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  async function handleSubmit() {
    if (isUploadingAvatar) {
      setMessage('Aguarde o upload da foto terminar antes de salvar.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          username,
          avatar_url: avatarUrl,
          city,
          state,
          phone,
          instagram,
          bio,
          neighborhood,
          specialties,
          availability_status: availabilityStatus
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Nao foi possivel salvar o perfil.')
        return
      }

      setMessage(data.message)
      router.refresh()
    } catch {
      setMessage('Nao foi possivel salvar o perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const validationError = getAvatarUploadError(file)

    if (validationError) {
      setMessage(validationError)
      event.target.value = ''
      return
    }

    setIsUploadingAvatar(true)
    setMessage('')

    try {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage('Faca login novamente antes de enviar a foto.')
        return
      }

      const previousAvatarPath = extractAvatarObjectPath(avatarUrl)
      const objectPath = buildAvatarObjectPath(user.id, file)

      const { error: uploadError } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

      if (uploadError) {
        setMessage(uploadError.message)
        return
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(objectPath)

      setAvatarUrl(publicUrl)

      if (previousAvatarPath) {
        await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([previousAvatarPath])
      }

      setMessage('Foto enviada. Clique em salvar alteracoes para publicar no perfil.')
    } catch {
      setMessage('Nao foi possivel enviar a foto agora.')
    } finally {
      setIsUploadingAvatar(false)
      event.target.value = ''
    }
  }

  function handleRemoveAvatar() {
    setAvatarUrl('')
    setMessage('Foto removida. Clique em salvar alteracoes para atualizar o perfil.')
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
      <div className="grid gap-4 md:grid-cols-[96px,1fr] md:items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Foto de ${fullName || username || 'perfil'}`}
            className="h-24 w-24 rounded-3xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-800 text-2xl font-semibold text-white">
            {(fullName || username || 'BB').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={username}
            onChange={(event) => setUsername(normalizeUsername(event.target.value))}
            placeholder="username-publico"
          />
          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploadingAvatar ? 'Enviando foto...' : avatarUrl ? 'Trocar foto' : 'Enviar foto'}
            </button>
            {avatarUrl ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="rounded-2xl border border-rose-500/40 px-4 py-3 text-sm font-semibold text-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Remover foto
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Sua foto vai para o Storage do BarberBridge e seu perfil publico ficara disponivel em{' '}
        <span className="text-sky-300">/u/{username || 'seu-username'}</span>.
      </p>
      <input
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder={role === 'shop' ? 'Nome da barbearia' : 'Nome profissional'}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Cidade" />
        <input value={state} onChange={(event) => setState(event.target.value)} placeholder="Estado" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="WhatsApp" />
        <input value={instagram} onChange={(event) => setInstagram(event.target.value)} placeholder="Instagram" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Bairro" />
        {role === 'barber' ? (
          <select value={availabilityStatus} onChange={(event) => setAvailabilityStatus(event.target.value)}>
            <option value="available">Disponivel</option>
            <option value="busy">Em atendimento</option>
            <option value="unavailable">Indisponivel</option>
          </select>
        ) : (
          <input disabled value="Barbearia" className="cursor-not-allowed opacity-70" />
        )}
      </div>
      {role === 'barber' ? (
        <input
          value={specialties}
          onChange={(event) => setSpecialties(event.target.value)}
          placeholder="Especialidades separadas por virgula"
        />
      ) : null}
      <textarea
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        placeholder={role === 'shop' ? 'Descricao da barbearia' : 'Resumo profissional'}
        rows={5}
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || isUploadingAvatar}
        className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Salvando...' : 'Salvar alteracoes'}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </div>
  )
}
