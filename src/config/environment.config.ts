import * as dotenv from 'dotenv';
dotenv.config();

export default {
    app: {
        port: Number(process.env.APP_PORT) || 8080,
        secreteKey: process.env.SECRETE_KEY
    },
    db: {
        type: process.env.DB_TYPE,
        url: process.env.DB_URI,
        host: process.env.DB_HOST,
        dbName: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    environment: process.env.NODE_ENV || 'local',
    email: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
        sendGridTemId: process.env.SENDGRID_TEM_ID,
    },
    auth: {
        authDomain: process.env.AUTH0_DOMAIN,
        authSecreteKey: process.env.AUTH0_SECRETE_KEY,
    }
};  