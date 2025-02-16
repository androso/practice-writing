import express from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Middleware
app.use(express.json());

// In development, proxy requests to Vite dev server
if (isDevelopment) {
  console.log('Running in development mode');
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:5173${req.url}`);
  });
} else {
  // In production, serve static files from dist
  app.use(express.static(path.join(__dirname, '../dist')));
}

// API Routes
app.get('/api/chapters', async (req, res) => {
  try {
    const chapters = {
      "farm": {
        "title": "Farm Animals",
        "thumbnail": "/static/images/farm.svg",
        "words": [
          {
            "english": "cow",
            "spanish": "vaca",
            "image": "/static/images/cow.svg"
          },
          {
            "english": "pig",
            "spanish": "cerdo",
            "image": "/static/images/pig.svg"
          }
        ]
      }
    };
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// In production, serve React app for all other routes
if (!isDevelopment) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} in ${isDevelopment ? 'development' : 'production'} mode`);
});

export default app;