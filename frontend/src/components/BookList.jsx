export const LOW_STOCK = 2;

export default function BookList({ books, onEdit, onDelete }) {
  if (!books.length) return <p className="empty">No books yet. Add your first book above.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th className="num">In stock</th><th></th></tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className={b.quantity < LOW_STOCK ? 'low' : ''}>
              <td data-label="Title">{b.title}</td>
              <td data-label="Author">{b.author}</td>
              <td data-label="Genre">{b.genre}</td>
              <td data-label="ISBN">{b.isbn}</td>
              <td data-label="In stock" className="num">{b.quantity}</td>
              <td className="row-actions">
                <button className="btn btn-small" onClick={() => onEdit(b)}>Update</button>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(b)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
