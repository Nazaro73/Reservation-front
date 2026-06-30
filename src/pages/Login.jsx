import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';
import { Button, Card, CardBody, Field, Input } from '../components/ui';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Connexion réussie');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Connexion impossible'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Espace administration</h1>
          <p className="text-slate-500 text-sm mt-1">Connectez-vous à votre salon</p>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Email" required>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@monsalon.fr"
                />
              </Field>
              <Field label="Mot de passe" required>
                <Input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion…' : 'Se connecter'}
              </Button>
            </form>
          </CardBody>
        </Card>
        <p className="text-center text-sm text-slate-500 mt-4">
          Pas encore de salon ?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
