const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// POST /auth/login  { membership_id, password }
router.post('/login', async (req, res, next) => {
  const { membership_id, password } = req.body;
  if (!membership_id || !password) {
    return res.status(400).json({ error: 'Enter your membership ID and password' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE membership_id = ?', [membership_id.trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Wrong membership ID or password' });
    }
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) { next(e); }
});

module.exports = router;
