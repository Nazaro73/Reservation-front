import { useEffect, useState, useCallback } from 'react';
import { organizationApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Card, CardBody, Spinner, Field, Input, PageHeader } from '../components/ui';
import { DAYS } from '../lib/constants';
import { formatDate } from '../lib/format';
import ApiKeyBox from '../components/ApiKeyBox';

function buildRows(schedules) {
  return DAYS.map((d) => {
    const existing = (schedules || []).find((s) => s.dayOfWeek === d.value);
    return {
      dayOfWeek: d.value,
      label: d.label,
      active: !!existing,
      startTime: existing?.startTime?.slice(0, 5) || '09:00',
      endTime: existing?.endTime?.slice(0, 5) || '18:00'
    };
  });
}

export default function Settings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [info, setInfo] = useState({ name: '', address: '', phone: '', email: '', bookingHorizonDays: 30 });
  const [rows, setRows] = useState([]);
  const [timeoff, setTimeoff] = useState({ date: '', reason: '' });
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const organization = await organizationApi.get();
      setOrg(organization);
      setInfo({
        name: organization.name || '',
        address: organization.address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        bookingHorizonDays: organization.bookingHorizonDays ?? 30
      });
      setRows(buildRows(organization.schedules));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const saveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await organizationApi.update({ ...info, bookingHorizonDays: Number(info.bookingHorizonDays) });
      toast.success('Informations enregistrées');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingInfo(false);
    }
  };

  const updateRow = (dayOfWeek, patch) => setRows((rs) => rs.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)));

  const saveHours = async () => {
    setSavingHours(true);
    try {
      const schedules = rows.filter((r) => r.active).map((r) => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime }));
      await organizationApi.setSchedules(schedules);
      toast.success('Horaires d’ouverture enregistrés');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingHours(false);
    }
  };

  const addTimeoff = async (e) => {
    e.preventDefault();
    try {
      await organizationApi.addTimeOff(timeoff);
      toast.success('Jour de fermeture ajouté');
      setTimeoff({ date: '', reason: '' });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const removeTimeoff = async (id) => {
    if (!window.confirm('Supprimer ce jour de fermeture ?')) return;
    try {
      await organizationApi.deleteTimeOff(id);
      toast.success('Supprimé');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Organisation, horaires et clé publique" />

      <div className="space-y-6">
        {/* Infos */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-4">Informations du salon</h2>
            <form onSubmit={saveInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nom" required>
                  <Input required value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
                </Field>
                <Field label="Email de contact">
                  <Input type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                </Field>
                <Field label="Téléphone">
                  <Input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
                </Field>
                <Field label="Adresse">
                  <Input value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
                </Field>
                <Field label="Fenêtre de réservation (jours)" hint="Nombre de jours à l'avance où l'on peut réserver (0 = illimité)">
                  <Input type="number" min="0" value={info.bookingHorizonDays} onChange={(e) => setInfo({ ...info, bookingHorizonDays: e.target.value })} />
                </Field>
              </div>
              <Button type="submit" disabled={savingInfo}>
                {savingInfo ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Horaires d'ouverture */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-4">Horaires d'ouverture</h2>
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.dayOfWeek} className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 w-32 shrink-0">
                    <input type="checkbox" checked={r.active} onChange={(e) => updateRow(r.dayOfWeek, { active: e.target.checked })} className="h-4 w-4" />
                    <span className="text-sm text-slate-700">{r.label}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input type="time" value={r.startTime} disabled={!r.active} onChange={(e) => updateRow(r.dayOfWeek, { startTime: e.target.value })} className="w-32" />
                    <span className="text-slate-400">→</span>
                    <Input type="time" value={r.endTime} disabled={!r.active} onChange={(e) => updateRow(r.dayOfWeek, { endTime: e.target.value })} className="w-32" />
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={saveHours} disabled={savingHours}>
              {savingHours ? 'Enregistrement…' : 'Enregistrer les horaires'}
            </Button>
          </CardBody>
        </Card>

        {/* Jours de fermeture */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-4">Jours de fermeture exceptionnelle</h2>
            <form onSubmit={addTimeoff} className="flex flex-wrap gap-3 items-end mb-4">
              <Field label="Date">
                <Input type="date" required value={timeoff.date} onChange={(e) => setTimeoff({ ...timeoff, date: e.target.value })} />
              </Field>
              <Field label="Motif">
                <Input value={timeoff.reason} onChange={(e) => setTimeoff({ ...timeoff, reason: e.target.value })} placeholder="Jour férié…" />
              </Field>
              <Button type="submit">Ajouter</Button>
            </form>
            {org?.timeOffs && org.timeOffs.length ? (
              <ul className="divide-y divide-slate-100">
                {org.timeOffs.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">
                      {formatDate(t.date)}
                      {t.reason && <span className="text-slate-400"> · {t.reason}</span>}
                    </span>
                    <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => removeTimeoff(t.id)}>
                      Supprimer
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Aucun jour de fermeture.</p>
            )}
          </CardBody>
        </Card>

        {/* Clé publique */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-1">Clé publique de réservation</h2>
            <p className="text-sm text-slate-500 mb-4">
              À intégrer sur votre site (en-tête <code className="text-xs">X-Api-Key</code>) pour la réservation en ligne des clients.
            </p>
            <ApiKeyBox apiKey={org?.publicApiKey} allowRegenerate onRegenerated={(k) => setOrg({ ...org, publicApiKey: k })} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
