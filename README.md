# Réservation — Front-office admin

Interface d'administration (SPA React) de l'[API de réservation](https://github.com/Nazaro73/API_Reservation).
Permet à chaque salon de gérer son organisation, son personnel, ses prestations,
ses réservations et ses paiements, et d'obtenir la **clé publique** à intégrer
sur son site pour la réservation en ligne des clients.

## Stack
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router** (routage SPA)
- **Axios** (client HTTP, injection du JWT)

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner VITE_API_URL
npm run dev            # http://localhost:5173
```

### Variables d'environnement
| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de base de l'API (avec `/api`) | `http://localhost:3000/api` |

> ⚠️ L'API doit autoriser l'origine du front via CORS (déjà activé côté API).

## Build & déploiement (statique)

```bash
npm run build     # génère dist/
npm run preview   # prévisualise le build
```

Le dossier `dist/` est une SPA statique déployable sur **Netlify**, **Vercel**,
**GitHub Pages**, etc. Les fichiers de réécriture SPA sont fournis
(`public/_redirects` pour Netlify, `vercel.json` pour Vercel) afin que le routage
côté client fonctionne sur les URL profondes.

Pensez à définir `VITE_API_URL` dans les variables d'environnement de la
plateforme d'hébergement (au moment du build).

## Fonctionnalités
- **Authentification** : connexion + création de salon (organisation + admin).
- **Tableau de bord** : indicateurs clés + clé publique de réservation.
- **Prestations** : CRUD (nom, durée, prix) + affectation au personnel.
- **Personnel** : création, horaires de travail hebdomadaires, absences/congés,
  connexion de l'agenda **Google Calendar**.
- **Réservations** : planning filtrable (date, praticien), création avec choix
  du créneau disponible, changement de statut, annulation, génération du **lien
  de paiement Mollie**.
- **Paramètres** : informations du salon, fenêtre de réservation, horaires
  d'ouverture, jours de fermeture, **régénération de la clé publique**.

## Structure
```
src/
  api/         client axios + endpoints par domaine
  components/  UI réutilisable, Layout, modales
  context/     Auth + Toast
  lib/         constantes (jours, statuts) + formatage
  pages/       Login, Register, Dashboard, Bookings, Services, Staff, StaffDetail, Settings
```

## Partie publique (réservation client)
Ce dépôt héberge **le front admin**. La réservation côté client final se fait via
l'**API publique** (`/api/public/*`) du backend, identifiée par la clé publique
`pk_...` du salon (récupérable dans le tableau de bord / les paramètres) et
destinée à être intégrée au cas par cas sur le site de chaque salon.
