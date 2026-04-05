# BarberBridge

Marketplace em Next.js + Supabase para conectar barbeiros e barbearias.

Produção: `https://barberbridge.vercel.app`

## Resumo executivo

O BarberBridge já tem base funcional de produto e deixou de ser apenas uma landing page com mocks. Hoje o sistema cobre descoberta pública de vagas, autenticação, onboarding, dashboards separados por perfil, CRUD dos fluxos principais e perfis públicos por usuário.

Ao mesmo tempo, o projeto ainda está em uma fase de consolidação. O núcleo do marketplace já existe, mas há frentes importantes para fechar antes de tratar o sistema como "produção madura":

- ciclo de vida completo da conta
- mensageria e realtime
- portfólio com upload real
- shortlist e convites completos
- testes, observabilidade e governança administrativa

## Estado atual do sistema

### O que já funciona

#### Público

- home com direcionamento por perfil
- listagem pública de vagas em `/jobs`
- detalhe de vaga em `/job/[id]`
- navegação guiada para cadastro e login
- header responsivo com menu hambúrguer no mobile

#### Autenticação

- cadastro com e-mail e senha
- login com e-mail e senha
- fallback por magic link
- fallback por código OTP
- callback SSR em `/auth/confirm`
- proteção de rotas e redirecionamento por role via proxy
- logout no header quando o usuário está autenticado

#### Onboarding e perfis

- onboarding persistido em `user_profiles`, `barber_profiles` e `shop_profiles`
- criação automática de shell de perfil em `user_profiles`
- username público por usuário
- avatar por URL
- edição persistida do perfil
- perfil público em `/u/[username]`

#### Barbearia

- criação real de vagas vinculada à `shop_profile`
- listagem de vagas próprias
- edição de vaga própria
- exclusão de vaga própria

#### Barbeiro

- dashboard com leitura real de perfil
- candidaturas reais
- convites reais
- reviews reais
- edição e exclusão da própria candidatura

#### Administração

- base segura para role `admin`
- allowlist de admins em `public.admin_emails`
- bloqueio de promoção a admin via metadata enviada pelo cliente
- dashboard administrativo inicial em `/dashboard/admin`
- leitura administrativa global de usuários, vagas, candidaturas e convites

## O que está parcial ou pendente

- shortlist de barbeiros ainda não está conectada ao banco
- mensagens existem no schema, mas a experiência de inbox e realtime ainda não está fechada
- portfólio ainda não usa upload real com Storage
- convites ainda não fecham toda a ponta operacional do lado da barbearia
- o admin atual é principalmente leitura e monitoramento, não moderação completa
- não existe fluxo de exclusão de conta no produto
- não existe suíte de testes automatizados
- o projeto ainda tem trechos com texto e seed em encoding quebrado

## Análise técnica por área

### Arquitetura

- App Router com `src/app`
- SSR e sessão com `@supabase/ssr`
- separação simples entre `components`, `services` e `lib`
- banco centralizado em `supabase/schema.sql`

Essa arquitetura é boa para um MVP evolutivo. O principal gargalo hoje não é estrutura de pastas, e sim maturidade operacional: migrações, testes, observabilidade e fechamento de fluxos incompletos.

### Banco de dados e RLS

Pontos fortes:

- modelagem principal cobre usuários, perfis, vagas, candidaturas, convites, reviews, conversas e mensagens
- RLS já existe nas tabelas centrais
- regras de ownership estão implementadas para boa parte do CRUD
- camada inicial de administração já foi pensada no banco

Pontos de atenção:

- `supabase/schema.sql` está monolítico; o ideal é evoluir para migrações versionadas
- exclusão de conta ainda não foi desenhada como fluxo do produto
- hoje `jobs.shop_id` usa `on delete set null`, então apagar uma barbearia direto no banco pode deixar vaga órfã
- algumas áreas do schema ainda convivem com seeds e textos antigos com encoding ruim

### Autenticação e autorização

Pontos fortes:

- o sistema hoje não depende apenas de magic link
- login com senha reduziu bastante o atrito de uso
- o proxy já faz proteção de rotas por sessão e por role
- a camada `admin` deixou de depender de metadata controlada pelo cliente

Pontos de atenção:

