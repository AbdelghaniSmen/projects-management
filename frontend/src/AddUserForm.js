import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    Nom: '',
    email: '',
    password: '',
    Entity: 'g1',
    role: 'user' // Ajouter un champ pour le rôle
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user && user.role !== 'admin') {
      setError('Seul un admin peut ajouter des utilisateurs');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://127.0.0.1:5001/add_user', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      console.log('Response:', response.data);

      if (response.status === 201) {
        setSuccess(true);
        setFormData({
          Nom: '',
          email: '',
          password: '',
          Entity: 'g1',
          role: 'user'
        });
        setTimeout(() => {
          navigate('/liste');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      if (error.response) {
        setError(`Erreur ${error.response.status}: ${error.response.data.error || JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError('Pas de réponse du serveur.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Nom: '',
      email: '',
      password: '',
      Entity: 'g1',
      role: 'user'
    });
    setError('');
    setSuccess(false);
  };

  if (user && user.role !== 'admin') {
    return <div><p>Accès refusé : seul un admin peut accéder à cette page.</p></div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center text-uppercase">Ajouter un Utilisateur</h1>
      <div className="card mx-auto shadow p-4" style={{ maxWidth: '500px' }}>
        {success && (
          <div className="alert alert-success mb-3">
            <i className="fas fa-check-circle me-2"></i>
            Utilisateur ajouté avec succès! Redirection...
            <button type="button" className="btn-close float-end" onClick={() => setSuccess(false)}></button>
          </div>
        )}
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close float-end" onClick={() => setError('')}></button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="Nom" className="form-label">
              <i className="fas fa-user me-2"></i>Nom :
            </label>
            <input
              type="text"
              id="Nom"
              name="Nom"
              className="form-control"
              value={formData.Nom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope me-2"></i>Email :
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <i className="fas fa-lock me-2"></i>Mot de passe :
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="Entity" className="form-label">
              <i className="fas fa-building me-2"></i>Entity :
            </label>
            <select
              id="Entity"
              name="Entity"
              className="form-select"
              value={formData.Entity}
              onChange={handleChange}
            >
              <option value="g1">g1</option>
              <option value="g2">g2</option>
              <option value="g3">g3</option>
              <option value="g4">g4</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              <i className="fas fa-user-tag me-2"></i>Rôle :
            </label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Chargement...
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle me-2"></i>Ajouter
                </>
              )}
            </button>
            <button type="button" className="btn btn-danger" onClick={resetForm}>
              <i className="fas fa-trash-alt me-2"></i>Effacer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;