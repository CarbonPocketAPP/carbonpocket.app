BEGIN;

CREATE TABLE IF NOT EXISTS contributor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_hash text NOT NULL,
  display_name text NOT NULL,
  consent_to_publish boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contributor_profiles_identity_hash_key UNIQUE (identity_hash)
);

CREATE TABLE IF NOT EXISTS contributor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id uuid REFERENCES contributor_profiles(id) ON DELETE SET NULL,
  stripe_reference text NOT NULL,
  kg integer NOT NULL CHECK (kg > 0),
  country text NOT NULL DEFAULT 'nao_informado',
  plan_type text,
  payment_type text NOT NULL CHECK (payment_type IN ('checkout', 'invoice')),
  occurred_at timestamptz NOT NULL,
  coverage_start timestamptz,
  coverage_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contributor_payments_stripe_reference_key UNIQUE (stripe_reference)
);

ALTER TABLE contributor_payments
  ADD COLUMN IF NOT EXISTS coverage_start timestamptz,
  ADD COLUMN IF NOT EXISTS coverage_end timestamptz;

ALTER TABLE attestations
  ADD COLUMN IF NOT EXISTS contributor_id uuid
    REFERENCES contributor_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS contributor_payments_contributor_idx
  ON contributor_payments (contributor_id);
CREATE INDEX IF NOT EXISTS contributor_payments_occurred_at_idx
  ON contributor_payments (occurred_at);

COMMIT;
