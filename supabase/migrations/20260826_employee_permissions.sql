-- Migration: Add permissions field to employees table
-- Stores granular access control settings per employee

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
        "viewOwnSchedule": true,
        "viewAllSchedules": false,
        "manageSchedule": true,
        "viewClients": true,
        "manageClients": true,
        "viewServices": true,
        "manageServices": false,
        "viewOwnFinancials": true,
        "viewAllFinancials": false,
        "manageFinancials": false,
        "viewReports": false,
        "viewSettings": false,
        "manageSettings": false,
        "viewEmployees": false,
        "manageEmployees": false,
        "viewInventory": false,
        "manageInventory": false,
        "viewCRM": false,
        "manageCRM": false
    }'::jsonb;

-- Comment
COMMENT ON COLUMN employees.permissions IS 'Granular access permissions for the employee';
