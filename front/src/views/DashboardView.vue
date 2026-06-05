<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFoyerStore } from '@/stores/foyer'
import { MONTH_NAMES } from '@/utils/date'
import type { ContributionMonth, Member, Payment, PaymentStatus } from '@/stores/foyer'
import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  LogOut,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  WalletCards,
  X,
} from 'lucide-vue-next'

// ─── Store (ViewModel) ────────────────────────────────────────────────────────

const store = useFoyerStore()

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface PaymentRow {
  member: Member
  month: ContributionMonth
  payment?: Payment
  status: PaymentStatus
  expectedAmount: number
  amountPaid: number
  paidAt?: string
  note: string
}

// ─── État UI ──────────────────────────────────────────────────────────────────

const now = new Date()

const viewMode      = ref<'monthly' | 'annual'>('monthly')
const selectedYear  = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)
const searchQuery   = ref('')

const showAddModal = ref(false)
const memberForm   = ref({ firstName: '', lastName: '', phone: '' })

const showPaymentModal    = ref(false)
const selectedPaymentRow  = ref<PaymentRow | null>(null)
const paymentForm         = ref({ isPaid: true, amountPaid: 0, paidAt: todayIso(), note: '' })

const showDeleteModal  = ref(false)
const memberToDelete   = ref<Member | null>(null)

// ─── Computed (depuis le store) ───────────────────────────────────────────────

const currentMonth  = computed(() => store.ensureMonth(selectedYear.value, selectedMonth.value))
const monthlyStats  = computed(() => store.getStatsForMonth(currentMonth.value.id))
const annualStats   = computed(() => store.getStatsForYear(selectedYear.value))

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return store.members
  return store.members.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase()
    return fullName.includes(q) || m.phone.toLowerCase().includes(q)
  })
})

const monthlyRows = computed<PaymentRow[]>(() =>
  filteredMembers.value.map((member) => buildPaymentRow(member, currentMonth.value)),
)

const annualMonths = computed(() => {
  const maxMonth = selectedYear.value === now.getFullYear() ? now.getMonth() + 1 : 12
  return Array.from({ length: maxMonth }, (_, i) => store.ensureMonth(selectedYear.value, i + 1))
})

// ─── Navigation mois / année ──────────────────────────────────────────────────

function prevMonth() {
  if (selectedMonth.value === 1) { selectedYear.value -= 1; selectedMonth.value = 12 }
  else selectedMonth.value -= 1
}

function nextMonth() {
  if (selectedYear.value === now.getFullYear() && selectedMonth.value >= now.getMonth() + 1) return
  if (selectedMonth.value === 12) { selectedYear.value += 1; selectedMonth.value = 1 }
  else selectedMonth.value += 1
}

function prevYear() { selectedYear.value -= 1 }

function nextYear() {
  if (selectedYear.value < now.getFullYear()) selectedYear.value += 1
}

// ─── Modal : ajouter un membre ────────────────────────────────────────────────

function openAddMember() {
  memberForm.value = { firstName: '', lastName: '', phone: '' }
  showAddModal.value = true
}

function closeAddMember() { showAddModal.value = false }

async function submitAddMember() {
  const { firstName, lastName, phone } = memberForm.value
  if (!firstName.trim() || !lastName.trim() || !phone.trim()) return
  try {
    await store.addMember({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() })
    showAddModal.value = false
  } catch (error) {
    console.error('Failed to add member:', error)
  }
}

// ─── Modal : paiement ─────────────────────────────────────────────────────────

function openPayment(row: PaymentRow) {
  selectedPaymentRow.value = row
  paymentForm.value = {
    isPaid:     row.payment?.isPaid ?? true,
    amountPaid: row.payment?.amountPaid || row.expectedAmount,
    paidAt:     row.payment?.paidAt ?? todayIso(),
    note:       row.payment?.note ?? '',
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
    memberId:   row.member.id,
    monthId:    row.month.id,
    isPaid:     paymentForm.value.isPaid,
    amountPaid: Number(paymentForm.value.amountPaid) || 0,
    paidAt:     paymentForm.value.isPaid ? paymentForm.value.paidAt : undefined,
    note:       paymentForm.value.note.trim(),
  })
  closePayment()
}

// ─── Modal : supprimer un membre ──────────────────────────────────────────────

function confirmDelete(member: Member) {
  memberToDelete.value = member
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  memberToDelete.value = null
}

function executeDelete() {
  if (memberToDelete.value) store.removeMember(memberToDelete.value.id)
  cancelDelete()
}

// ─── Actions inline ───────────────────────────────────────────────────────────

function markRowAsPaid(row: PaymentRow)   { store.markAsPaid(row.member.id, row.month.id) }
function markRowAsUnpaid(row: PaymentRow) { store.markAsUnpaid(row.member.id, row.month.id) }

