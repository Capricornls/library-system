const express = require('express');
const db = require('../db');
const router = express.Router();

const SELECT_WITH_NAMES = `
  SELECT t.id, t.book_id, t.user_id, t.type, t.quantity, t.created_at,
         b.title AS book_title, u.name AS user_name
  FROM transactions t
  JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id`;

// Transaction history (newest first)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`${SELECT_WITH_NAMES} ORDER BY t.created_at DESC, t.id DESC`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// Record a transaction AND update stock in one atomic step
// body: { book_id, user_id (optional), type: 'ADD_STOCK' | 'BORROW', quantity }
router.post('/', async (req, res, next) => {
  const { book_id, user_id, type } = req.body;
  const quantity = Number(req.body.quantity);

  if (!book_id) return res.status(400).json({ error: 'Choose a book' });
  if (!['ADD_STOCK', 'BORROW'].includes(type)) return res.status(400).json({ error: 'Type must be ADD_STOCK or BORROW' });
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ error: 'Quantity must be a whole number of 1 or more' });
  if (type === 'BORROW' && !user_id) return res.status(400).json({ error: 'Choose who is borrowing the book' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [books] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (!books.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }

    const change = type === 'BORROW' ? -quantity : quantity;
    if (books[0].quantity + change < 0) {
      await conn.rollback();
      return res.status(400).json({ error: `Only ${books[0].quantity} cop${books[0].quantity === 1 ? 'y' : 'ies'} in stock` });
    }

    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id = ?', [change, book_id]);
    const [result] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?,?,?,?)',
      [book_id, user_id || null, type, quantity]
    );
    await conn.commit();

    const [rows] = await db.query(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

module.exports = router;
