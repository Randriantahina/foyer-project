import type { Payment } from '@/stores/foyer'
import { monthId } from '@/utils/date'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface BackendPay {
  id: number
  amountPaid: number
  note: string
  payedAt: string | null
  paid?: boolean    // Jackson 2.x sérialise "isPaid" en "paid"
  isPaid?: boolean  // Jackson 3.x conserve le nom original
  member: { id: number }
  subscr: { year: number; month: number }
}

function mapPay(p: BackendPay): Payment {
  return {
    id: String(p.id),
    memberId: String(p.member.id),
    monthId: monthId(p.subscr.year, p.subscr.month),
    isPaid: p.isPaid ?? p.paid ?? false,
    amountPaid: Number(p.amountPaid),
    paidAt: p.payedAt ?? undefined,
    note: p.note || '',
    createdAt: p.payedAt || '',
    updatedAt: p.payedAt || '',
  }
}

const base = () => import.meta.env.VITE_API_URL as string

export const payApi = {
  async getByMonthYear(month: number, year: number): Promise<Payment[]> {
    const res = await fetch(`${base()}/api/v1/pays/subscriptions?month=${month}&year=${year}`)
    if (!res.ok) return []
    const json: ApiResponse<BackendPay[]> = await res.json()
    return (json.data || []).map(mapPay)
  },

  async create(
    memberId: string,
    subscriptionId: number,
    data: { amountPaid: number; note: string },
  ): Promise<Payment | null> {
    const res = await fetch(
      `${base()}/api/v1/pays/${memberId}/members/${subscriptionId}/subscriptions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    )
    if (!res.ok) return null
    const json: ApiResponse<BackendPay> = await res.json()
    return mapPay(json.data)
  },

  async update(payId: string, data: { amountPaid: number; note: string }): Promise<Payment | null> {
    const res = await fetch(`${base()}/api/v1/pays/${payId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const json: ApiResponse<BackendPay> = await res.json()
    return mapPay(json.data)
  },
}