// ─── Helpers présentation ─────────────────────────────────────────────────────

function buildPaymentRow(member: Member, month: ContributionMonth): PaymentRow {
  const payment = store.getPayment(member.id, month.id)
  return {
    member,
    month,
    payment,
    status:         store.getPaymentStatus(member.id, month.id),
    expectedAmount: month.amount,
    amountPaid:     payment?.amountPaid ?? 0,
    paidAt:         payment?.paidAt,
    note:           payment?.note ?? '',
  }
}

function memberInitials(m: Member) {
  return `${m.firstName.at(0) ?? ''}${m.lastName.at(0) ?? ''}`.toUpperCase()
}

function memberName(m: Member) { return `${m.firstName} ${m.lastName}` }

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

function annualPaymentStatus(memberId: string, month: ContributionMonth): PaymentStatus {
  return store.getPaymentStatus(memberId, month.id)
}

function annualAmountPaid(memberId: string) {
  return annualMonths.value.reduce((sum, month) => {
    const p = store.getPayment(memberId, month.id)
    return sum + (p?.isPaid ? p.amountPaid : 0)
  }, 0)
}

function annualCellTitle(member: Member, month: ContributionMonth) {
  const payment = store.getPayment(member.id, month.id)
  const status  = store.getPaymentStatus(member.id, month.id)
  return `${month.name} - ${statusLabel(status)} - ${formatCurrency(payment?.amountPaid ?? 0)}`
}

function monthShortName(month: ContributionMonth) {
  return (MONTH_NAMES[month.month - 1] ?? month.name).slice(0, 3)
}

