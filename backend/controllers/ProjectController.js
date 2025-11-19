const pool = require('../config/db');

async function getProjects(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const conditions = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.genre ILIKE $${params.length} OR p.status ILIKE $${params.length} OR p.directed_by ILIKE $${params.length} OR p.produced_by ILIKE $${params.length})`);
    }
    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM projects p ${whereSql}`, params);
    const total = countRes.rows[0]?.total || 0;

    params.push(limit);
    params.push(offset);

    const rowsRes = await pool.query(
      `SELECT 
         p.id, p.title, p.description, p.genre, p.written_by, p.executive_producer, p.produced_by, p.status, p.updated_at, p.year, p.directed_by, p.thumbnail_id, p.video_id,
         m1.fileurl AS thumbnail_url, m2.fileurl AS video_url
       FROM projects p
       LEFT JOIN media m1 ON m1.id = p.thumbnail_id
       LEFT JOIN media m2 ON m2.id = p.video_id
       ${whereSql}
       ORDER BY p.updated_at DESC NULLS LAST, p.id DESC
       LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );

    res.json({
      success: true,
      data: {
        projects: rowsRes.rows,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
      }
    });
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
}

async function getProjectStats(req, res) {
  try {
    const r = await pool.query('SELECT COUNT(*)::int AS total FROM projects');
    res.json({ total: r.rows[0]?.total || 0 });
  } catch (error) {
    console.error('getProjectStats error:', error);
    res.status(500).json({ total: 0 });
  }
}

async function getProject(req, res) {
  try {
    const id = req.params.id;
    const r = await pool.query(
      `SELECT 
         p.id, p.title, p.description, p.genre, p.written_by, p.executive_producer, p.produced_by, p.status, p.updated_at, p.year, p.directed_by, p.thumbnail_id, p.video_id,
         m1.fileurl AS thumbnail_url, m2.fileurl AS video_url
       FROM projects p
       LEFT JOIN media m1 ON m1.id = p.thumbnail_id
       LEFT JOIN media m2 ON m2.id = p.video_id
       WHERE p.id = $1`,
      [id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: { project: r.rows[0] } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
}

async function createProject(req, res) {
  try {
    const body = req.body || {};
    // Validate media references if provided
    const tIdRaw = body.thumbnail_id;
    const vIdRaw = body.video_id;
    const tId = tIdRaw === null || tIdRaw === '' || typeof tIdRaw === 'undefined' ? null : parseInt(tIdRaw, 10);
    const vId = vIdRaw === null || vIdRaw === '' || typeof vIdRaw === 'undefined' ? null : parseInt(vIdRaw, 10);
    if (Number.isNaN(tId)) return res.status(400).json({ success: false, error: 'Invalid thumbnail_id' });
    if (Number.isNaN(vId)) return res.status(400).json({ success: false, error: 'Invalid video_id' });
    if (tId !== null) {
      const r = await pool.query('SELECT id, filetype FROM media WHERE id=$1', [tId]);
      if (!r.rows.length) return res.status(400).json({ success: false, error: 'thumbnail_id does not exist' });
      if (r.rows[0].filetype !== 'image') return res.status(400).json({ success: false, error: 'thumbnail_id must reference an image' });
    }
    if (vId !== null) {
      const r = await pool.query('SELECT id, filetype FROM media WHERE id=$1', [vId]);
      if (!r.rows.length) return res.status(400).json({ success: false, error: 'video_id does not exist' });
      if (r.rows[0].filetype !== 'video') return res.status(400).json({ success: false, error: 'video_id must reference a video' });
    }
    const fields = ['title','description','genre','written_by','executive_producer','produced_by','status','year','directed_by','thumbnail_id','video_id'];
    const cols = [];
    const vals = [];
    const params = [];
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(body, f) && body[f] !== '') {
        let v = body[f];
        if (['year','thumbnail_id','video_id'].includes(f)) {
          v = v === null || v === '' ? null : parseInt(v, 10);
          if (Number.isNaN(v)) v = null;
        }
        cols.push(f);
        params.push(v);
        vals.push(`$${params.length}`);
      }
    }
    if (cols.length === 0) return res.status(400).json({ success: false, error: 'No fields to create' });
    let id;
    try {
      const insertSql = `INSERT INTO projects (${cols.join(', ')}, updated_at) VALUES (${vals.join(', ')}, NOW()) RETURNING id`;
      const r = await pool.query(insertSql, params);
      id = r.rows[0].id;
    } catch (err) {
      // Fallback: if id has no default (not identity/serial), generate next id manually
      if (err && (err.code === '23502' || /null value in column\s+"id"/i.test(err.message || ''))) {
        const nextRes = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next FROM projects');
        const nextId = nextRes.rows[0]?.next || 1;
        const fbCols = ['id', ...cols];
        const fbParams = [nextId, ...params];
        const fbVals = fbParams.map((_, i) => `$${i+1}`);
        const fbSql = `INSERT INTO projects (${fbCols.join(', ')}, updated_at) VALUES (${fbVals.join(', ')}, NOW()) RETURNING id`;
        const r2 = await pool.query(fbSql, fbParams);
        id = r2.rows[0].id;
      } else {
        throw err;
      }
    }
    const sel = await pool.query(
      `SELECT 
         p.id, p.title, p.description, p.genre, p.written_by, p.executive_producer, p.produced_by, p.status, p.updated_at, p.year, p.directed_by, p.thumbnail_id, p.video_id,
         m1.fileurl AS thumbnail_url, m2.fileurl AS video_url
       FROM projects p
       LEFT JOIN media m1 ON m1.id = p.thumbnail_id
       LEFT JOIN media m2 ON m2.id = p.video_id
       WHERE p.id = $1`,
      [id]
    );
    res.status(201).json({ success: true, data: { project: sel.rows[0] } });
  } catch (error) {
    if (error && error.code === '23503') {
      return res.status(400).json({ success: false, error: 'Invalid media reference' });
    }
    if (error && error.code === '22P02') {
      return res.status(400).json({ success: false, error: 'Invalid input type' });
    }
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
}

async function updateProject(req, res) {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const sets = [];
    const params = [];
    function setField(key, transform) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        let v = body[key];
        if (transform) v = transform(v);
        params.push(v);
        sets.push(`${key} = $${params.length}`);
      }
    }
    setField('title');
    setField('description');
    setField('genre');
    setField('written_by');
    setField('executive_producer');
    setField('produced_by');
    setField('status');
    setField('year', (v) => {
      const n = v === null || v === '' ? null : parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    });
    setField('directed_by');
    if (Object.prototype.hasOwnProperty.call(body, 'thumbnail_id')) {
      const n = body.thumbnail_id === null || body.thumbnail_id === '' ? null : parseInt(body.thumbnail_id, 10);
      if (Number.isNaN(n)) return res.status(400).json({ success: false, error: 'Invalid thumbnail_id' });
      if (n !== null) {
        const r = await pool.query('SELECT id, filetype FROM media WHERE id=$1', [n]);
        if (!r.rows.length) return res.status(400).json({ success: false, error: 'thumbnail_id does not exist' });
        if (r.rows[0].filetype !== 'image') return res.status(400).json({ success: false, error: 'thumbnail_id must reference an image' });
      }
      params.push(n);
      sets.push(`thumbnail_id = $${params.length}`);
    }
    if (Object.prototype.hasOwnProperty.call(body, 'video_id')) {
      const n = body.video_id === null || body.video_id === '' ? null : parseInt(body.video_id, 10);
      if (Number.isNaN(n)) return res.status(400).json({ success: false, error: 'Invalid video_id' });
      if (n !== null) {
        const r = await pool.query('SELECT id, filetype FROM media WHERE id=$1', [n]);
        if (!r.rows.length) return res.status(400).json({ success: false, error: 'video_id does not exist' });
        if (r.rows[0].filetype !== 'video') return res.status(400).json({ success: false, error: 'video_id must reference a video' });
      }
      params.push(n);
      sets.push(`video_id = $${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    sets.push('updated_at = NOW()');
    params.push(id);
    const r = await pool.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id`, params);
    if (!r.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    const sel = await pool.query(
      `SELECT 
         p.id, p.title, p.description, p.genre, p.written_by, p.executive_producer, p.produced_by, p.status, p.updated_at, p.year, p.directed_by, p.thumbnail_id, p.video_id,
         m1.fileurl AS thumbnail_url, m2.fileurl AS video_url
       FROM projects p
       LEFT JOIN media m1 ON m1.id = p.thumbnail_id
       LEFT JOIN media m2 ON m2.id = p.video_id
       WHERE p.id = $1`,
      [id]
    );
    res.json({ success: true, data: { project: sel.rows[0] } });
  } catch (error) {
    if (error && error.code === '23503') {
      return res.status(400).json({ success: false, error: 'Invalid media reference' });
    }
    if (error && error.code === '22P02') {
      return res.status(400).json({ success: false, error: 'Invalid input type' });
    }
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
}

async function deleteProject(req, res) {
  try {
    const id = req.params.id;
    const r = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
}

async function getPublicProjects(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '24', 10), 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim(); // e.g., 'published'

    const conditions = [];
    const params = [];
    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.genre ILIKE $${params.length})`);
    }
    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM projects p ${whereSql}`, params);
    const total = countRes.rows[0]?.total || 0;
    params.push(limit); params.push(offset);

    const rowsRes = await pool.query(
      `SELECT 
         p.id, p.title, p.description, p.genre, p.year, p.status, p.thumbnail_id, m1.fileurl AS thumbnail_url
       FROM projects p
       LEFT JOIN media m1 ON m1.id = p.thumbnail_id
       ${whereSql}
       ORDER BY p.updated_at DESC NULLS LAST, p.id DESC
       LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: { projects: rowsRes.rows, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total/limit)) } } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
}

module.exports = { getProjects, getProjectStats, getProject, createProject, updateProject, deleteProject, getPublicProjects };