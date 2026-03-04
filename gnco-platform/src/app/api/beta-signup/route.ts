import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const SIGNUPS_FILE = path.join(process.cwd(), 'data', 'beta-signups.json')

interface BetaSignup {
  email: string
  fundStrategy?: string
  fundSize?: string
  topJurisdiction?: string
  marketingConsent: boolean
  timestamp: string
}

async function readSignups(): Promise<BetaSignup[]> {
  try {
    const data = await fs.readFile(SIGNUPS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeSignups(signups: BetaSignup[]) {
  await fs.mkdir(path.dirname(SIGNUPS_FILE), { recursive: true })
  await fs.writeFile(SIGNUPS_FILE, JSON.stringify(signups, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fundStrategy, fundSize, topJurisdiction, marketingConsent } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const signup: BetaSignup = {
      email,
      fundStrategy,
      fundSize,
      topJurisdiction,
      marketingConsent: Boolean(marketingConsent),
      timestamp: new Date().toISOString(),
    }

    // If Resend API key is configured, use it; otherwise fall back to local file
    if (process.env.RESEND_API_KEY) {
      console.log('[beta-signup] Email service configured. Forwarding signup:', email)
      // Future: integrate with Resend/SendGrid here
    } else {
      console.warn('[beta-signup] No email service configured. Saving to local file.')
    }

    const signups = await readSignups()
    signups.push(signup)
    await writeSignups(signups)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
