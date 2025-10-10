const fs = require('fs');
const path = require('path');

function sanitizeName(name) {
  return String(name || '').replace(/[^a-zA-Z0-9-_]/g, '');
}

function textFilePath(dataDir, name) {
  return path.join(dataDir, 'text', `${sanitizeName(name)}.txt`);
}

function jsonFilePath(dataDir, name) {
  return path.join(dataDir, 'json', `${sanitizeName(name)}.json`);
}

async function readText(dataDir, name) {
  const p = textFilePath(dataDir, name);
  return fs.promises.readFile(p, 'utf8');
}

async function writeText(dataDir, name, content) {
  const p = textFilePath(dataDir, name);
  await fs.promises.writeFile(p, content ?? '', 'utf8');
  return p;
}

async function readJSON(dataDir, name) {
  const p = jsonFilePath(dataDir, name);
  const data = await fs.promises.readFile(p, 'utf8');
  return JSON.parse(data);
}

async function writeJSON(dataDir, name, obj) {
  const p = jsonFilePath(dataDir, name);
  const str = JSON.stringify(obj ?? {}, null, 2);
  await fs.promises.writeFile(p, str, 'utf8');
  return p;
}

async function listBasenames(dataDir, folder, ext) {
  const dir = path.join(dataDir, folder);
  try {
    const files = await fs.promises.readdir(dir);
    return files
      .filter((f) => f.toLowerCase().endsWith(`.${ext}`))
      .map((f) => f.slice(0, -(ext.length + 1)));
  } catch {
    return [];
  }
}

module.exports = { readText, writeText, readJSON, writeJSON, listBasenames, sanitizeName };
