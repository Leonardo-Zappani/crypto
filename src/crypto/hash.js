/**
 * Módulo de Hash - SHA-256
 * Utilizado para garantir a integridade da mensagem
 */

const crypto = require('crypto');

/**
 * Gera um hash SHA-256 de um conteúdo
 * @param {string|Buffer} content - Conteúdo para gerar hash
 * @returns {Buffer} Hash SHA-256 do conteúdo
 */
function createHash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest();
}

/**
 * Gera um hash SHA-256 e retorna como string hexadecimal
 * @param {string|Buffer} content - Conteúdo para gerar hash
 * @returns {string} Hash SHA-256 em formato hexadecimal
 */
function createHashHex(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

/**
 * Verifica se um hash corresponde ao conteúdo
 * @param {string|Buffer} content - Conteúdo original
 * @param {Buffer|string} hash - Hash para comparar
 * @returns {boolean} true se o hash corresponde ao conteúdo
 */
function verifyHash(content, hash) {
  const computedHash = createHash(content);
  const hashToCompare = Buffer.isBuffer(hash) ? hash : Buffer.from(hash, 'hex');

  return computedHash.equals(hashToCompare);
}

module.exports = {
  createHash,
  createHashHex,
  verifyHash
};
