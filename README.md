# BarberBridge

Marketplace em Next.js + Supabase para conectar barbeiros e barbearias.

## Visão geral

O projeto já saiu da fase de landing page isolada e hoje cobre uma base funcional de produto:

- páginas públicas para descoberta de vagas
- autenticação com Supabase
- onboarding por perfil
- dashboards separados para barbeiro e barbearia
- criação, edição e exclusão de registros do próprio usuário nos fluxos principais

O ambiente publicado está em:

- `https://barberbridge.vercel.app`

## O que já funciona

### Público

- home com direcionamento para barbeiro, barbearia e exploração de vagas
- listagem pública em `/jobs`
- detalhe de vaga em `/job/[id]`
- fluxo guiado de entrada a partir de vaga -> cadastro -> login

### Autenticação e onboarding

- escolha de perfil em `/register`
- login por magic link com Supabase
- fallback por código OTP em `/login`
- login por e-mail e senha
- callback SSR em `/auth/confirm`
- normalização de redirects quebrados ou codificados no callback
- onboarding persistido em `user_profiles`, `barber_profiles` e `shop_profiles`

### Navegação

- header público com CTAs por perfil
- navegação de dashboard por role em `src/app/dashboard/layout.tsx`
- dashboard do barbeiro com atalhos para vagas, candidaturas, convites e perfil
- dashboard da barbearia com atalhos para operação e gestão das vagas

### Barbearia

- criação real de vaga vinculada a `shop_profile`
- listagem de vagas próprias no dashboard
- edição de vaga própria
- exclusão de vaga própria

### Barbeiro

- leitura real de perfil, candidaturas, reviews e convites
- edição persistida de perfil
- edição da própria candidatura enquanto ela ainda está em andamento
- exclusão da própria candidatura enquanto ela ainda está em andamento

## O que ainda está parcial

- shortlist de barbeiros ainda usa mock
- inbox e realtime ainda não estão ligados ao banco
- portfólio ainda não usa upload real com Storage
- perfil público `/u/[username]` ainda não está fechado como experiência de produção
- envio de convites pela barbearia ainda não fecha toda a ponta operacional

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)

## Como rodar localmente

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

## Fluxo principal do produto

### Visitante

1. Entra em `/`
2. Vai para `/jobs` ou escolhe o perfil em `/register`
3. Abre uma vaga em `/job/[id]`
4. Segue para cadastro ou login

### Barbeiro

1. Faz login em `/login`
2. Conclui onboarding em `/onboarding`
3. Cai em `/dashboard/barber`
4. Explora vagas
5. Acompanha candidaturas em `/dashboard/applications`
6. Acompanha convites em `/dashboard/invitations`

### Barbearia

1. Faz login em `/login`
2. Conclui onboarding em `/onboarding`
3. Cai em `/dashboard/shop`
4. Publica vaga
5. Edita ou exclui vagas próprias
6. Evolui o funil de contratação

## Configuração do Supabase Auth

Para o fluxo de magic link e código OTP funcionar com SSR:

1. Em `Authentication -> URL Configuration`, configure:

```txt
Site URL:
https://barberbridge.vercel.app

Redirect URLs:
http://localhost:3000/**
https://barberbridge.vercel.app/**
```

2. Em `Authentication -> Email Templates -> Magic Link`, envie no mesmo e-mail:
- o botão do magic link
- o código OTP

Template sugerido:

```html
<h2>Seu acesso ao BarberBridge</h2>
<p>Clique no botão abaixo para entrar com segurança na sua conta.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&redirect_to={{ .RedirectTo }}">
    Entrar no BarberBridge
  </a>
</p>
<p>Se preferir, use este código de 6 dígitos:</p>
<p><strong>{{ .Token }}</strong></p>
```

### Observações sobre o callback

- o app trata `token_hash`, `redirect_to` e redirects codificados na rota `/auth/confirm`
- o login por código OTP também pode ser validado direto em `/login`
- se um link antigo apontar para um deployment antigo da Vercel, gere um e-mail novo

## Deploy na Vercel

O projeto está preparado para deploy padrão na Vercel.

### Checklist

1. Importe o repositório na Vercel
2. Mantenha o framework como `Next.js`
3. Adicione as env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-ou-publishable
```

4. Use Node 20
5. Faça o deploy

O `package.json` já fixa:

```json
"engines": {
  "node": "20.x"
}
```

## Estrutura principal

- `src/app`: rotas App Router
- `src/app/api`: endpoints de onboarding, perfil, vagas, candidaturas e convites
- `src/components`: UI pública e componentes de dashboard
- `src/services`: consultas e agregações do produto
- `src/lib/supabase`: clients SSR, browser e proxy de sessão
- `supabase/schema.sql`: schema inicial e policies

## Importante após atualizar o schema

Se você já aplicou o schema no Supabase antes das últimas etapas, reaplique a parte nova de [supabase/schema.sql](./supabase/schema.sql) para adicionar as policies mais recentes, especialmente:

- `invitations`
- `job_applications` update/delete pelo barbeiro

Sem isso, parte do CRUD vai falhar por causa do RLS.

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

## Próximos passos recomendados

1. Ligar mensagens ao Realtime
2. Integrar portfólio com Supabase Storage
3. Criar shortlist real de barbeiros com filtros
4. Fechar o perfil público `/u/[username]`
5. Implementar envio real de convites pela barbearia
