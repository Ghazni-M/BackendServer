// src/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// ───────────────────────────────────────────────────────────────
// IMAGE PATHS (Fixed - do NOT import images as modules in Node.js)
// ───────────────────────────────────────────────────────────────
const images = {
  main: '/images/Active-RitchieMain.jpg',
  r01: '/images/Active-Ritchie-01.jpg',
  r02: '/images/Active-Ritchie-02.jpg',
  r03: '/images/Active-Ritchie-03.jpg',
  r04: '/images/Active-Ritchie-04.jpg',
  rhmain:'/images/Ritchie-Har-Main.jpg',
  rh01: '/images/Ritchie-Har-01.jpg',
  rh02: '/images/Ritchie-Har-02.jpg',
  rh03: '/images/Ritchie-Har-03.jpg',
  rh04: '/images/Ritchie-Har-Main.jpg',
} as const;

// ───────────────────────────────────────────────────────────────
// PATH SETUP
// ───────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data.db');

// ───────────────────────────────────────────────────────────────
// DATABASE INITIALIZATION
// ───────────────────────────────────────────────────────────────
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Performance & Safety PRAGMAs
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// ───────────────────────────────────────────────────────────────
// SCHEMA
// ───────────────────────────────────────────────────────────────
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'agent', 'user')) DEFAULT 'agent',
  reset_token TEXT,
  reset_token_expiry INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  beds INTEGER NOT NULL DEFAULT 0,
  baths REAL NOT NULL DEFAULT 0,
  sqft INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  featured INTEGER DEFAULT 0,
  imageUrl TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  videoUrl TEXT,
  virtualTourUrl TEXT,
  description TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  acreage REAL DEFAULT 0,
  zoning TEXT,
  agent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  imageUrl TEXT,
  author_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'blog_post',
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE INDEX IF NOT EXISTS idx_properties_status   ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug          ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
`);

// ───────────────────────────────────────────────────────────────
// TRIGGERS
// ───────────────────────────────────────────────────────────────
db.exec(`
CREATE TRIGGER IF NOT EXISTS trg_properties_updated
AFTER UPDATE ON properties
FOR EACH ROW
BEGIN
  UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_posts_updated
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
  UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
