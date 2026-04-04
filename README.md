# BarberBridge

Marketplace em Next.js + Supabase para conectar barbeiros e barbearias.

## Status atual

Esta base já cobre:

- landing page e listagem pública de vagas
- detalhes de vaga via Supabase
- escolha de perfil em `/register`
- login por link mágico com Supabase
- rota de confirmação do link em `/auth/confirm`
- onboarding persistido em `user_profiles`, `barber_profiles` e `shop_profiles`
- proteção de rotas com sessão SSR e redirecionamento por role
- criação real de vagas vinculada à `shop_profile` autenticada
- dashboard do barbeiro com leitura real de perfil, candidaturas, reviews e convites
- edição persistida de perfil em `/dashboard/profile`
- dashboards iniciais para barbeiro e barbearia
- schema SQL com tabelas principais, RLS e base para mensagens

Ainda estão em modo mock ou parcial:

- shortlist de barbeiros
- inbox e realtime
- portfólio com upload real
- substituição completa dos mocks restantes do produto

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)

## Como rodar

1. Copie `.env.example` para `.env.local`
2. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-ou-publishable
```

3. Execute o SQL de [supabase/schema.sql](./supabase/schema.sql)
4. Rode `npm install`
5. Rode `npm run dev`
6. Acesse `http://localhost:3000`

## Configuração do Supabase Auth

Para o fluxo de magic link funcionar com SSR:

1. Em `Authentication -> URL Configuration`, adicione a URL local do app em Redirect URLs
2. Garanta que `http://localhost:3000/auth/confirm` esteja permitido
3. Se você personalizar templates de e-mail do Supabase, mantenha o fluxo compatível com `code` e `token_hash`, porque a confirmação é tratada pela rota `/auth/confirm`

Fluxo atual:

1. Usuário escolhe o perfil em `/register`
2. Faz login em `/login?role=...`
3. Recebe o link mágico
4. O Supabase redireciona para `/auth/confirm`
5. A rota valida a sessão e envia o usuário para `/onboarding`
6. O onboarding salva os dados no banco e redireciona para o dashboard correspondente

## Deploy na Vercel

O projeto está preparado para deploy padrão na Vercel sem configuração especial de framework.

### Checklist

1. Importe o repositório na Vercel
2. Mantenha o framework detectado como `Next.js`
3. Em `Settings -> Environment Variables`, adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-ou-publishable
```

4. Em `Settings -> Node.js Version`, prefira Node 20 ou 22
5. Faça o primeiro deploy

### Ajustes no Supabase para produção

Depois de ter a URL da Vercel:

1. Defina a `Site URL` com o domínio de produção
2. Adicione o callback de produção em Redirect URLs:

```txt
https://seu-dominio.vercel.app/auth/confirm
```

3. Se quiser testar previews com magic link, adicione também as URLs de preview que você realmente usar no fluxo de autenticação

### Observações importantes

- O app usa `window.location.origin` para montar o redirect do magic link, então o domínio precisa estar autorizado no Supabase
- `.env.local`, `.next`, `node_modules` e `.vercel` já estão ignorados no repositório
- O projeto foi atualizado para `next 15.5.14`, removendo as vulnerabilidades reportadas pelo `npm audit` antes do deploy

## Estrutura principal

- `src/app`: rotas App Router
- `src/components`: blocos de UI
- `src/services`: consultas e agregações do produto
- `src/lib/supabase`: clients SSR, browser e proxy de sessão
- `supabase/schema.sql`: schema inicial e policies

## Próximos passos recomendados

1. Ligar mensagens ao Realtime
2. Integrar portfólio com Supabase Storage
3. Criar shortlist real de barbeiros com filtros
4. Substituir os mocks restantes do perfil público `/u/[username]`
5. Evoluir o lado da barbearia para enviar convites reais a barbeiros

## Importante após atualizar o projeto

Se você já aplicou o schema no Supabase antes das últimas etapas, reaplique a parte nova de [supabase/schema.sql](./supabase/schema.sql) para adicionar as policies de `invitations`. Sem isso, a tela de convites não conseguirá ler nem atualizar status com RLS ativo.

## Rotas principais

- `/`
- `/jobs`
- `/job/[id]`
- `/register`
- `/login`
- `/onboarding`
- `/u/[username]`
- `/dashboard/barber`
- `/dashboard/shop`
- `/dashboard/messages`
- `/dashboard/reviews`
- `/dashboard/portfolio`
- `/dashboard/applications`
- `/dashboard/invitations`
- `/dashboard/profile`
