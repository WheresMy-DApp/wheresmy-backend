import express from 'express';
import dotenv from 'dotenv';

import { router as echoRoutes } from './routes/echo'

dotenv.config();

const app = express();

app.use('/echo', echoRoutes);

app.get('/', (req, res) => {
	res.send('Hello World!');
});
app.listen(process.env.PORT, () => {
	console.log('Server is running on port ' + process.env.PORT);
});