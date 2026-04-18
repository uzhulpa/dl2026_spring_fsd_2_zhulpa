import express from 'express';
import sequelize from './config/database.js';
import cors from 'cors';
import 'dotenv/config';

import ApiRouter from './routes/ApiRouter.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api', ApiRouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
});

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB ok');

        await sequelize.sync({alter: true});

        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    }

    catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();