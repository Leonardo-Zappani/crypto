/**
 * Classe User - Representa um usuário no sistema de comunicação segura
 * Cada usuário possui chaves RSA e um certificado digital
 */

const { generateKeyPair } = require('../crypto/asymmetric');
const { generateKey, encrypt, decrypt } = require('../crypto/symmetric');
const { sign, verify } = require('../crypto/digital-signature');
const { createHash, verifyHash } = require('../crypto/hash');
const asymmetric = require('../crypto/asymmetric');

/**
 * Classe que representa um usuário (Alice ou Bob)
 */
class User {
  constructor(name, certificate = null) {
    this.name = name;

    // Gera par de chaves RSA
    const keys = generateKeyPair();
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;

    // Armazena o certificado (será emitido pela CA)
    this.certificate = certificate;
  }

  /**
   * Define o certificado do usuário
   * @param {Certificate} certificate - Certificado digital
   */
  setCertificate(certificate) {
    this.certificate = certificate;
  }

  /**
   * Envia uma mensagem segura para outro usuário
   * @param {string} message - Mensagem em texto plano
   * @param {User} recipient - Usuário destinatário
   * @returns {Object} Pacote de mensagem criptografada
   */
  sendSecureMessage(message, recipient) {
    if (!this.certificate) {
      throw new Error('Usuário não possui certificado');
    }

    if (!recipient.certificate) {
      throw new Error('Destinatário não possui certificado');
    }

    // 1. Gera hash da mensagem original para verificação de integridade
    const messageHash = createHash(message);

    // 2. Gera uma chave simétrica aleatória (AES)
    const symmetricKey = generateKey();

    // 3. Criptografa a mensagem com a chave simétrica
    const { ciphertext, iv } = encrypt(message, symmetricKey);

    // 4. Criptografa a chave simétrica com a chave pública do destinatário (RSA)
    const encryptedSymmetricKey = asymmetric.encrypt(symmetricKey, recipient.publicKey);

    // 5. Assina o ciphertext com a chave privada do remetente
    const signature = sign(ciphertext, this.privateKey);

    // 6. Monta o pacote da mensagem
    return {
      from: this.name,
      to: recipient.name,
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      encryptedSymmetricKey: encryptedSymmetricKey.toString('base64'),
      signature: signature.toString('base64'),
      messageHash: messageHash.toString('base64'),
      senderCertificate: this.certificate.toJSON(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Recebe e descriptografa uma mensagem segura
   * @param {Object} messagePackage - Pacote de mensagem criptografada
   * @returns {Object} Resultado com mensagem descriptografada e validações
   */
  receiveSecureMessage(messagePackage) {
    const result = {
      success: false,
      message: null,
      validations: {
        certificateValid: false,
        signatureValid: false,
        integrityValid: false
      },
      errors: []
    };

    try {
      // 1. Reconstrói o certificado do remetente
      const { Certificate } = require('../crypto/certificate');
      const senderCert = Certificate.fromJSON(messagePackage.senderCertificate);

      // 2. Valida o certificado do remetente
      const certValidation = senderCert.validate();
      result.validations.certificateValid = certValidation.valid;

      if (!certValidation.valid) {
        result.errors.push(...certValidation.errors);
        return result;
      }

      // 3. Converte dados de base64 para Buffer
      const ciphertext = Buffer.from(messagePackage.ciphertext, 'base64');
      const iv = Buffer.from(messagePackage.iv, 'base64');
      const encryptedSymmetricKey = Buffer.from(messagePackage.encryptedSymmetricKey, 'base64');
      const signature = Buffer.from(messagePackage.signature, 'base64');
      const messageHash = Buffer.from(messagePackage.messageHash, 'base64');

      // 4. Verifica a assinatura digital usando a chave pública do remetente
      result.validations.signatureValid = verify(ciphertext, signature, senderCert.publicKey);

      if (!result.validations.signatureValid) {
        result.errors.push('Assinatura digital inválida - mensagem pode ter sido adulterada');
        return result;
      }

      // 5. Descriptografa a chave simétrica usando a chave privada do destinatário
      const symmetricKey = asymmetric.decrypt(encryptedSymmetricKey, this.privateKey);

      // 6. Descriptografa a mensagem usando a chave simétrica
      const decryptedMessage = decrypt(ciphertext, symmetricKey, iv);
      const message = decryptedMessage.toString('utf8');

      // 7. Verifica a integridade da mensagem usando o hash
      result.validations.integrityValid = verifyHash(message, messageHash);

      if (!result.validations.integrityValid) {
        result.errors.push('Hash da mensagem não corresponde - integridade comprometida');
        return result;
      }

      // 8. Tudo válido!
      result.success = true;
      result.message = message;

    } catch (error) {
      result.errors.push(`Erro ao processar mensagem: ${error.message}`);
    }

    return result;
  }
}

module.exports = User;
