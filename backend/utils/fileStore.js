const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const config = require('../config');

const JSON_DIR = path.join(config.dataDir, 'json');
const TEXT_DIR = path.join(config.dataDir, 'text');
const UPLOADS_DIR = path.join(config.dataDir, 'uploads');

async function ensureDir(dir) {
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch {}
}

async function readJson(name, fallback = null) {
  await ensureDir(JSON_DIR);
  const filePath = path.join(JSON_DIR, `${name}.json`);
  try {
    const buf = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(buf);
  } catch {
    return fallback;
  }
}

async function writeJson(name, data) {
  await ensureDir(JSON_DIR);
  const filePath = path.join(JSON_DIR, `${name}.json`);
  const tmp = `${filePath}.tmp`;
  const json = JSON.stringify(data ?? null, null, 2);
  await fsp.writeFile(tmp, json, 'utf8');
  await fsp.rename(tmp, filePath);
  return { ok: true };
}

async function readText(name, fallback = '') {
  await ensureDir(TEXT_DIR);
  const filePath = path.join(TEXT_DIR, `${name}.txt`);
  try {
    const buf = await fsp.readFile(filePath, 'utf8');
    return buf;
  } catch {
    return fallback;
  }
}

async function writeText(name, value) {
  await ensureDir(TEXT_DIR);
  const filePath = path.join(TEXT_DIR, `${name}.txt`);
  await fsp.writeFile(filePath, value ?? '', 'utf8');
  return { ok: true };
}

async function listJsonKeys() {
  await ensureDir(JSON_DIR);
  const items = await fsp.readdir(JSON_DIR, { withFileTypes: true });
  return items.filter(i => i.isFile() && i.name.endsWith('.json')).map(i => i.name.replace(/\.json$/, ''));
}

async function listTextKeys() {
  await ensureDir(TEXT_DIR);
  const items = await fsp.readdir(TEXT_DIR, { withFileTypes: true });
  return items.filter(i => i.isFile() && i.name.endsWith('.txt')).map(i => i.name.replace(/\.txt$/, ''));
}

async function listUploads(limit = 100) {
  await ensureDir(UPLOADS_DIR);
  const imgDir = path.join(UPLOADS_DIR, 'images');
  await ensureDir(imgDir);
  try {
    const files = await fsp.readdir(imgDir, { withFileTypes: true });
    const stats = await Promise.all(files.filter(f => f.isFile()).map(async f => {
      const fp = path.join(imgDir, f.name);
      const st = await fsp.stat(fp);
      return { name: f.name, mtimeMs: st.mtimeMs };
    }));
    const sorted = stats.sort((a,b) => b.mtimeMs - a.mtimeMs).slice(0, limit);
    return sorted.map(s => ({ filename: s.name, url: `/uploads/images/${s.name}` }));
  } catch {
    return [];
  }
}

module.exports = {
  readJson,
  writeJson,
  readText,
  writeText,
  listJsonKeys,
  listTextKeys,
  listUploads,
};
