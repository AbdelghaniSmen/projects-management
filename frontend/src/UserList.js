import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Charger les utilisateurs au montage et lors du changement de user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5001/api/users', {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, [user]);

  // Gestion de la suppression
  const handleDelete = async (userId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;

    try {
      const response = await axios.delete(`http://127.0.0.1:5001/delete_user/${userId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUsers(users.filter(u => u.Id !== userId));
        setMessages([...messages, response.data.message]);
      } else {
        setMessages([...messages, response.data.message]);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessages([...messages, 'Erreur lors de la suppression']);
    }
  };

  // Navigation vers les pages
  const handleUpdate = (userId) => navigate(`/update_user/${userId}`);
  const handleViewProjects = () => navigate('/projects');
  const handleViewDashboard = () => navigate('/dashboard');
  const handleViewTasks = () => {
    if (user.role === 'admin') {
      navigate('/projects'); // Admins voient tous les projets, puis peuvent accéder aux tâches
    } else {
      navigate('/my_tasks'); // Users voient leurs propres tâches
    }
  };

  // Vérification des permissions pour les actions
  const canEditOrDelete = (itemId) => user && (user.role === 'admin' || (user.role === 'user' && user.Id === itemId));

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Tableau des Utilisateurs</h1>

      {/* Affichage des messages */}
      {messages.length > 0 && (
        <div className="alert alert-info">
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      )}

      {/* Statut de connexion */}
      <h4 className="mb-3">
        {user ? `Connecté en tant que : ${user.Nom} (${user.role})` : 'Non connecté'}
      </h4>

      {/* Navigation supplémentaire */}
      <div className="mb-4 d-flex justify-content-between">
        <div>
          <button className="btn btn-primary mr-2" onClick={handleViewDashboard}>
            <i className="fas fa-tachometer-alt mr-2"></i>Tableau de Bord
          </button>
          <button className="btn btn-info mr-2" onClick={handleViewProjects}>
            <i className="fas fa-project-diagram mr-2"></i>Voir les Projets
          </button>
          <button className="btn btn-warning" onClick={handleViewTasks}>
            <i className="fas fa-tasks mr-2"></i>{user?.role === 'admin' ? 'Gérer les Tâches' : 'Mes Tâches'}
          </button>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>Id</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Entity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map(item => (
              <tr key={item.Id}>
                <td>{item.Id}</td>
                <td>{item.Nom}</td>
                <td>{item.Email}</td>
                <td>{item.Entity}</td>
                <td>
                  {canEditOrDelete(item.Id) && (
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-primary mr-2"
                        onClick={() => handleUpdate(item.Id)}
                        title="Modifier"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.Id)}
                        title="Supprimer"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Aucun utilisateur trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Boutons de navigation */}
      <div className="d-flex justify-content-between">
        {user && user.role === 'admin' && (
          <button className="btn btn-success" onClick={() => navigate('/add_user')}>
            <i className="fas fa-plus-circle mr-2"></i>Ajouter un utilisateur
          </button>
        )}
        <button className="btn btn-secondary" onClick={logout}>
          <i className="fas fa-sign-out-alt mr-2"></i>Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default UserList;