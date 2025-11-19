
const pool = require('../config/db');

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  for (const p of patterns) {
    const m = (url || '').match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

async function getVideos(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const cond = [`filetype = 'video'`];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      cond.push(`(filename ILIKE $${params.length} OR fileurl ILIKE $${params.length})`);
    }
    const whereSql = 'WHERE ' + cond.join(' AND ');

    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM media ${whereSql}`, params);
    const total = countRes.rows[0]?.total || 0;
    params.push(limit); params.push(offset);
    const rowsRes = await pool.query(
      `SELECT id, filename AS title, fileurl, updated_at
       FROM media
       ${whereSql}
       ORDER BY updated_at DESC NULLS LAST, id DESC
       LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    const videos = rowsRes.rows.map(r => ({ id: r.id, title: r.title, youtube_url: r.fileurl, updated_at: r.updated_at }));
    res.json({ success: true, data: { videos, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } } });
  } catch (error) {
    console.error('getVideos error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch videos' });
  }
}

async function getVideo(req, res) {
  try {
    const id = req.params.id;
    const r = await pool.query(`SELECT id, filename AS title, fileurl FROM media WHERE id=$1 AND filetype='video'`, [id]);
    if (!r.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    const v = r.rows[0];
    res.json({ success: true, data: { video: { id: v.id, title: v.title, youtube_url: v.fileurl } } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch video' });
  }
}

async function createVideo(req, res) {
  try {
    const title = (req.body.title || 'YouTube Video').trim();
    const url = (req.body.url || req.body.youtubeUrl || '').trim();
    const id = extractYouTubeId(url);
    if (!id) return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    const r = await pool.query(
      `INSERT INTO media (filename, filetype, fileurl, updated_at) VALUES ($1,'video',$2,NOW()) RETURNING id, filename AS title, fileurl`,
      [title, watchUrl]
    );
    res.status(201).json({ success: true, data: { video: { id: r.rows[0].id, title: r.rows[0].title, youtube_url: r.rows[0].fileurl } } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create video' });
  }
}

async function updateVideo(req, res) {
  try {
    const idParam = req.params.id;
    const title = (req.body.title || '').trim();
    const url = (req.body.url || req.body.youtubeUrl || '').trim();
    const sets = [];
    const params = [];
    if (title) { params.push(title); sets.push(`filename = $${params.length}`); }
    if (url) {
      const vid = extractYouTubeId(url);
      if (!vid) return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
      params.push(`https://www.youtube.com/watch?v=${vid}`);
      sets.push(`fileurl = $${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    params.push(idParam);
    const r = await pool.query(`UPDATE media SET ${sets.join(', ')}, updated_at = NOW() WHERE id=$${params.length} AND filetype='video' RETURNING id, filename AS title, fileurl`, params);
    if (!r.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: { video: { id: r.rows[0].id, title: r.rows[0].title, youtube_url: r.rows[0].fileurl } } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update video' });
  }
}

async function deleteVideo(req, res) {
  try {
    const id = req.params.id;
    const r = await pool.query(`DELETE FROM media WHERE id=$1 AND filetype='video'`, [id]);
    if (r.rowCount === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
}

module.exports = { getVideos, getVideo, createVideo, updateVideo, deleteVideo };
