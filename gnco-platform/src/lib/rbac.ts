import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export type OrgRole = 'owner' | 'admin' | 'viewer'

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  viewer: 1,
}

export function canManageMembers(role: OrgRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin
}

export function canChangeBilling(role: OrgRole): boolean {
  return role === 'owner'
}

export function canDelete(role: OrgRole): boolean {
  return role === 'owner'
}

export async function getCurrentMembership() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      memberships: {
        include: { organization: true },
      },
    },
  })

  if (!user || user.memberships.length === 0) return null

  const membership = user.memberships[0]
  return {
    user,
    membership,
    organization: membership.organization,
    role: membership.role as OrgRole,
  }
}

export async function ensureOrganization(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { memberships: { include: { organization: true } } },
  })

  if (!user) return null

  if (user.memberships.length > 0) {
    return { user, membership: user.memberships[0], organization: user.memberships[0].organization }
  }

  const org = await prisma.organization.create({
    data: {
      name: user.organization ?? `${user.name ?? user.email}'s Organization`,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
    include: { members: true },
  })

  return { user, membership: org.members[0], organization: org }
}
