'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApplicationEntryActionsProps {
  applicationId: string
  initialMessage: string | null
  status: string
}

export function ApplicationEntryActions({
  applicationId,
  initialMessage,
  status
}: ApplicationEntryActionsProps) {
  const router = useRouter()
  const [message, setMessage] = useState(initialMessage ?? '')
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const canManage = ['pending', 'viewed'].includes(status)

  async function handleSave() {
    setIsSaving(true)
    setFeedback('')

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const data = await response.json()

      if (!response.ok) {
        setFeedback(data.message ?? 'Nao foi possivel atualizar a candidatura.')
        return
      }

      setFeedback(data.message)
      router.refresh()
    } catch {
      setFeedback('Nao foi possivel atualizar a candidatura.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Excluir esta candidatura?')) {
      return
    }

    setIsDeleting(true)
    setFeedback('')

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (!response.ok) {
        setFeedback(data.message ?? 'Nao foi possivel excluir a candidatura.')
        return
      }

      router.refresh()
    } catch {
      setFeedback('Nao foi possivel excluir a candidatura.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!canManage) {
    return null
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <label className="block text-sm font-medium text-slate-300">Mensagem da candidatura</label>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        className="mt-3 w-full"
        placeholder="Explique rapidamente por que esta vaga combina com voce."
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? 'Salvando...' : 'Salvar candidatura'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-2xl border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir candidatura'}
        </button>
      </div>
      {feedback ? <p className="mt-3 text-sm text-slate-300">{feedback}</p> : null}
    </div>
  )
}
