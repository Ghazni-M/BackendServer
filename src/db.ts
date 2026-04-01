// src/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data.db');

const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// ───────────────────────────────────────────────────────────────
// PRAGMAS (performance + safety)
// ───────────────────────────────────────────────────────────────

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
// TRIGGERS (safe update timestamps)
// ───────────────────────────────────────────────────────────────

db.exec(`
CREATE TRIGGER IF NOT EXISTS trg_properties_updated
AFTER UPDATE ON properties
FOR EACH ROW
BEGIN
  UPDATE properties
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_posts_updated
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
  UPDATE posts
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
`);

// ───────────────────────────────────────────────────────────────
// SAFE MIGRATION HELPER
// ───────────────────────────────────────────────────────────────

function addColumnIfNotExists(table: string, column: string, definition: string) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    const exists = columns.some(c => c.name === column);

    if (!exists) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    }
  } catch (err) {
    console.warn(`Migration skipped for ${table}.${column}`);
  }
}

// ───────────────────────────────────────────────────────────────
// MIGRATIONS
// ───────────────────────────────────────────────────────────────

addColumnIfNotExists('users', 'reset_token', 'TEXT');
addColumnIfNotExists('users', 'reset_token_expiry', 'INTEGER');

// ───────────────────────────────────────────────────────────────
// SEEDING (idempotent + safe)
// ───────────────────────────────────────────────────────────────

const tablesToSeed = ['users', 'properties', 'posts'] as const;

for (const table of tablesToSeed) {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as {
    count: number;
  };

  if (count.count > 0) continue;

  console.log(`🌱 Seeding ${table}...`);

  // USERS
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

  // PROPERTIES
  if (table === 'properties') {
    db.prepare(`
      INSERT INTO properties (
        title, price, address, city, state, zip,
        beds, baths, sqft, type, status, featured,
        imageUrl, images, description, features,
        acreage, zoning, agent_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Modern Family Estate',
      450000,
      '123 Highland Ave',
      'Pennsboro',
      'WV',
      '26415',
      4,
      3,
      2800,
      'Residential',
      'Available',
      1,
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      JSON.stringify([
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      ]),
      'A beautiful modern family estate with spacious rooms and a large backyard.',
      JSON.stringify([
        'Hardwood Flooring',
        'Updated Kitchen',
        'Central Heating & Cooling',
        'Spacious Backyard',
      ]),
      0.5,
      'Residential',
      2
    );
  }

  // POSTS
  if (table === 'posts') {
    db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, imageUrl, author_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Real Estate Investment Tips for Beginners',
      'real-estate-investment-tips-beginners',
      'New to real estate investing? Learn essential tips...',
      'Full article content here...',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
      1
    );
  }
}

console.log('✅ Database initialized successfully');

export default db;
