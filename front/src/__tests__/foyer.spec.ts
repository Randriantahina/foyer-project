import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFoyerStore } from '../stores/foyer'

describe('useFoyerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addResident', () => {
    it('ajoute un résident et crée un paiement initial en attente', () => {
      const store = useFoyerStore()
      const avant = store.residents.length

      store.addResident({ nom: 'Test', prenom: 'User', dateEntree: '2026-05-01', cotisation: 400 })

      expect(store.residents.length).toBe(avant + 1)
      const nouveau = store.residents.at(-1)!
      expect(nouveau.nom).toBe('Test')
      expect(nouveau.cotisation).toBe(400)

      const paiementInitial = store.paiements.find(
        p => p.residentId === nouveau.id && p.statut === 'en_attente',
      )
      expect(paiementInitial).toBeDefined()
      expect(paiementInitial!.montant).toBe(400)
    })
  })

  describe('removeResident', () => {
    it('supprime le résident et tous ses paiements', () => {
      const store = useFoyerStore()
      store.addResident({ nom: 'À supprimer', prenom: 'Temp', dateEntree: '2026-05-01', cotisation: 350 })
      const resident = store.residents.at(-1)!

      store.removeResident(resident.id)

      expect(store.residents.find(r => r.id === resident.id)).toBeUndefined()
      expect(store.paiements.filter(p => p.residentId === resident.id)).toHaveLength(0)
    })
  })

  describe('marquerCommePaye', () => {
    it('met à jour le statut d\'un paiement existant', () => {
      const store = useFoyerStore()
      store.addResident({ nom: 'Paye', prenom: 'Moi', dateEntree: '2026-05-01', cotisation: 450 })
      const resident = store.residents.at(-1)!
      const now = new Date()

      store.marquerCommePaye(resident.id, now.getFullYear(), now.getMonth() + 1)

      const paiement = store.getPaiement(resident.id, now.getFullYear(), now.getMonth() + 1)
      expect(paiement?.statut).toBe('payé')
      expect(paiement?.datePaiement).toBeDefined()
    })

    it('crée un nouveau paiement si aucun n\'existe pour ce mois', () => {
      const store = useFoyerStore()
      store.addResident({ nom: 'Futur', prenom: 'Mois', dateEntree: '2026-05-01', cotisation: 450 })
      const resident = store.residents.at(-1)!

      store.marquerCommePaye(resident.id, 2026, 6)

      const paiement = store.getPaiement(resident.id, 2026, 6)
      expect(paiement?.statut).toBe('payé')
      expect(paiement?.montant).toBe(450)
    })
  })

  describe('getStatsMois', () => {
    it('calcule correctement le total collecté pour un mois', () => {
      const store = useFoyerStore()
      // Réinitialiser avec des IDs connus pour éviter la collision Date.now()
      store.residents.splice(0)
      store.paiements.splice(0)
      store.residents.push({ id: 'r1', nom: 'A', prenom: 'X', dateEntree: '2026-05-01', cotisation: 300 })
      store.residents.push({ id: 'r2', nom: 'B', prenom: 'Y', dateEntree: '2026-05-01', cotisation: 200 })

      store.marquerCommePaye('r1', 2026, 5)
      store.marquerCommePaye('r2', 2026, 5)

      const stats = store.getStatsMois(2026, 5)
      expect(stats.payes).toBe(2)
      expect(stats.totalCollecte).toBe(500)
      expect(stats.totalResidents).toBe(2)
    })

    it('comptabilise les paiements en retard séparément', () => {
      const store = useFoyerStore()
      store.residents.splice(0)
      store.paiements.splice(0)
      store.residents.push({ id: 'r3', nom: 'C', prenom: 'Z', dateEntree: '2026-01-01', cotisation: 400 })

      store.paiements.push({
        id: 'r3-2026-3',
        residentId: 'r3',
        annee: 2026,
        mois: 3,
        montant: 400,
        statut: 'en_retard',
      })

      const stats = store.getStatsMois(2026, 3)
      expect(stats.retards).toBe(1)
      expect(stats.payes).toBe(0)
    })
  })

  describe('getStatutMois', () => {
    it('retourne "en_attente" pour le mois courant sans paiement enregistré', () => {
      const store = useFoyerStore()
      store.addResident({ nom: 'Test', prenom: 'Statut', dateEntree: '2026-05-01', cotisation: 400 })
      const resident = store.residents.at(-1)!
      const now = new Date()

      // Supprimer le paiement auto-créé
      store.paiements.splice(
        store.paiements.findIndex(p => p.residentId === resident.id),
        1,
      )

      const statut = store.getStatutMois(resident.id, now.getFullYear(), now.getMonth() + 1)
      expect(statut).toBe('en_attente')
    })

    it('retourne "en_retard" pour un mois passé sans paiement', () => {
      const store = useFoyerStore()
      store.addResident({ nom: 'Test', prenom: 'Retard', dateEntree: '2025-01-01', cotisation: 400 })
      const resident = store.residents.at(-1)!

      const statut = store.getStatutMois(resident.id, 2025, 1)
      // Le paiement pour 2025-01 est auto-généré lors de addResident? Non, il génère juste le mois courant.
      // Sans paiement en 2025-01, c'est dans le passé donc en_retard.
      // Mais si un paiement existe déjà (payé ou autre), on retourne son statut.
      const existing = store.getPaiement(resident.id, 2025, 1)
      if (!existing) {
        expect(statut).toBe('en_retard')
      } else {
        expect(statut).toBe(existing.statut)
      }
    })
  })
})
