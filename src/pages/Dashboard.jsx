import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { organizationApi, staffApi, serviceApi, bookingApi } from '../api';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Card, CardBody, Spinner, Button, Badge } from '../components/ui';
import { todayStr } from '../lib/format';
import ApiKeyBox from '../components/ApiKeyBox';

function Stat({ label, value, to }) {
  const inner = (
    <Card className="hover:shadow-md transition">
      <CardBody>
        <div className="text-3xl font-semibold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500 mt-1">{label}</div>
      </CardBody>
    </Card>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [counts, setCounts] = useState({ staff: 0, services: 0, todayBookings: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [organization, staffRes, servicesRes, bookingsRes] = await Promise.all([
          organizationApi.get(),
          staffApi.list(),
          serviceApi.list(),
          bookingApi.list({ date: todayStr() })
        ]);
        setOrg(organization);
        setCounts({
          staff: staffRes.staff?.length || 0,
          services: servicesRes.services?.length || 0,
          todayBookings: (bookingsRes.bookings || []).filter((b) => b.status !== 'CANCELLED').length
        });
      } catch (err) {
        toast.error(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Bonjour 👋</h1>
      <p className="text-slate-500 text-sm mb-6">{org?.name}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Réservations aujourd'hui" value={counts.todayBookings} to="/reservations" />
        <Stat label="Prestations" value={counts.services} to="/prestations" />
        <Stat label="Membres du personnel" value={counts.staff} to="/personnel" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-1">Clé publique de réservation</h2>
            <p className="text-sm text-slate-500 mb-4">
              À intégrer sur le site du salon pour permettre aux clients de réserver en ligne.
            </p>
            <ApiKeyBox apiKey={org?.publicApiKey} />
            <div className="mt-3">
              <Link to="/parametres">
                <Button variant="secondary" size="sm">
                  Gérer dans les paramètres
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-3">Mise en route</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Badge color="brand">1</Badge> Créez vos prestations (durée, prix)
              </li>
              <li className="flex items-center gap-2">
                <Badge color="brand">2</Badge> Ajoutez votre personnel et leurs horaires
              </li>
              <li className="flex items-center gap-2">
                <Badge color="brand">3</Badge> Définissez vos horaires d'ouverture
              </li>
              <li className="flex items-center gap-2">
                <Badge color="brand">4</Badge> Intégrez la clé publique sur votre site
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
