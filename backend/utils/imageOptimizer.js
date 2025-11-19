const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Optimize image using sharp
 * Reduces file size while maintaining quality
 * 
 * @param {Buffer} imageBuffer - Image buffer to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<Buffer>} - Optimized image buffer
 */
async function optimizeImage(imageBuffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format = 'jpeg' // jpeg, png, webp
  } = options;

  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Determine output format
    let outputFormat = format;
    if (format === 'auto') {
      // Keep original format for PNG (transparency), convert others to JPEG
      outputFormat = metadata.format === 'png' ? 'png' : 'jpeg';
    }

    // Resize if needed
    let pipeline = image;
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply format-specific optimizations
    if (outputFormat === 'jpeg') {
      pipeline = pipeline.jpeg({
        quality,
        progressive: true,
        mozjpeg: true
      });
    } else if (outputFormat === 'png') {
      pipeline = pipeline.png({
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else if (outputFormat === 'webp') {
      pipeline = pipeline.webp({
        quality,
        effort: 6
      });
    }

    const optimizedBuffer = await pipeline.toBuffer();
    
    // Log optimization results
    const originalSize = imageBuffer.length;
    const optimizedSize = optimizedBuffer.length;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`Image optimized: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);

    return optimizedBuffer;
  } catch (error) {
    console.error('Image optimization error:', error);
    // Return original buffer if optimization fails
    return imageBuffer;
  }
}

/**
 * Get image metadata
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Image metadata
 */
async function getImageMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length,
      hasAlpha: metadata.hasAlpha || false
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return null;
  }
}

/**
 * Generate thumbnail from image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {number} size - Thumbnail size (default: 300)
 * @returns {Promise<Buffer>} - Thumbnail buffer
 */
async function generateThumbnail(imageBuffer, size = 300) {
  try {
    return await sharp(imageBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw error;
  }
}

module.exports = {
  optimizeImage,
  getImageMetadata,
  generateThumbnail
};


