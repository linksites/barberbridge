'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AccountDangerZone() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const canDelete = confirmation.trim().toUpperCase() === 'EXCLUIR'

  async function handleDeleteAccount() {
    if (!canDelete) {
      setMessage('Digite EXCLUIR para confirmar.')
      return
    }

    setIsDeleting(true)
    setMessage('')

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Nao foi possivel excluir a conta.')
        return
      }

      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      setMessage('Nao foi possivel excluir a conta.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-8">
      <h2 className="text-2xl font-semibold text-white">Zona de perigo</h2>
      <p className="mt-3 text-sm text-slate-300">
        Esta acao exclui sua conta e remove os dados ligados a ela. Para barbearias, as vagas criadas pela conta
        tambem sao removidas.
      </p>

      <div className="mt-6 grid gap-4">
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Digite EXCLUIR para confirmar"
        />
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting || !canDelete}
          className="rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? 'Excluindo conta...' : 'Excluir conta permanentemente'}
        </button>
        {message ? <p className="text-sm text-rose-100">{message}</p> : null}
      </div>
    </section>
  )
}
