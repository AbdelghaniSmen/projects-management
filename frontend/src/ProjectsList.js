import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5001/api/projects', { withCredentials: true });
        setProjects(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleAddProject = () => navigate('/add_project');

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Liste des Projets</h1>
      {loading && <p className="text-center"><i className="fas fa-spinner fa-spin"></i> Chargement...</p>}
      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Entité</th>
            <th>Créé par</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map(project => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.description || 'N/A'}</td>
                <td>{project.entity_id}</td>
                <td>{project.created_by}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/project/${project.id}/tasks`)}
                  >
                    Voir les tâches
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">Aucun projet trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
      {user && user.role === 'admin' && (
        <button className="btn btn-success" onClick={handleAddProject}>
          Ajouter un projet
        </button>
      )}
    </div>
  );
};

export default ProjectsList;