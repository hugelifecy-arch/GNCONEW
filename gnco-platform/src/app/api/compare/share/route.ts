import { NextRequest, NextResponse } from 'next/server'

import { createSharedComparison, getSharedComparison, verifyPassword } from '@/lib/compare-store'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { payload?: Record<string, unknown>; password?: string }

    if (!body.payload) {
      return NextResponse.json({ success: false, message: 'Missing comparison payload.' }, { status: 400 })
    }

    const shared = await createSharedComparison(body.payload, body.password?.trim() || undefined)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      success: true,
      shareUrl: `${appUrl}/compare/shared/${shared.id}`,
      id: shared.id,
      passwordProtected: shared.passwordProtected,
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to create share link.' }, { status: 500 })
  }
}

// Password verification via POST body (not URL query params) to prevent
// exposure in browser history, server logs, and HTTP referrer headers
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string; password?: string }

    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Missing share id.' }, { status: 400 })
    }

    const shared = await getSharedComparison(body.id)

    if (!shared) {
      return NextResponse.json({ success: false, message: 'Comparison not found.' }, { status: 404 })
    }

    if (shared.passwordHash) {
      if (!body.password || !verifyPassword(body.password, shared.passwordHash)) {
        return NextResponse.json({ success: false, message: 'Invalid password.' }, { status: 401 })
      }
    }

    return NextResponse.json({ success: true, payload: shared.payload, createdAt: shared.createdAt })
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to retrieve comparison.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing share id.' }, { status: 400 })
  }

  const shared = await getSharedComparison(id)

  if (!shared) {
    return NextResponse.json({ success: false, message: 'Comparison not found.' }, { status: 404 })
  }

  if (shared.passwordHash) {
    return NextResponse.json(
      { success: false, message: 'Password required. Use PUT with password in request body.', passwordProtected: true },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true, payload: shared.payload, createdAt: shared.createdAt })
}
