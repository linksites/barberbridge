'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function InvitationActions({
  invitationId,
  currentStatus
}: {
  invitationId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  async function updateStatus(status: 'accepted' | 'declined' | 'viewed') {
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Não foi possível atualizar o convite.')
        return
      }

      setMessage(data.message)
      router.refresh()
    } catch {
      setMessage('Não foi possível atualizar o convite.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!['sent', 'viewed'].includes(currentStatus)) {
    return message ? <p className="text-xs text-slate-400">{message}</p> : null
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {currentStatus === 'sent' ? (
        <button
          onClick={() => updateStatus('viewed')}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-white disabled:opacity-70"
        >
          Marcar como visto
        </button>
      ) : null}
      <button
        onClick={() => updateStatus('accepted')}
        disabled={isSubmitting}
        className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-70"
      >
        Aceitar
      </button>
      <button
        onClick={() => updateStatus('declined')}
        disabled={isSubmitting}
        className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-white disabled:opacity-70"
      >
        Recusar
      </button>
      {message ? <p className="w-full text-xs text-slate-400">{message}</p> : null}
    </div>
  )
}
