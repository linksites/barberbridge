# Roadmap BarberBridge

## Objetivo

Transformar o BarberBridge de um MVP funcional em um marketplace operacional, seguro e sustentável para produção.

## Princípios

- fechar o ciclo completo dos fluxos já existentes antes de abrir novas frentes
- priorizar integridade de dados e previsibilidade operacional
- tratar banco, auth e UX como partes do mesmo produto
- publicar em etapas pequenas, testáveis e reversíveis

## Fase 1: Estabilização do núcleo

Status: prioridade imediata

### Objetivos

- eliminar comportamentos perigosos ou incompletos do núcleo do sistema
- fechar fluxos que hoje ainda dependem de operação manual
- consolidar o que já existe antes de expandir

### Entregas

- fluxo de exclusão de conta autenticado
- decisão e implementação da regra de exclusão de vagas ao apagar barbearia
- revisão de foreign keys e limpeza de dados órfãos
- aplicação do schema administrativo em produção
- publicação do dashboard admin inicial
- revisão de textos com encoding quebrado
- padronização de estados de erro, loading, sucesso e empty state
- preparação do schema para migrações versionadas

### Critérios de conclusão

- usuário consegue encerrar a própria conta com segurança
- não existem vagas órfãs após exclusão de conta
- admin consegue acessar `/dashboard/admin`
- principais telas não exibem textos corrompidos

## Fase 2: Fechamento do marketplace principal

Status: próxima

### Objetivos

- fechar ponta a ponta dos fluxos que geram valor de negócio
- reduzir dependência de mocks restantes

### Entregas

- envio real de convites pela barbearia
- shortlist real de barbeiros com filtros
- candidatura iniciada a partir da vaga pública
- melhora da jornada de conversão em `/job/[id]`
- consolidação do perfil público `/u/[username]`
- ajustes de UX entre dashboard, vagas, candidaturas e convites

### Critérios de conclusão

- barbearia consegue convidar barbeiros sem fluxo manual
- barbeiro consegue sair de uma vaga pública até candidatura confirmada
- perfil público já representa bem o usuário e ajuda conversão

## Fase 3: Comunicação e reputação

Status: seguinte

### Objetivos

- transformar o marketplace em ambiente de relacionamento contínuo
- aumentar confiança e retenção

### Entregas

- inbox real com conversas e mensagens
- realtime para mensagens e eventos principais
- notificações de candidatura, convite e resposta
- reviews com melhor contexto de origem
- portfólio com upload via Supabase Storage
- melhoria visual da página pública de perfil

### Critérios de conclusão

- usuários conseguem conversar dentro da plataforma
- portfólio deixa de ser apenas URL manual
- reputação e prova social ficam visíveis e úteis

## Fase 4: Operação e governança

Status: depois do núcleo do produto

### Objetivos

- dar ferramentas de suporte, monitoramento e controle ao negócio
- preparar o sistema para volume maior e operação diária

### Entregas

- ações administrativas de moderação
- suspensão e reativação de contas
- fechamento administrativo de vagas
- auditoria básica de ações sensíveis
- métricas operacionais por papel
- observabilidade em produção
- logs e alertas essenciais

### Critérios de conclusão

- operação consegue agir sem mexer direto no banco
- incidentes deixam de depender de inspeção manual no Supabase

## Fase 5: Qualidade e escala

Status: contínua

### Objetivos

- reduzir risco de regressão
- permitir evolução mais rápida com menos medo

### Entregas

- lint configurado de forma não interativa
- testes de integração para auth, onboarding, jobs e applications
- testes de smoke para rotas principais
- revisão de performance e carregamento
- revisão de segurança de rotas e APIs
- documentação de deploy e operação

### Critérios de conclusão

- mudanças principais passam por validação automatizada
- equipe consegue publicar com mais previsibilidade

## Ordem recomendada de execução

1. Exclusão de conta e limpeza de vagas relacionadas
2. Publicação da base administrativa
3. Convites reais pela barbearia
4. Shortlist real e melhorias do funil de contratação
5. Mensagens e realtime
6. Portfólio com upload real
7. Observabilidade, testes e governança

## Decisão técnica recomendada agora

Para alinhar o produto ao comportamento esperado, a recomendação é:

1. criar uma action ou rota server-side para exclusão de conta
2. remover a dependência de exclusão manual no banco
3. fazer com que a remoção de uma barbearia apague ou encerre explicitamente suas vagas

Se a regra de negócio for "apagou a conta, apagam-se as vagas", então o caminho mais simples e coerente é:

- mudar `jobs.shop_id` para `on delete cascade`
- revisar os impactos em `job_applications`, `invitations` e `reviews`
- expor isso em um fluxo claro de confirmação no dashboard
