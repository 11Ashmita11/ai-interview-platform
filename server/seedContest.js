require('dotenv').config();
const pool = require('./config/db');

async function seed() {
  try {
    const now = new Date();

    // Contest 1: starts in 2 minutes (so you can test the countdown)
    const starts1 = new Date(now.getTime() + 2 * 60 * 1000);
    const ends1 = new Date(now.getTime() + 62 * 60 * 1000);

    // Contest 2: already active
    const starts2 = new Date(now.getTime() - 30 * 60 * 1000);
    const ends2 = new Date(now.getTime() + 30 * 60 * 1000);

    // Contest 3: ended
    const starts3 = new Date(now.getTime() - 120 * 60 * 1000);
    const ends3 = new Date(now.getTime() - 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO contests (title, description, starts_at, ends_at) VALUES ($1, $2, $3, $4)',
      ['DSA Sprint', 'Solve as many DSA problems as you can in 1 hour!', starts1, ends1]
    );

    await pool.query(
      'INSERT INTO contests (title, description, starts_at, ends_at) VALUES ($1, $2, $3, $4)',
      ['Full Stack Showdown', 'Test your knowledge of frontend, backend, and databases.', starts2, ends2]
    );

    await pool.query(
      'INSERT INTO contests (title, description, starts_at, ends_at) VALUES ($1, $2, $3, $4)',
      ['OS & DBMS Blitz', 'A quick-fire round on operating systems and databases.', starts3, ends3]
    );

    console.log('✅ Seeded 3 contests!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();