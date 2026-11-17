import { useState } from 'react';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

export default function UserForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial ? { ...initial, password: '' } : EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  function validate() {
    const e = {};
    if (!values.name.trim()) e.name = 'Enter the full name';
    if (!values.membership_id.trim()) e.membership_id = 'Enter a membership ID';
    if (!initial && values.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (initial && values.password && values.password.length < 6) e.password = 'Password must be at least 6 characters';
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
      await onSubmit(values);
      if (!initial) setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Update user' : 'Add a user'}</h2>
      <div className="field">
        <label htmlFor="u-name">Full name</label>
        <input id="u-name" name="name" value={values.name} onChange={handleChange} />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="u-mid">Membership ID</label>
        <input id="u-mid" name="membership_id" value={values.membership_id} onChange={handleChange} />
        {errors.membership_id && <span className="error-text">{errors.membership_id}</span>}
      </div>
      <div className="field">
        <label htmlFor="u-role">Role</label>
        <select id="u-role" name="role" value={values.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="u-pass">{initial ? 'New password (leave blank to keep the current one)' : 'Password'}</label>
        <input id="u-pass" name="password" type="password" value={values.password} onChange={handleChange} autoComplete="new-password" />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>
      {serverError && <p className="alert alert-error">{serverError}</p>}
      <div className="form-actions">
        <button className="btn" type="submit" disabled={saving}>{initial ? 'Save changes' : 'Add user'}</button>
        {onCancel && <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
