import express from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.get('/api/chapters', async (req, res) => {
  try {
    // For now, return static data until we set up the database schema
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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;
