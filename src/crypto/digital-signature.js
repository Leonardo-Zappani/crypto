/**
 * Módulo de Assinatura Digital
 * Utilizado para autenticar o remetente da mensagem
 */

const crypto = require('crypto');

/**
 * Assina dados usando a chave privada
 * @param {string|Buffer} data - Dados para assinar
 * @param {string} privateKey - Chave privada em formato PEM
 * @returns {Buffer} Assinatura digital dos dados
 */
function sign(data, privateKey) {
  const sign = crypto.createSign('sha256');
  sign.update(data);
  sign.end();

  return sign.sign(privateKey);
}

/**
 * Verifica a assinatura digital usando a chave pública
 * @param {string|Buffer} data - Dados originais
 * @param {Buffer} signature - Assinatura digital para verificar
 * @param {string} publicKey - Chave pública em formato PEM
 * @returns {boolean} true se a assinatura é válida
 */
function verify(data, signature, publicKey) {
  const verify = crypto.createVerify('sha256');
  verify.update(data);
  verify.end();

  return verify.verify(publicKey, signature);
}

module.exports = {
  sign,
  verify
};
