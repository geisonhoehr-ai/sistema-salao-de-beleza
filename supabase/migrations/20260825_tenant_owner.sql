-- Migration: Add owner_id to tenants table
-- Links the tenant to its creator/owner for better user-tenant association

ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Index for fast owner lookups
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);

-- Comment
COMMENT ON COLUMN tenants.owner_id IS 'User ID of the tenant owner/creator';
