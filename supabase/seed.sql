-- BarberBridge development seed
-- Execute manually only in development or demo environments.

insert into public.jobs (title, description, work_type, payment_model, amount, city, state, status)
select *
from (
  values
    (
      'Barbeiro freelancer para sexta e sabado',
      'Atendimento em alta demanda com cortes, barba e acabamento.',
      'Freelancer',
      'Diaria',
      250,
      'Belem',
      'PA',
      'open'
    ),
    (
      'Barbeiro fixo com comissao',
      'Barbearia em expansao procura profissional com boa presenca e tecnica.',
      'Fixo',
      'Comissao + base',
      1800,
      'Ananindeua',
      'PA',
      'open'
    )
) as seed(title, description, work_type, payment_model, amount, city, state, status)
where not exists (
  select 1
  from public.jobs existing
  where existing.shop_id is null
    and lower(existing.title) = lower(seed.title)
    and lower(existing.city) = lower(seed.city)
    and lower(coalesce(existing.state, '')) = lower(coalesce(seed.state, ''))
    and existing.amount = seed.amount
    and existing.status = seed.status
);
