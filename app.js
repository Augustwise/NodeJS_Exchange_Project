import express    from 'express';
import path       from 'path';
import { fileURLToPath } from 'url';
import session    from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import sequelize  from './db.js';
import loadUser   from './middleware/loadUser.js';
import { csrfToken } from './middleware/csrf.js';
import pageRoutes from './routes/pageRoutes.js';
import authRoutes from './routes/authRoutes.js';

const pgSession = connectPgSimple(session);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new pgSession({
        conObject: {
            host:     process.env.DB_HOST,
            port:     Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME,
            user:     process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ...(sequelize.buildSslOptions() && { ssl: sequelize.buildSslOptions() })
        },
        createTableIfMissing: true
    }),
    secret:            process.env.SESSION_SECRET || 'dev-only-change-me',
    resave:            false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure:   process.env.NODE_ENV === 'production',
        maxAge:   7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

app.use(csrfToken);

app.use(loadUser);

app.use('/', pageRoutes);

app.use('/api/auth', authRoutes);

export default app;
