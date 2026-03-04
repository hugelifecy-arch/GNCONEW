import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  token: z.string(),
})

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 })
  }

  const invite = await prisma.invite.findUnique({
    where: { token: parsed.data.token },
  })

  if (!invite) {
    return NextResponse.json({ message: 'Invitation not found.' }, { status: 404 })
  }

  if (invite.usedAt) {
    return NextResponse.json({ message: 'Invitation already used.' }, { status: 410 })
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ message: 'Invitation has expired.' }, { status: 410 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 })
  }

  const existing = await prisma.organizationMember.findFirst({
    where: { organizationId: invite.organizationId, userId: user.id },
  })

  if (existing) {
    return NextResponse.json({ message: 'You are already a member of this organization.' }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        organizationId: invite.organizationId,
        userId: user.id,
        role: invite.role,
      },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true })
}
