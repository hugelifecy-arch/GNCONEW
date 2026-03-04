'use client'

import { useCallback, useEffect, useState } from 'react'

type Member = {
  id: string
  userId: string
  email: string
  name: string | null
  role: 'owner' | 'admin' | 'viewer'
  joinedAt: string
}

type Invite = {
  id: string
  email: string
  role: string
  expiresAt: string
  usedAt: string | null
}

const roleBadge: Record<string, string> = {
  owner: 'bg-accent-gold/15 text-accent-gold',
  admin: 'bg-blue-500/15 text-blue-400',
  viewer: 'bg-bg-elevated text-text-secondary',
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>('viewer')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    const res = await fetch('/api/team')
    if (!res.ok) {
      setLoading(false)
      return
    }
    const data = await res.json()
    setMembers(data.members ?? [])
    setInvites(data.invites ?? [])
    setCurrentUserRole(data.currentUserRole ?? 'viewer')
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setMessage(null)

    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage('Invitation sent successfully.')
      setInviteEmail('')
      fetchTeam()
    } else {
      setMessage(data.message ?? 'Failed to send invitation.')
    }
    setInviting(false)
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    const res = await fetch('/api/team/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, role: newRole }),
    })
    if (res.ok) fetchTeam()
  }

  const handleRemove = async (memberId: string) => {
    const res = await fetch('/api/team/remove', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    if (res.ok) fetchTeam()
  }

  if (loading) {
    return (
      <main className="p-6 lg:p-8">
        <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
          <h1 className="font-serif text-3xl">Team Settings</h1>
          <p className="mt-3 text-text-secondary">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="space-y-6">
        <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
          <h1 className="font-serif text-3xl">Team Settings</h1>
          <p className="mt-2 text-text-secondary">Manage your organization members and invitations.</p>
        </div>

        {canManage && (
          <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
            <h2 className="text-xl font-semibold">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm text-text-secondary">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="mt-1 w-full rounded-md border border-bg-border bg-bg-elevated px-3 py-2 text-sm outline-none focus:border-accent-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'viewer')}
                  className="mt-1 rounded-md border border-bg-border bg-bg-elevated px-3 py-2 text-sm outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="rounded-md bg-accent-gold px-4 py-2 text-sm font-semibold text-bg-primary disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>
            {message && <p className="mt-3 text-sm text-text-secondary">{message}</p>}
          </div>
        )}

        <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
          <h2 className="text-xl font-semibold">Members ({members.length})</h2>
          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{member.name ?? member.email}</p>
                  <p className="text-xs text-text-secondary">{member.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[member.role] ?? roleBadge.viewer}`}>
                    {member.role}
                  </span>
                  {canManage && member.role !== 'owner' && (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        className="rounded border border-bg-border bg-bg-surface px-2 py-1 text-xs outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-text-secondary">No team members yet. Send an invite to get started.</p>
            )}
          </div>
        </div>

        {invites.length > 0 && (
          <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
            <h2 className="text-xl font-semibold">Pending Invitations</h2>
            <div className="mt-4 space-y-3">
              {invites.filter((i) => !i.usedAt).map((invite) => (
                <div key={invite.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-4 py-3">
                  <div>
                    <p className="text-sm">{invite.email}</p>
                    <p className="text-xs text-text-secondary">Expires: {new Date(invite.expiresAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[invite.role] ?? roleBadge.viewer}`}>
                    {invite.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
