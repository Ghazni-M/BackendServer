// src/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import sanitizeHtml from 'sanitize-html';

// ───────────────────────────────────────────────────────────────
// PATH SETUP
// ───────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data.db');

// ───────────────────────────────────────────────────────────────
// IMAGE PATHS
// ───────────────────────────────────────────────────────────────
const images = {
  main: '/images/Active-RitchieMain.jpg',
  r01: '/images/Active-Ritchie-01.jpg',
  r02: '/images/Active-Ritchie-02.jpg',
  r03: '/images/Active-Ritchie-03.jpg',
  r04: '/images/Active-Ritchie-04.jpg',

  rhmain: '/images/Ritchie-Har-Main.jpg',
  rh01: '/images/Ritchie-Har-01.jpg',
  rh02: '/images/Ritchie-Har-02.jpg',
  rh03: '/images/Ritchie-Har-03.jpg',
  rh04: '/images/Ritchie-Har-Main.jpg',
} as const;

// ───────────────────────────────────────────────────────────────
// DATABASE INITIALIZATION
// ───────────────────────────────────────────────────────────────
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development'
    ? console.log
    : undefined,
});

// ───────────────────────────────────────────────────────────────
// PERFORMANCE + SAFETY
// ───────────────────────────────────────────────────────────────
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// ───────────────────────────────────────────────────────────────
// SANITIZER HELPER
// ───────────────────────────────────────────────────────────────
export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'h1',
      'h2',
      'h3',
      'span',
      'div',
      'br',
    ],

    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['style', 'class'],
    },

    allowedSchemes: ['http', 'https', 'mailto'],

    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  });
}

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

  FOREIGN KEY (agent_id)
    REFERENCES users(id)
    ON DELETE SET NULL
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

  FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
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

  FOREIGN KEY (author_id)
    REFERENCES users(id)
    ON DELETE SET NULL
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

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (property_id)
    REFERENCES properties(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_properties_status
ON properties(status);

CREATE INDEX IF NOT EXISTS idx_properties_featured
ON properties(featured);

CREATE INDEX IF NOT EXISTS idx_properties_agent_id
ON properties(agent_id);

CREATE INDEX IF NOT EXISTS idx_posts_slug
ON posts(slug);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
ON inquiries(created_at);
`);

// ───────────────────────────────────────────────────────────────
// TRIGGERS
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
// MIGRATION HELPER
// ───────────────────────────────────────────────────────────────
function addColumnIfNotExists(
  table: string,
  column: string,
  definition: string
) {
  try {
    const columns = db
      .prepare(`PRAGMA table_info(${table})`)
      .all() as any[];

    const exists = columns.some((c) => c.name === column);

    if (!exists) {
      db.prepare(`
        ALTER TABLE ${table}
        ADD COLUMN ${column} ${definition}
      `).run();

      console.log(`✅ Added column ${table}.${column}`);
    }
  } catch (err) {
    console.warn(`Migration skipped for ${table}.${column}`, err);
  }
}

// ───────────────────────────────────────────────────────────────
// RUN MIGRATIONS
// ───────────────────────────────────────────────────────────────
addColumnIfNotExists('users', 'reset_token', 'TEXT');
addColumnIfNotExists('users', 'reset_token_expiry', 'INTEGER');

// ───────────────────────────────────────────────────────────────
// SEEDING
// ───────────────────────────────────────────────────────────────
const tablesToSeed = ['users', 'properties', 'posts'] as const;

for (const table of tablesToSeed) {
  const count = db.prepare(`
    SELECT COUNT(*) as count FROM ${table}
  `).get() as { count: number };

  if (count.count > 0) continue;

  console.log(`🌱 Seeding ${table}...`);

  // ───────────────── USERS ─────────────────
  if (table === 'users') {
    const hash = (password: string) =>
      bcrypt.hashSync(password, 12);

    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(
      'Administrator',
      'admin@ritchierealty.com',
      hash('Admin@Ritchie2026'),
      'owner'
    );

    db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(
      'Janet Stanley',
      'janet@ritchierealty.com',
      hash('Janet@Ritchie2026'),
      'agent'
    );
  }

  // ───────────────── PROPERTIES ─────────────────
  if (table === 'properties') {
    db.prepare(`
      INSERT INTO properties (
        title,
        price,
        address,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        type,
        status,
        featured,
        imageUrl,
        images,
        description,
        features,
        acreage,
        zoning,
        agent_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      JSON.stringify([
        images.r01,
        images.r02,
        images.r03,
        images.r04,
      ]),
      'Beautiful riverside villa with scenic views and modern amenities.',
      JSON.stringify([
        'Nine Rooms',
        'Updated Kitchen',
        'Central A/C',
        'River View',
      ]),
      0.5,
      'Residential',
      2
    );

    db.prepare(`
      INSERT INTO properties (
        title,
        price,
        address,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        type,
        status,
        featured,
        imageUrl,
        images,
        description,
        features,
        acreage,
        zoning,
        agent_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      JSON.stringify([
        images.rh01,
        images.rh02,
        images.rh03,
        images.rh04,
      ]),
      'Classic brick ranch home with large yard and garage.',
      JSON.stringify([
        'Family Room',
        'Central A/C',
        'Detached Garage',
      ]),
      0.8,
      'Residential',
      2
    );
  }

  // ───────────────── POSTS ─────────────────
  if (table === 'posts') {
    const rawPostContent = `
      <h1>🏡 Real Estate Investment Tips for Beginners</h1>

      <p>
        Starting your real estate journey can feel overwhelming,
        but Pennsboro, WV is a beginner-friendly market.
      </p>

      <h2>Why Pennsboro?</h2>

      <ul>
        <li>Affordable property prices</li>
        <li>Lower competition</li>
        <li>Long-term growth potential</li>
      </ul>

      <p>
        Success in real estate comes from consistency and smart decisions.
      </p>
    `;

    const cleanContent = sanitizeContent(rawPostContent);

    db.prepare(`
      INSERT INTO posts (
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        author_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Real Estate Investment Tips for Beginners',
      'real-estate-investment-tips-beginners',
      'New to real estate investing? Learn essential beginner tips.',
      cleanContent,
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
      1
    );
  }
}

console.log('✅ Database initialized successfully');

export default db;
