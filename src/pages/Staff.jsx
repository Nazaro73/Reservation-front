import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Card, Modal, Table, PageHeader, Spinner, Field, Input, Badge } from '../components/ui';

const emptyForm = { firstName: '', lastName: '', email: '', password: '' };

export default function Staff() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await staffApi.list();
      setStaff(data.staff || []);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await staffApi.create(form);
      toast.success('Membre ajouté');
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nom',
      render: (s) => <span className="font-medium text-slate-900">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'}</span>
    },
    { key: 'email', header: 'Email', render: (s) => <span className="text-slate-600">{s.email}</span> },
    {
      key: 'schedules',
      header: 'Horaires',
      render: (s) =>
        s.schedules && s.schedules.length ? (
          <Badge color="emerald">{s.schedules.length} jour(s)</Badge>
        ) : (
          <Badge color="amber">À définir</Badge>
        )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <Button variant="secondary" size="sm" onClick={() => navigate(`/personnel/${s.id}`)}>
          Gérer
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Personnel"
        subtitle="Vos praticiens, leurs horaires, absences et agenda Google"
        action={<Button onClick={() => setOpen(true)}>+ Ajouter un membre</Button>}
      />

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <Table
            columns={columns}
            rows={staff}
            empty={
              <div className="text-center py-10">
                <p className="text-slate-600">Aucun membre du personnel</p>
                <Button className="mt-3" onClick={() => setOpen(true)}>
                  Ajouter le premier
                </Button>
              </div>
            }
          />
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ajouter un membre du personnel"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="staff-form" disabled={saving}>
              {saving ? 'Création…' : 'Créer'}
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" required>
              <Input required value={form.firstName} onChange={set('firstName')} />
            </Field>
            <Field label="Nom" required>
              <Input required value={form.lastName} onChange={set('lastName')} />
            </Field>
          </div>
          <Field label="Email" required>
            <Input type="email" required value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Mot de passe" required hint="Le membre pourra se connecter avec ces identifiants">
            <Input type="password" required value={form.password} onChange={set('password')} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
