import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const DEFAULT_MONTH_AMOUNT = 120_000

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function timestamp() {
  return new Date().toISOString()
}

function monthId(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function monthName(year: number, month: number) {
  return `${MONTH_NAMES[month - 1] ?? 'Mois'} ${year}`
}

function isPastMonth(month: ContributionMonth) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  return month.year < currentYear || (month.year === currentYear && month.month < currentMonth)
}

function createMonth(year: number, month: number, amount = DEFAULT_MONTH_AMOUNT): ContributionMonth {
  const now = timestamp()

  return {
    id: monthId(year, month),
    name: monthName(year, month),
    month,
    year,
    amount,
    createdAt: now,
    updatedAt: now,
  }
}

function buildMonths(): ContributionMonth[] {
  const months: ContributionMonth[] = []
  const now = new Date()
  let year = 2025
  let month = 1

  while (year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth() + 1)) {
    months.push(createMonth(year, month))
    month += 1

    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Rakoto',
    phone: '+261 34 12 345 67',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Rasoa',
    phone: '+261 33 45 678 90',
    createdAt: '2025-09-01T08:20:00.000Z',
    updatedAt: '2025-09-01T08:20:00.000Z',
  },
  {
    id: '3',
    firstName: 'Pierre',
    lastName: 'Andrianina',
    phone: '+261 32 22 111 44',
    createdAt: '2025-10-15T10:00:00.000Z',
    updatedAt: '2025-10-15T10:00:00.000Z',
  },
  {
    id: '4',
    firstName: 'Sophie',
    lastName: 'Raveloson',
    phone: '+261 38 88 555 21',
    createdAt: '2025-11-03T09:30:00.000Z',
    updatedAt: '2025-11-03T09:30:00.000Z',
  },
  {
    id: '5',
    firstName: 'Lucas',
    lastName: 'Randria',
    phone: '+261 34 77 009 18',
    createdAt: '2026-01-10T13:15:00.000Z',
    updatedAt: '2026-01-10T13:15:00.000Z',
  },
  {
    id: '6',
    firstName: 'Emma',
    lastName: 'Nomenjanahary',
    phone: '+261 33 19 456 02',
    createdAt: '2026-03-05T11:45:00.000Z',
    updatedAt: '2026-03-05T11:45:00.000Z',
  },
]

