const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const validUser = username === config.adminUsername;
  let validPass = false;
  if (config.adminPasswordHash) {
    try {
      validPass = await bcrypt.compare(password, config.adminPasswordHash);
    } catch {
      validPass = false;
    }
  } else {
    validPass = password === config.adminPassword;
  }
  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const payload = { sub: config.adminUsername, role: 'admin' };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return res.json({ token, expiresIn: config.jwtExpiresIn });
});

router.get('/me', (req, res) => {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return res.json({ authenticated: true, user: { username: payload.sub, role: payload.role } });
  } catch {
    return res.json({ authenticated: false });
  }
});

module.exports = router;
