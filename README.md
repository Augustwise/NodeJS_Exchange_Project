# NodeJS Exchange Project

A server-side web application for displaying exchange rates and managing a user-submitted cryptocurrency catalog. Built with Node.js, Express, EJS, and PostgreSQL.

## Stack

- **Node.js / Express** — web server
- **EJS** — server-side templating
- **Sequelize** — ORM
- **PostgreSQL** — database
- **express-session / bcryptjs** — auth

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

3. Start the server:

```bash
npm start
```

Tables are created automatically on first run. The `User` and `Admin` roles are seeded on startup.

The app runs at `http://localhost:3001` by default.

## Environment variables

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_SSL` | Enable SSL (`true` / `false`) |
| `SESSION_SECRET` | Secret for signing session cookies |
| `SERVER_PORT` | Port the server listens on (default: 3001) |
| `CLIENT_ORIGIN` | Allowed client origin |
| `NODE_ENV` | Environment (`development` / `production`) |

## Routes

### Pages

| Method | Path | Description |
|---|---|---|
| GET | `/` | Home — exchange rates |
| GET | `/login` | Login page |
| GET | `/register` | Registration page |
| GET | `/account` | User account page |
| GET | `/crypt` | Cryptocurrency listing |
| GET | `/create` | Submit a new cryptocurrency |
| POST | `/create` | Save new cryptocurrency |
| GET | `/crypto/:id/edit` | Edit own cryptocurrency |
| POST | `/crypto/:id/edit` | Update own cryptocurrency |
| POST | `/crypto/:id/delete` | Delete own cryptocurrency |
| POST | `/logout` | Log out and redirect to `/login` |

### Auth API

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out (JSON response) |

### Admin (requires Admin role)

| Method | Path | Description |
|---|---|---|
| GET | `/admin` | Admin dashboard |
| GET | `/admin/users` | User list with role controls |
| GET | `/admin/cryptos` | Pending cryptocurrencies |
| POST | `/admin/users/:userId/grant-admin` | Grant Admin role |
| POST | `/admin/users/:userId/revoke-admin` | Revoke Admin role |
| POST | `/admin/cryptos/:cryptoId/approve` | Approve cryptocurrency |
| POST | `/admin/cryptos/:cryptoId/reject` | Reject cryptocurrency |
