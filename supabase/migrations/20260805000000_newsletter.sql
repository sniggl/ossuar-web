-- The newsletter list. Two tables, no auth, no policies: nothing but the Edge
-- Functions (service role) ever touches this schema, and RLS with zero policies
-- is what makes that true rather than merely intended.

create extension if not exists citext;

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  -- citext, because Ossuar@… and ossuar@… are one person and one unique row
  email citext not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  -- the secret in every confirm and unsubscribe link; rotated on re-subscribe
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  -- consent evidence: who asked, from where, and when they confirmed it
  signup_ip inet,
  confirm_ip inet
);

create index subscribers_status_idx on public.subscribers (status);
create index subscribers_signup_ip_idx on public.subscribers (signup_ip, created_at desc);

alter table public.subscribers enable row level security;

-- One row per journal entry that has gone out. The send loop is idempotent
-- because of this table: an entry already here is never mailed twice, however
-- often a deploy re-runs it.
create table public.sends (
  slug text primary key,
  sent_at timestamptz not null default now(),
  recipients integer not null default 0
);

alter table public.sends enable row level security;
