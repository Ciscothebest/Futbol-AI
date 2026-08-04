-- =============================================================================
-- FUTBOL AI PLATFORM — MIGRACIÓN SEGURA DE PRODUCCIÓN (PostgreSQL / Supabase)
-- Aplica todos los campos nuevos desde el 20 de Julio 2026 a la fecha
-- Ejecutar en Supabase SQL Editor (no rompe datos existentes)
-- =============================================================================

-- ─── TABLA: users ─────────────────────────────────────────────────────────────

-- Passkeys y Biometría WebAuthn
ALTER TABLE users ADD COLUMN IF NOT EXISTS hasPasskey             BOOLEAN          NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyCredentialId   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyPublicKey      TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyCounter        INTEGER          DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyPinHash        VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyChallenge      TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyDeviceInfo     VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyWebAuthnDevice VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkeyPinDevice      VARCHAR(255);

-- Seguridad: Preguntas de Seguridad
ALTER TABLE users ADD COLUMN IF NOT EXISTS securityQuestions     TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS featureSettings       TEXT;

-- Ciclo de Facturación
ALTER TABLE users ADD COLUMN IF NOT EXISTS billingCycleStart     TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billingCycleEnd       TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS autoRenew             BOOLEAN          NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS maxPaidTierInCycle    VARCHAR(50)      DEFAULT 'Gratis';

-- Plan Local Coach
ALTER TABLE users ADD COLUMN IF NOT EXISTS localCoachData        TEXT;

-- Quotas Plan Gratis / Pro (diario)
ALTER TABLE users ADD COLUMN IF NOT EXISTS dailyComparisonsCount  INTEGER          DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dailyAiMessagesCount   INTEGER          DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lastDailyResetDate     VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS firstDailyComparisonAt TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firstDailyAiMessageAt  TIMESTAMP WITH TIME ZONE;

-- Quotas Plan Plus (semanal)
ALTER TABLE users ADD COLUMN IF NOT EXISTS weeklyComparisonsCount  INTEGER         DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firstWeeklyComparisonAt TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weeklyAiMessagesCount   INTEGER         DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firstWeeklyAiMessageAt  TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lastWeeklyResetDate     VARCHAR(15);

-- Quotas Plan Plus/Enterprise (mensual)
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthlySimulationsCount  INTEGER        DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firstMonthlySimulationAt TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthlyComparisonsCount  INTEGER        DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS firstMonthlyComparisonAt TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lastMonthlyResetDate     VARCHAR(10);

-- Onboarding y configuración inicial
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboardingComplete    BOOLEAN          NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS selectedCountry       VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS selectedClub          VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferredFormation    VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferredStyle        VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS selectedTier          VARCHAR(50)      NOT NULL DEFAULT 'Gratis';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatarUrl             VARCHAR(500);

-- OTP / Verificación
ALTER TABLE users ADD COLUMN IF NOT EXISTS otpCode               VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otpExpires            TIMESTAMP WITH TIME ZONE;

-- ─── TABLA: Players ────────────────────────────────────────────────────────────

ALTER TABLE "Players" ADD COLUMN IF NOT EXISTS userId           VARCHAR(100);
ALTER TABLE "Players" ADD COLUMN IF NOT EXISTS trophies         TEXT;
ALTER TABLE "Players" ADD COLUMN IF NOT EXISTS careerTotals     TEXT;
ALTER TABLE "Players" ADD COLUMN IF NOT EXISTS transfers        TEXT;
ALTER TABLE "Players" ADD COLUMN IF NOT EXISTS history          TEXT;
ALTER TABLE "Players" ADD COLUMN IF NOT EXISTS tags             TEXT;

-- ─── TABLA: Prospects ─────────────────────────────────────────────────────────

ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS docType         VARCHAR(50);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS docNumber        VARCHAR(50);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS docFileUrl       TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS docFileName      VARCHAR(255);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS heightUnit       VARCHAR(10);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS weightUnit       VARCHAR(10);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS medicalStatus    VARCHAR(50);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS improvements     TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS weaknesses       TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS tacticalNotes    TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS highlightUrl     TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS trophies         TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS injuries         TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS authorizations   TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS legalDetails     TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS tags             TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS history          TEXT;
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS positionEs       VARCHAR(50);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS nationalityEs    VARCHAR(100);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS flag             VARCHAR(255);
ALTER TABLE "Prospects" ADD COLUMN IF NOT EXISTS bioEs            TEXT;

-- ─── TABLA: payments ──────────────────────────────────────────────────────────

ALTER TABLE payments ADD COLUMN IF NOT EXISTS userAccount        VARCHAR(100);

-- ─── ÍNDICES DE SOPORTE (solo si no existen) ──────────────────────────────────

CREATE INDEX IF NOT EXISTS ix_users_email              ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_role               ON users (role);
CREATE INDEX IF NOT EXISTS ix_users_selected_tier      ON users ("selectedTier");
CREATE INDEX IF NOT EXISTS ix_prospects_user_id        ON "Prospects" ("userId");
CREATE INDEX IF NOT EXISTS ix_payments_user_id         ON payments ("userId");
CREATE INDEX IF NOT EXISTS ix_payment_methods_user_id  ON payment_methods ("userId");

-- =============================================================================
-- FIN DE MIGRACIÓN
-- Después de ejecutar, reiniciar el servicio en Render para aplicar cambios.
-- =============================================================================
