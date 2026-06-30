import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/reservations', label: 'Réservations' },
  { to: '/prestations', label: 'Prestations' },
  { to: '/personnel', label: 'Personnel' },
  { to: '/parametres', label: 'Paramètres' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const orgName = user?.organization?.name || 'Mon salon';

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="text-white font-semibold text-lg">Réservation</div>
        <div className="text-slate-400 text-xs mt-0.5 truncate">{orgName}</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <div className="px-4 py-2 text-xs text-slate-400 truncate">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-64 bg-slate-800 shrink-0">{sidebar}</aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-slate-800">{sidebar}</div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between bg-slate-800 px-4 py-3">
          <span className="text-white font-semibold">Réservation</span>
          <button onClick={() => setOpen(true)} className="text-white text-2xl leading-none">
            &#9776;
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
