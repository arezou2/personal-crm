const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'crm.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Create contacts table
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    notes TEXT,
    tags TEXT DEFAULT '[]',
    photo TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

// Seed sample contacts if empty
const count = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
if (count.count === 0) {
  const now = new Date().toISOString();
  const samples = [
    {
      id: uuidv4(),
      name: 'Alex Chen',
      email: 'alex.chen@techcorp.io',
      phone: '+1 (415) 555-0142',
      company: 'TechCorp',
      notes: 'Met at SF Tech Summit 2024. Interested in collaboration on AI projects.',
      tags: JSON.stringify(['tech', 'investor', 'sf']),
      photo: null,
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      name: 'Sarah Mitchell',
      email: 'sarah@designstudio.co',
      phone: '+1 (310) 555-0198',
      company: 'Design Studio',
      notes: 'Talented product designer. Works with early-stage startups.',
      tags: JSON.stringify(['design', 'freelance']),
      photo: null,
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      name: 'Marcus Johnson',
      email: 'marcus.j@venturefund.vc',
      phone: '+1 (646) 555-0173',
      company: 'Venture Fund Capital',
      notes: 'Partner at VFC. Focus on seed-stage B2B SaaS. Follow up in Q2.',
      tags: JSON.stringify(['vc', 'investor', 'nyc']),
      photo: null,
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      name: 'Priya Patel',
      email: 'priya@buildfast.dev',
      phone: '+1 (512) 555-0261',
      company: 'BuildFast',
      notes: 'CTO, ex-Google. Building dev tools. Strong technical background.',
      tags: JSON.stringify(['engineering', 'cto', 'austin']),
      photo: null,
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      name: 'Jordan Williams',
      email: 'jordan@growthlab.co',
      phone: '+1 (323) 555-0187',
      company: 'Growth Lab',
      notes: 'Growth hacker extraordinaire. Great at viral loops and referral programs.',
      tags: JSON.stringify(['marketing', 'growth']),
      photo: null,
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      name: 'Emma Rodriguez',
      email: 'emma.r@legaltech.law',
      phone: '+1 (305) 555-0134',
      company: 'LegalTech Partners',
      notes: 'Startup attorney. Helped with incorporation. Very responsive.',
      tags: JSON.stringify(['legal', 'advisor']),
      photo: null,
      created_at: now,
      updated_at: now
    }
  ];

  const insert = db.prepare(`
    INSERT INTO contacts (id, name, email, phone, company, notes, tags, photo, created_at, updated_at)
    VALUES (:id, :name, :email, :phone, :company, :notes, :tags, :photo, :created_at, :updated_at)
  `);

  for (const contact of samples) {
    insert.run(contact);
  }
  console.log('✅ Seeded 6 sample contacts');
}

module.exports = db;
