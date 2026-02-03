-- Run this in your Supabase SQL Editor to match the application code

-- Check if table exists, if not create it (this is a basic structure)
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company text,
  name text, -- Contact Name
  email text,
  source text, -- 'AliveAI' or 'Zellgo'
  status text default 'New', -- 'New', 'Contacted', etc.
  ticket_total numeric,
  ticket_monthly numeric,
  value numeric, -- Usually equal to ticket_total, used for displaying value
  avatar_url text
);

-- If the table already exists but might check for missing columns, 
-- you can run these individually to ensure they exist:

do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'company') then
    alter table public.leads add column company text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'name') then
    alter table public.leads add column name text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'source') then
    alter table public.leads add column source text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'status') then
    alter table public.leads add column status text default 'New';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'ticket_total') then
    alter table public.leads add column ticket_total numeric;
  end if;

   if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'ticket_monthly') then
    alter table public.leads add column ticket_monthly numeric;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'value') then
    alter table public.leads add column value numeric;
  end if;
end $$;
