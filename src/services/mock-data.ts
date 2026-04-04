export const barberDashboardStats = [
  { title: 'Convites recebidos', value: '12', helper: '3 novos hoje' },
  { title: 'Candidaturas ativas', value: '7', helper: '2 visualizadas' },
  { title: 'Avaliação média', value: '4.9', helper: 'Baseado em 18 reviews' },
  { title: 'Ganhos projetados', value: 'R$ 2.450', helper: 'Próximos 30 dias' }
]

export const shopDashboardStats = [
  { title: 'Vagas abertas', value: '4', helper: '2 com alta procura' },
  { title: 'Candidatos qualificados', value: '19', helper: '7 com portfólio forte' },
  { title: 'Tempo médio de fechamento', value: '2,4 dias', helper: 'Meta: abaixo de 2 dias' },
  { title: 'Satisfação geral', value: '4.8', helper: 'Feedback dos profissionais' }
]

export const portfolioItems = [
  {
    id: '1',
    title: 'Fade navalhado premium',
    description: 'Acabamento limpo com desenho lateral e barba alinhada.',
    image_url: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: '2',
    title: 'Corte social moderno',
    description: 'Visual corporativo com textura no topo.',
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: '3',
    title: 'Barba premium',
    description: 'Tratamento com toalha quente e acabamento detalhado.',
    image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80'
  }
]

export const applicationRows = [
  { id: 'a1', vacancy: 'Barbeiro freelancer para sexta e sábado', place: 'Barbearia Prime', city: 'Belém', status: 'Visualizada', amount: 'R$ 250/dia' },
  { id: 'a2', vacancy: 'Barbeiro fixo com comissão', place: 'Studio Cut', city: 'Ananindeua', status: 'Em análise', amount: 'Comissão + base' }
]

export const invitationRows = [
  { id: 'i1', shop: 'Black Gold Barber', role: 'Cobertura para feriado', city: 'Belém', status: 'Novo', note: 'Preciso de um profissional para sexta e sábado.' },
  { id: 'i2', shop: 'Barbearia Central', role: 'Teste prático', city: 'Castanhal', status: 'Visualizado', note: 'Gostamos do seu portfólio.' }
]

export const reviewRows = [
  { id: 'r1', author: 'Barbearia Prime', rating: 5, comment: 'Excelente técnica e ótimo atendimento ao cliente.', date: '2026-03-28' },
  { id: 'r2', author: 'Black Gold Barber', rating: 5, comment: 'Pontual, profissional e ótimo acabamento.', date: '2026-03-12' },
  { id: 'r3', author: 'Studio Cut', rating: 4, comment: 'Boa adaptação ao fluxo da casa.', date: '2026-02-20' }
]

export const messageThreads = [
  { id: 'm1', name: 'Barbearia Prime', lastMessage: 'Pode vir para um teste amanhã às 10h?', unread: 2 },
  { id: 'm2', name: 'Black Gold Barber', lastMessage: 'Fechamos a diária de sábado.', unread: 0 },
  { id: 'm3', name: 'Studio Cut', lastMessage: 'Envie mais fotos do seu portfólio.', unread: 1 }
]

export const shopApplicants = [
  { id: 's1', name: 'João Victor', specialty: 'Fade, barba e pigmentação', city: 'Belém', rating: '4.9', status: 'Disponível' },
  { id: 's2', name: 'Kaique Santos', specialty: 'Corte social e atendimento premium', city: 'Ananindeua', rating: '4.8', status: 'Em teste' },
  { id: 's3', name: 'Lucas Martins', specialty: 'Navalhado e freestyle', city: 'Belém', rating: '4.7', status: 'Novo candidato' }
]
