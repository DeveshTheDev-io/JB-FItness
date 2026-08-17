import express from 'express';
import { apiRouter } from '../server/api';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get(['/api/health', '/health', '/api'], (req, res) => {
  res.json({ status: 'ok', server: 'JB Fitness API', time: new Date().toISOString() });
});

app.use(apiRouter);

export default app;
