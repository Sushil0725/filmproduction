const path = require('path');
const upload = require('../middleware/upload');
const { readJson, writeJson, readText, writeText, listJsonKeys, listTextKeys, listUploads } = require('../utils/fileStore');

const ALLOWED_JSON_KEYS = new Set([
  'homepage',
  'service-categories',
  'projects',
  'gallery',
  'news',
  'site'
]);

function getFallbackForKey(key) {
  switch (key) {
    case 'homepage':
      return {
        hero: { headline: '', tagline: '', backgroundType: 'image', backgroundImage: '', backgroundVideo: '' },
        highlights: [],
        services: { selected: [] },
        projects: { selected: [] },
        videos: { selected: [] },
        contact: { address: '', phone: '', email: '', hours: '', social: { facebook: '', instagram: '', youtube: '' } }
      };
    case 'service-categories':
    case 'projects':
    case 'gallery':
    case 'news':
      return [];
    case 'site':
      return { title: 'MB Pictures', tagline: '' };
    default:
      return null;
  }
}

async function getPublicJson(req, res) {
  try {
    const key = String(req.params.key || '').toLowerCase();
    if (!ALLOWED_JSON_KEYS.has(key)) return res.status(404).json({ success: false, error: 'Not found' });
    const data = await readJson(key, getFallbackForKey(key));
    res.json(data);
  } catch (error) {
    console.error('getPublicJson error:', error);
    res.status(500).json({ success: false, error: 'Failed to read content' });
  }
}

async function getPublicText(req, res) {
  try {
    const key = String(req.params.key || '').toLowerCase();
    const text = await readText(key, '');
    res.type('text/plain').send(text);
  } catch (error) {
    console.error('getPublicText error:', error);
    res.status(500).type('text/plain').send('');
  }
}

async function putAdminJson(req, res) {
  try {
    const key = String(req.params.key || '').toLowerCase();
    if (!ALLOWED_JSON_KEYS.has(key)) return res.status(400).json({ success: false, error: 'Invalid key' });
    await writeJson(key, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('putAdminJson error:', error);
    res.status(500).json({ success: false, error: 'Failed to save content' });
  }
}

async function putAdminText(req, res) {
  try {
    const key = String(req.params.key || '').toLowerCase();
    const value = typeof req.body?.value === 'string' ? req.body.value : String(req.body || '');
    await writeText(key, value);
    res.json({ success: true });
  } catch (error) {
    console.error('putAdminText error:', error);
    res.status(500).json({ success: false, error: 'Failed to save text' });
  }
}

async function getAdminList(req, res) {
  try {
    const [json, text, uploads] = await Promise.all([
      listJsonKeys(),
      listTextKeys(),
      listUploads(120)
    ]);
    res.json({ json, text, uploads });
  } catch (error) {
    console.error('getAdminList error:', error);
    res.status(500).json({ success: false, error: 'Failed to list content' });
  }
}

module.exports = {
  getPublicJson,
  getPublicText,
  putAdminJson,
  putAdminText,
  getAdminList,
};