function buildPayments(members: Member[], months: ContributionMonth[]): Payment[] {
  const payments: Payment[] = []

  months.forEach((month) => {
    members.forEach((member, memberIndex) => {
      const memberCreatedAt = new Date(member.createdAt)
      const joinedAfterMonth =
        memberCreatedAt.getFullYear() > month.year ||
        (memberCreatedAt.getFullYear() === month.year && memberCreatedAt.getMonth() + 1 > month.month)

      if (joinedAfterMonth) return

      const paid = isPastMonth(month)
        ? (memberIndex + month.month) % 6 !== 0
        : memberIndex % 3 !== 0

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

export const useFoyerStore = defineStore('foyer', () => {
  const initialMonths = buildMonths()

  const members = ref<Member[]>([...mockMembers])
  const months = ref<ContributionMonth[]>(initialMonths)
  const payments = ref<Payment[]>(buildPayments(mockMembers, initialMonths))

  function ensureMonth(year: number, month: number) {
    const existing = getMonth(year, month)
    if (existing) return existing

    const created = createMonth(year, month)
    months.value.push(created)
    months.value.sort((a, b) => a.year - b.year || a.month - b.month)
    return created
  }

  function getMonth(year: number, month: number) {
    return months.value.find((item) => item.year === year && item.month === month)
  }

  function getPayment(memberId: string, contributionMonthId: string) {
    return payments.value.find(
      (payment) => payment.memberId === memberId && payment.monthId === contributionMonthId,
    )
  }

  function getPaymentStatus(memberId: string, contributionMonthId: string): PaymentStatus {
    const month = months.value.find((item) => item.id === contributionMonthId)
    const payment = getPayment(memberId, contributionMonthId)

    if (payment?.isPaid) return 'paid'
    if (month && isPastMonth(month)) return 'late'
    return 'pending'
  }

  function addMember(data: Pick<Member, 'firstName' | 'lastName' | 'phone'>) {
    const now = timestamp()
    const member: Member = {
      id: String(Date.now()),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      createdAt: now,
      updatedAt: now,
    }

    members.value.push(member)
    return member
  }

  function removeMember(id: string) {
    members.value = members.value.filter((member) => member.id !== id)
    payments.value = payments.value.filter((payment) => payment.memberId !== id)
  }

  function savePayment(data: PaymentInput) {
    const existing = getPayment(data.memberId, data.monthId)
    const now = timestamp()

    if (existing) {
      existing.isPaid = data.isPaid
      existing.amountPaid = data.isPaid ? data.amountPaid : 0
      existing.paidAt = data.isPaid ? data.paidAt : undefined
      existing.note = data.note
      existing.updatedAt = now
      return existing
    }

    const payment: Payment = {
      id: `${data.memberId}-${data.monthId}`,
      memberId: data.memberId,
      monthId: data.monthId,
      isPaid: data.isPaid,
      amountPaid: data.isPaid ? data.amountPaid : 0,
      paidAt: data.isPaid ? data.paidAt : undefined,
      note: data.note,
      createdAt: now,
      updatedAt: now,
    }

    payments.value.push(payment)
    return payment
  }

  function markAsPaid(memberId: string, contributionMonthId: string) {
    const month = months.value.find((item) => item.id === contributionMonthId)
    if (!month) return

    savePayment({
      memberId,
      monthId: contributionMonthId,
      isPaid: true,
      amountPaid: month.amount,
      paidAt: todayIso(),
      note: 'Paiement reçu',
    })
  }

  function markAsUnpaid(memberId: string, contributionMonthId: string) {
    const existing = getPayment(memberId, contributionMonthId)

    savePayment({
      memberId,
      monthId: contributionMonthId,
      isPaid: false,
      amountPaid: 0,
      paidAt: undefined,
      note: existing?.note ?? '',
    })
  }

  function getStatsForMonth(contributionMonthId: string) {
    const month = months.value.find((item) => item.id === contributionMonthId)
    const totalMembers = members.value.length
    const monthPayments = payments.value.filter((payment) => payment.monthId === contributionMonthId)
    const paidPayments = monthPayments.filter((payment) => payment.isPaid)
    const lateCount = members.value.filter(
      (member) => getPaymentStatus(member.id, contributionMonthId) === 'late',
    ).length
    const expectedAmount = totalMembers * (month?.amount ?? 0)
    const collectedAmount = paidPayments.reduce((sum, payment) => sum + payment.amountPaid, 0)

    return {
      totalMembers,
      paidCount: paidPayments.length,
      unpaidCount: totalMembers - paidPayments.length,
      lateCount,
      expectedAmount,
      collectedAmount,
    }
  }

  function getStatsForYear(year: number) {
    const yearMonths = months.value.filter((month) => month.year === year)
    const yearPayments = payments.value.filter((payment) =>
      yearMonths.some((month) => month.id === payment.monthId),
    )
    const paidPayments = yearPayments.filter((payment) => payment.isPaid)
    const lateCount = members.value.reduce(
      (count, member) =>
        count +
        yearMonths.filter((month) => getPaymentStatus(member.id, month.id) === 'late').length,
      0,
    )
    const expectedAmount = yearMonths.reduce(
      (sum, month) => sum + month.amount * members.value.length,
      0,
    )

    return {
      totalMembers: members.value.length,
      paidSlots: paidPayments.length,
      unpaidSlots: yearMonths.length * members.value.length - paidPayments.length,
      lateSlots: lateCount,
      expectedAmount,
      collectedAmount: paidPayments.reduce((sum, payment) => sum + payment.amountPaid, 0),
    }
  }

  return {
    members,
    months,
    payments,
    ensureMonth,
    getMonth,
    getPayment,
    getPaymentStatus,
    addMember,
    removeMember,
    savePayment,
    markAsPaid,
    markAsUnpaid,
    getStatsForMonth,
    getStatsForYear,
  }
})
