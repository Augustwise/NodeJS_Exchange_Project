# NodeJS Exchange Project

## How to run

1. Install dependencies:

```bash
npm i
```

## Configuration

Create a `.env` file in the project root before starting the server.

Example:

```env
PORT=3000
AUTH_SECRET=your-session-secret
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

Notes:

- The app uses MySQL through Sequelize, so the database must exist and be reachable with the credentials above.
- `PORT` is optional. If it is not set, the server starts on `3000`.
- `AUTH_SECRET` is used to sign session cookies. If it is not set, the app falls back to a development-only default value.
- Exchange rates and historical data are fetched from the National Bank of Ukraine API during startup and refreshed while the server is running.

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
- `GET /crypto/:id/edit` — form for editing a cryptocurrency created by the current user
- `POST /crypto/:id/edit` — update a cryptocurrency created by the current user
- `POST /crypto/:id/delete` — delete a cryptocurrency created by the current user
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
