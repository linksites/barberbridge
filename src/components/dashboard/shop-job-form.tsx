'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ShopJobForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [amount, setAmount] = useState('')
  const [workType, setWorkType] = useState('Freelancer')
  const [paymentModel, setPaymentModel] = useState('Diária')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateJob() {
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          city,
          state,
          neighborhood,
          amount,
          work_type: workType,
          payment_model: paymentModel
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Não foi possível publicar a vaga.')
        return
      }

      setTitle('')
      setDescription('')
      setCity('')
      setState('')
      setNeighborhood('')
      setAmount('')
      setWorkType('Freelancer')
      setPaymentModel('Diária')
      setMessage(data.message)
      router.refresh()
    } catch {
      setMessage('Não foi possível publicar a vaga.')
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
      <button
        onClick={handleCreateJob}
        disabled={isSubmitting}
        className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Publicando...' : 'Publicar vaga'}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </div>
  )
}
