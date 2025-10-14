const pool = require('../config/db');
const { uploadBuffer, deleteByPublicId, isConfigured } = require('../utils/cloudinary');

function toInt(v, def = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  if (typeof v === 'number') return v !== 0;
  return undefined;
}

async function listPublic(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, image_url, created_at, updated_at
       FROM services WHERE published = true
       ORDER BY order_index ASC, created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
}

async function listAdmin(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM services ORDER BY order_index ASC, created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
}

async function createService(req, res) {
  const { title, description } = req.body || {};
  const published = toBool(req.body?.published) !== false;
  const order_index = toInt(req.body?.order_index, 0);
  if (!title) return res.status(400).json({ error: 'title required' });

  let image_url = null;
  let image_public_id = null;
  try {
    if (req.file && req.file.buffer) {
      if (!isConfigured()) return res.status(500).json({ error: 'Cloudinary not configured' });
      const up = await uploadBuffer(req.file.buffer, { folder: 'filmpro/services', resource_type: 'image' });
      image_url = up.secure_url;
      image_public_id = up.public_id;
    }

    const { rows } = await pool.query(
      `INSERT INTO services (title, description, image_url, image_public_id, published, order_index)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, description || null, image_url, image_public_id, published, order_index]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create service' });
  }
}

async function updateService(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const { title, description } = req.body || {};
  const published = typeof req.body?.published !== 'undefined' ? toBool(req.body.published) : undefined;
  const order_index = typeof req.body?.order_index !== 'undefined' ? toInt(req.body.order_index) : undefined;

  try {
    const { rows: existRows } = await pool.query(`SELECT image_public_id FROM services WHERE id=$1`, [id]);
    if (!existRows.length) return res.status(404).json({ error: 'Not found' });
    const current = existRows[0];

    let image_url;
    let image_public_id;
    if (req.file && req.file.buffer) {
      if (!isConfigured()) return res.status(500).json({ error: 'Cloudinary not configured' });
      if (current.image_public_id) await deleteByPublicId(current.image_public_id);
      const up = await uploadBuffer(req.file.buffer, { folder: 'filmpro/services', resource_type: 'image' });
      image_url = up.secure_url;
      image_public_id = up.public_id;
    }

    const sets = [];
    const params = [];
    function pushSet(col, val) { sets.push(`${col} = $${params.length + 1}`); params.push(val); }

    if (typeof title !== 'undefined') pushSet('title', title || null);
    if (typeof description !== 'undefined') pushSet('description', description || null);
    if (typeof published !== 'undefined') pushSet('published', published);
    if (typeof order_index !== 'undefined') pushSet('order_index', order_index);
    if (typeof image_url !== 'undefined') pushSet('image_url', image_url);
    if (typeof image_public_id !== 'undefined') pushSet('image_public_id', image_public_id);

    if (!sets.length) return res.status(400).json({ error: 'no changes provided' });
    sets.push('updated_at = now()');
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE services SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update service' });
  }
}

async function deleteService(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  try {
    const { rows } = await pool.query(`DELETE FROM services WHERE id=$1 RETURNING image_public_id`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const pub = rows[0].image_public_id;
    if (pub) await deleteByPublicId(pub);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
}

module.exports = { listPublic, listAdmin, createService, updateService, deleteService };
