import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFoyerStore, type Member } from '../stores/foyer'

function memberFixture(id: string): Member {
  return {
    id,
    firstName: `Prénom ${id}`,
    lastName: `Nom ${id}`,
    phone: '+261 34 00 000 00',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  }
}

describe('useFoyerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addMember', () => {
    it('ajoute un membre avec les champs alignés sur la table members', () => {
      const store = useFoyerStore()
      const before = store.members.length

      store.addMember({
        firstName: 'Test',
        lastName: 'Rakoto',
        phone: '+261 34 12 345 67',
      })

      expect(store.members.length).toBe(before + 1)
      const member = store.members[store.members.length - 1]!
      expect(member.firstName).toBe('Test')
      expect(member.lastName).toBe('Rakoto')
      expect(member.phone).toBe('+261 34 12 345 67')
      expect(member.createdAt).toBeDefined()
      expect(member.updatedAt).toBeDefined()
    })
  })

  describe('removeMember', () => {
    it('supprime le membre et tous ses paiements', () => {
      const store = useFoyerStore()
      const month = store.ensureMonth(2026, 5)
      const member = store.addMember({
        firstName: 'Temp',
        lastName: 'Delete',
        phone: '+261 33 11 222 33',
      })

      store.markAsPaid(member.id, month.id)
      store.removeMember(member.id)

      expect(store.members.find((item) => item.id === member.id)).toBeUndefined()
      expect(store.payments.filter((payment) => payment.memberId === member.id)).toHaveLength(0)
    })
  })

  describe('payments', () => {
    it('marque un paiement comme payé pour un mois configuré', () => {
      const store = useFoyerStore()
      const month = store.ensureMonth(2026, 5)
      const member = store.addMember({
        firstName: 'Paye',
        lastName: 'Moi',
        phone: '+261 32 44 555 66',
      })

      store.markAsPaid(member.id, month.id)

      const payment = store.getPayment(member.id, month.id)
      expect(payment?.isPaid).toBe(true)
      expect(payment?.amountPaid).toBe(month.amount)
      expect(payment?.paidAt).toBeDefined()
    })

    it('enregistre un montant, une date et une note personnalisés', () => {
      const store = useFoyerStore()
      const month = store.ensureMonth(2026, 6)
      const member = store.addMember({
        firstName: 'Note',
        lastName: 'Custom',
        phone: '+261 38 44 555 66',
      })

      store.savePayment({
        memberId: member.id,
        monthId: month.id,
        isPaid: true,
        amountPaid: 95_000,
        paidAt: '2026-06-12',
        note: 'Paiement partiel',
      })

      const payment = store.getPayment(member.id, month.id)
      expect(payment?.isPaid).toBe(true)
      expect(payment?.amountPaid).toBe(95_000)
      expect(payment?.paidAt).toBe('2026-06-12')
      expect(payment?.note).toBe('Paiement partiel')
    })

    it('peut annuler un paiement reçu', () => {
      const store = useFoyerStore()
      const month = store.ensureMonth(2026, 7)
      const member = store.addMember({
        firstName: 'Cancel',
        lastName: 'Payment',
        phone: '+261 37 44 555 66',
      })

      store.markAsPaid(member.id, month.id)
      store.markAsUnpaid(member.id, month.id)

      const payment = store.getPayment(member.id, month.id)
      expect(payment?.isPaid).toBe(false)
      expect(payment?.amountPaid).toBe(0)
      expect(payment?.paidAt).toBeUndefined()
    })
  })

  describe('getStatsForMonth', () => {
    it('calcule les montants collectés et attendus en Ariary', () => {
      const store = useFoyerStore()
      const month = store.ensureMonth(2026, 5)
      store.members.splice(0)
      store.payments.splice(0)
      store.members.push(memberFixture('m1'))
      store.members.push(memberFixture('m2'))

      store.savePayment({
        memberId: 'm1',
        monthId: month.id,
        isPaid: true,
        amountPaid: 80_000,
        paidAt: '2026-05-04',
        note: '',
      })

      const stats = store.getStatsForMonth(month.id)
      expect(stats.totalMembers).toBe(2)
      expect(stats.paidCount).toBe(1)
      expect(stats.unpaidCount).toBe(1)
      expect(stats.collectedAmount).toBe(80_000)
      expect(stats.expectedAmount).toBe(month.amount * 2)
    })
  })

  describe('getPaymentStatus', () => {
    it('retourne pending pour un mois courant sans paiement', () => {
      const store = useFoyerStore()
      const now = new Date()
      const month = store.ensureMonth(now.getFullYear(), now.getMonth() + 1)
      const member = store.addMember({
        firstName: 'Pending',
        lastName: 'Current',
        phone: '+261 34 99 888 77',
      })

      expect(store.getPaymentStatus(member.id, month.id)).toBe('pending')
    })

    it('retourne late pour un mois passé sans paiement', () => {
      const store = useFoyerStore()
      const month = store.ensureMonth(2025, 1)
      const member = store.addMember({
        firstName: 'Late',
        lastName: 'Past',
        phone: '+261 34 77 888 99',
      })
      store.payments.splice(0)

      expect(store.getPaymentStatus(member.id, month.id)).toBe('late')
    })
  })
})
