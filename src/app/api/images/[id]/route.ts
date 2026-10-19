import { NextResponse, type NextRequest } from 'next/server';
import { getImage, ImageNotFoundError } from '@/lib/image-storage.server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data, mimeType } = await getImage(id);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(data.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    if (err instanceof ImageNotFoundError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('Error serving image:', err);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}