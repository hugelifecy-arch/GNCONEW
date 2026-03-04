import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { JURISDICTION_METADATA } from '@/lib/jurisdiction-metadata'
import { JURISDICTIONS } from '@/lib/jurisdiction-data'
import { generateBriefDocx } from '@/lib/generateBrief'

const requestSchema = z.object({
  generatedAt: z.string(),
  brief: z.object({
    strategy: z.string(),
    fundSize: z.string(),
    lpCount: z.number(),
    lpMix: z.array(z.string()),
    gpDomicile: z.string(),
  }),
  recommendations: z
    .array(
      z.object({
        jurisdiction: z.string(),
        vehicleType: z.string(),
        rank: z.number(),
        reasoning: z.string(),
        estimatedFormationCost: z.object({ min: z.number(), max: z.number() }),
        estimatedTimelineWeeks: z.object({ min: z.number(), max: z.number() }),
      }),
    )
    .min(1),
})

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function getUserAccessLevel(user: Awaited<ReturnType<typeof currentUser>>): 'preview' | 'full' {
  if (!user) return 'preview'

  const metadata = user.publicMetadata ?? {}
  const tier = typeof metadata.tier === 'string' ? metadata.tier.toLowerCase() : ''

  if (tier === 'paid' || tier === 'beta' || metadata.isPaid === true || metadata.betaAccess === true) {
    return 'full'
  }

  return 'preview'
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Invalid request payload.' }, { status: 400 })
  }

  const user = await currentUser()
  const accessLevel = getUserAccessLevel(user)

  const top = parsed.data.recommendations[0]
  const topJurisdiction = JURISDICTIONS.find((entry) => entry.name === top.jurisdiction)
  const meta = topJurisdiction ? JURISDICTION_METADATA[topJurisdiction.id] : undefined

  const today = new Date(parsed.data.generatedAt)
  const renderedDate = Number.isNaN(today.getTime()) ? new Date().toISOString().slice(0, 10) : today.toISOString().slice(0, 10)

  const strategy = titleCase(parsed.data.brief.strategy)
  const topJurisdictionName = top.jurisdiction.replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `GNCO_Brief_${strategy.replace(/\s/g, '_')}_${topJurisdictionName}_${renderedDate}.docx`

  const docxBuffer = await generateBriefDocx({
    generatedAt: parsed.data.generatedAt,
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
    brief: {
      strategy,
      fundSize: titleCase(parsed.data.brief.fundSize),
      lpCount: parsed.data.brief.lpCount,
      lpMix: parsed.data.brief.lpMix,
      gpDomicile: parsed.data.brief.gpDomicile,
    },
    recommendations: accessLevel === 'full' ? parsed.data.recommendations : [parsed.data.recommendations[0]],
    jurisdictionData: {
      regulator: meta?.regulator?.name ?? topJurisdiction?.regulator,
      regulatorUrl: meta?.regulator?.url ?? topJurisdiction?.regulatorUrl,
      annualCostMin: topJurisdiction?.annualCostRange.min,
      annualCostMax: topJurisdiction?.annualCostRange.max,
      taxTreaties: topJurisdiction?.taxTreaties,
      taxHeadline: meta?.tax_headline,
      timelines: meta?.timelines,
      keyCompliance: meta?.key_compliance,
      serviceProviders: meta?.service_providers,
    },
  })

  return new NextResponse(new Uint8Array(docxBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'x-brief-access-level': accessLevel,
      'x-brief-filename': filename,
    },
  })
}
