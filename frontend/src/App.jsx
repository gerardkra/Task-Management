import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:3001";
const COLONNES = ["À faire", "En cours", "Terminé"];
const COULEURS = {
  "À faire": { bg: "#EFF6FF", border: "#3B82F6", badge: "#DBEAFE", text: "#1D4ED8" },
  "En cours": { bg: "#FFFBEB", border: "#F59E0B", badge: "#FEF3C7", text: "#92400E" },
  "Terminé": { bg: "#ECFDF5", border: "#10B981", badge: "#D1FAE5", text: "#065F46" },
};

function FormulaireAjout({ onAjouter, onAnnuler }) {
  const [form, setForm] = useState({ titre: "", description: "", date_limite: "", statut: "À faire" });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async () => {
    if (!form.titre.trim()) { alert("Le titre est obligatoire !"); return; }
    if (!form.date_limite) { alert("La date limite est obligatoire !"); return; }
    await onAjouter(form);
    setForm({ titre: "", description: "", date_limite: "", statut: "À faire" });
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>➕ Nouvelle tâche</h2>
        <label>Titre *</label>
        <input name="titre" value={form.titre} onChange={handleChange} placeholder="Ex: Créer la page d'accueil" />
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez la tâche..." rows={3} />
        <label>Date limite *</label>
        <input type="date" name="date_limite" value={form.date_limite} onChange={handleChange} />
        <label>Statut initial</label>
        <select name="statut" value={form.statut} onChange={handleChange}>
          {COLONNES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="modal-buttons">
          <button className="btn-annuler" onClick={onAnnuler}>Annuler</button>
          <button className="btn-ajouter" onClick={handleSubmit}>Créer la tâche</button>
        </div>
      </div>
    </div>
  );
}

function FormulaireModification({ tache, onModifier, onAnnuler }) {
  const [form, setForm] = useState({ ...tache });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>✏️ Modifier la tâche</h2>
        <label>Titre *</label>
        <input name="titre" value={form.titre} onChange={handleChange} />
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        <label>Date limite *</label>
        <input type="date" name="date_limite" value={form.date_limite} onChange={handleChange} />
        <label>Statut</label>
        <select name="statut" value={form.statut} onChange={handleChange}>
          {COLONNES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="modal-buttons">
          <button className="btn-annuler" onClick={onAnnuler}>Annuler</button>
          <button className="btn-ajouter" onClick={() => onModifier(form)}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function CarteTache({ tache, onSupprimer, onDeplacer, onModifier }) {
  const couleur = COULEURS[tache.statut];
  const estEnRetard = new Date(tache.date_limite) < new Date() && tache.statut !== "Terminé";
  return (
    <div className="carte-tache" style={{ borderLeft: `4px solid ${couleur.border}`, background: couleur.bg }}>
      <div className="carte-header">
        <h3 className="carte-titre">{tache.titre}</h3>
        <div className="carte-actions">
          <button className="btn-icone" title="Modifier" onClick={() => onModifier(tache)}>✏️</button>
          <button className="btn-icone btn-supprimer" title="Supprimer" onClick={() => onSupprimer(tache.id)}>🗑️</button>
        </div>
      </div>
      {tache.description && <p className="carte-description">{tache.description}</p>}
      <div className="carte-footer">
        <span className="carte-date" style={{ color: estEnRetard ? "#DC2626" : "#6B7280" }}>
          {estEnRetard ? "⚠️" : "📅"} {tache.date_limite}
        </span>
        <div className="carte-navigation">
          {tache.statut !== "À faire" && <button className="btn-deplacer" onClick={() => onDeplacer(tache, "gauche")}>◀</button>}
          {tache.statut !== "Terminé" && <button className="btn-deplacer btn-avancer" onClick={() => onDeplacer(tache, "droite")}>▶</button>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [taches, setTaches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [tacheAModifier, setTacheAModifier] = useState(null);

  const chargerTaches = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTaches(response.data);
      setErreur(null);
    } catch (err) {
      setErreur("❌ Impossible de contacter le backend. Assurez-vous que Rust tourne sur le port 3001.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { chargerTaches(); }, []);

  const creerTache = async (form) => {
    try {
      await axios.post(`${API_URL}/tasks`, form);
      setAfficherFormulaire(false);
      await chargerTaches();
    } catch (err) { alert("Erreur : " + (err.response?.data || err.message)); }
  };

  const supprimerTache = async (id) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      await chargerTaches();
    } catch (err) { alert("Erreur lors de la suppression."); }
  };

  const deplacerTache = async (tache, direction) => {
    const index = COLONNES.indexOf(tache.statut);
    const nouveauStatut = COLONNES[direction === "droite" ? index + 1 : index - 1];
    try {
      await axios.put(`${API_URL}/tasks/${tache.id}`, { statut: nouveauStatut });
      await chargerTaches();
    } catch (err) { alert("Erreur lors du déplacement."); }
  };

  const modifierTache = async (form) => {
    try {
      await axios.put(`${API_URL}/tasks/${form.id}`, form);
      setTacheAModifier(null);
      await chargerTaches();
    } catch (err) { alert("Erreur lors de la modification."); }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="header-titre">📋 Tableau de bord</h1>
          <p className="header-sous-titre">Gérez vos tâches simplement</p>
        </div>
        <button className="btn-nouvelle-tache" onClick={() => setAfficherFormulaire(true)}>➕ Nouvelle tâche</button>
      </header>

      {chargement && (
        <div className="message-centre">
          <div className="spinner" />
          <p>Chargement des tâches...</p>
        </div>
      )}

      {erreur && (
        <div className="alerte-erreur">
          <strong>{erreur}</strong>
          <p>Commande pour démarrer le backend :</p>
          <code>cd backend && cargo run</code>
        </div>
      )}

      {!chargement && !erreur && (
        <div className="kanban-board">
          {COLONNES.map((colonne) => {
            const couleur = COULEURS[colonne];
            const tachesColonne = taches.filter((t) => t.statut === colonne);
            return (
              <div key={colonne} className="kanban-colonne">
                <div className="colonne-header" style={{ borderBottom: `3px solid ${couleur.border}` }}>
                  <h2 className="colonne-titre">{colonne}</h2>
                  <span className="colonne-badge" style={{ background: couleur.badge, color: couleur.text }}>
                    {tachesColonne.length}
                  </span>
                </div>
                <div className="colonne-taches">
                  {tachesColonne.length === 0 ? (
                    <div className="colonne-vide"><p>Aucune tâche ici</p></div>
                  ) : (
                    tachesColonne.map((tache) => (
                      <CarteTache key={tache.id} tache={tache} onSupprimer={supprimerTache} onDeplacer={deplacerTache} onModifier={setTacheAModifier} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {afficherFormulaire && <FormulaireAjout onAjouter={creerTache} onAnnuler={() => setAfficherFormulaire(false)} />}
      {tacheAModifier && <FormulaireModification tache={tacheAModifier} onModifier={modifierTache} onAnnuler={() => setTacheAModifier(null)} />}
    </div>
  );
}