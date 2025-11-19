const { readJson } = require('../utils/fileStore');

async function getServices(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
    const offset = (page - 1) * limit;

    const categories = await readJson('service-categories', []);
    const items = [];
    for (const cat of Array.isArray(categories) ? categories : []) {
      const catId = cat.id || (cat.name || 'category').toLowerCase().replace(/\s+/g, '-');
      for (const it of Array.isArray(cat.items) ? cat.items : []) {
        const title = it.title || '';
        const id = `${catId}:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const description = Array.isArray(it.points) && it.points.length ? String(it.points[0]) : (cat.summary || '');
        items.push({ id, title, description });
      }
    }

    const total = items.length;
    const slice = items.slice(offset, offset + limit);
    res.json({
      success: true,
      data: {
        services: slice,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
      }
    });
  } catch (error) {
    console.error('getServices error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch services' });
  }
}

async function getServiceStats(req, res) {
  try {
    const categories = await readJson('service-categories', []);
    let total = 0;
    for (const cat of Array.isArray(categories) ? categories : []) {
      total += Array.isArray(cat.items) ? cat.items.length : 0;
    }
    res.json({ total });
  } catch (error) {
    console.error('getServiceStats error:', error);
    res.status(500).json({ total: 0 });
  }
}

module.exports = { getServices, getServiceStats };