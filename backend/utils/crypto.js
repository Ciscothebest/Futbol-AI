const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ALGORITHM = 'aes-256-cbc';
const SECRET = process.env.PAYMENT_ENCRYPTION_KEY || 'FutbolAI_Secure_Payment_Secret_Key_2026_32bytes!';
// Derive a 32-byte key buffer using SHA-256
const KEY = crypto.createHash('sha256').update(SECRET).digest();

/**
 * Encrypts plain text into an IV + Ciphertext hex string
 * @param {string|object} data 
 * @returns {string} iv:encryptedData formatted string
 */
function encrypt(data) {
  if (!data) return null;
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an IV + Ciphertext hex string back to plain text
 * @param {string} encryptedData 
 * @param {boolean} parseJson Whether to parse as JSON
 * @returns {string|object|null}
 */
function decrypt(encryptedData, parseJson = false) {
  if (!encryptedData || typeof encryptedData !== 'string') return null;
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    if (parseJson) {
      try {
        return JSON.parse(decrypted);
      } catch (e) {
        return decrypted;
      }
    }
    return decrypted;
  } catch (err) {
    console.error('⚠️ Decryption error:', err.message);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt
};
