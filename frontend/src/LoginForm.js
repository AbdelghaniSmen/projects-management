import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:5001/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true // Ajouté pour gérer les cookies de session
      });

      if (response.status === 200) {
        // Connexion réussie, mettre à jour l'état d'authentification
        login(response.data.user); // Stocker les données de l'utilisateur
        navigate('/liste'); // Rediriger vers la page protégée
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      if (error.response) {
        setError(`Erreur ${error.response.status}: ${error.response.data.error || 'Email ou mot de passe incorrect.'}`);
      } else if (error.request) {
        setError('Pas de réponse du serveur. Vérifiez que votre serveur backend est en cours d\'exécution.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
    });
    setError('');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-uppercase">Connexion</h1>

      <div className="card mx-auto shadow p-4" style={{ maxWidth: '500px' }}>
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close float-end" onClick={() => setError('')}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="d-flex justify-content-between">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>Connexion
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              <i className="fas fa-undo me-2"></i>Effacer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;