import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { approveListing } from '@/lib/db';

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const formData = await req.formData();
  const listingId = formData.get('listingId') as string;
  if (listingId) {
    await approveListing(listingId);
  }
  return NextResponse.redirect(new URL('/admin/listings', req.url));
}
