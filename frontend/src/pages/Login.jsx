import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!membershipId.trim() || !password) {
      setError('Enter your membership ID and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(membershipId, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="panel login-card" onSubmit={handleSubmit} noValidate>
        <h1>Log in</h1>
        <p className="muted">Use your library membership ID.</p>
        <div className="field">
          <label htmlFor="l-id">Membership ID</label>
          <input id="l-id" value={membershipId} onChange={(e) => setMembershipId(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="l-pw">Password</label>
          <input id="l-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
    </div>
  );
}
