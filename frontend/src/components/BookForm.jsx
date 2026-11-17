import { useState } from 'react';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

// Used for both adding a book and editing one (pass `initial` to edit).
export default function BookForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial ? { ...initial } : EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (!values.title.trim()) e.title = 'Enter the book title';
    if (!values.author.trim()) e.author = 'Enter the author';
    if (!values.genre.trim()) e.genre = 'Enter the genre';
    if (!values.isbn.trim()) e.isbn = 'Enter the ISBN';
    else if (!/^[0-9Xx-]{10,17}$/.test(values.isbn.trim())) e.isbn = 'ISBN should be 10 to 13 digits (dashes allowed)';
    const q = Number(values.quantity);
    if (values.quantity === '' || !Number.isInteger(q) || q < 0) e.quantity = 'Enter a whole number, 0 or more';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({ ...values, quantity: Number(values.quantity) });
      if (!initial) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const field = (name, label, type = 'text') => (
    <div className="field">
      <label htmlFor={`book-${name}`}>{label}</label>
      <input id={`book-${name}`} name={name} type={type} value={values[name]} onChange={handleChange}
             min={type === 'number' ? 0 : undefined} aria-invalid={!!errors[name]} />
      {errors[name] && <span className="error-text">{errors[name]}</span>}
    </div>
  );

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Update book' : 'Add a book'}</h2>
      {field('title', 'Title')}
      {field('author', 'Author')}
      {field('genre', 'Genre')}
      {field('isbn', 'ISBN')}
      {field('quantity', initial ? 'Quantity in stock' : 'Initial quantity', 'number')}
      {serverError && <p className="alert alert-error">{serverError}</p>}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={saving}>{initial ? 'Save changes' : 'Add book'}</button>
        {onCancel && <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
