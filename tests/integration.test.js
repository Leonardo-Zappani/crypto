/**
 * Testes de Integração - Comunicação completa Alice → Bob
 */

const User = require('../src/users/user');
const { CertificateAuthority } = require('../src/crypto/certificate');

describe('Integração - Sistema de Comunicação Segura', () => {
  let ca, alice, bob;

  beforeEach(() => {
    // Setup: CA, Alice e Bob
    ca = new CertificateAuthority('Academic CA');
    alice = new User('Alice');
    bob = new User('Bob');

    // Emite certificados
    const aliceCert = ca.issueCertificate('Alice', alice.publicKey);
    const bobCert = ca.issueCertificate('Bob', bob.publicKey);

    alice.setCertificate(aliceCert);
    bob.setCertificate(bobCert);
  });

  test('Alice deve enviar mensagem segura para Bob', () => {
    const message = 'Mensagem secreta de Alice para Bob';

    const messagePackage = alice.sendSecureMessage(message, bob);

    expect(messagePackage).toHaveProperty('from', 'Alice');
    expect(messagePackage).toHaveProperty('to', 'Bob');
    expect(messagePackage).toHaveProperty('ciphertext');
    expect(messagePackage).toHaveProperty('signature');
    expect(messagePackage).toHaveProperty('encryptedSymmetricKey');
    expect(messagePackage).toHaveProperty('senderCertificate');
  });

  test('Bob deve receber e descriptografar mensagem de Alice', () => {
    const message = 'Olá Bob, esta é uma mensagem segura!';

    const messagePackage = alice.sendSecureMessage(message, bob);
    const result = bob.receiveSecureMessage(messagePackage);

    expect(result.success).toBe(true);
    expect(result.message).toBe(message);
    expect(result.validations.certificateValid).toBe(true);
    expect(result.validations.signatureValid).toBe(true);
    expect(result.validations.integrityValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('Bob deve rejeitar mensagem com certificado inválido', () => {
    const message = 'Mensagem teste';
    const messagePackage = alice.sendSecureMessage(message, bob);

    // Corrompe o certificado
    messagePackage.senderCertificate.signature = 'assinatura_invalida';

    const result = bob.receiveSecureMessage(messagePackage);

    expect(result.success).toBe(false);
    expect(result.validations.certificateValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Bob deve rejeitar mensagem com assinatura inválida', () => {
    const message = 'Mensagem teste';
    const messagePackage = alice.sendSecureMessage(message, bob);

    // Adultera o ciphertext (invalida assinatura)
    messagePackage.ciphertext = Buffer.from('dados adulterados').toString('base64');

    const result = bob.receiveSecureMessage(messagePackage);

    expect(result.success).toBe(false);
    expect(result.validations.signatureValid).toBe(false);
    expect(result.errors).toContain('Assinatura digital inválida - mensagem pode ter sido adulterada');
  });

  test('deve funcionar com mensagens longas', () => {
    const longMessage = 'A'.repeat(1000);

    const messagePackage = alice.sendSecureMessage(longMessage, bob);
    const result = bob.receiveSecureMessage(messagePackage);

    expect(result.success).toBe(true);
    expect(result.message).toBe(longMessage);
  });

  test('deve funcionar com caracteres especiais e emojis', () => {
    const message = 'Olá! 👋 Testando caracteres especiais: áéíóú ñ 中文 🔐🌍';

    const messagePackage = alice.sendSecureMessage(message, bob);
    const result = bob.receiveSecureMessage(messagePackage);

    expect(result.success).toBe(true);
    expect(result.message).toBe(message);
  });

  test('Bob pode responder para Alice', () => {
    const messageAliceToBob = 'Olá Bob!';
    const messageBobToAlice = 'Olá Alice, recebi sua mensagem!';

    // Alice → Bob
    const package1 = alice.sendSecureMessage(messageAliceToBob, bob);
    const result1 = bob.receiveSecureMessage(package1);

    expect(result1.success).toBe(true);
    expect(result1.message).toBe(messageAliceToBob);

    // Bob → Alice
    const package2 = bob.sendSecureMessage(messageBobToAlice, alice);
    const result2 = alice.receiveSecureMessage(package2);

    expect(result2.success).toBe(true);
    expect(result2.message).toBe(messageBobToAlice);
  });

  test('deve falhar se Alice não tiver certificado', () => {
    const aliceWithoutCert = new User('Alice Without Cert');
    const message = 'Mensagem';

    expect(() => aliceWithoutCert.sendSecureMessage(message, bob)).toThrow('Usuário não possui certificado');
  });

  test('deve falhar se Bob não tiver certificado', () => {
    const bobWithoutCert = new User('Bob Without Cert');
    const message = 'Mensagem';

    expect(() => alice.sendSecureMessage(message, bobWithoutCert)).toThrow('Destinatário não possui certificado');
  });

  test('deve detectar certificado expirado', () => {
    // Cria certificado que expira em 0 dias (já expirado)
    const expiredCert = ca.issueCertificate('Charlie', alice.publicKey, -1);
    const charlie = new User('Charlie');
    charlie.setCertificate(expiredCert);

    const message = 'Mensagem com certificado expirado';
    const messagePackage = charlie.sendSecureMessage(message, bob);

    const result = bob.receiveSecureMessage(messagePackage);

    expect(result.success).toBe(false);
    expect(result.validations.certificateValid).toBe(false);
    expect(result.errors).toContain('Certificado expirado');
  });

  test('pacotes de mensagens diferentes devem ter timestamps diferentes', (done) => {
    const message = 'Teste timestamp';
    const package1 = alice.sendSecureMessage(message, bob);

    setTimeout(() => {
      const package2 = alice.sendSecureMessage(message, bob);
      expect(package1.timestamp).not.toBe(package2.timestamp);
      done();
    }, 10);
  });
});
