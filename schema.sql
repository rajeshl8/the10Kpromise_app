create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Admins
create table if not exists public.admins (
  user_id uuid primary key,
  note text,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

drop policy if exists admins_full on public.admins;
create policy admins_full on public.admins
for all using (public.is_admin()) with check (public.is_admin());

-- Partners
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  display_name text,
  first_name text,
  last_name text,
  hgi_partner_id text unique,
  personal_target integer default 100,
  created_at timestamptz default now()
);
alter table public.partners enable row level security;

create index if not exists idx_partners_hgi   on public.partners(hgi_partner_id);
create index if not exists idx_partners_email on public.partners(email);

drop policy if exists partners_select on public.partners;
create policy partners_select on public.partners
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists partners_insert on public.partners;
create policy partners_insert on public.partners
for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists partners_update on public.partners;
create policy partners_update on public.partners
for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

-- Protections
create sequence if not exists protection_seq;

create or replace function public.gen_protection_id()
returns text language sql stable as $$
  select 'PTK-'||to_char(now(),'YYMM')||'-'||lpad(nextval('protection_seq')::text,5,'0');
$$;

create table if not exists public.protections (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique default public.gen_protection_id(),

  partner_id uuid references public.partners(id) on delete set null,
  partner_user_id uuid not null,

  family_notes text,
  client_state text,
  product_type text,
  promise_date date,

  status text not null default 'approved' check (status in ('pending','approved','rejected','deleted')),
  extra jsonb not null default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.protections enable row level security;

create index if not exists idx_protections_status_created on public.protections(status, created_at desc);
create index if not exists idx_protections_promise on public.protections(promise_date);
create index if not exists idx_protections_product on public.protections(product_type);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_set_updated_at on public.protections;
create trigger trg_set_updated_at before update on public.protections for each row execute procedure public.set_updated_at();

drop policy if exists prot_select on public.protections;
create policy prot_select on public.protections
for select using (public.is_admin() or partner_user_id = auth.uid());

drop policy if exists prot_insert on public.protections;
create policy prot_insert on public.protections
for insert with check (public.is_admin() or partner_user_id = auth.uid());

drop policy if exists prot_update_admin on public.protections;
create policy prot_update_admin on public.protections
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists prot_delete_admin on public.protections;
create policy prot_delete_admin on public.protections
for delete using (public.is_admin());

create or replace function public.soft_delete_protection(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only admins can soft-delete'; end if;
  update public.protections set status='deleted', deleted_at=now() where id=p_id;
end $$;

-- Staging for CSV/Excel imports (admins only)
drop table if exists public.staging_protections cascade;
create table public.staging_protections (
  id uuid primary key default gen_random_uuid(),
  partner_first_name text,
  partner_last_name text,
  hgi_partner_id text,
  partner_email text,
  client_state text,
  product_type text,
  promise_date date,
  family_notes text,
  status text default 'approved',
  extra jsonb default '{}'::jsonb,
  raw jsonb,
  created_at timestamptz default now()
);
alter table public.staging_protections enable row level security;

drop policy if exists staging_admin_all on public.staging_protections;
create policy staging_admin_all on public.staging_protections
for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.promote_staging_protections()
returns table(inserted_count integer) language plpgsql security definer set search_path = public as $$
declare v_cnt integer := 0;
begin
  if not public.is_admin() then raise exception 'Only admins can promote imports'; end if;

  with src as (
    select id as staging_id,
           nullif(trim(partner_first_name),'') as first_name,
           nullif(trim(partner_last_name),'')  as last_name,
           nullif(trim(hgi_partner_id),'')     as hgi_id,
           nullif(trim(partner_email),'')      as email,
           nullif(trim(client_state),'')       as client_state,
           nullif(trim(product_type),'')       as product_type,
           promise_date,
           nullif(trim(family_notes),'')       as family_notes,
           coalesce(nullif(trim(status),''), 'approved') as status,
           coalesce(extra, '{}'::jsonb) as extra
    from public.staging_protections
  ),
  resolved_partner as (
    select s.*,
           (select id from public.partners where hgi_partner_id = s.hgi_id) as p_by_hgi,
           (select id from public.partners where email = s.email)          as p_by_email
    from src s
  ),
  ensured_partner as (
    insert into public.partners (id, user_id, email, display_name, first_name, last_name, hgi_partner_id)
    select gen_random_uuid(), gen_random_uuid(),
           coalesce(r.email, concat(lower(r.first_name), '.', lower(r.last_name), '@unknown')),
           null, r.first_name, r.last_name, r.hgi_id
    from resolved_partner r
    where r.p_by_hgi is null and r.p_by_email is null
    returning id
  ),
  final_partner as (
    select coalesce(r.p_by_hgi, r.p_by_email, ep.id) as partner_id, r.*
    from resolved_partner r left join ensured_partner ep on true
  ),
  upsert_profile as (
    update public.partners p
       set first_name = coalesce(p.first_name, fp.first_name),
           last_name  = coalesce(p.last_name,  fp.last_name),
           hgi_partner_id = coalesce(p.hgi_partner_id, fp.hgi_id),
           email = coalesce(p.email, fp.email)
      from final_partner fp where p.id = fp.partner_id
    returning p.id
  ),
  inserted as (
    insert into public.protections (
      partner_id, partner_user_id, family_notes,
      status, extra, client_state, product_type, promise_date
    )
    select fp.partner_id,
           (select user_id from public.partners where id = fp.partner_id),
           fp.family_notes,
           fp.status, fp.extra, fp.client_state, fp.product_type, fp.promise_date
    from final_partner fp
    returning id
  )
  delete from public.staging_protections;

  get diagnostics v_cnt = row_count;
  return query select v_cnt;
end $$;

-- Counter view
create or replace view public.protection_metrics as
select (select count(*) from public.protections where status='approved' and deleted_at is null) as protected_count;

-- Partner statistics view
create or replace view public.partner_stats as
select 
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  coalesce(p.first_name || ' ' || p.last_name, p.display_name, p.email) as full_name,
  p.personal_target,
  count(pr.id) filter (where pr.status = 'approved' and pr.deleted_at is null) as completed_count,
  p.created_at
from public.partners p
left join public.protections pr on pr.partner_user_id = p.user_id
group by p.id, p.user_id, p.email, p.display_name, p.first_name, p.last_name, p.personal_target, p.created_at;

-- Leaderboard view (top performers)
create or replace view public.leaderboard as
select 
  p.id,
  p.user_id,
  coalesce(p.first_name || ' ' || p.last_name, p.display_name, split_part(p.email, '@', 1)) as name,
  p.personal_target,
  count(pr.id) filter (where pr.status = 'approved' and pr.deleted_at is null) as completed_count,
  round(
    (count(pr.id) filter (where pr.status = 'approved' and pr.deleted_at is null)::numeric / 
    nullif(p.personal_target, 0)::numeric) * 100, 
    1
  ) as completion_percentage
from public.partners p
left join public.protections pr on pr.partner_user_id = p.user_id
group by p.id, p.user_id, p.first_name, p.last_name, p.display_name, p.email, p.personal_target
having count(pr.id) filter (where pr.status = 'approved' and pr.deleted_at is null) > 0
order by completed_count desc, completion_percentage desc
limit 50;
