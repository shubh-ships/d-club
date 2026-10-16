-- Bhajan Clubbing — run in Supabase Dashboard → SQL Editor (project ljqiwuqowbsjveglujig).
-- Visitors (anon role) can only INSERT name + phone + age + pincode + gender. They cannot read, update or delete rows.
-- View registrations in Table Editor (dashboard bypasses RLS).

create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  phone text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  age smallint check (age between 5 and 100),
  pincode text check (pincode ~ '^[1-9][0-9]{5}$'),
  gender text check (gender in ('male', 'female', 'other')),
  created_at timestamptz not null default now()
);

-- Existing table from before the age field: add the column (safe to re-run).
alter table public.registrations add column if not exists age smallint;
alter table public.registrations drop constraint if exists registrations_age_check;
alter table public.registrations add constraint registrations_age_check check (age between 5 and 100);

-- PIN code (6 digits, Indian format) added 2026-10-16 (safe to re-run).
alter table public.registrations add column if not exists pincode text;
alter table public.registrations drop constraint if exists registrations_pincode_check;
alter table public.registrations add constraint registrations_pincode_check check (pincode ~ '^[1-9][0-9]{5}$');

alter table public.registrations enable row level security;

revoke all on public.registrations from anon, authenticated;
-- Gender added 2026-10-16 (safe to re-run).
alter table public.registrations add column if not exists gender text;
alter table public.registrations drop constraint if exists registrations_gender_check;
alter table public.registrations add constraint registrations_gender_check check (gender in ('male', 'female', 'other'));

grant insert (name, phone, age, pincode, gender) on public.registrations to anon;

drop policy if exists "Public can register" on public.registrations;
create policy "Public can register"
  on public.registrations
  for insert
  to anon
  with check (true);

-- Live "X people already have their pass" counter on the site.
-- Returns only the total; visitors still cannot read any names or phone numbers.
create or replace function public.registration_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.registrations
$$;

revoke all on function public.registration_count() from public;
grant execute on function public.registration_count() to anon;
