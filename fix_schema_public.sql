-- Tente rodar este comando, especificando o schema 'public'
-- Isso deve resolver o erro "relation leads does not exist" se a tabela estiver no schema padrão

-- 1. Cria a tabela se ela não existir (apenas por garantia)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company text,
  name text,
  email text,
  source text,
  status text default 'New',
  ticket_total numeric,
  ticket_monthly numeric,
  value numeric,
  avatar_url text
);

-- 2. Adiciona as colunas necessárias com o prefixo 'public.'
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS mes_competencia date;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS produto_oferta text;

-- 3. Verifica se funcionou
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'leads' 
AND column_name IN ('mes_competencia', 'produto_oferta');
