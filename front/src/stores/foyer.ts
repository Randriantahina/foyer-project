import { defineStore } from 'pinia'
import { ref } from 'vue'
import { memberApi } from '@/services/memberApi'
import { subscriptionApi } from '@/services/subscriptionApi'
import { payApi } from '@/services/payApi'
import { MONTH_NAMES, monthId, monthName, isPastMonth } from '@/utils/date'

// ─── Types publics (Model) ────────────────────────────────────────────────────

export { MONTH_NAMES }

export interface Member {
  id: string
  firstName: string
  lastName: string
  phone: string
  createdAt: string
  updatedAt: string
}

export interface ContributionMonth {
  id: string
  name: string
  month: number
  year: number
  amount: number
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  memberId: string
  monthId: string
  isPaid: boolean
  amountPaid: number
  paidAt?: string
  note: string
  createdAt: string
  updatedAt: string
}

export type PaymentStatus = 'paid' | 'pending' | 'late'

export interface PaymentInput {
  memberId: string
  monthId: string
  isPaid: boolean
  amountPaid: number
  paidAt?: string
  note: string
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

const DEFAULT_MONTH_AMOUNT = 120_000

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function timestamp() {
  return new Date().toISOString()
}

function createMonth(year: number, month: number, amount = DEFAULT_MONTH_AMOUNT): ContributionMonth {
  const now = timestamp()
  return { id: monthId(year, month), name: monthName(year, month), month, year, amount, createdAt: now, updatedAt: now }
}

// ─── Mock data (fallback si API inaccessible) ─────────────────────────────────

const mockMembers: Member[] = [
  { id: '1', firstName: 'Jean',   lastName: 'Rakoto',          phone: '+261 34 12 345 67', createdAt: '2025-09-01T08:00:00.000Z', updatedAt: '2025-09-01T08:00:00.000Z' },
  { id: '2', firstName: 'Marie',  lastName: 'Rasoa',           phone: '+261 33 45 678 90', createdAt: '2025-09-01T08:20:00.000Z', updatedAt: '2025-09-01T08:20:00.000Z' },
  { id: '3', firstName: 'Pierre', lastName: 'Andrianina',      phone: '+261 32 22 111 44', createdAt: '2025-10-15T10:00:00.000Z', updatedAt: '2025-10-15T10:00:00.000Z' },
  { id: '4', firstName: 'Sophie', lastName: 'Raveloson',       phone: '+261 38 88 555 21', createdAt: '2025-11-03T09:30:00.000Z', updatedAt: '2025-11-03T09:30:00.000Z' },
  { id: '5', firstName: 'Lucas',  lastName: 'Randria',         phone: '+261 34 77 009 18', createdAt: '2026-01-10T13:15:00.000Z', updatedAt: '2026-01-10T13:15:00.000Z' },
  { id: '6', firstName: 'Emma',   lastName: 'Nomenjanahary',   phone: '+261 33 19 456 02', createdAt: '2026-03-05T11:45:00.000Z', updatedAt: '2026-03-05T11:45:00.000Z' },
]

function buildMockMonths(): ContributionMonth[] {
  const months: ContributionMonth[] = []
  const now = new Date()
  let year = 2025
  let month = 1
  while (year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth() + 1)) {
    months.push(createMonth(year, month))
    month = month === 12 ? ((year++), 1) : month + 1
  }
  return months
}

function buildMockPayments(members: Member[], months: ContributionMonth[]): Payment[] {
  const payments: Payment[] = []
  months.forEach((month) => {
    members.forEach((member, i) => {
      const joined = new Date(member.createdAt)
      const joinedAfter = joined.getFullYear() > month.year || (joined.getFullYear() === month.year && joined.getMonth() + 1 > month.month)
      if (joinedAfter) return
      const paid = isPastMonth(month.month, month.year) ? (i + month.month) % 6 !== 0 : i % 3 !== 0
      payments.push({
        id: `${member.id}-${month.id}`,
        memberId: member.id,
        monthId: month.id,
        isPaid: paid,
        amountPaid: paid ? month.amount : 0,
        paidAt: paid ? `${month.year}-${String(month.month).padStart(2, '0')}-05` : undefined,
        note: paid ? 'Paiement reçu' : '',
        createdAt: month.createdAt,
        updatedAt: month.updatedAt,
      })
    })
  })
  return payments
}

