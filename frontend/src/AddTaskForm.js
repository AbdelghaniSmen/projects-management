import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AddTaskForm = () => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: projectId,
    assigned_to: '',
    status: 'todo',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'admin') {
      setError('Seul un admin peut ajouter des tâches');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://127.0.0.1:5001/api/tasks', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate(`/project/${projectId}/tasks`), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'ajout de la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Ajouter une Tâche au Projet #{projectId}</h1>
      {success && <div className="alert alert-success">Tâche ajoutée avec succès ! Redirection...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Titre</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
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
          <label htmlFor="assigned_to" className="form-label">Assigné à (ID utilisateur)</label>
          <input
            type="number"
            id="assigned_to"
            name="assigned_to"
            className="form-control"
            value={formData.assigned_to}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="status" className="form-label">Statut</label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="due_date" className="form-label">Date limite</label>
          <input
            type="datetime-local"
            id="due_date"
            name="due_date"
            className="form-control"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Ajout...' : 'Ajouter la tâche'}
        </button>
      </form>
    </div>
  );
};

export default AddTaskForm;