import { nanoid } from 'nanoid'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'

export type SavedComparisonData = {
  id: string
  name: string
  createdAt: string
  columns: string[]
  scoreSummary: number
  payload: Record<string, unknown>
}

export type SharedComparisonData = {
  id: string
  createdAt: string
  passwordProtected: boolean
  payload: Record<string, unknown>
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export async function createSavedComparison(
  input: Omit<SavedComparisonData, 'id' | 'createdAt'>
): Promise<SavedComparisonData> {
  try {
    const record = await prisma.savedComparison.create({
      data: {
        id: nanoid(10),
        name: input.name,
        columns: input.columns,
        scoreSummary: input.scoreSummary,
        payload: input.payload as Record<string, unknown>,
      },
    })
    return {
      id: record.id,
      name: record.name,
      createdAt: record.createdAt.toISOString(),
      columns: record.columns,
      scoreSummary: record.scoreSummary,
      payload: record.payload as Record<string, unknown>,
    }
  } catch {
    // Fallback to in-memory if DB is unavailable
    const comparison: SavedComparisonData = {
      id: nanoid(10),
      createdAt: new Date().toISOString(),
      ...input,
    }
    fallbackSavedComparisons.set(comparison.id, comparison)
    return comparison
  }
}

export async function listSavedComparisons(): Promise<SavedComparisonData[]> {
  try {
    const records = await prisma.savedComparison.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.createdAt.toISOString(),
      columns: r.columns,
      scoreSummary: r.scoreSummary,
      payload: r.payload as Record<string, unknown>,
    }))
  } catch {
    return Array.from(fallbackSavedComparisons.values()).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )
  }
}

export async function createSharedComparison(
  payload: Record<string, unknown>,
  password?: string
): Promise<{ id: string; createdAt: string; passwordProtected: boolean }> {
  const passwordHash = password ? hashPassword(password) : undefined

  try {
    const record = await prisma.sharedComparison.create({
      data: {
        id: nanoid(10),
        payload: payload as Record<string, unknown>,
        passwordHash,
      },
    })
    return {
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      passwordProtected: Boolean(passwordHash),
    }
  } catch {
    const id = nanoid(10)
    fallbackSharedComparisons.set(id, {
      id,
      createdAt: new Date().toISOString(),
      passwordHash,
      payload,
    })
    return { id, createdAt: new Date().toISOString(), passwordProtected: Boolean(passwordHash) }
  }
}

export async function getSharedComparison(
  id: string
): Promise<{ payload: Record<string, unknown>; passwordHash?: string; createdAt: string } | null> {
  try {
    const record = await prisma.sharedComparison.findUnique({ where: { id } })
    if (!record) return null
    return {
      payload: record.payload as Record<string, unknown>,
      passwordHash: record.passwordHash ?? undefined,
      createdAt: record.createdAt.toISOString(),
    }
  } catch {
    const fallback = fallbackSharedComparisons.get(id)
    if (!fallback) return null
    return {
      payload: fallback.payload,
      passwordHash: fallback.passwordHash,
      createdAt: fallback.createdAt,
    }
  }
}

// Fallback in-memory stores (used only when DB is unavailable)
const fallbackSavedComparisons = new Map<string, SavedComparisonData>()
const fallbackSharedComparisons = new Map<
  string,
  { id: string; createdAt: string; passwordHash?: string; payload: Record<string, unknown> }
>()
