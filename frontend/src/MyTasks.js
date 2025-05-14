import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:5001/api/tasks`, { withCredentials: true });
        const myTasks = response.data.filter(task => task.assigned_to === user.Id);
        setTasks(myTasks);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTasks();
  }, [user]);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Mes Tâches</h1>
      {loading && <p className="text-center"><i className="fas fa-spinner fa-spin"></i> Chargement...</p>}
      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Projet</th>
            <th>Statut</th>
            <th>Date Limite</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map(task => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.description || 'N/A'}</td>
                <td>{task.project_id}</td>
                <td>{task.status}</td>
                <td>{task.due_date || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">Aucune tâche assignée</td>
            </tr>
          )}
        </tbody>
      </table>
      <button className="btn btn-secondary" onClick={() => navigate('/liste')}>
        Retour à la liste des utilisateurs
      </button>
    </div>
  );
};

export default MyTasks;