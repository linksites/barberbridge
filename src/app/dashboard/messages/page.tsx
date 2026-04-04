import { SectionCard } from '@/components/dashboard/section-card'
import { messageThreads } from '@/services/mock-data'

const messages = [
  { id: '1', author: 'Barbearia Prime', text: 'Pode vir para um teste amanhã às 10h?', own: false },
  { id: '2', author: 'Você', text: 'Posso sim. Levo meu material completo.', own: true },
  { id: '3', author: 'Barbearia Prime', text: 'Perfeito. Já deixei separado o espaço.', own: false }
]

export default function MessagesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-white">Mensagens</h1>
        <p className="mt-3 text-slate-300">Inbox base para evoluir com Supabase Realtime depois.</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[340px,1fr]">
        <SectionCard title="Conversas" description="Lista de contatos recentes">
          <div className="space-y-4">
            {messageThreads.map((thread) => (
              <div key={thread.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-semibold text-white">{thread.name}</h2>
                  {thread.unread > 0 ? <span className="rounded-full bg-sky-500 px-2 py-1 text-xs font-semibold text-slate-950">{thread.unread}</span> : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">{thread.lastMessage}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Thread ativa" description="Modelo de tela de conversa pronta para ligação com banco.">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-xl rounded-3xl p-4 text-sm ${message.own ? 'ml-auto bg-sky-500 text-slate-950' : 'bg-slate-950/70 text-slate-200 border border-slate-800'}`}>
                <p className="font-semibold">{message.author}</p>
                <p className="mt-2">{message.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <input placeholder="Digite uma mensagem" className="flex-1" />
            <button className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">Enviar</button>
          </div>
        </SectionCard>
      </div>
    </main>
  )
}
