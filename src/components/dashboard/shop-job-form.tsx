'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShopJobFormProps {
  mode?: 'create' | 'edit'
  jobId?: string
  initialValues?: {
    title: string
    description: string
    city: string
    state: string
    neighborhood: string
    amount: string
    workType: string
    paymentModel: string
    status?: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ShopJobForm({
  mode = 'create',
  jobId,
  initialValues,
  onSuccess,
  onCancel
}: ShopJobFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [city, setCity] = useState(initialValues?.city ?? '')
  const [state, setState] = useState(initialValues?.state ?? '')
  const [neighborhood, setNeighborhood] = useState(initialValues?.neighborhood ?? '')
  const [amount, setAmount] = useState(initialValues?.amount ?? '')
  const [workType, setWorkType] = useState(initialValues?.workType ?? 'Freelancer')
  const [paymentModel, setPaymentModel] = useState(initialValues?.paymentModel ?? 'Diária')
  const [status, setStatus] = useState(initialValues?.status ?? 'open')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(mode === 'edit' && jobId ? `/api/jobs/${jobId}` : '/api/jobs', {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          city,
          state,
          neighborhood,
          amount,
          work_type: workType,
          payment_model: paymentModel,
          status
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Não foi possível salvar a vaga.')
        return
      }

      if (mode === 'create') {
        setTitle('')
        setDescription('')
        setCity('')
        setState('')
        setNeighborhood('')
        setAmount('')
        setWorkType('Freelancer')
        setPaymentModel('Diária')
        setStatus('open')
      }

      setMessage(data.message)
      router.refresh()
      onSuccess?.()
    } catch {
      setMessage(mode === 'edit' ? 'Não foi possível atualizar a vaga.' : 'Não foi possível publicar a vaga.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da vaga" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da vaga" rows={5} />
      <div className="grid gap-4 md:grid-cols-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" />
        <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" inputMode="decimal" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <select value={workType} onChange={(e) => setWorkType(e.target.value)}>
          <option value="Freelancer">Freelancer</option>
          <option value="Fixo">Fixo</option>
          <option value="Temporário">Temporário</option>
        </select>
        <select value={paymentModel} onChange={(e) => setPaymentModel(e.target.value)}>
          <option value="Diária">Diária</option>
          <option value="Comissão + base">Comissão + base</option>
          <option value="Comissão">Comissão</option>
          <option value="Salário fixo">Salário fixo</option>
          <option value="Por atendimento">Por atendimento</option>
        </select>
      </div>
      {mode === 'edit' ? (
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Rascunho</option>
          <option value="open">Aberta</option>
          <option value="closed">Fechada</option>
        </select>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (mode === 'edit' ? 'Salvando...' : 'Publicando...') : mode === 'edit' ? 'Salvar vaga' : 'Publicar vaga'}
        </button>
        {mode === 'edit' && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white"
          >
            Cancelar
          </button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </div>
  )
}
