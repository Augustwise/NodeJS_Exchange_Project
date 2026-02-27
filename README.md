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

## Admin pages

- `GET /admin` — admin dashboard with management sections
- `GET /admin/users` — users list with role controls
- `GET /admin/cryptos` — pending user currencies for moderation
- `POST /admin/users/:userId/grant-admin` — grant Admin role
- `POST /admin/users/:userId/revoke-admin` — revoke Admin role
- `POST /admin/cryptos/:cryptoId/approve` — approve user currency
- `POST /admin/cryptos/:cryptoId/reject` — reject and remove pending user currency

