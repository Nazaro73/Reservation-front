import { useEffect, useState, useCallback } from 'react';
import { bookingApi, staffApi, serviceApi, paymentApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Card, Modal, Table, PageHeader, Spinner, Field, Input, Select, Badge } from '../components/ui';
import { BOOKING_STATUS } from '../lib/constants';
import { formatDateTime, formatTime, todayStr, staffName, formatPrice } from '../lib/format';
import NewBookingModal from '../components/NewBookingModal';

export default function Bookings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ date: todayStr(), staffId: '' });
  const [newOpen, setNewOpen] = useState(false);

  const loadRefs = useCallback(async () => {
    try {
      const [st, sv] = await Promise.all([staffApi.list(), serviceApi.list()]);
      setStaff(st.staff || []);
      setServices(sv.services || []);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, [toast]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.staffId) params.staffId = filters.staffId;
      const data = await bookingApi.list(params);
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const cancel = async (b) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await bookingApi.cancel(b.id);
      toast.success('Réservation annulée');
      loadBookings();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const changeStatus = async (b, status) => {
    try {
      await bookingApi.updateStatus(b.id, status);
      toast.success('Statut mis à jour');
      loadBookings();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const paymentLink = async (b) => {
    try {
      const data = await paymentApi.create(b.id);
      if (data.checkoutUrl) {
        await navigator.clipboard.writeText(data.checkoutUrl).catch(() => {});
        toast.success('Lien de paiement copié dans le presse-papier');
      } else {
        toast.info('Paiement indisponible (Mollie non configuré)');
      }
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const columns = [
    {
      key: 'time',
      header: 'Horaire',
      render: (b) => (
        <div>
          <div className="font-medium text-slate-900">{formatTime(b.startTime)} – {formatTime(b.endTime)}</div>
          <div className="text-xs text-slate-400">{formatDateTime(b.startTime).split(' ').slice(0, 2).join(' ')}</div>
        </div>
      )
    },
    {
      key: 'client',
      header: 'Client',
      render: (b) => (
        <div>
          <div className="text-slate-900">{b.Client ? `${b.Client.firstName} ${b.Client.lastName}` : '—'}</div>
          <div className="text-xs text-slate-400">{b.Client?.email}</div>
        </div>
      )
    },
    { key: 'service', header: 'Prestation', render: (b) => b.Service?.name || '—' },
    { key: 'staff', header: 'Praticien', render: (b) => staffName(b.Staff) },
    {
      key: 'status',
      header: 'Statut',
      render: (b) => {
        const s = BOOKING_STATUS[b.status] || { label: b.status, color: 'slate' };
        return <Badge color={s.color}>{s.label}</Badge>;
      }
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-1 items-center">
          <Select
            value={b.status}
            onChange={(e) => changeStatus(b, e.target.value)}
            className="w-36 text-xs py-1"
          >
            {Object.entries(BOOKING_STATUS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </Select>
          {b.status === 'PENDING' && (
            <Button variant="ghost" size="sm" onClick={() => paymentLink(b)}>
              Lien paiement
            </Button>
          )}
          {b.status !== 'CANCELLED' && (
            <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => cancel(b)}>
              Annuler
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Réservations"
        subtitle="Planning et gestion des rendez-vous"
        action={<Button onClick={() => setNewOpen(true)}>+ Nouvelle réservation</Button>}
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <Field label="Date">
            <Input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
          </Field>
          <Field label="Praticien">
            <Select value={filters.staffId} onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}>
              <option value="">Tous</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {staffName(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Button variant="secondary" onClick={() => setFilters({ date: '', staffId: '' })}>
            Tout afficher
          </Button>
        </div>
      </Card>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <Table columns={columns} rows={bookings} empty={<div className="text-center py-10 text-slate-500">Aucune réservation pour ces critères</div>} />
        </Card>
      )}

      <NewBookingModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        staff={staff}
        services={services}
        onCreated={() => {
          setNewOpen(false);
          loadBookings();
        }}
      />
    </div>
  );
}
