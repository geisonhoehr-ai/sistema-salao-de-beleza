-- Migration: Create employee_invites table for professional onboarding
-- This table stores invitation tokens sent to employees to join a tenant

CREATE TABLE IF NOT EXISTS employee_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token UUID NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_employee_invites_token ON employee_invites(token);

-- Index for tenant-based queries
CREATE INDEX IF NOT EXISTS idx_employee_invites_tenant_id ON employee_invites(tenant_id);

-- Index for employee-based queries
CREATE INDEX IF NOT EXISTS idx_employee_invites_employee_id ON employee_invites(employee_id);

-- RLS Policies
ALTER TABLE employee_invites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read invites by token (needed for public invite acceptance page)
CREATE POLICY "Anyone can read invites by token" ON employee_invites
    FOR SELECT
    USING (true);

-- Tenant admins can manage invites
CREATE POLICY "Tenant admins can insert invites" ON employee_invites
    FOR INSERT
    WITH CHECK (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::text::uuid);

CREATE POLICY "Tenant admins can update invites" ON employee_invites
    FOR UPDATE
    USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::text::uuid);

-- Anyone can update invite status (for accepting invites)
CREATE POLICY "Anyone can accept invites" ON employee_invites
    FOR UPDATE
    USING (true)
    WITH CHECK (status = 'accepted');

COMMENT ON TABLE employee_invites IS 'Stores invitation tokens for employees to join a tenant and create their accounts';
