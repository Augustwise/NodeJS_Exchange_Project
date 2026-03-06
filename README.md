# NodeJS Exchange Project

## How to run

1. Install dependencies:

```bash
npm i
```

2. Start the server:

```bash
npm start
```

3. Open in browser:

```text
http://localhost:3000
```

## API Endpoints

### Page routes

- `GET /` — home page with exchange rates and historical data
- `GET /login` — login page
- `GET /register` — registration page
- `GET /account` — logged-in user account page
- `GET /crypt` — cryptocurrency listing page
- `GET /create` — form for submitting a new cryptocurrency
- `POST /create` — submit a new cryptocurrency for approval
- `GET /about` — about page
- `GET /contact` — contact page
- `POST /logout` — log out the current user and redirect to `/login`

### Authentication API

- `POST /api/auth/register` — register a new user account
- `POST /api/auth/login` — log in a user and create a session
- `POST /api/auth/logout` — log out the current user and return JSON

Successful responses:

`POST /api/auth/register` returns `201 Created`:

```json
{
  "ok": true,
  "message": "Registration completed successfully."
}
```

`POST /api/auth/login` returns `200 OK`:

```json
{
  "ok": true,
  "message": "Welcome back, <name>!",
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com"
  }
}
```

`POST /api/auth/logout` returns `200 OK`:

```json
{
  "ok": true,
  "message": "Logged out successfully."
}
```

### Admin routes

- `GET /admin` — admin dashboard with management sections
- `GET /admin/users` — users list with role controls
- `GET /admin/cryptos` — pending user currencies for moderation
- `POST /admin/users/:userId/grant-admin` — grant Admin role
- `POST /admin/users/:userId/revoke-admin` — revoke Admin role
- `POST /admin/cryptos/:cryptoId/approve` — approve user currency
- `POST /admin/cryptos/:cryptoId/reject` — reject and remove pending user currency
