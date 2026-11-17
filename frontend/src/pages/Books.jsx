import { useEffect, useState } from 'react';
import { api } from '../api.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/books').then(setBooks).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function addBook(values) {
    await api.post('/books', values);
    setMessage('Book added');
    load();
  }

  async function updateBook(values) {
    await api.put(`/books/${editing.id}`, values);
    setEditing(null);
    setMessage('Book updated');
    load();
  }

  async function deleteBook(book) {
    if (!window.confirm(`Delete "${book.title}"? Its transaction history will be deleted too.`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      setMessage('Book deleted');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>Books</h1>
      {message && <p className="alert alert-ok" role="status">{message}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {editing
        ? <BookForm key={editing.id} initial={editing} onSubmit={updateBook} onCancel={() => setEditing(null)} />
        : <BookForm onSubmit={addBook} />}

      <BookList books={books} onEdit={(b) => { setEditing(b); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={deleteBook} />
    </>
  );
}
