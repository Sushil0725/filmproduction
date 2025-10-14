const pool = require('../config/db');
const { uploadBuffer, deleteByPublicId, isConfigured } = require('../utils/cloudinary');

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  if (typeof v === 'number') return v !== 0;
  return undefined;
}

async function listPublic(req, res) {
  const { featured, category, limit = 50, offset = 0 } = req.query || {};
  const clauses = ['published = true'];
  const params = [];
  if (typeof featured !== 'undefined') {
    clauses.push('featured = $' + (params.length + 1));
    params.push(toBool(featured) === true);
  }
  if (category) {
    clauses.push('LOWER(category) = LOWER($' + (params.length + 1) + ')');
    params.push(String(category));
  }
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const o = Math.max(0, parseInt(offset, 10) || 0);
  params.push(l, o);
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  try {
    const { rows } = await pool.query(
      `SELECT id, title, subtitle, image_url, video_url, description, category, featured, created_at, updated_at
       FROM projects ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function getPublicById(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  try {
    const { rows } = await pool.query(
      `SELECT id, title, subtitle, image_url, video_url, description, category, featured, created_at, updated_at
       FROM projects WHERE id = $1 AND published = true`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

async function listAdmin(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM projects ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function createProject(req, res) {
  const { title, subtitle, video_url, description, category } = req.body || {};
  const featured = toBool(req.body?.featured) === true;
  const published = toBool(req.body?.published) !== false; // default true
  if (!title) return res.status(400).json({ error: 'title required' });

  let image_url = null;
  let image_public_id = null;
  try {
    if (req.file && req.file.buffer) {
      if (!isConfigured()) return res.status(500).json({ error: 'Cloudinary not configured' });
      const up = await uploadBuffer(req.file.buffer, { folder: 'filmpro/projects', resource_type: 'image' });
      image_url = up.secure_url;
      image_public_id = up.public_id;
    }

    const { rows } = await pool.query(
      `INSERT INTO projects (title, subtitle, image_url, image_public_id, video_url, description, category, featured, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [title, subtitle || null, image_url, image_public_id, video_url || null, description || null, category || null, featured, published]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create project' });
  }
}

async function updateProject(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const { title, subtitle, video_url, description, category } = req.body || {};
  const featured = typeof req.body?.featured !== 'undefined' ? toBool(req.body.featured) : undefined;
  const published = typeof req.body?.published !== 'undefined' ? toBool(req.body.published) : undefined;

  try {
    const { rows: existRows } = await pool.query(`SELECT image_public_id FROM projects WHERE id=$1`, [id]);
    if (!existRows.length) return res.status(404).json({ error: 'Not found' });
    const current = existRows[0];

    let image_url;
    let image_public_id;
    if (req.file && req.file.buffer) {
      if (!isConfigured()) return res.status(500).json({ error: 'Cloudinary not configured' });
      if (current.image_public_id) await deleteByPublicId(current.image_public_id);
      const up = await uploadBuffer(req.file.buffer, { folder: 'filmpro/projects', resource_type: 'image' });
      image_url = up.secure_url;
      image_public_id = up.public_id;
    }

    const sets = [];
    const params = [];
    function pushSet(col, val) { sets.push(`${col} = $${params.length + 1}`); params.push(val); }

    if (typeof title !== 'undefined') pushSet('title', title || null);
    if (typeof subtitle !== 'undefined') pushSet('subtitle', subtitle || null);
    if (typeof video_url !== 'undefined') pushSet('video_url', video_url || null);
    if (typeof description !== 'undefined') pushSet('description', description || null);
    if (typeof category !== 'undefined') pushSet('category', category || null);
    if (typeof featured !== 'undefined') pushSet('featured', featured);
    if (typeof published !== 'undefined') pushSet('published', published);
    if (typeof image_url !== 'undefined') pushSet('image_url', image_url);
    if (typeof image_public_id !== 'undefined') pushSet('image_public_id', image_public_id);

    if (!sets.length) return res.status(400).json({ error: 'no changes provided' });
    sets.push('updated_at = now()');
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE projects SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update project' });
  }
}

async function deleteProject(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  try {
    const { rows } = await pool.query(`DELETE FROM projects WHERE id=$1 RETURNING image_public_id`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const pub = rows[0].image_public_id;
    if (pub) await deleteByPublicId(pub);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

module.exports = {
  listPublic,
  getPublicById,
  listAdmin,
  createProject,
  updateProject,
  deleteProject,
};
