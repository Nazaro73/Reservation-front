// Helpers de formatage date/heure/prix (locale fr-FR).

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
}

export function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatPrice(value, currency = 'EUR') {
  if (value == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(value));
}

// Date du jour au format YYYY-MM-DD (local) pour les inputs date.
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function staffName(staff) {
  if (!staff) return '—';
  const u = staff.User || staff.user;
  if (u) return `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
  return `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || '—';
}
