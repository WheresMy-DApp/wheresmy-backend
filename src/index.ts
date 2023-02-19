import express, { Request, Response, NextFunction } from 'express';
const cors = require("cors");
import dotenv from 'dotenv';
import logger from './utils/logger';
import { NotFoundError, InvalidError, TokenExpiredError, UnauthorizedError } from './utils/errors';
import { establishConnection } from './utils/db';
import { router as userRoutes } from './routes/user';
import { router as deviceRoutes } from './routes/device';

import userAuth from './middlewares/user';

import { abi } from './utils/abis/WheresMyNFT';

import { swaggerUi, swaggerSpec } from './utils/swagger';
dotenv.config();

establishConnection();
const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "*",
        optionsSuccessStatus: 200,
    })
);

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.redirect('/docs');
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/user', userRoutes);
app.use('/device', deviceRoutes);
app.get('/abi', async (req: Request, res: Response, next: NextFunction) => {
    res.send(abi());
})

app.get("/health", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "OK",
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode: number = 500;
    switch (err.constructor) {
        case NotFoundError:
            statusCode = 404;
            break;
        case TokenExpiredError:
            statusCode = 498;
            break;
        case UnauthorizedError:
            statusCode = 401;
            break;
        case InvalidError:
            statusCode = 400;
            break;
        default:
            statusCode = 500;
            logger.error(err);
            break;
    }

    res.status(statusCode).json({
        error: err.message,
    });
});

app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
});