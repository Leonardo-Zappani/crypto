/**
 * Módulo de Criptografia Simétrica - AES-256-CBC
 * Utilizado para criptografar o conteúdo da mensagem
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Gera uma chave simétrica aleatória
 * @returns {Buffer} Chave simétrica de 256 bits
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Criptografa um conteúdo usando AES-256-CBC
 * @param {string|Buffer} plaintext - Texto para criptografar
 * @param {Buffer} key - Chave simétrica de 256 bits
 * @returns {Object} Objeto contendo ciphertext e iv
 */
function encrypt(plaintext, key) {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`A chave deve ter ${KEY_LENGTH} bytes`);
  }

  // Gera um IV aleatório para cada criptografia
  const iv = crypto.randomBytes(IV_LENGTH);

  // Cria o cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Criptografa
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);

  return {
    ciphertext: encrypted,
    iv: iv
  };
}

/**
 * Descriptografa um conteúdo criptografado com AES-256-CBC
 * @param {Buffer} ciphertext - Texto criptografado
 * @param {Buffer} key - Chave simétrica de 256 bits
 * @param {Buffer} iv - Initialization Vector usado na criptografia
 * @returns {Buffer} Texto descriptografado
 */
function decrypt(ciphertext, key, iv) {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`A chave deve ter ${KEY_LENGTH} bytes`);
  }

  if (iv.length !== IV_LENGTH) {
    throw new Error(`O IV deve ter ${IV_LENGTH} bytes`);
  }

  // Cria o decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Descriptografa
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  return decrypted;
}

module.exports = {
  generateKey,
  encrypt,
  decrypt,
  KEY_LENGTH,
  IV_LENGTH
};
