import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AddProjectForm = () => {
  const [formData, setFormData] = useState({ name: '', description: '', entity_id: '' });
  const [entities, setEntities] = useState([]); // Nouvel état pour les entités
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Charger les entités au montage du composant
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5001/api/entities', {
          withCredentials: true
        });
        setEntities(response.data);
        // Sélectionner la première entité par défaut si elle existe
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, entity_id: response.data[0].identity.toString() }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error);
        setError('Impossible de charger les entités');
      }
    };
    fetchEntities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Utilisateur actuel:', user);
    if (!user || user.role !== 'admin') {
      setError('Seul un admin peut ajouter des projets');
      console.log('Erreur: Rôle non admin ou utilisateur non défini');
      return;
    }
    console.log('Données avant envoi:', formData);
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://127.0.0.1:5001/api/projects', {
        ...formData,
        entity_id: parseInt(formData.entity_id) // Convertir en int pour Flask
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      console.log('Réponse de Flask:', response.data);
      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate('/projects'), 2000);
      }
    } catch (error) {
      console.error('Erreur réseau ou serveur:', error.response || error.message);
      setError(error.response?.data?.error || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Ajouter un Projet</h1>
      {success && <div className="alert alert-success">Projet ajouté avec succès ! Redirection...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nom du projet</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="entity_id" className="form-label">Entité</label>
          <select
            id="entity_id"
            name="entity_id"
            className="form-select"
            value={formData.entity_id}
            onChange={handleChange}
            required
          >
            {entities.length > 0 ? (
              entities.map(entity => (
                <option key={entity.identity} value={entity.identity}>
                  {entity.nomentity}
                </option>
              ))
            ) : (
              <option value="">Aucune entité disponible</option>
            )}
          </select>
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
};

export default AddProjectForm;