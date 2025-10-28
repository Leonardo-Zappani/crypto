/**
 * Testes para o módulo de Certificado Digital
 */

const { CertificateAuthority, Certificate } = require('../src/crypto/certificate');
const { generateKeyPair } = require('../src/crypto/asymmetric');

describe('Módulo Certificado Digital', () => {
  let ca;
  let userKeys;

  beforeEach(() => {
    ca = new CertificateAuthority('Test CA');
    userKeys = generateKeyPair();
  });

  describe('CertificateAuthority', () => {
    test('deve criar CA com nome', () => {
      expect(ca.name).toBe('Test CA');
      expect(ca.publicKey).toBeDefined();
      expect(ca.privateKey).toBeDefined();
    });

    test('deve emitir certificado para usuário', () => {
      const cert = ca.issueCertificate('Alice', userKeys.publicKey);

      expect(cert).toBeInstanceOf(Certificate);
      expect(cert.subject).toBe('Alice');
      expect(cert.issuer).toBe('Test CA');
      expect(cert.publicKey).toBe(userKeys.publicKey);
    });

    test('certificado deve ter número serial único', () => {
      const cert1 = ca.issueCertificate('Alice', userKeys.publicKey);
      const cert2 = ca.issueCertificate('Bob', userKeys.publicKey);

      expect(cert1.serialNumber).not.toBe(cert2.serialNumber);
    });
  });

  describe('Certificate', () => {
    let certificate;

    beforeEach(() => {
      certificate = ca.issueCertificate('Alice', userKeys.publicKey, 30);
    });

    test('deve ter todas as propriedades necessárias', () => {
      expect(certificate.subject).toBe('Alice');
      expect(certificate.issuer).toBe('Test CA');
      expect(certificate.publicKey).toBe(userKeys.publicKey);
      expect(certificate.serialNumber).toBeDefined();
      expect(certificate.issuedAt).toBeInstanceOf(Date);
      expect(certificate.expiresAt).toBeInstanceOf(Date);
      expect(certificate.signature).toBeInstanceOf(Buffer);
    });

    test('deve validar certificado válido', () => {
      const validation = certificate.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('deve detectar certificado expirado', () => {
      // Testa com data futura (após expiração)
      const futureDate = new Date(certificate.expiresAt.getTime() + 24 * 60 * 60 * 1000);
      const validation = certificate.validate(futureDate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Certificado expirado');
    });

    test('deve detectar certificado ainda não válido', () => {
      // Testa com data passada (antes da emissão)
      const pastDate = new Date(certificate.issuedAt.getTime() - 24 * 60 * 60 * 1000);
      const validation = certificate.validate(pastDate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Certificado ainda não é válido');
    });

    test('deve detectar assinatura inválida', () => {
      // Corrompe a assinatura
      certificate.signature = Buffer.from('assinatura inválida');

      const validation = certificate.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Assinatura do certificado inválida');
    });

    test('deve converter para JSON e reconstruir', () => {
      const json = certificate.toJSON();

      expect(json.subject).toBe('Alice');
      expect(json.signature).toBeDefined();
      expect(typeof json.signature).toBe('string');

      const reconstructed = Certificate.fromJSON(json);

      expect(reconstructed.subject).toBe(certificate.subject);
      expect(reconstructed.serialNumber).toBe(certificate.serialNumber);
      expect(reconstructed.signature).toEqual(certificate.signature);
    });

    test('certificado reconstruído deve validar corretamente', () => {
      const json = certificate.toJSON();
      const reconstructed = Certificate.fromJSON(json);

      const validation = reconstructed.validate();

      expect(validation.valid).toBe(true);
    });
  });
});
