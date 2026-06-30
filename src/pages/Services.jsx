import { useEffect, useState, useCallback } from 'react';
import { serviceApi, staffApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button, Card, Modal, Table, PageHeader, Spinner, Field, Input, Textarea, Badge } from '../components/ui';
import { formatPrice, staffName } from '../lib/format';

const emptyForm = { name: '', description: '', durationMinutes: 30, price: 0 };

export default function Services() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = création
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignService, setAssignService] = useState(null);
  const [assignIds, setAssignIds] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, st] = await Promise.all([serviceApi.list(), staffApi.list()]);
      setServices(s.services || []);
      setStaff(st.staff || []);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      price: service.price
    });
    setEditOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price)
      };
      if (editing) {
        await serviceApi.update(editing.id, payload);
        toast.success('Prestation mise à jour');
      } else {
        await serviceApi.create(payload);
        toast.success('Prestation créée');
      }
      setEditOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (service) => {
    if (!window.confirm(`Supprimer la prestation "${service.name}" ?`)) return;
    try {
      await serviceApi.remove(service.id);
      toast.success('Prestation supprimée');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const openAssign = (service) => {
    setAssignService(service);
    setAssignIds((service.staff || []).map((s) => s.id));
    setAssignOpen(true);
  };

  const toggleAssign = (id) => {
    setAssignIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const saveAssign = async () => {
    setSaving(true);
    try {
      await serviceApi.assign(assignService.id, assignIds);
      toast.success('Affectations mises à jour');
      setAssignOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Prestation', render: (s) => <span className="font-medium text-slate-900">{s.name}</span> },
    { key: 'durationMinutes', header: 'Durée', render: (s) => `${s.durationMinutes} min` },
    { key: 'price', header: 'Prix', render: (s) => formatPrice(s.price) },
    {
      key: 'staff',
      header: 'Personnel',
      render: (s) =>
        s.staff && s.staff.length ? (
          <div className="flex flex-wrap gap-1">
            {s.staff.map((m) => (
              <Badge key={m.id}>{`${m.firstName} ${m.lastName}`}</Badge>
            ))}
          </div>
        ) : (
          <span className="text-slate-400">Aucun</span>
        )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openAssign(s)}>
            Affecter
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
            Modifier
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => remove(s)}>
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Prestations"
        subtitle="Les services proposés (durée, prix) et le personnel qui les réalise"
        action={<Button onClick={openCreate}>+ Nouvelle prestation</Button>}
      />

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <Table
            columns={columns}
            rows={services}
            empty={
              <div className="text-center py-10">
                <p className="text-slate-600">Aucune prestation pour l'instant</p>
                <Button className="mt-3" onClick={openCreate}>
                  Créer la première
                </Button>
              </div>
            }
          />
        </Card>
      )}

      {/* Modale création / édition */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editing ? 'Modifier la prestation' : 'Nouvelle prestation'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" form="service-form" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <form id="service-form" onSubmit={save} className="space-y-4">
          <Field label="Nom" required>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Durée (minutes)" required>
              <Input type="number" min="1" required value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </Field>
            <Field label="Prix (€)" required>
              <Input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Modale affectation */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={`Affecter — ${assignService?.name || ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveAssign} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        {staff.length === 0 ? (
          <p className="text-sm text-slate-500">Ajoutez d'abord du personnel.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((m) => (
              <label key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={assignIds.includes(m.id)} onChange={() => toggleAssign(m.id)} className="h-4 w-4" />
                <span className="text-sm text-slate-700">{staffName(m)}</span>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
