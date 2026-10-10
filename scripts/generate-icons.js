import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal pure Node.js PNG encoder without external dependencies
function createPng(width, height, drawPixel) {
  // RGBA buffer
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowSize + 1);
    rawData[rowStart] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowStart + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper to create chunk
  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    // CRC32 calculation
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 lookup table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Drawing function for Grocery Icon
function drawGroceryIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = isMaskable ? w * 0.48 : w * 0.44;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background rounded squircle / circle in Emerald
  if (!isMaskable && dist > radius) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Emerald green gradient (#059669 -> #047857)
  const normY = y / h;
  const rBg = Math.round(5 + normY * 2);
  const gBg = Math.round(150 - normY * 30);
  const bBg = Math.round(105 - normY * 20);

  // Center shopping bag dimensions
  const bagW = w * 0.48;
  const bagH = h * 0.50;
  const bagLeft = cx - bagW / 2;
  const bagRight = cx + bagW / 2;
  const bagTop = cy - bagH * 0.25;
  const bagBottom = cy + bagH * 0.75;

  // Handle arc
  const handleRadius = w * 0.14;
  const handleCenterY = bagTop - h * 0.02;
  const handleDist = Math.sqrt(dx * dx + (y - handleCenterY) * (y - handleCenterY));
  if (y <= bagTop && Math.abs(handleDist - handleRadius) < w * 0.025) {
    // Gold handle (#fbbf24)
    return [251, 191, 36, 255];
  }

  // Inside white bag
  if (x >= bagLeft && x <= bagRight && y >= bagTop && y <= bagBottom) {
    // Apple fruit in center
    const fruitDist1 = Math.sqrt((x - (cx - w * 0.04)) ** 2 + (y - (cy + h * 0.15)) ** 2);
    const fruitDist2 = Math.sqrt((x - (cx + w * 0.04)) ** 2 + (y - (cy + h * 0.15)) ** 2);
    const fruitRadius = w * 0.09;

    if (fruitDist1 <= fruitRadius || fruitDist2 <= fruitRadius) {
      // Red apple (#ef4444)
      return [239, 68, 68, 255];
    }

    // Leaf on top of apple
    const leafDx = x - (cx + w * 0.02);
    const leafDy = y - (cy + h * 0.05);
    if (leafDx > 0 && leafDy < 0 && (leafDx * leafDx + leafDy * leafDy) < (w * 0.05) ** 2) {
      // Emerald leaf (#10b981)
      return [16, 185, 129, 255];
    }

    // White grocery bag background
    return [255, 255, 255, 255];
  }

  return [rBg, gBg, bBg, 255];
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 192x192
const p192 = createPng(192, 192, (x, y, w, h) => drawGroceryIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), p192);

// 512x512
const p512 = createPng(512, 512, (x, y, w, h) => drawGroceryIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), p512);

// 512x512 maskable (full bleed background)
const pMaskable = createPng(512, 512, (x, y, w, h) => drawGroceryIcon(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), pMaskable);

// 180x180 apple touch icon
const pApple = createPng(180, 180, (x, y, w, h) => drawGroceryIcon(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pApple);

console.log('Successfully generated all PWA PNG icons in public/icons/');
