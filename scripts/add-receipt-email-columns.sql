ALTER TABLE attestations
  ADD COLUMN IF NOT EXISTS receipt_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_email_error text,
  ADD COLUMN IF NOT EXISTS reversed_at timestamptz;
