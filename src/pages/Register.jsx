import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';
import { Button, Card, CardBody, Field, Input } from '../components/ui';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organizationName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Salon créé ! Bienvenue.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Création impossible'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Créer votre salon</h1>
          <p className="text-slate-500 text-sm mt-1">Compte administrateur + organisation</p>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Nom du salon" required>
                <Input required value={form.organizationName} onChange={set('organizationName')} placeholder="Salon Belle Vue" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom">
                  <Input value={form.firstName} onChange={set('firstName')} />
                </Field>
                <Field label="Nom">
                  <Input value={form.lastName} onChange={set('lastName')} />
                </Field>
              </div>
              <Field label="Email" required>
                <Input type="email" required value={form.email} onChange={set('email')} placeholder="admin@monsalon.fr" />
              </Field>
              <Field label="Mot de passe" required hint="8 caractères minimum recommandé">
                <Input type="password" required value={form.password} onChange={set('password')} />
              </Field>
              <Field label="Téléphone">
                <Input value={form.phone} onChange={set('phone')} />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création…' : 'Créer mon salon'}
              </Button>
            </form>
          </CardBody>
        </Card>
        <p className="text-center text-sm text-slate-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
