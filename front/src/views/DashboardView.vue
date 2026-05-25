<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFoyerStore, MOIS, type Resident, type StatutPaiement } from '@/stores/foyer'
import {
  Users, CheckCircle, AlertCircle, TrendingUp, Plus, Trash2,
  ChevronLeft, ChevronRight, Search, BarChart3, CalendarDays,
  LogOut, Building2, X,
} from 'lucide-vue-next'

const store = useFoyerStore()

const MOIS_COURT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// --- Navigation mois/année ---
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)
const viewMode = ref<'mensuelle' | 'annuelle'>('mensuelle')

function prevMonth() {
  if (selectedMonth.value === 1) { selectedMonth.value = 12; selectedYear.value-- }
  else selectedMonth.value--
}
function nextMonth() {
  const n = new Date()
  if (selectedYear.value === n.getFullYear() && selectedMonth.value >= n.getMonth() + 1) return
  if (selectedMonth.value === 12) { selectedMonth.value = 1; selectedYear.value++ }
  else selectedMonth.value++
}
function prevYear() { selectedYear.value-- }
function nextYear() { if (selectedYear.value < new Date().getFullYear()) selectedYear.value++ }

// --- Recherche ---
const searchQuery = ref('')
const filteredResidents = computed(() => {
  if (!searchQuery.value) return store.residents
  const q = searchQuery.value.toLowerCase()
  return store.residents.filter(r =>
    r.nom.toLowerCase().includes(q) ||
    r.prenom.toLowerCase().includes(q),
  )
})

// --- Stats ---
const stats = computed(() => store.getStatsMois(selectedYear.value, selectedMonth.value))
const annualStats = computed(() => store.getStatsAnnee(selectedYear.value))

// --- Vue annuelle ---
const annualMonths = computed(() => {
  const n = new Date()
  const max = selectedYear.value === n.getFullYear() ? n.getMonth() + 1 : 12
  return Array.from({ length: max }, (_, i) => i + 1)
})

function totalPayeAnnee(residentId: string) {
  return store.paiements
    .filter(p => p.residentId === residentId && p.annee === selectedYear.value && p.statut === 'payé')
    .reduce((sum, p) => sum + p.montant, 0)
}

function cellDotClass(residentId: string, mois: number) {
  const s = store.getStatutMois(residentId, selectedYear.value, mois)
  return s === 'payé' ? 'bg-green-500' : s === 'en_attente' ? 'bg-amber-400' : 'bg-red-500'
}

function cellTitle(residentId: string, mois: number) {
  return `${MOIS[mois - 1]} : ${statutLabel(store.getStatutMois(residentId, selectedYear.value, mois))}`
}

// --- Helpers statut ---
function statutLabel(s: StatutPaiement) {
  return s === 'payé' ? 'Payé' : s === 'en_attente' ? 'En attente' : 'En retard'
}
function statutBadgeClass(s: StatutPaiement) {
  return s === 'payé'
    ? 'bg-green-100 text-green-700 ring-green-200'
    : s === 'en_attente'
      ? 'bg-amber-100 text-amber-700 ring-amber-200'
      : 'bg-red-100 text-red-700 ring-red-200'
}

// --- Modal ajout ---
const showAddModal = ref(false)
const form = ref({ nom: '', prenom: '', dateEntree: now.toISOString().slice(0, 10), cotisation: 450 })

function openAdd() {
  form.value = { nom: '', prenom: '', dateEntree: new Date().toISOString().slice(0, 10), cotisation: 450 }
  showAddModal.value = true
}

function submitAdd() {
  if (!form.value.nom.trim() || !form.value.prenom.trim()) return
  store.addResident({ ...form.value })
  showAddModal.value = false
}

// --- Modal suppression ---
const showDeleteModal = ref(false)
const toDelete = ref<Resident | null>(null)

function confirmDelete(r: Resident) { toDelete.value = r; showDeleteModal.value = true }
function cancelDelete() { showDeleteModal.value = false; toDelete.value = null }
function executeDelete() { if (toDelete.value) store.removeResident(toDelete.value.id); cancelDelete() }

