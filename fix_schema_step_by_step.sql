-- PASSO 1: Selecione este comando e clique em RUN
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS mes_competencia date;

-- PASSO 2: Depois, apague o anterior, cole este e clique em RUN
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS produto_oferta text;
