import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureOrganization, canManageMembers, type OrgRole } from '@/lib/rbac'

const schema = z.object({
  memberId: z.string(),
})

export async function DELETE(request: NextRequest) {
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

  const target = await prisma.organizationMember.findFirst({
    where: { id: parsed.data.memberId, organizationId: ctx.organization.id },
  })

  if (!target) {
    return NextResponse.json({ message: 'Member not found.' }, { status: 404 })
  }

  if (target.role === 'owner') {
    return NextResponse.json({ message: 'Cannot remove the owner.' }, { status: 403 })
  }

  await prisma.organizationMember.delete({ where: { id: target.id } })

  return NextResponse.json({ success: true })
}
