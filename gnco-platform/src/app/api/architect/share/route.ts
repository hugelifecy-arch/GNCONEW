import crypto from 'crypto'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// Fallback in-memory store (used only when DB is unavailable)
type SharedResult = {
  createdAt: string
  views: number
  [key: string]: unknown
}
const fallbackStore = new Map<string, SharedResult>()

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as Record<string, unknown>
    const shareId = crypto.randomUUID().slice(0, 10)

    try {
      await prisma.sharedResult.create({
        data: {
          id: shareId,
          data: data as Prisma.InputJsonValue,
          views: 0,
        },
      })
    } catch {
      fallbackStore.set(shareId, {
        ...data,
        createdAt: new Date().toISOString(),
        views: 0,
      })
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gnconew.vercel.app'}/results/${shareId}`

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to generate share link' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shareId = searchParams.get('id')

  if (!shareId) {
    return NextResponse.json({ error: 'Missing share ID' }, { status: 400 })
  }

  try {
    const result = await prisma.sharedResult.update({
      where: { id: shareId },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: { ...(result.data as object), createdAt: result.createdAt, views: result.views },
    })
  } catch {
    const result = fallbackStore.get(shareId)
    if (!result) {
      return NextResponse.json({ error: 'Results not found' }, { status: 404 })
    }
    result.views += 1
    return NextResponse.json({ success: true, data: result })
  }
}
