'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeUsername } from '@/lib/public-profiles'

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

  async function handleSubmit() {
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
        setMessage(data.message ?? 'Não foi possível salvar o perfil.')
        return
      }

      setMessage(data.message)
      router.refresh()
    } catch {
      setMessage('Não foi possível salvar o perfil.')
    } finally {
      setIsSubmitting(false)
    }
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
            onChange={(e) => setUsername(normalizeUsername(e.target.value))}
            placeholder="username-publico"
          />
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://sua-foto-publica.jpg"
          />
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Seu perfil público ficará disponível em <span className="text-sky-300">/u/{username || 'seu-username'}</span>.
      </p>
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder={role === 'shop' ? 'Nome da barbearia' : 'Nome profissional'}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" />
        <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" />
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
        {role === 'barber' ? (
          <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
            <option value="available">Disponível</option>
            <option value="busy">Em atendimento</option>
            <option value="unavailable">Indisponível</option>
          </select>
        ) : (
          <input disabled value="Barbearia" className="cursor-not-allowed opacity-70" />
        )}
      </div>
      {role === 'barber' ? (
        <input
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          placeholder="Especialidades separadas por vírgula"
        />
      ) : null}
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder={role === 'shop' ? 'Descrição da barbearia' : 'Resumo profissional'}
        rows={5}
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </div>
  )
}
