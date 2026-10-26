-- Custom request workflow: richer request data, admin offers, provider
-- response deadlines, client cancellation/rejection reasons, payments and an
-- audit trail. Additive only, safe to re-run.

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commune TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS budget_min NUMERIC(12,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS budget_max NUMERIC(12,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attachments TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Admin offer / quote
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(12,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_message TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_status TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_sent_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_responded_at TIMESTAMPTZ;

-- Provider assignment acceptance + deadline
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_response TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_response_deadline TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_responded_at TIMESTAMPTZ;

-- Simulated/recorded payment state (no external gateway is configured)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'UNPAID';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Notifications can now deep-link to the relevant screen, not just a listing.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_pending_queue
  ON bookings (status, provider_id, service_type, created_at);

CREATE INDEX IF NOT EXISTS idx_bookings_provider_deadline
  ON bookings (provider_response_deadline)
  WHERE status = 'DISPATCHED';

-- Audit trail for every request/assignment lifecycle event.
CREATE TABLE IF NOT EXISTS booking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking_created
  ON booking_events (booking_id, created_at DESC);

-- Existing dispatched rows predate the acceptance deadline. They still need an
-- accept/decline action, so mark them as pending provider response (no deadline
-- is invented retroactively).
UPDATE bookings
SET provider_response = 'PENDING'
WHERE status = 'DISPATCHED'
  AND provider_id IS NOT NULL
  AND provider_response = 'NONE';
