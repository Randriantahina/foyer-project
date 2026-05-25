import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Resident {
  id: string
  nom: string
  prenom: string
  dateEntree: string
  cotisation: number
}

export type StatutPaiement = 'payé' | 'en_attente' | 'en_retard'

export interface Paiement {
  id: string
  residentId: string
  annee: number
  mois: number
  montant: number
  statut: StatutPaiement
  datePaiement?: string
}

export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const mockResidents: Resident[] = [
  { id: '1', nom: 'Dupont', prenom: 'Jean', dateEntree: '2025-09-01', cotisation: 450 },
  { id: '2', nom: 'Martin', prenom: 'Marie', dateEntree: '2025-09-01', cotisation: 450 },
  { id: '3', nom: 'Bernard', prenom: 'Pierre', dateEntree: '2025-10-15', cotisation: 500 },
  { id: '4', nom: 'Petit', prenom: 'Sophie', dateEntree: '2025-09-01', cotisation: 500 },
  { id: '5', nom: 'Robert', prenom: 'Lucas', dateEntree: '2026-01-10', cotisation: 480 },
  { id: '6', nom: 'Richard', prenom: 'Emma', dateEntree: '2026-03-05', cotisation: 480 },
]

function generateMockPayments(residents: Resident[]): Paiement[] {
  const payments: Paiement[] = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  residents.forEach((resident, rIdx) => {
    const startDate = new Date(resident.dateEntree)
    let year = startDate.getFullYear()
    let month = startDate.getMonth() + 1

    while (year < currentYear || (year === currentYear && month <= currentMonth)) {
      const isPast = year < currentYear || (year === currentYear && month < currentMonth)
      let statut: StatutPaiement
      if (isPast) {
        statut = (rIdx + month) % 7 === 0 ? 'en_retard' : 'payé'
      } else {
        statut = rIdx % 3 === 0 ? 'en_attente' : 'payé'
      }

      payments.push({
        id: `${resident.id}-${year}-${month}`,
        residentId: resident.id,
        annee: year,
        mois: month,
        montant: resident.cotisation,
        statut,
        datePaiement: statut === 'payé' ? `${year}-${String(month).padStart(2, '0')}-05` : undefined,
      })

      month++
      if (month > 12) { month = 1; year++ }
    }
  })

  return payments
}

export const useFoyerStore = defineStore('foyer', () => {
  const residents = ref<Resident[]>([...mockResidents])
  const paiements = ref<Paiement[]>(generateMockPayments(mockResidents))

  function getPaiement(residentId: string, annee: number, mois: number): Paiement | undefined {
    return paiements.value.find(p => p.residentId === residentId && p.annee === annee && p.mois === mois)
  }

  function getStatutMois(residentId: string, annee: number, mois: number): StatutPaiement {
    const p = getPaiement(residentId, annee, mois)
    if (p) return p.statut
    const now = new Date()
    if (annee < now.getFullYear() || (annee === now.getFullYear() && mois < now.getMonth() + 1)) {
      return 'en_retard'
    }
    return 'en_attente'
  }

  function addResident(data: Omit<Resident, 'id'>) {
    const id = String(Date.now())
    residents.value.push({ id, ...data })
    const now = new Date()
    paiements.value.push({
      id: `${id}-${now.getFullYear()}-${now.getMonth() + 1}`,
      residentId: id,
      annee: now.getFullYear(),
      mois: now.getMonth() + 1,
      montant: data.cotisation,
      statut: 'en_attente',
    })
  }

  function removeResident(id: string) {
    residents.value = residents.value.filter(r => r.id !== id)
    paiements.value = paiements.value.filter(p => p.residentId !== id)
  }

  function marquerCommePaye(residentId: string, annee: number, mois: number) {
    const existing = getPaiement(residentId, annee, mois)
    const datePaiement = new Date().toISOString().split('T')[0]
    if (existing) {
      existing.statut = 'payé'
      existing.datePaiement = datePaiement
    } else {
      const resident = residents.value.find(r => r.id === residentId)
      if (!resident) return
      paiements.value.push({
        id: `${residentId}-${annee}-${mois}`,
        residentId,
        annee,
        mois,
        montant: resident.cotisation,
        statut: 'payé',
        datePaiement,
      })
    }
  }

  function getStatsMois(annee: number, mois: number) {
    const payes = paiements.value.filter(p => p.annee === annee && p.mois === mois && p.statut === 'payé')
    const retards = paiements.value.filter(p => p.annee === annee && p.mois === mois && p.statut === 'en_retard')
    const totalCollecte = payes.reduce((sum, p) => sum + p.montant, 0)
    const totalAttendu = residents.value.reduce((sum, r) => sum + r.cotisation, 0)
    return {
      totalResidents: residents.value.length,
      payes: payes.length,
      retards: retards.length,
      enAttente: residents.value.length - payes.length - retards.length,
      totalCollecte,
      totalAttendu,
    }
  }

  function getStatsAnnee(annee: number) {
    const allPaid = paiements.value.filter(p => p.annee === annee && p.statut === 'payé')
    const allLate = paiements.value.filter(p => p.annee === annee && p.statut === 'en_retard')
    return {
      totalResidents: residents.value.length,
      totalPaidSlots: allPaid.length,
      totalLateSlots: allLate.length,
      totalCollecte: allPaid.reduce((sum, p) => sum + p.montant, 0),
    }
  }

  return {
    residents,
    paiements,
    getPaiement,
    getStatutMois,
    addResident,
    removeResident,
    marquerCommePaye,
    getStatsMois,
    getStatsAnnee,
  }
})
