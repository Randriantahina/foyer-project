import type { ContributionMonth } from '@/stores/foyer'
import { monthId, monthName } from '@/utils/date'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface BackendSubscription {
  id: number
  name: string
  month: number
  year: number
  amount: number
}

function mapSubscription(s: BackendSubscription): ContributionMonth {
  return {
    id: monthId(s.year, s.month),
    name: s.name || monthName(s.year, s.month),
    month: s.month,
    year: s.year,
    amount: Number(s.amount),
    createdAt: '',
    updatedAt: '',
  }
}

const base = () => import.meta.env.VITE_API_URL as string

export const subscriptionApi = {
  async getAll(): Promise<{ months: ContributionMonth[]; idMap: Map<string, number> }> {
    const res = await fetch(`${base()}/api/v1/subscriptions`)
    if (!res.ok) throw new Error('Failed to fetch subscriptions')
    const json: ApiResponse<BackendSubscription[]> = await res.json()

    const months = json.data.map(mapSubscription)
    const idMap = new Map<string, number>()
    json.data.forEach((s) => idMap.set(monthId(s.year, s.month), s.id))

    return { months, idMap }
  },
}
