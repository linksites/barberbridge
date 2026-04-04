# BarberBridge

Marketplace em Next.js + Supabase para conectar barbeiros e barbearias.

## Status atual

Esta base ja cobre:

- landing page e listagem publica de vagas
- detalhes de vaga via Supabase
- escolha de perfil em `/register`
- login por link magico com Supabase
- fallback de login por codigo OTP em `/login`
- rota de confirmacao do link em `/auth/confirm`
- onboarding persistido em `user_profiles`, `barber_profiles` e `shop_profiles`
- protecao de rotas com sessao SSR e redirecionamento por role
- criacao real de vagas vinculada a `shop_profile` autenticada
- dashboard do barbeiro com leitura real de perfil, candidaturas, reviews e convites
- edicao persistida de perfil em `/dashboard/profile`
- dashboards iniciais para barbeiro e barbearia
- schema SQL com tabelas principais, RLS e base para mensagens

Ainda estao em modo mock ou parcial:

- shortlist de barbeiros
- inbox e realtime
- portfolio com upload real
- substituicao completa dos mocks restantes do produto

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

## Configuracao do Supabase Auth

Para o fluxo de magic link e codigo OTP funcionar com SSR:

1. Em `Authentication -> URL Configuration`, adicione a URL local do app em Redirect URLs
2. Garanta que `http://localhost:3000/auth/confirm` esteja permitido
3. Em `Authentication -> Email Templates -> Magic Link`, envie no mesmo e-mail o botao do magic link e tambem o codigo OTP
4. Se voce personalizar templates de e-mail do Supabase, mantenha o fluxo compativel com `token_hash`, `redirect_to` e `{{ .Token }}`

Template sugerido para o Magic Link:

```html
<h2>Seu acesso ao BarberBridge</h2>
<p>Clique no botao abaixo para entrar com seguranca na sua conta.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&redirect_to={{ .RedirectTo }}">
    Entrar no BarberBridge
  </a>
</p>
<p>Se preferir, use este codigo de 6 digitos:</p>
<p><strong>{{ .Token }}</strong></p>
```

Fluxo atual:

1. Usuario escolhe o perfil em `/register`
2. Faz login em `/login?role=...`
3. Recebe um e-mail com link magico e codigo OTP
4. O Supabase redireciona para `/auth/confirm` quando o link e usado
5. Se preferir, o usuario pode validar o codigo diretamente em `/login`
6. A sessao segue para `/onboarding`
7. O onboarding salva os dados no banco e redireciona para o dashboard correspondente

## Deploy na Vercel

O projeto esta preparado para deploy padrao na Vercel sem configuracao especial de framework.

### Checklist

1. Importe o repositorio na Vercel
2. Mantenha o framework detectado como `Next.js`
3. Em `Settings -> Environment Variables`, adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-ou-publishable
```

4. Em `Settings -> Node.js Version`, prefira Node 20 ou 22
5. Faca o primeiro deploy

### Ajustes no Supabase para producao

Depois de ter a URL da Vercel:

1. Defina a `Site URL` com o dominio de producao
2. Adicione o callback de producao em Redirect URLs:

```txt
https://seu-dominio.vercel.app/auth/confirm
```

3. Se quiser testar previews com magic link, adicione tambem as URLs de preview que voce realmente usar no fluxo de autenticacao

### Observacoes importantes

- O app usa `window.location.origin` para montar o redirect do login, entao o dominio precisa estar autorizado no Supabase
- `.env.local`, `.next`, `node_modules` e `.vercel` ja estao ignorados no repositorio
- O projeto foi atualizado para `next 15.5.14`, removendo as vulnerabilidades reportadas pelo `npm audit` antes do deploy

## Estrutura principal

- `src/app`: rotas App Router
- `src/components`: blocos de UI
- `src/services`: consultas e agregacoes do produto
- `src/lib/supabase`: clients SSR, browser e proxy de sessao
- `supabase/schema.sql`: schema inicial e policies

## Proximos passos recomendados

1. Ligar mensagens ao Realtime
2. Integrar portfolio com Supabase Storage
3. Criar shortlist real de barbeiros com filtros
4. Substituir os mocks restantes do perfil publico `/u/[username]`
5. Evoluir o lado da barbearia para enviar convites reais a barbeiros

## Importante apos atualizar o projeto

Se voce ja aplicou o schema no Supabase antes das ultimas etapas, reaplique a parte nova de [supabase/schema.sql](./supabase/schema.sql) para adicionar as policies de `invitations`. Sem isso, a tela de convites nao conseguira ler nem atualizar status com RLS ativo.

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
