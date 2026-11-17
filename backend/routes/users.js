const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

const PUBLIC_FIELDS = 'id, name, membership_id, role, created_at'; // never send password_hash

function validate(body, { passwordRequired }) {
  const { name, membership_id, role, password } = body;
  if (!name?.trim() || !membership_id?.trim()) return 'Name and membership ID are required';
  if (!['admin', 'member'].includes(role)) return 'Role must be admin or member';
  if (passwordRequired && (!password || password.length < 6)) return 'Password must be at least 6 characters';
  if (!passwordRequired && password && password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY name`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  const error = validate(req.body, { passwordRequired: true });
  if (error) return res.status(400).json({ error });
  const { name, membership_id, role, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      [name.trim(), membership_id.trim(), role, hash]
    );
    const [rows] = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That membership ID is already taken' });
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  const error = validate(req.body, { passwordRequired: false });
  if (error) return res.status(400).json({ error });
  const { name, membership_id, role, password } = req.body;
  try {
    let result;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      [result] = await db.query(
        'UPDATE users SET name=?, membership_id=?, role=?, password_hash=? WHERE id=?',
        [name.trim(), membership_id.trim(), role, hash, req.params.id]
      );
    } else {
      [result] = await db.query(
        'UPDATE users SET name=?, membership_id=?, role=? WHERE id=?',
        [name.trim(), membership_id.trim(), role, req.params.id]
      );
    }
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
    const [rows] = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That membership ID is already taken' });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
