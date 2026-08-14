import express from 'express';
import { apiRouter } from '../server/api';

const app = express();
app.use(apiRouter);

export default app;
