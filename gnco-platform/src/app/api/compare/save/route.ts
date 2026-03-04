import { NextRequest, NextResponse } from 'next/server'

import { createSavedComparison, listSavedComparisons } from '@/lib/compare-store'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string
      columns?: string[]
      scoreSummary?: number
      payload?: Record<string, unknown>
    }

    if (!body.name || !body.columns || !body.payload || typeof body.scoreSummary !== 'number') {
      return NextResponse.json({ success: false, message: 'Invalid save payload.' }, { status: 400 })
    }

    const saved = await createSavedComparison({
      name: body.name,
      columns: body.columns,
      scoreSummary: body.scoreSummary,
      payload: body.payload,
    })

    return NextResponse.json({ success: true, comparison: saved })
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to save comparison.' }, { status: 500 })
  }
}

export async function GET() {
  const comparisons = await listSavedComparisons()
  return NextResponse.json({ success: true, comparisons })
}
