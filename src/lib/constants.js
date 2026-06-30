// Jours de la semaine (dayOfWeek: 0 = Dimanche ... 6 = Samedi, comme l'API).
export const DAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' }
];

export const dayLabel = (value) => DAYS.find((d) => d.value === value)?.label || '—';

// Statuts de réservation -> libellé + couleur de badge.
export const BOOKING_STATUS = {
  PENDING: { label: 'En attente', color: 'amber' },
  CONFIRMED: { label: 'Confirmée', color: 'emerald' },
  CANCELLED: { label: 'Annulée', color: 'rose' },
  COMPLETED: { label: 'Terminée', color: 'slate' }
};

// Statuts de paiement Mollie -> libellé + couleur.
export const PAYMENT_STATUS = {
  open: { label: 'En attente', color: 'amber' },
  pending: { label: 'En cours', color: 'amber' },
  paid: { label: 'Payé', color: 'emerald' },
  failed: { label: 'Échoué', color: 'rose' },
  canceled: { label: 'Annulé', color: 'rose' },
  expired: { label: 'Expiré', color: 'rose' }
};
