import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './style.css';
import UserList from './UserList';
import AddUserForm from './AddUserForm';
import LoginForm from './LoginForm';
import UpdateUserForm from './UpdateUserForm';
import ProjectsList from './ProjectsList';
import AddProjectForm from './AddProjectForm';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm'; // À créer
import Dashboard from './Dashboard'; // À créer
import ProtectedRoute from './ProtectedRoute';
import MyTasks from './MyTasks';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Route publique */}
            <Route path="/" element={<LoginForm />} />

            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/liste" element={<UserList />} />
              <Route path="/add_user" element={<AddUserForm />} />
              <Route path="/update_user/:userId" element={<UpdateUserForm />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/add_project" element={<AddProjectForm />} />
              <Route path="/project/:projectId/tasks" element={<TaskList />} />
              <Route path="/project/:projectId/add_task" element={<AddTaskForm />} />
              <Route path="/my_tasks" element={<MyTasks />} /> {/* Nouvelle route */}
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;