const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Multer config for photo uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function parseTags(contact) {
  try {
    contact.tags = JSON.parse(contact.tags || '[]');
  } catch {
    contact.tags = [];
  }
  return contact;
}

// GET /api/contacts
router.get('/', (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = 'SELECT * FROM contacts';
    const params = {};

    if (search) {
      query += ` WHERE (name LIKE :term OR email LIKE :term OR company LIKE :term OR phone LIKE :term OR notes LIKE :term)`;
      params.term = `%${search}%`;
    }

    query += ' ORDER BY created_at DESC';

    let contacts = db.prepare(query).all(params);

    if (tag) {
      contacts = contacts.filter(c => {
        try {
          const tags = JSON.parse(c.tags || '[]');
          return tags.includes(tag);
        } catch { return false; }
      });
    }

    contacts = contacts.map(parseTags);
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST /api/contacts
router.post('/', (req, res) => {
  try {
    const { name, email, phone, company, notes, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const now = new Date().toISOString();
    const id = uuidv4();
    const tagsStr = JSON.stringify(Array.isArray(tags) ? tags : (tags ? [tags] : []));

    db.prepare(`
      INSERT INTO contacts (id, name, email, phone, company, notes, tags, photo, created_at, updated_at)
      VALUES (:id, :name, :email, :phone, :company, :notes, :tags, :photo, :created_at, :updated_at)
    `).run({ id, name, email: email || null, phone: phone || null, company: company || null, notes: notes || null, tags: tagsStr, photo: null, created_at: now, updated_at: now });

    const contact = parseTags(db.prepare('SELECT * FROM contacts WHERE id = :id').get({ id }));
    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /api/contacts/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM contacts WHERE id = :id').get({ id });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    const { name, email, phone, company, notes, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const now = new Date().toISOString();
    const tagsStr = JSON.stringify(Array.isArray(tags) ? tags : (tags ? [tags] : []));

    db.prepare(`
      UPDATE contacts SET name=:name, email=:email, phone=:phone, company=:company, notes=:notes, tags=:tags, updated_at=:updated_at WHERE id=:id
    `).run({ name, email: email || null, phone: phone || null, company: company || null, notes: notes || null, tags: tagsStr, updated_at: now, id });

    const contact = parseTags(db.prepare('SELECT * FROM contacts WHERE id = :id').get({ id }));
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM contacts WHERE id = :id').get({ id });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    if (existing.photo) {
      const photoPath = path.join(uploadsDir, existing.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    db.prepare('DELETE FROM contacts WHERE id = :id').run({ id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// POST /api/contacts/:id/photo
router.post('/:id/photo', upload.single('photo'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM contacts WHERE id = :id').get({ id });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    if (existing.photo) {
      const oldPath = path.join(uploadsDir, existing.photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE contacts SET photo=:photo, updated_at=:updated_at WHERE id=:id')
      .run({ photo: req.file.filename, updated_at: now, id });

    const contact = parseTags(db.prepare('SELECT * FROM contacts WHERE id = :id').get({ id }));
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

module.exports = router;
