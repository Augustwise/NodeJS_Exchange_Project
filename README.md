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

- `GET /admin` — admin dashboard (currently only Users button)
- `GET /admin/users` — users list with role controls
- `POST /admin/users/:userId/grant-admin` — grant Admin role
- `POST /admin/users/:userId/revoke-admin` — revoke Admin role

## Project Structure

```
NodeJS_Exchange_Project/
├── server.js
├── app.js
├── db.js
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   └── pageController.js
├── middleware/
│   ├── loadUser.js
│   └── requireAdmin.js
├── models/
│   └── userModel.js
├── routes/
│   ├── authRoutes.js
│   └── pageRoutes.js
├── utils/
│   ├── currencyService.js
│   └── dateUtils.js
├── views/
│   ├── partials/
│   │   └── header.ejs
│   ├── index.ejs
│   ├── about.ejs
│   ├── contact.ejs
│   ├── account.ejs
│   ├── admin.ejs
│   ├── admin-users.ejs
│   ├── crypt.ejs
│   ├── login.ejs
│   └── register.ejs
└── public/
    ├── images/
    │   ├── Flag_China.svg
    │   ├── Flag_UK.webp
    │   ├── Flag_of_Europe.webp
    │   ├── burger_menu.svg
    │   └── close.svg
    ├── js/
    │   ├── index.js
    │   ├── converter.js
    │   ├── crypt.js
    │   ├── login.js
    │   ├── register.js
    │   └── menu.js
    └── styles/
        ├── base.css
        ├── style.css
        ├── home.css
        ├── about.css
        ├── contact.css
        ├── account.css
        ├── crypto.css
        ├── admin.css
        └── auth.css
```
