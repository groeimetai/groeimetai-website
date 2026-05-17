// Admin endpoint to manually trigger IndexNow submission of the full URL set.
// Protected by INDEXNOW_ADMIN_TOKEN env var.
//
// Usage:
//   curl -X POST https://groeimetai.io/api/indexnow/submit \
//     -H "Authorization: Bearer $TOKEN"
//
// You can also POST a JSON body with `{ urls: [...] }` to submit a custom subset.

import { NextRequest, NextResponse } from 'next/server';
import { listIndexableUrls, submitUrls } from '@/lib/indexnow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const adminToken = process.env.INDEXNOW_ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: 'INDEXNOW_ADMIN_TOKEN not configured' },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get('authorization') || '';
  const provided = authHeader.replace(/^Bearer\s+/i, '');
  if (provided !== adminToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let customUrls: string[] | null = null;
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (Array.isArray(body?.urls)) {
        customUrls = body.urls.filter((u: unknown): u is string => typeof u === 'string');
      }
    }
  } catch {
    // Empty body is fine — defaults to all URLs.
  }

  const urls = customUrls && customUrls.length > 0 ? customUrls : listIndexableUrls();
  const result = await submitUrls(urls);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET() {
  // Helpful for verification: list how many URLs we would submit, without submitting.
  return NextResponse.json({
    urlCount: listIndexableUrls().length,
    sample: listIndexableUrls().slice(0, 10),
  });
}
