import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { LOW_STOCK } from '../components/BookList.jsx';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/books')
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const lowStock = books.filter((b) => b.quantity < LOW_STOCK);
  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);

  if (loading) return <p className="muted">Loading books...</p>;
  if (error) return <p className="alert alert-error">{error}</p>;

  return (
    <>
      <h1>Availability</h1>
      <p className="summary">
        {books.length} titles, {totalCopies} copies on the shelf.{' '}
        {lowStock.length
          ? <strong className="warn">{lowStock.length} {lowStock.length === 1 ? 'title is' : 'titles are'} running low.</strong>
          : 'Every title is well stocked.'}
      </p>

      {!books.length ? (
        <p className="empty">No books in the library yet. Add some on the Books page.</p>
      ) : (
        <div className="card-grid">
          {books.map((b) => {
            const low = b.quantity < LOW_STOCK;
            return (
              <article key={b.id} className={`book-card ${low ? 'low' : ''}`}>
                <h3>{b.title}</h3>
                <p className="muted">{b.author}</p>
                <p className="genre">{b.genre}</p>
                <div className="stock">
                  <span className="stock-number">{b.quantity}</span>
                  <span>{low ? (b.quantity === 0 ? 'out of stock' : 'copy left, low stock') : 'in stock'}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