// ─── ViewModel (Store Pinia) ──────────────────────────────────────────────────

export const useFoyerStore = defineStore('foyer', () => {
  const members  = ref<Member[]>([])
  const months   = ref<ContributionMonth[]>([])
  const payments = ref<Payment[]>([])

  // Clé interne : "YYYY-MM" → ID subscription backend (nécessaire pour créer un pay)
  const subscriptionIdMap = ref<Map<string, number>>(new Map())

  // ── Chargement initial ──────────────────────────────────────────────────────

  async function fetchData() {
    try {
      const [fetchedMembers, { months: fetchedMonths, idMap }] = await Promise.all([
        memberApi.getAll(),
        subscriptionApi.getAll(),
      ])

      subscriptionIdMap.value = idMap

      const allPays = (
        await Promise.all(fetchedMonths.map((m) => payApi.getByMonthYear(m.month, m.year)))
      ).flat()

      const payKeys = new Set(allPays.map((p) => `${p.memberId}-${p.monthId}`))

      // Enregistrements virtuels "non payé" pour les combos sans pay backend
      const virtualPays: Payment[] = []
      fetchedMembers.forEach((member) => {
        fetchedMonths.forEach((month) => {
          const key = `${member.id}-${month.id}`
          if (!payKeys.has(key)) {
            virtualPays.push({
              id: `virtual-${key}`,
              memberId: member.id,
              monthId: month.id,
              isPaid: false,
              amountPaid: 0,
              note: '',
              createdAt: '',
              updatedAt: '',
            })
          }
        })
      })

      members.value  = fetchedMembers
      months.value   = fetchedMonths
      payments.value = [...allPays, ...virtualPays]
    } catch (error) {
      console.error('API inaccessible, données mock utilisées :', error)
      const mockMonths = buildMockMonths()
      members.value  = mockMembers
      months.value   = mockMonths
      payments.value = buildMockPayments(mockMembers, mockMonths)
    }
  }

  // ── Mois ────────────────────────────────────────────────────────────────────

  function ensureMonth(year: number, month: number): ContributionMonth {
    const existing = months.value.find((m) => m.year === year && m.month === month)
    if (existing) return existing
    const created = createMonth(year, month)
    months.value.push(created)
    months.value.sort((a, b) => a.year - b.year || a.month - b.month)
    return created
  }

  function getMonth(year: number, month: number): ContributionMonth | undefined {
    return months.value.find((m) => m.year === year && m.month === month)
  }

  // ── Paiements ───────────────────────────────────────────────────────────────

  function getPayment(memberId: string, contributionMonthId: string): Payment | undefined {
    return payments.value.find((p) => p.memberId === memberId && p.monthId === contributionMonthId)
  }

  function getPaymentStatus(memberId: string, contributionMonthId: string): PaymentStatus {
    const month   = months.value.find((m) => m.id === contributionMonthId)
    const payment = getPayment(memberId, contributionMonthId)
    if (payment?.isPaid) return 'paid'
    if (month && isPastMonth(month.month, month.year)) return 'late'
    return 'pending'
  }

  function savePayment(data: PaymentInput): Payment {
    const existing = getPayment(data.memberId, data.monthId)
    const now = timestamp()

    if (existing) {
      // Mise à jour optimiste locale
      existing.isPaid     = data.isPaid
      existing.amountPaid = data.isPaid ? data.amountPaid : 0
      existing.paidAt     = data.isPaid ? data.paidAt : undefined
      existing.note       = data.note
      existing.updatedAt  = now

      const backendSubId = subscriptionIdMap.value.get(data.monthId)

      if (existing.id.startsWith('virtual-') && backendSubId) {
        // Crée un vrai pay côté backend, remplace le virtuel quand c'est fait
        payApi
          .create(data.memberId, backendSubId, { amountPaid: data.amountPaid, note: data.note })
          .then((created) => {
            if (!created) return
            const idx = payments.value.findIndex((p) => p.id === existing.id)
            if (idx !== -1) payments.value[idx] = created
          })
          .catch(console.error)
      } else if (!existing.id.startsWith('virtual-')) {
        payApi
          .update(existing.id, { amountPaid: data.amountPaid, note: data.note })
          .then((updated) => {
            if (!updated) return
            const idx = payments.value.findIndex((p) => p.id === existing.id)
            if (idx !== -1) payments.value[idx] = updated
          })
          .catch(console.error)
      }

      return existing
    }

    // Nouveau pay : crée localement et synchronise en arrière-plan
    const virtualId = `virtual-${data.memberId}-${data.monthId}`
    const payment: Payment = {
      id: virtualId,
      memberId:    data.memberId,
      monthId:     data.monthId,
      isPaid:      data.isPaid,
      amountPaid:  data.isPaid ? data.amountPaid : 0,
      paidAt:      data.isPaid ? data.paidAt : undefined,
      note:        data.note,
      createdAt:   now,
      updatedAt:   now,
    }
    payments.value.push(payment)

    const backendSubId = subscriptionIdMap.value.get(data.monthId)
    if (backendSubId) {
      payApi
        .create(data.memberId, backendSubId, { amountPaid: data.amountPaid, note: data.note })
        .then((created) => {
          if (!created) return
          const idx = payments.value.findIndex((p) => p.id === virtualId)
          if (idx !== -1) payments.value[idx] = created
        })
        .catch(console.error)
    }

    return payment
  }

  function markAsPaid(memberId: string, contributionMonthId: string): void {
    const month = months.value.find((m) => m.id === contributionMonthId)
    if (!month) return
    savePayment({ memberId, monthId: contributionMonthId, isPaid: true, amountPaid: month.amount, paidAt: todayIso(), note: 'Paiement reçu' })
  }

  function markAsUnpaid(memberId: string, contributionMonthId: string): void {
    const existing = getPayment(memberId, contributionMonthId)
    savePayment({ memberId, monthId: contributionMonthId, isPaid: false, amountPaid: 0, paidAt: undefined, note: existing?.note ?? '' })
  }

  // ── Membres ─────────────────────────────────────────────────────────────────

  async function addMember(data: Pick<Member, 'firstName' | 'lastName' | 'phone'>): Promise<Member> {
    const member = await memberApi.create(data)
    members.value.push(member)
    return member
  }

  function removeMember(id: string): void {
    members.value  = members.value.filter((m) => m.id !== id)
    payments.value = payments.value.filter((p) => p.memberId !== id)
    memberApi.delete(id)
  }

  // ── Statistiques ─────────────────────────────────────────────────────────────

  function getStatsForMonth(contributionMonthId: string) {
    const month         = months.value.find((m) => m.id === contributionMonthId)
    const totalMembers  = members.value.length
    const monthPayments = payments.value.filter((p) => p.monthId === contributionMonthId)
    const paidPayments  = monthPayments.filter((p) => p.isPaid)
    const lateCount     = members.value.filter((m) => getPaymentStatus(m.id, contributionMonthId) === 'late').length

    return {
      totalMembers,
      paidCount:        paidPayments.length,
      unpaidCount:      totalMembers - paidPayments.length,
      lateCount,
      expectedAmount:   totalMembers * (month?.amount ?? 0),
      collectedAmount:  paidPayments.reduce((sum, p) => sum + p.amountPaid, 0),
    }
  }

  function getStatsForYear(year: number) {
    const yearMonths   = months.value.filter((m) => m.year === year)
    const yearPayments = payments.value.filter((p) => yearMonths.some((m) => m.id === p.monthId))
    const paidPayments = yearPayments.filter((p) => p.isPaid)
    const lateCount    = members.value.reduce(
      (count, member) => count + yearMonths.filter((m) => getPaymentStatus(member.id, m.id) === 'late').length,
      0,
    )

    return {
      totalMembers:   members.value.length,
      paidSlots:      paidPayments.length,
      unpaidSlots:    yearMonths.length * members.value.length - paidPayments.length,
      lateSlots:      lateCount,
      expectedAmount: yearMonths.reduce((sum, m) => sum + m.amount * members.value.length, 0),
      collectedAmount: paidPayments.reduce((sum, p) => sum + p.amountPaid, 0),
    }
  }

  return {
    members,
    months,
    payments,
    fetchData,
    ensureMonth,
    getMonth,
    getPayment,
    getPaymentStatus,
    savePayment,
    markAsPaid,
    markAsUnpaid,
    addMember,
    removeMember,
    getStatsForMonth,
    getStatsForYear,
  }
})
