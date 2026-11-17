const express = require('express');
const db = require('../db');
const router = express.Router();

function validate(body) {
  const { title, author, genre, isbn, quantity } = body;
  if (![title, author, genre, isbn].every((v) => typeof v === 'string' && v.trim())) {
    return 'Title, author, genre and ISBN are required';
  }
  const q = Number(quantity);
  if (!Number.isInteger(q) || q < 0) return 'Quantity must be a whole number of 0 or more';
  return null;
}

// READ all
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (e) { next(e); }
});

// READ one
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// CREATE
router.post('/', async (req, res, next) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with that ISBN already exists' });
    next(e);
  }
});

// UPDATE
router.put('/:id', async (req, res, next) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with that ISBN already exists' });
    next(e);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
