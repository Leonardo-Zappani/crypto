/**
 * Módulo de Certificado Digital Simulado
 * Utilizado para validar a identidade do remetente
 */

const crypto = require('crypto');
const { sign, verify } = require('./digital-signature');
const { generateKeyPair } = require('./asymmetric');

/**
 * Autoridade Certificadora (CA) Simulada
 */
class CertificateAuthority {
  constructor(name = 'Academic CA') {
    this.name = name;
    const keys = generateKeyPair();
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  /**
   * Emite um certificado para um usuário
   * @param {string} subject - Nome do titular do certificado
   * @param {string} publicKey - Chave pública do titular
   * @param {number} validityDays - Dias de validade (padrão: 365)
   * @returns {Certificate} Certificado emitido
   */
  issueCertificate(subject, publicKey, validityDays = 365) {
    const serialNumber = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + validityDays * 24 * 60 * 60 * 1000);

    // Cria os dados do certificado
    const certData = {
      subject,
      issuer: this.name,
      publicKey,
      serialNumber,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    // Assina o certificado com a chave privada da CA
    const dataToSign = JSON.stringify(certData);
    const signature = sign(dataToSign, this.privateKey);

    return new Certificate(certData, signature, this.publicKey);
  }
}

/**
 * Classe que representa um Certificado Digital
 */
class Certificate {
  constructor(data, signature, caPublicKey) {
    this.subject = data.subject;
    this.issuer = data.issuer;
    this.publicKey = data.publicKey;
    this.serialNumber = data.serialNumber;
    this.issuedAt = new Date(data.issuedAt);
    this.expiresAt = new Date(data.expiresAt);
    this.signature = signature;
    this.caPublicKey = caPublicKey;
  }

  /**
   * Verifica se o certificado é válido
   * @param {Date} currentDate - Data para verificar validade (padrão: agora)
   * @returns {Object} Objeto com status de validade e mensagens de erro
   */
  validate(currentDate = new Date()) {
    const errors = [];

    // Verifica se o certificado expirou
    if (currentDate > this.expiresAt) {
      errors.push('Certificado expirado');
    }

    // Verifica se o certificado ainda não é válido
    if (currentDate < this.issuedAt) {
      errors.push('Certificado ainda não é válido');
    }

    // Verifica a assinatura da CA
    const certData = {
      subject: this.subject,
      issuer: this.issuer,
      publicKey: this.publicKey,
      serialNumber: this.serialNumber,
      issuedAt: this.issuedAt.toISOString(),
      expiresAt: this.expiresAt.toISOString()
    };
    const dataToVerify = JSON.stringify(certData);

    if (!verify(dataToVerify, this.signature, this.caPublicKey)) {
      errors.push('Assinatura do certificado inválida');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Converte o certificado para JSON
   * @returns {Object} Representação JSON do certificado
   */
  toJSON() {
    return {
      subject: this.subject,
      issuer: this.issuer,
      publicKey: this.publicKey,
      serialNumber: this.serialNumber,
      issuedAt: this.issuedAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      signature: this.signature.toString('base64'),
      caPublicKey: this.caPublicKey
    };
  }

  /**
   * Cria um certificado a partir de JSON
   * @param {Object} json - Representação JSON do certificado
   * @returns {Certificate} Instância do certificado
   */
  static fromJSON(json) {
    const data = {
      subject: json.subject,
      issuer: json.issuer,
      publicKey: json.publicKey,
      serialNumber: json.serialNumber,
      issuedAt: json.issuedAt,
      expiresAt: json.expiresAt
    };

    const signature = Buffer.from(json.signature, 'base64');
    return new Certificate(data, signature, json.caPublicKey);
  }
}

module.exports = {
  CertificateAuthority,
  Certificate
};
