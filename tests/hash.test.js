/**
 * Testes para o módulo Hash (SHA-256)
 */

const { createHash, createHashHex, verifyHash } = require('../src/crypto/hash');

describe('Módulo Hash (SHA-256)', () => {
  test('deve criar hash de uma string', () => {
    const content = 'Hello World';
    const hash = createHash(content);

    expect(hash).toBeInstanceOf(Buffer);
    expect(hash.length).toBe(32); // SHA-256 sempre tem 32 bytes
  });

  test('deve criar hash hexadecimal de uma string', () => {
    const content = 'Hello World';
    const hash = createHashHex(content);

    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // 32 bytes = 64 caracteres hex
  });

  test('deve criar o mesmo hash para o mesmo conteúdo', () => {
    const content = 'Mensagem de teste';
    const hash1 = createHashHex(content);
    const hash2 = createHashHex(content);

    expect(hash1).toBe(hash2);
  });

  test('deve criar hashes diferentes para conteúdos diferentes', () => {
    const hash1 = createHashHex('Mensagem 1');
    const hash2 = createHashHex('Mensagem 2');

    expect(hash1).not.toBe(hash2);
  });

  test('deve verificar hash corretamente (válido)', () => {
    const content = 'Conteúdo original';
    const hash = createHash(content);

    expect(verifyHash(content, hash)).toBe(true);
  });

  test('deve detectar hash inválido', () => {
    const content = 'Conteúdo original';
    const wrongContent = 'Conteúdo adulterado';
    const hash = createHash(content);

    expect(verifyHash(wrongContent, hash)).toBe(false);
  });

  test('deve verificar hash em formato hexadecimal', () => {
    const content = 'Teste hex';
    const hash = createHashHex(content);

    expect(verifyHash(content, hash)).toBe(true);
  });
});
