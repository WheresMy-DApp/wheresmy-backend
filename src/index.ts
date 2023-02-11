import express, {Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';

import { router as userRoutes } from './routes/user'

dotenv.config();

const app = express();

app.use('/user', userRoutes);

app.get("/health", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: "OK",
    });
});

app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
});