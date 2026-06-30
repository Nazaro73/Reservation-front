import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { staffApi, googleApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Card, CardBody, Spinner, Field, Input, Badge, PageHeader } from '../components/ui';
import { DAYS } from '../lib/constants';
import { formatDate } from '../lib/format';

function buildScheduleRows(schedules) {
  return DAYS.map((d) => {
    const existing = (schedules || []).find((s) => s.dayOfWeek === d.value);
    return {
      dayOfWeek: d.value,
      label: d.label,
      active: existing ? existing.isActive !== false : false,
      startTime: existing?.startTime?.slice(0, 5) || '09:00',
      endTime: existing?.endTime?.slice(0, 5) || '17:00'
    };
  });
}

export default function StaffDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const [rows, setRows] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [timeoff, setTimeoff] = useState({ startDate: '', endDate: '', reason: '' });
  const [google, setGoogle] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, googleRes] = await Promise.all([
        staffApi.get(id),
        googleApi.connectionStatus(id).catch(() => ({ connected: false }))
      ]);
      setStaff(staffRes.staff);
      setRows(buildScheduleRows(staffRes.staff.schedules));
      setGoogle(googleRes);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (dayOfWeek, patch) => {
    setRows((rs) => rs.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)));
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const schedules = rows
        .filter((r) => r.active)
        .map((r) => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime, isActive: true }));
      await staffApi.setSchedules(id, schedules);
      toast.success('Horaires enregistrés');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingSchedule(false);
    }
  };

  const addTimeoff = async (e) => {
    e.preventDefault();
    try {
      await staffApi.addTimeOff(id, timeoff);
      toast.success('Absence ajoutée');
      setTimeoff({ startDate: '', endDate: '', reason: '' });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const removeTimeoff = async (timeoffId) => {
    if (!window.confirm('Supprimer cette absence ?')) return;
    try {
      await staffApi.deleteTimeOff(id, timeoffId);
      toast.success('Absence supprimée');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const connectGoogle = async () => {
    try {
      const { authUrl } = await googleApi.getAuthUrl(id);
      window.open(authUrl, '_blank', 'noopener');
      toast.info('Autorisez l’accès dans l’onglet ouvert, puis rafraîchissez.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const disconnectGoogle = async () => {
    if (!window.confirm('Déconnecter l’agenda Google de ce membre ?')) return;
    try {
      await googleApi.disconnect(id);
      toast.success('Agenda Google déconnecté');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <Spinner />;
  if (!staff) return null;

  return (
    <div>
      <Link to="/personnel" className="text-sm text-brand-600 hover:underline">
        &larr; Retour au personnel
      </Link>
      <PageHeader title={`${staff.firstName} ${staff.lastName}`} subtitle={staff.email} />

      <div className="space-y-6">
        {/* Horaires de travail */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-4">Horaires de travail</h2>
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
            <div className="mt-4">
              <Button onClick={saveSchedule} disabled={savingSchedule}>
                {savingSchedule ? 'Enregistrement…' : 'Enregistrer les horaires'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Absences */}
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-4">Absences / congés</h2>
            <form onSubmit={addTimeoff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end mb-4">
              <Field label="Du">
                <Input type="date" required value={timeoff.startDate} onChange={(e) => setTimeoff({ ...timeoff, startDate: e.target.value })} />
              </Field>
              <Field label="Au">
                <Input type="date" required value={timeoff.endDate} onChange={(e) => setTimeoff({ ...timeoff, endDate: e.target.value })} />
              </Field>
              <Field label="Motif">
                <Input value={timeoff.reason} onChange={(e) => setTimeoff({ ...timeoff, reason: e.target.value })} placeholder="Congés…" />
              </Field>
              <Button type="submit">Ajouter</Button>
            </form>

            {staff.timeOffs && staff.timeOffs.length ? (
              <ul className="divide-y divide-slate-100">
                {staff.timeOffs.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">
                      {formatDate(t.startDate)} → {formatDate(t.endDate)}
                      {t.reason && <span className="text-slate-400"> · {t.reason}</span>}
                    </span>
                    <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => removeTimeoff(t.id)}>
                      Supprimer
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Aucune absence enregistrée.</p>
            )}
          </CardBody>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900 mb-1">Agenda Google</h2>
                {google?.connected ? (
                  <p className="text-sm text-slate-600">
                    Connecté <Badge color="emerald">{google.googleEmail}</Badge> — les réservations confirmées y sont ajoutées.
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">Non connecté. Connectez un compte pour synchroniser les rendez-vous.</p>
                )}
              </div>
              {google?.connected ? (
                <Button variant="danger" size="sm" onClick={disconnectGoogle}>
                  Déconnecter
                </Button>
              ) : (
                <Button size="sm" onClick={connectGoogle}>
                  Connecter Google
                </Button>
              )}
            </div>
            {!google?.connected && (
              <p className="text-xs text-slate-400 mt-2">
                Après autorisation dans le nouvel onglet, revenez ici et rafraîchissez la page.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
