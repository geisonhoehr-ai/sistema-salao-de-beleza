-- ============================================================================
-- MIGRATION: Campos de Subscription e Trial para Tenants
-- Data: 2026-08-20
-- Descrição: Adiciona subscription_status e trial_ends_at para suportar
--            fluxo de signup self-service com trial de 30 dias
-- ============================================================================

-- 1. ADICIONAR COLUNA subscription_status
-- Valores possíveis: trialing, active, canceled, past_due
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing';

-- 2. ADICIONAR COLUNA trial_ends_at
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- 3. ADICIONAR CHECK CONSTRAINT para subscription_status (apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'tenants_subscription_status_check'
    ) THEN
        ALTER TABLE public.tenants
        ADD CONSTRAINT tenants_subscription_status_check
        CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'past_due'));
    END IF;
END $$;

-- 4. BACKFILL: Tenants existentes são considerados ativos (já estão usando o sistema)
-- Apenas atualiza onde subscription_status é NULL ou 'trialing' sem trial_ends_at definido
UPDATE public.tenants
SET subscription_status = 'active'
WHERE subscription_status IS NULL
   OR (subscription_status = 'trialing' AND trial_ends_at IS NULL);

-- 5. ÍNDICE para queries de trial expirado
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status
ON public.tenants(subscription_status);

CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at
ON public.tenants(trial_ends_at)
WHERE trial_ends_at IS NOT NULL;

-- 6. COMENTÁRIOS
COMMENT ON COLUMN public.tenants.subscription_status IS 'Status da assinatura: trialing, active, canceled, past_due';
COMMENT ON COLUMN public.tenants.trial_ends_at IS 'Data/hora de expiração do período de trial (NULL se não em trial)';
