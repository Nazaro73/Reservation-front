import { useState, useEffect } from 'react';
import { bookingApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Modal, Field, Input, Select } from './ui';
import { todayStr, formatTime, staffName } from '../lib/format';

const emptyClient = { clientFirstName: '', clientLastName: '', clientEmail: '', clientPhone: '' };

export default function NewBookingModal({ open, onClose, staff, services, onCreated }) {
  const toast = useToast();
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [slotsMsg, setSlotsMsg] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [client, setClient] = useState(emptyClient);
  const [saving, setSaving] = useState(false);

  // Réinitialise à l'ouverture.
  useEffect(() => {
    if (open) {
      setServiceId('');
      setStaffId('');
      setDate(todayStr());
      setSlots([]);
      setSlotsMsg('');
      setSelectedSlot('');
      setClient(emptyClient);
    }
  }, [open]);

  // Charge les créneaux dès que service + staff + date sont définis.
  useEffect(() => {
    if (!serviceId || !staffId || !date) {
      setSlots([]);
      setSlotsMsg('');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const data = await bookingApi.availableSlots(staffId, { date, serviceId });
        if (cancelled) return;
        setSlots(data.slots || []);
        setSlotsMsg(data.slots?.length ? '' : data.message || 'Aucun créneau disponible');
      } catch (err) {
        if (!cancelled) toast.error(errorMessage(err));
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, date, toast]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Choisissez un créneau');
      return;
    }
    setSaving(true);
    try {
      const data = await bookingApi.create({
        ...client,
        serviceId: Number(serviceId),
        staffId: Number(staffId),
        startTime: selectedSlot
      });
      if (data.checkoutUrl) {
        await navigator.clipboard.writeText(data.checkoutUrl).catch(() => {});
        toast.success('Réservation créée — lien de paiement copié');
      } else {
        toast.success('Réservation créée');
      }
      onCreated?.();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const staffForService = serviceId
    ? staff.filter((s) => services.find((sv) => sv.id === Number(serviceId))?.staff?.some((m) => m.id === s.id))
    : staff;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle réservation"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="new-booking-form" disabled={saving || !selectedSlot}>
            {saving ? 'Création…' : 'Créer la réservation'}
          </Button>
        </>
      }
    >
      <form id="new-booking-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Prestation" required>
            <Select required value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">—</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Praticien" required>
            <Select required value={staffId} onChange={(e) => setStaffId(e.target.value)} disabled={!serviceId}>
              <option value="">—</option>
              {staffForService.map((s) => (
                <option key={s.id} value={s.id}>
                  {staffName(s)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" required>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        {/* Créneaux */}
        {serviceId && staffId && (
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Créneau</span>
            {loadingSlots ? (
              <p className="text-sm text-slate-400">Chargement des créneaux…</p>
            ) : slots.length ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.startTime}
                    onClick={() => setSelectedSlot(slot.startTime)}
                    className={`text-sm px-2 py-1.5 rounded-lg border transition ${
                      selectedSlot === slot.startTime
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-300 hover:border-brand-400 text-slate-700'
                    }`}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-600">{slotsMsg}</p>
            )}
          </div>
        )}

        {/* Client */}
        <div className="border-t border-slate-200 pt-4">
          <span className="block text-sm font-medium text-slate-700 mb-2">Client</span>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" required>
              <Input required value={client.clientFirstName} onChange={(e) => setClient({ ...client, clientFirstName: e.target.value })} />
            </Field>
            <Field label="Nom" required>
              <Input required value={client.clientLastName} onChange={(e) => setClient({ ...client, clientLastName: e.target.value })} />
            </Field>
            <Field label="Email" required>
              <Input type="email" required value={client.clientEmail} onChange={(e) => setClient({ ...client, clientEmail: e.target.value })} />
            </Field>
            <Field label="Téléphone">
              <Input value={client.clientPhone} onChange={(e) => setClient({ ...client, clientPhone: e.target.value })} />
            </Field>
          </div>
        </div>
      </form>
    </Modal>
  );
}