`);

// ───────────────────────────────────────────────────────────────
// MIGRATION HELPER
// ───────────────────────────────────────────────────────────────
function addColumnIfNotExists(table: string, column: string, definition: string) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    if (!columns.some((c: any) => c.name === column)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
      console.log(`✅ Added column ${table}.${column}`);
    }
  } catch (err) {
    console.warn(`Migration skipped for ${table}.${column}:`, err);
  }
}

// Run migrations
addColumnIfNotExists('users', 'reset_token', 'TEXT');
addColumnIfNotExists('users', 'reset_token_expiry', 'INTEGER');

// ───────────────────────────────────────────────────────────────
// SEEDING (Idempotent)
// ───────────────────────────────────────────────────────────────
const tablesToSeed = ['users', 'properties', 'posts'] as const;

for (const table of tablesToSeed) {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };

  if (count.count > 0) continue;

  console.log(`🌱 Seeding ${table}...`);

  if (table === 'users') {
    const hash = (p: string) => bcrypt.hashSync(p, 12);

    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run('Administrator', 'admin@ritchierealty.com', hash('admin123'), 'owner');

    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run('Janet Stanley', 'janet@ritchierealty.com', hash('janet123'), 'agent');
  }

  if (table === 'properties') {
    db.prepare(`
      INSERT INTO properties (
        title, price, address, city, state, zip, beds, baths, sqft,
        type, status, featured, imageUrl, images, description, features,
        acreage, zoning, agent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Serene Riverside Villa',
      35000,
      '43 Carroll St',
      'Cairo',
      'WV',
      '26337',
      3,
      2,
      1370,
      'Residential',
      'Available',
      1,
      images.main,
      JSON.stringify([images.r01, images.r02, images.r03, images.r04]),
      'This charming 2-story home is located just moments from the scenic Hughes River...',
      JSON.stringify([
        'Nine Rooms',
        'Updated Kitchen',
        'Central A/C',
        'Natural Gas Fuel',
        'River View',
        'River Waterfront',
        'Municipal Water',
        'and More.'
      ]),
      0.5,
      'Residential',
      2
    );

     // Additional Property
  db.prepare(`
    INSERT INTO properties (
      title, price, address, city, state, zip, beds, baths, sqft,
      type, status, featured, imageUrl, images, description, features,
      acreage, zoning, agent_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Charming Brick Ranch with Spacious Yard',
    48900,
    '429 N Penn Ave',
    'Harrisville',
    'WV',
    '26362',
    2,
    1.5,
    1840,
    'Residential',
    'Available',
    1,
    images.rhmain,
    JSON.stringify([images.rh01, images.rh02, images.rh03, images.rh04]),
    'Welcome to this charming brick ranch home offering single-level living at its finest. Featuring a spacious yard, attached garage, and classic curb appeal, this well-maintained home.',
    JSON.stringify([
      '8 Spacious Bedrooms',
      'Family Room',
      'First Floor Primary Bedroom',
      'Dining',
      'Kitchen',
      'Natural Gas Fuel and Natural Gas Avail',
      'Central A/C',
      'Detached Garage and 2 Garage Spaces',
      'Frame Construction',
    ]),
    0.8,
    'Residential',
    2
  );

}

   if (table === 'posts') {
    const postContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Real Estate Investment Tips for Beginners in Pennsboro, WV</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background: #f9f9f9; color: #333; }
    .container { max-width: 900px; margin: auto; padding: 20px; background: #fff; }
    h1, h2, h3 { color: #0B1F3B; }
    h1 { border-bottom: 3px solid #F5B301; padding-bottom: 10px; }
    .tip { background: #e8f4ff; padding: 10px; border-left: 5px solid #0B1F3B; margin: 15px 0; }
    .warning { background: #ffeaea; padding: 10px; border-left: 5px solid #E74C3C; margin: 15px 0; }
    .highlight { background: #fff8e1; padding: 10px; border-left: 5px solid #F5B301; margin: 15px 0; }
  </style>
</head>
<body>
<div class="container">
  <h1>🏡 Real Estate Investment Tips for Beginners in Pennsboro, WV</h1>
  <p>Starting your journey in real estate can feel overwhelming—especially if you're new. But if you're looking for an affordable and beginner-friendly market, Pennsboro, WV is a great place to start.</p>

  <h2>📍 Why Pennsboro is a Good Place to Start</h2>
  <ul>
    <li>💰 Affordable property prices</li>
    <li>🏘️ Less competition</li>
    <li>🌳 Quiet, community-driven environment</li>
    <li>📈 Long-term growth potential</li>
  </ul>

  <div class="tip">👉 Tip: Lower property prices mean lower risk for beginners.</div>

  <h2>1. Understand the Local Market</h2>
  <p>Study recent sales, rental demand, and neighborhood trends. Pennsboro’s market is stable but slower-paced.</p>

  <h2>2. Start Small</h2>
  <p>Begin with single-family homes or small fixer-uppers.</p>

  <h2>3. Look for Undervalued Properties</h2>
  <ul>
    <li>Homes needing minor repairs</li>
    <li>Properties on the market for a long time</li>
    <li>Motivated sellers</li>
  </ul>

  <div class="highlight">💡 Example: A $5,000 repair could increase property value significantly.</div>

  <h2>4. Consider Rental Income</h2>
  <p>Focus on properties that generate consistent rental income.</p>

  <h2>5. Budget for Repairs</h2>
  <p>Always keep extra funds for maintenance and unexpected costs.</p>

  <div class="warning">⚠️ Never invest all your money into buying the property.</div>

  <h2>Final Thoughts</h2>
  <p>Real estate investing in Pennsboro, WV is perfect for beginners willing to start small and stay consistent.</p>

  <div class="tip">💡 Success comes from smart decisions, not fast decisions.<br> Here in Ritchie Realty, it's the best place you can invest in real estate without regret.</div>
</div>
</body>
</html>`;

    db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, imageUrl, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Real Estate Investment Tips for Beginners',
      'real-estate-investment-tips-beginners',
      'New to real estate investing? Learn essential tips...',
      postContent,
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
      1
    );
  }
}

console.log('✅ Database initialized successfully');

export default db;
