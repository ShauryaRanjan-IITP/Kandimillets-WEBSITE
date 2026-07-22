-- Authentication Hardening & Password Recovery — additive enum values
-- only. No existing "audit_log" row's `action` value is touched; every
-- previously-written PASSWORD_RESET entry keeps its exact meaning
-- ("a password was successfully changed").

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PASSWORD_RESET_REQUESTED';
ALTER TYPE "AuditAction" ADD VALUE 'PASSWORD_RESET_FAILED';
