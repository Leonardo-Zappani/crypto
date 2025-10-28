/**
 * Testes para o módulo de Criptografia Assimétrica (RSA)
 */

const { generateKeyPair, encrypt, decrypt, KEY_SIZE } = require('../src/crypto/asymmetric');

describe('Módulo Criptografia Assimétrica (RSA)', () => {
  test('deve gerar par de chaves RSA', () => {
    const { publicKey, privateKey } = generateKeyPair();

    expect(typeof publicKey).toBe('string');
    expect(typeof privateKey).toBe('string');
    expect(publicKey).toContain('BEGIN PUBLIC KEY');
    expect(privateKey).toContain('BEGIN PRIVATE KEY');
  });

  test('deve gerar pares de chaves diferentes a cada chamada', () => {
    const keys1 = generateKeyPair();
    const keys2 = generateKeyPair();

    expect(keys1.publicKey).not.toBe(keys2.publicKey);
    expect(keys1.privateKey).not.toBe(keys2.privateKey);
  });

  test('deve criptografar dados com chave pública', () => {
    const { publicKey } = generateKeyPair();
    const data = 'Dados secretos';

    const encrypted = encrypt(data, publicKey);

    expect(encrypted).toBeInstanceOf(Buffer);
    expect(encrypted.toString()).not.toBe(data);
  });

  test('deve descriptografar dados com chave privada', () => {
    const { publicKey, privateKey } = generateKeyPair();
    const data = 'Mensagem criptografada com RSA';

    const encrypted = encrypt(data, publicKey);
    const decrypted = decrypt(encrypted, privateKey);

    expect(decrypted.toString('utf8')).toBe(data);
  });

  test('deve criptografar Buffer', () => {
    const { publicKey, privateKey } = generateKeyPair();
    const data = Buffer.from('Dados em buffer');

    const encrypted = encrypt(data, publicKey);
    const decrypted = decrypt(encrypted, privateKey);

    expect(decrypted).toEqual(data);
  });

  test('não deve conseguir descriptografar com chave privada errada', () => {
    const keys1 = generateKeyPair();
    const keys2 = generateKeyPair();
    const data = 'Dados secretos';

    const encrypted = encrypt(data, keys1.publicKey);

    expect(() => decrypt(encrypted, keys2.privateKey)).toThrow();
  });

  test('criptografias devem produzir resultados diferentes (padding aleatório)', () => {
    const { publicKey } = generateKeyPair();
    const data = 'Mesma mensagem';

    const encrypted1 = encrypt(data, publicKey);
    const encrypted2 = encrypt(data, publicKey);

    // RSA com OAEP padding usa randomização
    expect(encrypted1).not.toEqual(encrypted2);
  });

  test('deve criptografar dados pequenos corretamente', () => {
    const { publicKey, privateKey } = generateKeyPair();
    const data = 'A';

    const encrypted = encrypt(data, publicKey);
    const decrypted = decrypt(encrypted, privateKey);

    expect(decrypted.toString('utf8')).toBe(data);
  });
});
