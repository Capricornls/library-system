# Library Inventory System (BIWA2110)

React frontend + Express backend + MySQL.

## Setup

### 1. Backend
```
cd backend
npm install
cp .env.example .env     # then put your MySQL password in .env
npm start
```
The API runs on http://localhost:5000. On first start it creates the `library_db`
database, the tables, and a default admin:

- Membership ID: `ADMIN001`
- Password: `admin123`

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
Open the address Vite prints (usually http://localhost:5173).

## API

| Resource | Routes |
| --- | --- |
| Books | GET /books, GET /books/:id, POST /books, PUT /books/:id, DELETE /books/:id |
| Users | GET /users, GET /users/:id, POST /users, PUT /users/:id, DELETE /users/:id |
| Transactions | GET /transactions, GET /transactions/:id, POST /transactions |
| Auth | POST /auth/login |

Posting a transaction (`BORROW` or `ADD_STOCK`) updates the book's stock in the same
database transaction, and a borrow is refused if there are not enough copies.

## Pages
- Dashboard: availability cards, low stock (fewer than 2 copies) highlighted
- Books: add form, editable list with Update and Delete
- Transactions: add stock / borrow form and history log
- Users (admin only): add, update, delete users
- Login