// --- Initiales ---
function initiales(r: Resident) { return `${r.prenom[0]}${r.nom[0]}`.toUpperCase() }
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">

    <!-- ===== SIDEBAR ===== -->
    <aside class="w-60 bg-slate-900 flex flex-col shrink-0">
      <!-- Logo -->
      <div class="px-5 py-5 border-b border-slate-700/60">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-white font-semibold text-sm leading-none">Foyer</p>
            <p class="text-slate-400 text-xs mt-0.5">Gestion résidents</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-5 space-y-1">
        <p class="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Vues</p>
        <button
          @click="viewMode = 'mensuelle'"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            viewMode === 'mensuelle'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          ]"
        >
          <CalendarDays class="w-4 h-4 shrink-0" />
          Vue mensuelle
        </button>
        <button
          @click="viewMode = 'annuelle'"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            viewMode === 'annuelle'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          ]"
        >
          <BarChart3 class="w-4 h-4 shrink-0" />
          Vue annuelle
        </button>
      </nav>

      <!-- Utilisateur -->
      <div class="px-3 py-4 border-t border-slate-700/60">
        <div class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors group cursor-pointer">
          <div class="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
            <span class="text-slate-300 text-xs font-semibold">A</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-slate-200 text-sm font-medium truncate">Administrateur</p>
            <p class="text-slate-500 text-xs truncate">Gestionnaire</p>
          </div>
          <LogOut class="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
        </div>
      </div>
    </aside>

    <!-- ===== MAIN ===== -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Header -->
      <header class="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">
            {{ viewMode === 'mensuelle' ? 'Paiements mensuels' : 'Récapitulatif annuel' }}
          </h1>
          <p class="text-sm text-gray-400 mt-0.5">
            {{ store.residents.length }} résident{{ store.residents.length !== 1 ? 's' : '' }}
            enregistré{{ store.residents.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Navigateur mensuel -->
          <template v-if="viewMode === 'mensuelle'">
            <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <button @click="prevMonth" class="px-2.5 py-2 hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronLeft class="w-4 h-4" />
              </button>
              <span class="px-3 text-sm font-medium text-gray-800 min-w-35 text-center">
                {{ MOIS[selectedMonth - 1] }} {{ selectedYear }}
              </span>
              <button @click="nextMonth" class="px-2.5 py-2 hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </template>

          <!-- Navigateur annuel -->
          <template v-else>
            <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <button @click="prevYear" class="px-2.5 py-2 hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronLeft class="w-4 h-4" />
              </button>
              <span class="px-3 text-sm font-medium text-gray-800 min-w-17.5 text-center">
                {{ selectedYear }}
              </span>
              <button @click="nextYear" class="px-2.5 py-2 hover:bg-gray-100 text-gray-500 transition-colors">
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </template>

          <!-- Bouton ajouter -->
          <button
            @click="openAdd"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus class="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </header>

      <!-- Contenu défilant -->
      <div class="flex-1 overflow-y-auto p-6">

        <!-- ===== CARTES STATS ===== -->
        <div class="grid grid-cols-4 gap-4 mb-6">

          <!-- Résidents -->
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Résidents</span>
              <div class="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Users class="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">
              {{ viewMode === 'mensuelle' ? stats.totalResidents : annualStats.totalResidents }}
            </p>
            <p class="text-xs text-gray-400 mt-1">au total</p>
          </div>

          <!-- Payés -->
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {{ viewMode === 'mensuelle' ? 'Payés' : 'Mensualités payées' }}
              </span>
              <div class="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle class="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">
              {{ viewMode === 'mensuelle' ? stats.payes : annualStats.totalPaidSlots }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ viewMode === 'mensuelle' ? `sur ${stats.totalResidents}` : `sur l'année` }}
            </p>
          </div>

          <!-- En retard -->
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">En retard</span>
              <div class="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertCircle class="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">
              {{ viewMode === 'mensuelle' ? stats.retards : annualStats.totalLateSlots }}
            </p>
            <p v-if="(viewMode === 'mensuelle' ? stats.retards : annualStats.totalLateSlots) > 0" class="text-xs text-red-400 mt-1 font-medium">
              Action requise
            </p>
            <p v-else class="text-xs text-gray-400 mt-1">Tout est à jour</p>
          </div>

          <!-- Total collecté -->
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {{ viewMode === 'mensuelle' ? 'Collecté' : 'Total annuel' }}
              </span>
              <div class="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp class="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">
              {{ viewMode === 'mensuelle' ? stats.totalCollecte : annualStats.totalCollecte }}
              <span class="text-lg font-semibold text-gray-400">€</span>
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ viewMode === 'mensuelle' ? `sur ${stats.totalAttendu} € attendus` : `encaissés en ${selectedYear}` }}
            </p>
          </div>
        </div>

        <!-- ===== TABLEAU ===== -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <!-- En-tête tableau -->
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-semibold text-gray-800 text-sm">
              {{
                viewMode === 'mensuelle'
                  ? `${MOIS[selectedMonth - 1]} ${selectedYear}`
                  : `Récapitulatif ${selectedYear}`
              }}
            </h2>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                v-model="searchQuery"
                placeholder="Rechercher…"
                class="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-44"
              />
            </div>
          </div>

          <!-- ===== VUE MENSUELLE ===== -->
          <template v-if="viewMode === 'mensuelle'">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50/70">
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Résident</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Cotisation</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Statut</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Payé le</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="resident in filteredResidents"
                  :key="resident.id"
                  class="hover:bg-gray-50/60 transition-colors"
                >
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                        <span class="text-indigo-700 text-xs font-bold">{{ initiales(resident) }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ resident.prenom }} {{ resident.nom }}</p>
                        <p class="text-xs text-gray-400">Depuis le {{ resident.dateEntree }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-sm font-semibold text-gray-900">{{ resident.cotisation }} €</span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset',
                        statutBadgeClass(store.getStatutMois(resident.id, selectedYear, selectedMonth))
                      ]"
                    >
                      {{ statutLabel(store.getStatutMois(resident.id, selectedYear, selectedMonth)) }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-sm text-gray-400">
                      {{ store.getPaiement(resident.id, selectedYear, selectedMonth)?.datePaiement ?? '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        v-if="store.getStatutMois(resident.id, selectedYear, selectedMonth) !== 'payé'"
                        @click="store.marquerCommePaye(resident.id, selectedYear, selectedMonth)"
                        class="text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Marquer payé
                      </button>
                      <button
                        @click="confirmDelete(resident)"
                        class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredResidents.length === 0">
                  <td colspan="5" class="px-5 py-16 text-center text-gray-400 text-sm">
                    Aucun résident trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </template>

          <!-- ===== VUE ANNUELLE ===== -->
          <template v-else>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50/70">
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide sticky left-0 bg-gray-50/70 min-w-45">
                      Résident
                    </th>
                    <th
                      v-for="m in annualMonths"
                      :key="m"
                      class="px-1 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide min-w-11.5"
                    >
                      {{ MOIS_COURT[m - 1] }}
                    </th>
                    <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                    <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="resident in filteredResidents"
                    :key="resident.id"
                    class="hover:bg-gray-50/60 transition-colors"
                  >
                    <td class="px-5 py-3.5 sticky left-0 bg-white">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <span class="text-indigo-700 text-xs font-bold">{{ initiales(resident) }}</span>
                        </div>
                        <span class="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {{ resident.prenom }} {{ resident.nom }}
                        </span>
                      </div>
                    </td>
                    <td v-for="m in annualMonths" :key="m" class="px-1 py-3.5 text-center">
                      <div class="flex justify-center">
                        <div
                          :class="['w-5 h-5 rounded-full cursor-help transition-transform hover:scale-125', cellDotClass(resident.id, m)]"
                          :title="cellTitle(resident.id, m)"
                        />
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <span class="text-sm font-bold text-gray-900">{{ totalPayeAnnee(resident.id) }} €</span>
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <button
                        @click="confirmDelete(resident)"
                        class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredResidents.length === 0">
                    <td :colspan="annualMonths.length + 3" class="px-5 py-16 text-center text-gray-400 text-sm">
                      Aucun résident trouvé
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Légende -->
            <div class="px-5 py-3 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-400">
              <span class="font-semibold text-gray-500">Légende</span>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-green-500" />
                Payé
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-amber-400" />
                En attente
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-500" />
                En retard
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <!-- ===== MODAL AJOUT RÉSIDENT ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAddModal"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="showAddModal = false"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Ajouter un résident</h2>
              <button @click="showAddModal = false" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Prénom <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.prenom"
                    type="text"
                    placeholder="Jean"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.nom"
                    type="text"
                    placeholder="Dupont"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Date d'entrée</label>
                <input
                  v-model="form.dateEntree"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Cotisation mensuelle (€)</label>
                <input
                  v-model.number="form.cotisation"
                  type="number"
                  min="0"
                  step="10"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div class="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                @click="showAddModal = false"
                class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                @click="submitAdd"
                :disabled="!form.nom.trim() || !form.prenom.trim()"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Ajouter le résident
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== MODAL SUPPRESSION ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="cancelDelete"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div class="p-6 text-center">
              <div class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 class="w-6 h-6 text-red-500" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900 mb-2">Supprimer le résident ?</h2>
              <p class="text-sm text-gray-500 leading-relaxed">
                Vous allez supprimer
                <span class="font-semibold text-gray-800">{{ toDelete?.prenom }} {{ toDelete?.nom }}</span>
                ainsi que tous ses enregistrements de paiement. Cette action est irréversible.
              </p>
            </div>
            <div class="px-6 pb-6 flex items-center gap-3">
              <button
                @click="cancelDelete"
                class="flex-1 px-4 py-2.5 border border-gray-200 text-sm text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="executeDelete"
                class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Supprimer
              </button>
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
