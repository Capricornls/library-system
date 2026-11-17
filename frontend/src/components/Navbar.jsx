import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">Library Inventory</span>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          {user.role === 'admin' && <NavLink to="/users">Users</NavLink>}
        </nav>
        <div className="navbar-user">
          <span>{user.name}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