function todayIso() { return new Date().toISOString().slice(0, 10) }
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-100 text-gray-900 md:flex-row">
    <aside class="flex w-full shrink-0 flex-col border-r border-slate-800 bg-slate-950 md:w-64">
      <div class="border-b border-slate-800 px-5 py-5">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Building2 class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="text-sm font-semibold leading-none text-white">Foyer</p>
            <p class="mt-1 text-xs text-slate-400">Suivi des cotisations</p>
          </div>
        </div>
      </div>

      <nav class="flex flex-1 gap-2 overflow-x-auto px-3 py-4 md:block md:space-y-1 md:overflow-visible">
        <button
          :class="[
            'flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full',
            viewMode === 'monthly'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white',
          ]"
          @click="viewMode = 'monthly'"
        >
          <CalendarDays class="h-4 w-4" />
          Tableau de bord
        </button>
        <button
          :class="[
            'flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full',
            viewMode === 'annual'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-900 hover:text-white',
          ]"
          @click="viewMode = 'annual'"
        >
          <BarChart3 class="h-4 w-4" />
          Vue annuelle
        </button>
        <div class="hidden border-t border-slate-800 pt-4 md:mt-4 md:block">
          <div class="px-3 text-xs font-medium uppercase tracking-wide text-slate-500">Données</div>
          <div class="mt-3 space-y-2 px-3 text-xs text-slate-400">
            <p>{{ store.members.length }} membres</p>
            <p>{{ store.months.length }} mois configurés</p>
            <p>{{ store.payments.length }} paiements</p>
          </div>
        </div>
      </nav>

      <div class="hidden border-t border-slate-800 px-3 py-4 md:block">
        <div class="flex items-center gap-3 rounded-lg px-3 py-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
            <span class="text-xs font-semibold text-slate-300">A</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-200">Administrateur</p>
            <p class="truncate text-xs text-slate-500">Gestionnaire</p>
          </div>
          <LogOut class="h-4 w-4 text-slate-600" />
        </div>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header class="shrink-0 border-b border-gray-200 bg-white px-4 py-4 md:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-950">
              {{ viewMode === 'monthly' ? 'Paiements mensuels' : 'Récapitulatif annuel' }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ viewMode === 'monthly' ? currentMonth.name : selectedYear }}
              · {{ store.members.length }} membre{{ store.members.length > 1 ? 's' : '' }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div
              v-if="viewMode === 'monthly'"
              class="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <button class="px-3 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" type="button" @click="prevMonth">
                <ChevronLeft class="h-4 w-4" />
              </button>
              <span class="min-w-40 px-3 text-center text-sm font-semibold text-gray-800">
                {{ currentMonth.name }}
              </span>
              <button class="px-3 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" type="button" @click="nextMonth">
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>

            <div
              v-else
              class="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <button class="px-3 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" type="button" @click="prevYear">
                <ChevronLeft class="h-4 w-4" />
              </button>
              <span class="min-w-24 px-3 text-center text-sm font-semibold text-gray-800">
                {{ selectedYear }}
              </span>
              <button class="px-3 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" type="button" @click="nextYear">
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>

            <button
              class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              type="button"
              @click="openAddMember"
            >
              <Plus class="h-4 w-4" />
              Ajouter membre
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Membres</span>
              <Users class="h-4 w-4 text-indigo-600" />
            </div>
            <p class="mt-3 text-2xl font-bold">
              {{ viewMode === 'monthly' ? monthlyStats.totalMembers : annualStats.totalMembers }}
            </p>
            <p class="mt-1 text-xs text-gray-500">inscrits dans le foyer</p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Payés</span>
              <CheckCircle class="h-4 w-4 text-green-600" />
            </div>
            <p class="mt-3 text-2xl font-bold">
              {{ viewMode === 'monthly' ? monthlyStats.paidCount : annualStats.paidSlots }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              {{ viewMode === 'monthly' ? 'paiements reçus' : 'mensualités reçues' }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Impayés</span>
              <AlertCircle class="h-4 w-4 text-red-500" />
            </div>
            <p class="mt-3 text-2xl font-bold">
              {{ viewMode === 'monthly' ? monthlyStats.unpaidCount : annualStats.unpaidSlots }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              {{ viewMode === 'monthly' ? `${monthlyStats.lateCount} en retard` : `${annualStats.lateSlots} retards` }}
            </p>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">Collecté</span>
              <WalletCards class="h-4 w-4 text-emerald-600" />
            </div>
            <p class="mt-3 text-2xl font-bold">
              {{ formatCurrency(viewMode === 'monthly' ? monthlyStats.collectedAmount : annualStats.collectedAmount) }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              sur {{ formatCurrency(viewMode === 'monthly' ? monthlyStats.expectedAmount : annualStats.expectedAmount) }}
            </p>
          </div>
        </section>

        <section class="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">
                {{ viewMode === 'monthly' ? currentMonth.name : `Paiements ${selectedYear}` }}
              </h2>
              <p class="mt-1 text-xs text-gray-500">
                Montant mensuel attendu:
                {{ formatCurrency(viewMode === 'monthly' ? currentMonth.amount : annualStats.expectedAmount) }}
              </p>
            </div>

            <div class="relative w-full lg:w-72">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="Rechercher nom ou téléphone"
              />
            </div>
          </div>

          <template v-if="viewMode === 'monthly'">
            <div class="overflow-x-auto">
              <table class="w-full min-w-245">
                <thead>
                  <tr class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th class="px-4 py-3">Membre</th>
                    <th class="px-4 py-3">Téléphone</th>
                    <th class="px-4 py-3 text-right">Attendu</th>
                    <th class="px-4 py-3 text-right">Payé</th>
                    <th class="px-4 py-3">Statut</th>
                    <th class="px-4 py-3">Date</th>
                    <th class="px-4 py-3">Note</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in monthlyRows" :key="row.member.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                          <span class="text-xs font-bold text-indigo-700">{{ memberInitials(row.member) }}</span>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-gray-950">{{ memberName(row.member) }}</p>
                          <p class="text-xs text-gray-500">Créé le {{ row.member.createdAt.slice(0, 10) }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2 text-sm text-gray-700">
                        <Phone class="h-3.5 w-3.5 text-gray-400" />
                        {{ row.member.phone }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-semibold">{{ formatCurrency(row.expectedAmount) }}</td>
                    <td class="px-4 py-3 text-right text-sm font-semibold">{{ formatCurrency(row.amountPaid) }}</td>
                    <td class="px-4 py-3">
                      <span :class="['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', statusBadgeClass(row.status)]">
                        {{ statusLabel(row.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ row.paidAt ?? '-' }}</td>
                    <td class="max-w-56 px-4 py-3 text-sm text-gray-600">
                      <span class="line-clamp-1">{{ row.note || '-' }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          v-if="row.status !== 'paid'"
                          class="rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                          type="button"
                          @click="markRowAsPaid(row)"
                        >
                          Marquer payé
                        </button>
                        <button
                          v-else
                          class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                          type="button"
                          @click="markRowAsUnpaid(row)"
                        >
                          Annuler
                        </button>
                        <button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Modifier le paiement" type="button" @click="openPayment(row)">
                          <Edit3 class="h-4 w-4" />
                        </button>
                        <button class="rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-600" title="Supprimer le membre" type="button" @click="confirmDelete(row.member)">
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="monthlyRows.length === 0">
                    <td colspan="8" class="px-4 py-16 text-center text-sm text-gray-500">Aucun membre trouvé.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <template v-else>
            <div class="overflow-x-auto">
              <table class="w-full min-w-230">
                <thead>
                  <tr class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th class="sticky left-0 bg-gray-50 px-4 py-3">Membre</th>
                    <th v-for="month in annualMonths" :key="month.id" class="px-2 py-3 text-center">
                      {{ monthShortName(month) }}
                    </th>
                    <th class="px-4 py-3 text-right">Total payé</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50">
                    <td class="sticky left-0 bg-white px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                          <span class="text-xs font-bold text-indigo-700">{{ memberInitials(member) }}</span>
                        </div>
                        <div>
                          <p class="whitespace-nowrap text-sm font-semibold text-gray-950">{{ memberName(member) }}</p>
                          <p class="whitespace-nowrap text-xs text-gray-500">{{ member.phone }}</p>
                        </div>
                      </div>
                    </td>
                    <td v-for="month in annualMonths" :key="month.id" class="px-2 py-3 text-center">
                      <div class="flex justify-center">
                        <div
                          :class="['h-4 w-4 rounded-full ring-2 ring-white', statusDotClass(annualPaymentStatus(member.id, month))]"
                          :title="annualCellTitle(member, month)"
                        />
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-bold">{{ formatCurrency(annualAmountPaid(member.id)) }}</td>
                    <td class="px-4 py-3 text-right">
                      <button class="rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-600" title="Supprimer le membre" type="button" @click="confirmDelete(member)">
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredMembers.length === 0">
                    <td :colspan="annualMonths.length + 3" class="px-4 py-16 text-center text-sm text-gray-500">Aucun membre trouvé.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex flex-wrap items-center gap-5 border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
              <span class="font-semibold text-gray-700">Légende</span>
              <span class="inline-flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-green-500" />Payé</span>
              <span class="inline-flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-amber-400" />En attente</span>
              <span class="inline-flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-red-500" />En retard</span>
            </div>
          </template>
        </section>
      </div>
    </main>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="closeAddMember">
          <div class="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 class="text-base font-semibold text-gray-950">Ajouter un membre</h2>
              <button class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" type="button" @click="closeAddMember">
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="space-y-4 px-5 py-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">Prénom</span>
                  <input v-model="memberForm.firstName" class="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Jean" />
                </label>
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">Nom</span>
                  <input v-model="memberForm.lastName" class="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Rakoto" />
                </label>
              </div>
              <label class="block">
                <span class="text-sm font-medium text-gray-700">Téléphone</span>
                <input v-model="memberForm.phone" class="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="+261 34 12 345 67" />
              </label>
            </div>
            <div class="flex justify-end gap-3 px-5 pb-5">
              <button class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100" type="button" @click="closeAddMember">Annuler</button>
              <button
                :disabled="!memberForm.firstName.trim() || !memberForm.lastName.trim() || !memberForm.phone.trim()"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                @click="submitAddMember"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="closePayment">
          <div class="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 class="text-base font-semibold text-gray-950">Modifier le paiement</h2>
                <p class="mt-1 text-xs text-gray-500">
                  {{ selectedPaymentRow ? memberName(selectedPaymentRow.member) : '' }}
                  · {{ selectedPaymentRow?.month.name }}
                </p>
              </div>
              <button class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" type="button" @click="closePayment">
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="space-y-4 px-5 py-5">
              <label class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <input v-model="paymentForm.isPaid" class="h-4 w-4 accent-indigo-600" type="checkbox" />
                <span class="text-sm font-medium text-gray-800">Paiement reçu</span>
              </label>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">Montant payé (Ar)</span>
                  <input v-model.number="paymentForm.amountPaid" :disabled="!paymentForm.isPaid" class="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 disabled:text-gray-400" min="0" step="1000" type="number" />
                </label>
                <label class="block">
                  <span class="text-sm font-medium text-gray-700">Payé le</span>
                  <input v-model="paymentForm.paidAt" :disabled="!paymentForm.isPaid" class="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 disabled:text-gray-400" type="date" />
                </label>
              </div>
              <label class="block">
                <span class="text-sm font-medium text-gray-700">Note</span>
                <textarea v-model="paymentForm.note" class="mt-1 min-h-24 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Référence, commentaire, rappel..." />
              </label>
            </div>
            <div class="flex justify-end gap-3 px-5 pb-5">
              <button class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100" type="button" @click="closePayment">Annuler</button>
              <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700" type="button" @click="submitPayment">Enregistrer</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" @click.self="cancelDelete">
          <div class="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div class="px-5 py-5 text-center">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
                <Trash2 class="h-5 w-5 text-red-600" />
              </div>
              <h2 class="text-base font-semibold text-gray-950">Supprimer le membre ?</h2>
              <p class="mt-2 text-sm leading-relaxed text-gray-500">
                Cette action supprimera
                <span class="font-semibold text-gray-800">{{ memberToDelete ? memberName(memberToDelete) : '' }}</span>
                et ses paiements associés.
              </p>
            </div>
            <div class="flex gap-3 px-5 pb-5">
              <button class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" @click="cancelDelete">Annuler</button>
              <button class="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" type="button" @click="executeDelete">Supprimer</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
