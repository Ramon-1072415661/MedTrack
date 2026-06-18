-- Adicionar coluna de contato de emergência à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS emergency_contact text;

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.emergency_contact IS 'JSON string contendo dados do contato de emergência (name, phone, relationship)';
