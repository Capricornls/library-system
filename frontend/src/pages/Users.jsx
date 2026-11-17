import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/users').then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function addUser(values) {
    await api.post('/users', values);
    setMessage('User added');
    load();
  }

  async function updateUser(values) {
    const body = { ...values };
    if (!body.password) delete body.password;
    await api.put(`/users/${editing.id}`, body);
    setEditing(null);
    setMessage('User updated');
    load();
  }

  async function deleteUser(u) {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      setMessage('User deleted');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>Users</h1>
      {message && <p className="alert alert-ok" role="status">{message}</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {editing
        ? <UserForm key={editing.id} initial={editing} onSubmit={updateUser} onCancel={() => setEditing(null)} />
        : <UserForm onSubmit={addUser} />}
      <UserList users={users} currentUserId={currentUser.id}
                onEdit={(u) => { setEditing(u); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onDelete={deleteUser} />
    </>
  );
}
