import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          axios.get('http://127.0.0.1:5001/api/users', { withCredentials: true }),
          axios.get('http://127.0.0.1:5001/api/projects', { withCredentials: true })
        ]);
        setStats({
          users: usersRes.data.length,
          projects: projectsRes.data.length,
          tasks: 0 // À compléter avec une route /api/tasks si nécessaire
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center">Tableau de Bord</h1>
      {user && <h4 className="mb-4">Connecté en tant que : {user.Nom} ({user.role})</h4>}
      <div className="row">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Utilisateurs Actifs</h5>
              <p className="card-text">{stats.users}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Projets</h5>
              <p className="card-text">{stats.projects}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Tâches</h5>
              <p className="card-text">{stats.tasks}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;