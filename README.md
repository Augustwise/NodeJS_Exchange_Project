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

## API documentation

Every route is documented in [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3.0.3).

To read it, paste the file into [editor.swagger.io](https://editor.swagger.io/), or
open it with the Swagger Viewer / OpenAPI extension in your editor.
