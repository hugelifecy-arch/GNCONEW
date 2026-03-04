import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureOrganization } from '@/lib/rbac'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 })
  }

  const ctx = await ensureOrganization(userId)
  if (!ctx) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 })
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: ctx.organization.id },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { joinedAt: 'asc' },
  })

  const invites = await prisma.invite.findMany({
    where: { organizationId: ctx.organization.id, usedAt: null },
    orderBy: { expiresAt: 'desc' },
  })

  return NextResponse.json({
    currentUserRole: ctx.membership.role,
    organizationName: ctx.organization.name,
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt.toISOString(),
      usedAt: i.usedAt?.toISOString() ?? null,
    })),
  })
}