- é preciso validar no painel do Supabase se as rotas e templates continuam alinhados com o fluxo atual
- falta um fluxo explícito para exclusão de conta, recuperação de senha e gestão de sessão mais completa

### Produto e experiência

Pontos fortes:

- a navegação principal está mais clara
- o usuário já consegue avançar por uma jornada coerente de descoberta -> cadastro -> onboarding -> dashboard
- os dois perfis operacionais principais já têm valor real no sistema

Pontos de atenção:

- algumas áreas ainda passam sensação de "em construção"
- faltam mensagens de sucesso, vazio e erro mais consistentes entre telas
- o dashboard admin ainda não fecha um ciclo completo de suporte/moderação

## Risco importante: exclusão de contas

Hoje não existe um fluxo oficial de exclusão de conta dentro do produto.

Além disso, o schema atual preserva vagas quando a `shop_profile` é removida:

- `shop_profiles.user_id` referencia `auth.users(id)` com `on delete cascade`
- `jobs.shop_id` referencia `shop_profiles(id)` com `on delete set null`

Na prática, isso significa:

1. se a barbearia for apagada em `auth.users`, o perfil da barbearia cai em cascata
2. as vagas ligadas a essa barbearia não são apagadas
3. essas vagas ficam órfãs

Para a regra de negócio que vocês descreveram, o caminho recomendado é:

1. criar um fluxo autenticado de "Encerrar conta"
2. executar a exclusão pelo servidor com controle explícito
3. alterar `jobs.shop_id` para `on delete cascade` ou fazer limpeza transacional manual antes de apagar o usuário

Se a regra for "apagou a conta, apagam-se as vagas", a abordagem mais coerente é alinhar isso no banco e no fluxo do produto.

## Status por módulo

| Módulo | Status | Observação |
| --- | --- | --- |
| Landing e descoberta pública | Estável | Home, jobs e job detail já funcionam |
| Cadastro e login | Estável | Senha, magic link e OTP |
| Onboarding | Estável | Persiste nos perfis corretos |
| Dashboard do barbeiro | Funcional | Ainda pode evoluir em UX |
| Dashboard da barbearia | Funcional | CRUD de vagas já funciona |
| Perfil público | Funcional | Precisa amadurecer visual e portfólio |
| Convites | Parcial | Leitura real existe, envio ainda precisa fechar |
| Mensagens | Parcial | Schema existe, produto ainda não |
| Portfólio | Parcial | Sem upload real |
| Administração | Inicial | Leitura global, sem moderação completa |
| Exclusão de conta | Pendente | Precisa de fluxo e regra de limpeza |
| Testes e observabilidade | Pendente | Ainda sem cobertura adequada |

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- TypeScript

## Estrutura principal

- `src/app`: rotas App Router
- `src/app/api`: endpoints do produto
- `src/components`: UI pública e componentes de dashboard
- `src/services`: consultas e agregações
- `src/lib/supabase`: clients SSR/browser e proxy
- `supabase/schema.sql`: schema, triggers e policies
- `ROADMAP.md`: plano de evolução do produto

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

## Configuração do Supabase Auth

Em `Authentication -> URL Configuration`:

```txt
Site URL:
https://barberbridge.vercel.app

Redirect URLs:
http://localhost:3000/**
https://barberbridge.vercel.app/**
```

Para o template de `Magic Link`, o app já foi ajustado para callback SSR via `/auth/confirm`.

## Administração

O código já suporta uma camada inicial de admin.

Para promover um usuário existente a administrador:

```sql
insert into public.admin_emails (email)
values ('admin@seudominio.com')
on conflict (email) do nothing;
```

Depois disso, o usuário passa a ser reconhecido como `admin` pela lógica segura do banco.

Importante:

- a base administrativa depende de aplicar o `supabase/schema.sql` atualizado
- o dashboard admin atual é de leitura e monitoramento, não de moderação completa

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

## Próximas prioridades

O plano detalhado está em [ROADMAP.md](./ROADMAP.md), mas a ordem recomendada hoje é:

1. fechar exclusão de conta e limpeza de dados relacionados
2. aplicar e publicar a base administrativa
3. concluir convites reais e shortlist
4. implementar mensagens com Realtime
5. integrar portfólio com Storage
6. adicionar testes e observabilidade
