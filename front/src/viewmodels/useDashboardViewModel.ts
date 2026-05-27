import { computed, ref } from 'vue'
import {
  MONTH_NAMES,
  useFoyerStore,
  type ContributionMonth,
  type Member,
  type Payment,
  type PaymentStatus,
} from '@/stores/foyer'

export type DashboardViewMode = 'monthly' | 'annual'

export interface PaymentRow {
  member: Member
  month: ContributionMonth
  payment?: Payment
  status: PaymentStatus
  expectedAmount: number
  amountPaid: number
  paidAt?: string
  note: string
}

export function useDashboardViewModel() {
  const store = useFoyerStore()
  const now = new Date()

  const viewMode = ref<DashboardViewMode>('monthly')
  const selectedYear = ref(now.getFullYear())
  const selectedMonth = ref(now.getMonth() + 1)
  const searchQuery = ref('')

  const showAddModal = ref(false)
  const memberForm = ref({ firstName: '', lastName: '', phone: '' })

  const showPaymentModal = ref(false)
  const selectedPaymentRow = ref<PaymentRow | null>(null)
  const paymentForm = ref({
    isPaid: true,
    amountPaid: 0,
    paidAt: todayIso(),
    note: '',
  })

  const showDeleteModal = ref(false)
  const memberToDelete = ref<Member | null>(null)

  const currentMonth = computed(() => store.ensureMonth(selectedYear.value, selectedMonth.value))
  const monthlyStats = computed(() => store.getStatsForMonth(currentMonth.value.id))
  const annualStats = computed(() => store.getStatsForYear(selectedYear.value))

  const filteredMembers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return store.members

    return store.members.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      return (
        fullName.includes(query) ||
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.phone.toLowerCase().includes(query)
      )
    })
  })

  const monthlyRows = computed<PaymentRow[]>(() =>
    filteredMembers.value.map((member) => buildPaymentRow(member, currentMonth.value)),
  )

  const annualMonths = computed(() => {
    const maxMonth =
      selectedYear.value === now.getFullYear()
        ? now.getMonth() + 1
        : 12

    return Array.from({ length: maxMonth }, (_, index) =>
      store.ensureMonth(selectedYear.value, index + 1),
    )
  })

  function buildPaymentRow(member: Member, month: ContributionMonth): PaymentRow {
    const payment = store.getPayment(member.id, month.id)

    return {
      member,
      month,
      payment,
      status: store.getPaymentStatus(member.id, month.id),
      expectedAmount: month.amount,
      amountPaid: payment?.amountPaid ?? 0,
      paidAt: payment?.paidAt,
      note: payment?.note ?? '',
    }
  }

  function prevMonth() {
    if (selectedMonth.value === 1) {
      selectedMonth.value = 12
      selectedYear.value -= 1
      return
    }

    selectedMonth.value -= 1
  }

  function nextMonth() {
    const currentYear = now.getFullYear()
    const currentMonthNumber = now.getMonth() + 1

    if (selectedYear.value === currentYear && selectedMonth.value >= currentMonthNumber) return

    if (selectedMonth.value === 12) {
      selectedMonth.value = 1
      selectedYear.value += 1
      return
    }

    selectedMonth.value += 1
  }

  function prevYear() {
    selectedYear.value -= 1
  }

  function nextYear() {
    if (selectedYear.value < now.getFullYear()) {
      selectedYear.value += 1
    }
  }

  function openAddMember() {
    memberForm.value = { firstName: '', lastName: '', phone: '' }
    showAddModal.value = true
  }

  function closeAddMember() {
    showAddModal.value = false
  }

  function submitAddMember() {
    const firstName = memberForm.value.firstName.trim()
    const lastName = memberForm.value.lastName.trim()
    const phone = memberForm.value.phone.trim()

    if (!firstName || !lastName || !phone) return

    store.addMember({ firstName, lastName, phone })
    showAddModal.value = false
  }

  function openPayment(row: PaymentRow) {
    selectedPaymentRow.value = row
    paymentForm.value = {
      isPaid: row.payment?.isPaid ?? true,
      amountPaid: row.payment?.amountPaid || row.expectedAmount,
      paidAt: row.payment?.paidAt ?? todayIso(),
      note: row.payment?.note ?? '',
    }
    showPaymentModal.value = true
  }

  function closePayment() {
    showPaymentModal.value = false
    selectedPaymentRow.value = null
  }

  function submitPayment() {
    const row = selectedPaymentRow.value
    if (!row) return

    store.savePayment({
      memberId: row.member.id,
      monthId: row.month.id,
      isPaid: paymentForm.value.isPaid,
      amountPaid: Number(paymentForm.value.amountPaid) || 0,
      paidAt: paymentForm.value.isPaid ? paymentForm.value.paidAt : undefined,
      note: paymentForm.value.note.trim(),
    })

    closePayment()
  }

  function markRowAsPaid(row: PaymentRow) {
    store.markAsPaid(row.member.id, row.month.id)
  }

  function markRowAsUnpaid(row: PaymentRow) {
    store.markAsUnpaid(row.member.id, row.month.id)
  }

  function confirmDelete(member: Member) {
    memberToDelete.value = member
    showDeleteModal.value = true
  }

  function cancelDelete() {
    showDeleteModal.value = false
    memberToDelete.value = null
  }

  function executeDelete() {
    if (memberToDelete.value) {
      store.removeMember(memberToDelete.value.id)
    }

    cancelDelete()
  }

  function memberInitials(member: Member) {
    return `${member.firstName.at(0) ?? ''}${member.lastName.at(0) ?? ''}`.toUpperCase()
  }

  function memberName(member: Member) {
    return `${member.firstName} ${member.lastName}`
  }

  function formatCurrency(value: number) {
    return `${new Intl.NumberFormat('fr-FR').format(value)} Ar`
  }

  function statusLabel(status: PaymentStatus) {
    if (status === 'paid') return 'Payé'
    if (status === 'late') return 'En retard'
    return 'En attente'
  }

  function statusBadgeClass(status: PaymentStatus) {
    if (status === 'paid') return 'bg-green-50 text-green-700 ring-green-200'
    if (status === 'late') return 'bg-red-50 text-red-700 ring-red-200'
    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }

  function statusDotClass(status: PaymentStatus) {
    if (status === 'paid') return 'bg-green-500'
    if (status === 'late') return 'bg-red-500'
    return 'bg-amber-400'
  }

  function annualPaymentStatus(memberId: string, month: ContributionMonth) {
    return store.getPaymentStatus(memberId, month.id)
  }

  function annualAmountPaid(memberId: string) {
    return annualMonths.value.reduce((sum, month) => {
      const payment = store.getPayment(memberId, month.id)
      return sum + (payment?.isPaid ? payment.amountPaid : 0)
    }, 0)
  }

  function annualCellTitle(member: Member, month: ContributionMonth) {
    const payment = store.getPayment(member.id, month.id)
    const status = store.getPaymentStatus(member.id, month.id)
    const amount = payment?.amountPaid ?? 0

    return `${month.name} - ${statusLabel(status)} - ${formatCurrency(amount)}`
  }

  function monthShortName(month: ContributionMonth) {
    return (MONTH_NAMES[month.month - 1] ?? month.name).slice(0, 3)
  }

  return {
    store,
    viewMode,
    selectedYear,
    selectedMonth,
    searchQuery,
    showAddModal,
    memberForm,
    showPaymentModal,
    selectedPaymentRow,
    paymentForm,
    showDeleteModal,
    memberToDelete,
    currentMonth,
    monthlyStats,
    annualStats,
    filteredMembers,
    monthlyRows,
    annualMonths,
    prevMonth,
    nextMonth,
    prevYear,
    nextYear,
    openAddMember,
    closeAddMember,
    submitAddMember,
    openPayment,
    closePayment,
    submitPayment,
    markRowAsPaid,
    markRowAsUnpaid,
    confirmDelete,
    cancelDelete,
    executeDelete,
    memberInitials,
    memberName,
    formatCurrency,
    statusLabel,
    statusBadgeClass,
    statusDotClass,
    annualPaymentStatus,
    annualAmountPaid,
    annualCellTitle,
    monthShortName,
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
