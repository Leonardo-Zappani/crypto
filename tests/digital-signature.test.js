/**
 * Testes para o módulo de Assinatura Digital
 */

const { sign, verify } = require('../src/crypto/digital-signature');
const { generateKeyPair } = require('../src/crypto/asymmetric');

describe('Módulo Assinatura Digital', () => {
  let publicKey, privateKey;

  beforeAll(() => {
    const keys = generateKeyPair();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  });

  test('deve criar assinatura digital', () => {
    const data = 'Dados para assinar';
    const signature = sign(data, privateKey);

    expect(signature).toBeInstanceOf(Buffer);
    expect(signature.length).toBeGreaterThan(0);
  });

  test('deve verificar assinatura válida', () => {
    const data = 'Mensagem autêntica';
    const signature = sign(data, privateKey);

    const isValid = verify(data, signature, publicKey);

    expect(isValid).toBe(true);
  });

  test('deve rejeitar assinatura inválida (dados adulterados)', () => {
    const originalData = 'Mensagem original';
    const tamperedData = 'Mensagem adulterada';
    const signature = sign(originalData, privateKey);

    const isValid = verify(tamperedData, signature, publicKey);

    expect(isValid).toBe(false);
  });

  test('deve rejeitar assinatura com chave pública errada', () => {
    const data = 'Mensagem assinada';
    const signature = sign(data, privateKey);

    const otherKeys = generateKeyPair();
    const isValid = verify(data, signature, otherKeys.publicKey);

    expect(isValid).toBe(false);
  });

  test('deve criar assinaturas diferentes para dados diferentes', () => {
    const data1 = 'Primeira mensagem';
    const data2 = 'Segunda mensagem';

    const signature1 = sign(data1, privateKey);
    const signature2 = sign(data2, privateKey);

    expect(signature1).not.toEqual(signature2);
  });

  test('deve assinar e verificar Buffers', () => {
    const data = Buffer.from('Dados em buffer');
    const signature = sign(data, privateKey);

    const isValid = verify(data, signature, publicKey);

    expect(isValid).toBe(true);
  });

  test('deve criar mesma assinatura para mesmos dados', () => {
    const data = 'Mesmos dados';

    const signature1 = sign(data, privateKey);
    const signature2 = sign(data, privateKey);

    // Assinatura RSA determinística para mesmos dados
    expect(signature1).toEqual(signature2);
  });

  test('deve detectar assinatura corrompida', () => {
    const data = 'Dados originais';
    const signature = sign(data, privateKey);

    // Corrompe a assinatura
    signature[0] = signature[0] ^ 0xFF;

    const isValid = verify(data, signature, publicKey);

    expect(isValid).toBe(false);
  });
});
