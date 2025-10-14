const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const {
  CLOUDINARY_CLOUD_NAME: cloud_name,
  CLOUDINARY_API_KEY: api_key,
  CLOUDINARY_API_SECRET: api_secret,
} = process.env;

if (cloud_name && api_key && api_secret) {
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

function bufferToStream(buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

function isConfigured() {
  return !!(cloud_name && api_key && api_secret);
}

async function uploadBuffer(buffer, options = {}) {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  }
  const { folder = 'filmpro', resource_type = 'image', ...rest } = options;
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type, ...rest },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    bufferToStream(buffer).pipe(uploadStream);
  });
}

async function deleteByPublicId(publicId, options = {}) {
  if (!isConfigured()) return { result: 'not-configured' };
  try {
    const res = await cloudinary.uploader.destroy(publicId, { invalidate: true, ...options });
    return res;
  } catch (e) {
    return { result: 'error', error: e.message };
  }
}

module.exports = { cloudinary, uploadBuffer, deleteByPublicId, isConfigured };
