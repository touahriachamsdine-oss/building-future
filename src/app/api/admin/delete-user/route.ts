import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const formData = await req.formData();
  const userId = formData.get('userId') as string;
  if (userId) {
    await deleteUser(userId);
  }
  return NextResponse.redirect(new URL('/admin/users', req.url));
}
