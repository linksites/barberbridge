create extension if not exists "uuid-ossp";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('barber', 'shop', 'admin')),
  full_name text,
  username text,
  avatar_url text,
  phone text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.slugify_profile_value(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.generate_profile_username(seed text, profile_user_id uuid)
returns text
language plpgsql
immutable
as $$
declare
  base_username text;
  suffix text;
begin
  base_username := public.slugify_profile_value(seed);

  if base_username = '' then
    base_username := 'perfil';
  end if;

  suffix := substr(replace(profile_user_id::text, '-', ''), 1, 8);

  return left(base_username, 23) || '-' || suffix;
end;
$$;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    join auth.users au on au.id = up.id
    join public.admin_emails ae on lower(ae.email) = lower(au.email)
    where up.id = check_user_id
      and up.role = 'admin'
  );
$$;

create table if not exists public.barber_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  bio text,
  city text not null,
  state text,
  neighborhood text,
  experience_years int default 0,
  specialties text[] default '{}',
  instagram text,
  whatsapp text,
  availability_status text not null default 'available',
  average_rating numeric(3,2) not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.barber_portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  barber_profile_id uuid not null references public.barber_profiles(id) on delete cascade,
  image_url text not null,
  title text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.shop_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  shop_name text not null,
  description text,
  city text not null,
  state text,
  neighborhood text,
  address text,
  instagram text,
  whatsapp text,
  average_rating numeric(3,2) not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shop_profiles(id) on delete set null,
  title text not null,
  description text not null,
  work_type text not null default 'Freelancer',
  payment_model text not null default 'Diária',
  amount numeric(10,2) not null default 0,
  city text not null,
  state text,
  neighborhood text,
  start_date date,
  end_date date,
  status text not null default 'open' check (status in ('draft', 'open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  barber_id uuid not null references public.barber_profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'viewed', 'accepted', 'rejected', 'hired')),
  created_at timestamptz not null default now(),
  unique (job_id, barber_id)
);

create table if not exists public.invitations (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references public.shop_profiles(id) on delete cascade,
  barber_id uuid not null references public.barber_profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  message text,
  status text not null default 'sent' check (status in ('sent', 'viewed', 'accepted', 'declined', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  reviewed_user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create or replace view public.jobs_with_shop as
select
  j.id,
  j.title,
  j.description,
  j.work_type,
  j.payment_model,
  j.amount,
  j.city,
  j.state,
  j.neighborhood,
  j.status,
  j.created_at,
  s.shop_name
from public.jobs j
left join public.shop_profiles s on s.id = j.shop_id;

create unique index if not exists user_profiles_username_lower_idx
on public.user_profiles (lower(username))
where username is not null;

insert into public.user_profiles (id, role, full_name, username)
select
  users.id,
  case
    when exists (
      select 1 from public.admin_emails admins
      where lower(admins.email) = lower(users.email)
    ) then 'admin'
    when users.raw_user_meta_data ->> 'role' in ('barber', 'shop') then users.raw_user_meta_data ->> 'role'
    else 'barber'
  end,
  nullif(
    coalesce(
      users.raw_user_meta_data ->> 'full_name',
      users.raw_user_meta_data ->> 'name',
      ''
    ),
    ''
  ),
  public.generate_profile_username(
    coalesce(
      nullif(users.raw_user_meta_data ->> 'full_name', ''),
      nullif(users.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(users.email, ''), '@', 1),
      'perfil'
    ),
    users.id
  )
from auth.users users
left join public.user_profiles profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do nothing;

update public.user_profiles profiles
set username = public.generate_profile_username(
  coalesce(
    nullif(profiles.full_name, ''),
    split_part(coalesce(users.email, ''), '@', 1),
    'perfil'
  ),
  profiles.id
)
from auth.users users
where users.id = profiles.id
  and (profiles.username is null or btrim(profiles.username) = '');

update public.user_profiles profiles
set role = case
  when exists (
    select 1 from public.admin_emails admins
    where lower(admins.email) = lower(users.email)
  ) then 'admin'
  when users.raw_user_meta_data ->> 'role' in ('barber', 'shop') then users.raw_user_meta_data ->> 'role'
  when profiles.role in ('barber', 'shop') then profiles.role
  else 'barber'
end
from auth.users users
where users.id = profiles.id;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  suggested_name text;
begin
  requested_role := case
    when exists (
      select 1 from public.admin_emails admins
      where lower(admins.email) = lower(new.email)
    ) then 'admin'
    when new.raw_user_meta_data ->> 'role' in ('barber', 'shop') then new.raw_user_meta_data ->> 'role'
    else 'barber'
  end;

  suggested_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'perfil'
  );

  insert into public.user_profiles (id, role, full_name, username)
  values (
    new.id,
    requested_role,
    nullif(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      ),
      ''
    ),
    public.generate_profile_username(suggested_name, new.id)
  )
  on conflict (id) do update
  set
    role = public.user_profiles.role,
    full_name = coalesce(public.user_profiles.full_name, excluded.full_name),
    username = coalesce(public.user_profiles.username, excluded.username),
    updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_admin_role_from_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.user_profiles profiles
    set role = 'admin',
        updated_at = now()
    from auth.users users
    where users.id = profiles.id
      and lower(users.email) = lower(new.email);

    return new;
  end if;

  update public.user_profiles profiles
  set role = case
      when users.raw_user_meta_data ->> 'role' in ('barber', 'shop') then users.raw_user_meta_data ->> 'role'
      when profiles.role = 'shop' then 'shop'
      else 'barber'
    end,
    updated_at = now()
  from auth.users users
  where users.id = profiles.id
    and lower(users.email) = lower(old.email);

  return old;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop trigger if exists on_admin_email_sync on public.admin_emails;
create trigger on_admin_email_sync
after insert or delete on public.admin_emails
for each row execute function public.sync_admin_role_from_allowlist();

alter table public.user_profiles enable row level security;
alter table public.barber_profiles enable row level security;
alter table public.barber_portfolio_items enable row level security;
alter table public.shop_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.invitations enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public can view barber profiles" on public.barber_profiles;
create policy "Public can view barber profiles"
on public.barber_profiles for select using (true);

drop policy if exists "Public can view shops" on public.shop_profiles;
create policy "Public can view shops"
on public.shop_profiles for select using (true);

drop policy if exists "Public can view jobs" on public.jobs;
create policy "Public can view jobs"
on public.jobs for select using (true);

drop policy if exists "Users manage own profile shell" on public.user_profiles;
create policy "Users manage own profile shell"
on public.user_profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Public can view user profile shells" on public.user_profiles;
create policy "Public can view user profile shells"
on public.user_profiles for select
using (username is not null and btrim(username) <> '');

drop policy if exists "Admins read all user profiles" on public.user_profiles;
create policy "Admins read all user profiles"
on public.user_profiles for select
using (public.is_admin());

drop policy if exists "Barber manages own profile" on public.barber_profiles;
create policy "Barber manages own profile"
on public.barber_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins read all barber profiles" on public.barber_profiles;
create policy "Admins read all barber profiles"
on public.barber_profiles for select
using (public.is_admin());

drop policy if exists "Shop manages own profile" on public.shop_profiles;
create policy "Shop manages own profile"
on public.shop_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins read all shop profiles" on public.shop_profiles;
create policy "Admins read all shop profiles"
on public.shop_profiles for select
using (public.is_admin());

drop policy if exists "Shop manages own jobs" on public.jobs;
create policy "Shop manages own jobs"
on public.jobs for all
using (
  exists (
    select 1 from public.shop_profiles s
    where s.id = jobs.shop_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.shop_profiles s
    where s.id = jobs.shop_id and s.user_id = auth.uid()
  )
);

drop policy if exists "Admins read all jobs" on public.jobs;
create policy "Admins read all jobs"
on public.jobs for select
using (public.is_admin());

drop policy if exists "Barber creates own applications" on public.job_applications;
create policy "Barber creates own applications"
on public.job_applications for insert
with check (
  exists (
    select 1 from public.barber_profiles b
    where b.id = barber_id and b.user_id = auth.uid()
  )
);

drop policy if exists "Barber reads own applications" on public.job_applications;
create policy "Barber reads own applications"
on public.job_applications for select
using (
  exists (
    select 1 from public.barber_profiles b
    where b.id = barber_id and b.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.jobs j
    join public.shop_profiles s on s.id = j.shop_id
    where j.id = job_applications.job_id and s.user_id = auth.uid()
  )
);

drop policy if exists "Admins read all applications" on public.job_applications;
create policy "Admins read all applications"
on public.job_applications for select
using (public.is_admin());

drop policy if exists "Barber updates own applications" on public.job_applications;
create policy "Barber updates own applications"
on public.job_applications for update
using (
  exists (
    select 1 from public.barber_profiles b
    where b.id = barber_id and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.barber_profiles b
    where b.id = barber_id and b.user_id = auth.uid()
  )
);

drop policy if exists "Barber deletes own applications" on public.job_applications;
create policy "Barber deletes own applications"
on public.job_applications for delete
using (
  exists (
    select 1 from public.barber_profiles b
    where b.id = barber_id and b.user_id = auth.uid()
  )
);

drop policy if exists "Barber reads own invitations" on public.invitations;
create policy "Barber reads own invitations"
on public.invitations for select
using (
  exists (
    select 1 from public.barber_profiles b
    where b.id = invitations.barber_id and b.user_id = auth.uid()
  )
);

drop policy if exists "Admins read all invitations" on public.invitations;
create policy "Admins read all invitations"
on public.invitations for select
using (public.is_admin());

drop policy if exists "Barber updates own invitations" on public.invitations;
create policy "Barber updates own invitations"
on public.invitations for update
using (
  exists (
    select 1 from public.barber_profiles b
    where b.id = invitations.barber_id and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.barber_profiles b
    where b.id = invitations.barber_id and b.user_id = auth.uid()
  )
);

drop policy if exists "Shop reads own invitations" on public.invitations;
create policy "Shop reads own invitations"
on public.invitations for select
using (
  exists (
    select 1 from public.shop_profiles s
    where s.id = invitations.shop_id and s.user_id = auth.uid()
  )
);

drop policy if exists "Shop creates own invitations" on public.invitations;
create policy "Shop creates own invitations"
on public.invitations for insert
with check (
  exists (
    select 1 from public.shop_profiles s
    where s.id = invitations.shop_id and s.user_id = auth.uid()
  )
);

insert into public.jobs (title, description, work_type, payment_model, amount, city, status)
values
  ('Barbeiro freelancer para sexta e sábado', 'Atendimento em alta demanda com cortes, barba e acabamento.', 'Freelancer', 'Diária', 250, 'Belém', 'open'),
  ('Barbeiro fixo com comissão', 'Barbearia em expansão procura profissional com boa presença e técnica.', 'Fixo', 'Comissão + base', 1800, 'Ananindeua', 'open')
on conflict do nothing;


create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages"
on public.messages for select
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
on public.messages for insert
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations"
on public.conversations for select
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "Participants read participants" on public.conversation_participants;
create policy "Participants read participants"
on public.conversation_participants for select
using (user_id = auth.uid());

drop policy if exists "Participants join conversations" on public.conversation_participants;
create policy "Participants join conversations"
on public.conversation_participants for insert
with check (user_id = auth.uid());

drop policy if exists "Authenticated users create reviews" on public.reviews;
create policy "Authenticated users create reviews"
on public.reviews for insert
with check (reviewer_user_id = auth.uid());

drop policy if exists "Public reads reviews" on public.reviews;
create policy "Public reads reviews"
on public.reviews for select
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public"
on storage.objects for select
using (bucket_id = 'profile-avatars');

drop policy if exists "Users upload own avatar images" on storage.objects;
create policy "Users upload own avatar images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "Users update own avatar images" on storage.objects;
create policy "Users update own avatar images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users delete own avatar images" on storage.objects;
create policy "Users delete own avatar images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- storage suggestion:
-- bucket: barber-portfolio
-- path pattern: {user_id}/{file_name}
