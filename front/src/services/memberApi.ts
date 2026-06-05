import type { Member } from '@/stores/foyer'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface BackendMember {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
}

function mapMember(m: BackendMember): Member {
  return {
    id: String(m.id),
    firstName: m.firstName,
    lastName: m.lastName,
    phone: m.phoneNumber,
    createdAt: '',
    updatedAt: '',
  }
}

const base = () => import.meta.env.VITE_API_URL as string

export const memberApi = {
  async getAll(): Promise<Member[]> {
    const res = await fetch(`${base()}/api/v1/members`)
    if (!res.ok) throw new Error('Failed to fetch members')
    const json: ApiResponse<BackendMember[]> = await res.json()
    return json.data.map(mapMember)
  },

  async create(data: Pick<Member, 'firstName' | 'lastName' | 'phone'>): Promise<Member> {
    const res = await fetch(`${base()}/api/v1/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phone,
      }),
    })
    if (!res.ok) throw new Error('Failed to create member')
    const json: ApiResponse<BackendMember> = await res.json()
    return mapMember(json.data)
  },

  delete(id: string): void {
    fetch(`${base()}/api/v1/members/${id}`, { method: 'DELETE' }).catch(console.error)
  },
}
