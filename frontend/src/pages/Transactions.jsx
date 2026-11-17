import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY = { book_id: '', type: 'BORROW', user_id: '', quantity: 1 };

export default function Transactions() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const [b, t] = await Promise.all([api.get('/books'), api.get('/transactions')]);
      setBooks(b);
      setHistory(t);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => {
    load();
    api.get('/users').then(setUsers).catch(() => {});
  }, []);

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!values.book_id) return setError('Choose a book');
    if (!Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 1) return setError('Quantity must be 1 or more');
    if (values.type === 'BORROW' && !values.user_id) return setError('Choose who is borrowing the book');
    try {
      await api.post('/transactions', {
        ...values,
        quantity: Number(values.quantity),
        user_id: values.type === 'BORROW' ? values.user_id : user.id,
      });
      setMessage(values.type === 'BORROW' ? 'Borrowing recorded, stock reduced' : 'Stock added');
      setValues({ ...EMPTY, type: values.type });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Transactions</h1>
      <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
        <h2>Record a transaction</h2>
        <div className="field">
          <label htmlFor="t-type">Action</label>
          <select id="t-type" name="type" value={values.type} onChange={handleChange}>
            <option value="BORROW">Borrow (deduct stock)</option>
            <option value="ADD_STOCK">New arrival (add stock)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="t-book">Book</label>
          <select id="t-book" name="book_id" value={values.book_id} onChange={handleChange}>
            <option value="">Choose a book</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>)}
          </select>
        </div>
        {values.type === 'BORROW' && (
          <div className="field">
            <label htmlFor="t-user">Borrower</label>
            <select id="t-user" name="user_id" value={values.user_id} onChange={handleChange}>
              <option value="">Choose a member</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="t-qty">Quantity</label>
          <input id="t-qty" name="quantity" type="number" min="1" value={values.quantity} onChange={handleChange} />
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        {message && <p className="alert alert-ok" role="status">{message}</p>}
        <div className="form-actions">
          <button className="btn" type="submit">{values.type === 'BORROW' ? 'Record borrowing' : 'Add stock'}</button>
        </div>
      </form>

      <h2>History</h2>
      {!history.length ? (
        <p className="empty">No transactions yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Book</th><th>Action</th><th className="num">Qty</th><th>Member</th></tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id}>
                  <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
                  <td data-label="Book">{t.book_title}</td>
                  <td data-label="Action"><span className={`tag ${t.type === 'BORROW' ? 'tag-borrow' : 'tag-add'}`}>{t.type === 'BORROW' ? 'Borrowed' : 'Stock added'}</span></td>
                  <td data-label="Qty" className="num">{t.quantity}</td>
                  <td data-label="Member">{t.user_name || 'Deleted user'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
