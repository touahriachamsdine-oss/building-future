import { NextResponse, type NextRequest } from 'next/server';
import { query } from '@/lib/neon';
import { isSetupRequestAllowed } from '@/lib/setup-auth';

export async function GET(req: NextRequest) {
  if (!isSetupRequestAllowed(req)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  try {
    await query(`
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  listing_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
`);

    await query(`
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO site_config (id, config) VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
`);

    await query(`
ALTER TABLE bookings ALTER COLUMN provider_id DROP NOT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS baladia TEXT;
`);

    return Response.json({ success: true, message: 'Tables created' });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
