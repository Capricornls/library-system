const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => res.json({ message: 'Library API is running' }));

// Fallback + error handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
db.init()
  .then(() => app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not start. Is MySQL running and are the .env details correct?\n', err.message);
    process.exit(1);
  });
