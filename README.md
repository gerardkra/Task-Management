# Task Management — Kanban Full-Stack

![Backend](https://img.shields.io/badge/Backend-Rust%20%2B%20Axum-orange?style=flat-square&logo=rust)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=flat-square&logo=react)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2017-336791?style=flat-square&logo=postgresql)
![Deploy Backend](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)
![Deploy Frontend](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/Licence-MIT-green?style=flat-square)

Application web de gestion de tâches sous forme de tableau Kanban. Le backend est une API REST écrite en Rust, le frontend est une interface React connectée à cette API.

---

## Démo

| Service | URL |
|---|---|
| Frontend | [task-management-pi-weld.vercel.app](https://task-management-pi-weld.vercel.app) |
| Backend API | Déployé sur Render |

---

## Fonctionnalités

- CRUD complet sur les tâches (créer, lire, modifier, supprimer)
- Tableau Kanban avec trois colonnes : À faire, En cours, Terminé
- Déplacement des tâches entre colonnes
- Modal d'édition pour modifier tous les champs d'une tâche
- Détection des tâches en retard (date dépassée mise en évidence)
- Validation des champs obligatoires côté backend (titre et date)
- Persistance via PostgreSQL 17 hébergé sur Render

---

## Stack technique

**Backend**

- Rust avec Axum 0.7 comme framework web
- SQLx 0.8 pour les requêtes PostgreSQL asynchrones
- Tokio comme runtime asynchrone
- Tower HTTP pour le middleware CORS
- Serde pour la sérialisation JSON
- UUID v4 pour les identifiants

**Frontend**

- React 18 avec Vite
- Axios pour les appels HTTP
- CSS personnalisé, interface responsive

---

## Structure du projet

```
Task-Management/
├── backend/
│   ├── Cargo.toml
│   ├── .env
│   └── src/
│       └── main.rs
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
└── README.md
```

---

## Installation locale

### Prérequis

- Rust 1.70+
- Node.js 16+
- PostgreSQL (local ou distant)

### Backend

```bash
cd backend
```

Crée un fichier `.env` :

```env
DATABASE_URL=postgresql://user:password@host:5432/kanban_db?sslmode=require
```

Crée la table dans ta base de données :

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  date_limite TEXT,
  statut TEXT NOT NULL
);
```

Lance le serveur :

```bash
cargo run
```

Le backend démarre sur `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`. Assure-toi que `API_URL` dans `App.jsx` pointe vers `http://localhost:3001` en développement.

---

## API

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Récupère toutes les tâches |
| POST | `/tasks` | Crée une nouvelle tâche |
| PUT | `/tasks/:id` | Met à jour une tâche |
| DELETE | `/tasks/:id` | Supprime une tâche |

Format d'une tâche :

```json
{
  "id": "uuid-v4",
  "titre": "string",
  "description": "string",
  "date_limite": "YYYY-MM-DD",
  "statut": "À faire | En cours | Terminé"
}
```

---

## Déploiement

### Backend sur Render

1. Crée un Web Service sur [render.com](https://render.com)
2. Configure le Root Directory sur `backend`, la Build Command sur `cargo build --release` et la Start Command sur `./target/release/backend`
3. Ajoute la variable d'environnement `DATABASE_URL` avec l'Internal URL de ta base Render

### Frontend sur Vercel

1. Importe le repo sur [vercel.com](https://vercel.com)
2. Configure le Root Directory sur `frontend` et le framework sur Vite
3. Mets à jour `API_URL` dans `App.jsx` avec l'URL de ton backend Render

---

## Roadmap

- Authentification utilisateur avec JWT
- Drag & Drop entre les colonnes
- Filtres et tri par date, statut ou priorité
- Etiquettes et catégories
- Dashboard avec statistiques
- Mode sombre

---
