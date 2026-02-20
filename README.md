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

## Project Structure

```
NodeJS_Exchange_Project/
├── server.js
├── app.js
├── db.js
├── controllers/
│   ├── authController.js
│   └── pageController.js
├── middleware/
│   └── loadUser.js
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
        └── auth.css
```
