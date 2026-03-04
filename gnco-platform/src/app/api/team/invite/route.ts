import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureOrganization, canManageMembers, type OrgRole } from '@/lib/rbac'

const schema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'viewer']),
})

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 })
  }

  const ctx = await ensureOrganization(userId)
  if (!ctx) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 })
  }

  if (!canManageMembers(ctx.membership.role as OrgRole)) {
    return NextResponse.json({ message: 'Insufficient permissions.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 })
  }

  const existing = await prisma.invite.findFirst({
    where: {
      organizationId: ctx.organization.id,
      email: parsed.data.email,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  })

  if (existing) {
    return NextResponse.json({ message: 'An active invitation already exists for this email.' }, { status: 409 })
  }

  const invite = await prisma.invite.create({
    data: {
      organizationId: ctx.organization.id,
      email: parsed.data.email,
      role: parsed.data.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return NextResponse.json({ success: true, inviteToken: invite.token })
}
