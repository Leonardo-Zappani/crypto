/**
 * Testes para o módulo de Criptografia Simétrica (AES-256)
 */

const { generateKey, encrypt, decrypt, KEY_LENGTH, IV_LENGTH } = require('../src/crypto/symmetric');

describe('Módulo Criptografia Simétrica (AES-256)', () => {
  test('deve gerar chave simétrica de 256 bits', () => {
    const key = generateKey();

    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(KEY_LENGTH);
  });

  test('deve gerar chaves diferentes a cada chamada', () => {
    const key1 = generateKey();
    const key2 = generateKey();

    expect(key1).not.toEqual(key2);
  });

  test('deve criptografar uma mensagem', () => {
    const key = generateKey();
    const plaintext = 'Mensagem secreta';

    const result = encrypt(plaintext, key);

    expect(result).toHaveProperty('ciphertext');
    expect(result).toHaveProperty('iv');
    expect(result.ciphertext).toBeInstanceOf(Buffer);
    expect(result.iv).toBeInstanceOf(Buffer);
    expect(result.iv.length).toBe(IV_LENGTH);
  });

  test('deve descriptografar uma mensagem criptografada', () => {
    const key = generateKey();
    const plaintext = 'Mensagem secreta para criptografar';

    const { ciphertext, iv } = encrypt(plaintext, key);
    const decrypted = decrypt(ciphertext, key, iv);

    expect(decrypted.toString('utf8')).toBe(plaintext);
  });

  test('ciphertext deve ser diferente do plaintext', () => {
    const key = generateKey();
    const plaintext = 'Mensagem em texto claro';

    const { ciphertext } = encrypt(plaintext, key);

    expect(ciphertext.toString()).not.toBe(plaintext);
  });

  test('deve gerar IVs diferentes para cada criptografia', () => {
    const key = generateKey();
    const plaintext = 'Mesma mensagem';

    const result1 = encrypt(plaintext, key);
    const result2 = encrypt(plaintext, key);

    expect(result1.iv).not.toEqual(result2.iv);
    expect(result1.ciphertext).not.toEqual(result2.ciphertext);
  });

  test('deve lançar erro ao tentar criptografar com chave inválida', () => {
    const invalidKey = Buffer.from('chave curta');
    const plaintext = 'Mensagem';

    expect(() => encrypt(plaintext, invalidKey)).toThrow();
  });

  test('deve lançar erro ao tentar descriptografar com chave errada', () => {
    const key1 = generateKey();
    const key2 = generateKey();
    const plaintext = 'Mensagem secreta';

    const { ciphertext, iv } = encrypt(plaintext, key1);

    expect(() => decrypt(ciphertext, key2, iv)).toThrow();
  });

  test('deve produzir resultado incorreto ao descriptografar com IV errado', () => {
    const key = generateKey();
    const plaintext = 'Mensagem secreta';

    const { ciphertext, iv } = encrypt(plaintext, key);
    const wrongIv = Buffer.alloc(IV_LENGTH);

    // Descriptografar com IV errado não lança erro, mas produz resultado errado
    const decrypted = decrypt(ciphertext, key, wrongIv);
    expect(decrypted.toString('utf8')).not.toBe(plaintext);
  });
});
