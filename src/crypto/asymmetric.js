/**
 * Módulo de Criptografia Assimétrica - RSA
 * Utilizado para troca segura da chave simétrica
 */

const crypto = require('crypto');

const KEY_SIZE = 2048; // Tamanho da chave RSA em bits

/**
 * Gera um par de chaves RSA (pública e privada)
 * @returns {Object} Objeto contendo publicKey e privateKey
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: KEY_SIZE,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

/**
 * Criptografa dados usando a chave pública RSA
 * @param {Buffer|string} data - Dados para criptografar
 * @param {string} publicKey - Chave pública em formato PEM
 * @returns {Buffer} Dados criptografados
 */
function encrypt(data, publicKey) {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.isBuffer(data) ? data : Buffer.from(data)
  );
}

/**
 * Descriptografa dados usando a chave privada RSA
 * @param {Buffer} encryptedData - Dados criptografados
 * @param {string} privateKey - Chave privada em formato PEM
 * @returns {Buffer} Dados descriptografados
 */
function decrypt(encryptedData, privateKey) {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedData
  );
}

module.exports = {
  generateKeyPair,
  encrypt,
  decrypt,
  KEY_SIZE
};
