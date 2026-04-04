'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShopJobForm } from '@/components/dashboard/shop-job-form'

interface JobEntryActionsProps {
  job: {
    id: string
    title: string
    description?: string | null
    city: string
    state?: string | null
    neighborhood?: string | null
    amount: number
    work_type: string
    payment_model: string
    status: string
  }
}

export function JobEntryActions({ job }: JobEntryActionsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleDelete() {
    if (!window.confirm(`Excluir a vaga "${job.title}"?`)) {
      return
    }

    setIsDeleting(true)
    setMessage('')

    try {
      const response = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Não foi possível excluir a vaga.')
        return
      }

      router.refresh()
    } catch {
      setMessage('Não foi possível excluir a vaga.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <ShopJobForm
          mode="edit"
          jobId={job.id}
          initialValues={{
            title: job.title,
            description: job.description ?? '',
            city: job.city,
            state: job.state ?? '',
            neighborhood: job.neighborhood ?? '',
            amount: String(job.amount),
            workType: job.work_type,
            paymentModel: job.payment_model,
            status: job.status
          }}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false)
            router.refresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Editar vaga
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-2xl border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isDeleting ? 'Excluindo...' : 'Excluir vaga'}
      </button>
      {message ? <p className="text-sm text-rose-300">{message}</p> : null}
    </div>
  )
}
