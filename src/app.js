import express from 'express';
import cors from 'cors';
import config from '#config/index.js';
import authRoutes from '#routes/auth.routes.js';
import userRoutes from '#routes/user.routes.js';
import profileRoutes from '#routes/profile.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.static(path.join(process.cwd(), 'frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend/dist/index.html'));
});

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});