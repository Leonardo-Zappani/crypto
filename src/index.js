/**
 * Demonstração do Sistema de Comunicação Segura
 * Alice envia uma mensagem criptografada para Bob
 */

const User = require('./users/user');
const { CertificateAuthority } = require('./crypto/certificate');

console.log('='.repeat(70));
console.log('SISTEMA DE COMUNICAÇÃO SEGURA - TRABALHO PRÁTICO');
console.log('='.repeat(70));
console.log();

// 1. Criar a Autoridade Certificadora (CA)
console.log('1. Criando Autoridade Certificadora (CA)...');
const ca = new CertificateAuthority('Academic CA');
console.log('   ✓ CA criada com sucesso');
console.log();

// 2. Criar usuários Alice e Bob
console.log('2. Criando usuários Alice e Bob...');
const alice = new User('Alice');
const bob = new User('Bob');
console.log('   ✓ Alice criada com par de chaves RSA');
console.log('   ✓ Bob criado com par de chaves RSA');
console.log();

// 3. Emitir certificados para Alice e Bob
console.log('3. Emitindo certificados digitais...');
const aliceCertificate = ca.issueCertificate('Alice', alice.publicKey);
const bobCertificate = ca.issueCertificate('Bob', bob.publicKey);
alice.setCertificate(aliceCertificate);
bob.setCertificate(bobCertificate);
console.log('   ✓ Certificado emitido para Alice');
console.log('   ✓ Certificado emitido para Bob');
console.log();

// 4. Alice envia mensagem para Bob
console.log('4. Alice preparando mensagem para Bob...');
const originalMessage = 'Olá Bob! Esta é uma mensagem secreta e segura. 🔐';
console.log(`   Mensagem original: "${originalMessage}"`);
console.log();

console.log('5. Criptografando mensagem...');
const messagePackage = alice.sendSecureMessage(originalMessage, bob);
console.log('   ✓ Hash SHA-256 calculado para integridade');
console.log('   ✓ Chave simétrica AES-256 gerada');
console.log('   ✓ Mensagem criptografada com AES-256-CBC');
console.log('   ✓ Chave simétrica criptografada com RSA (chave pública de Bob)');
console.log('   ✓ Assinatura digital criada com chave privada de Alice');
console.log();

console.log('6. Pacote de mensagem criado:');
console.log(`   De: ${messagePackage.from}`);
console.log(`   Para: ${messagePackage.to}`);
console.log(`   Timestamp: ${messagePackage.timestamp}`);
console.log(`   Tamanho do ciphertext: ${messagePackage.ciphertext.length} bytes`);
console.log();

// 7. Bob recebe e descriptografa a mensagem
console.log('7. Bob recebendo e validando mensagem...');
const result = bob.receiveSecureMessage(messagePackage);

console.log();
console.log('8. Resultados da validação:');
console.log(`   ✓ Certificado válido: ${result.validations.certificateValid ? '✓ SIM' : '✗ NÃO'}`);
console.log(`   ✓ Assinatura válida: ${result.validations.signatureValid ? '✓ SIM' : '✗ NÃO'}`);
console.log(`   ✓ Integridade verificada: ${result.validations.integrityValid ? '✓ SIM' : '✗ NÃO'}`);
console.log();

if (result.success) {
  console.log('9. Mensagem descriptografada com sucesso:');
  console.log(`   "${result.message}"`);
  console.log();
  console.log('✓ COMUNICAÇÃO SEGURA ESTABELECIDA COM SUCESSO!');
  console.log();
  console.log('Conceitos demonstrados:');
  console.log('  • Hash (SHA-256): Verificação de integridade');
  console.log('  • Criptografia Simétrica (AES-256): Proteção do conteúdo');
  console.log('  • Criptografia Assimétrica (RSA): Troca segura da chave');
  console.log('  • Assinatura Digital: Autenticação do remetente');
  console.log('  • Certificado Digital: Validação da identidade');
} else {
  console.log('✗ FALHA NA COMUNICAÇÃO!');
  console.log('Erros:');
  result.errors.forEach(error => console.log(`  • ${error}`));
}

console.log();
console.log('='.repeat(70));
console.log();

// 10. Demonstração de adulteração
console.log('10. TESTE DE SEGURANÇA: Simulando adulteração da mensagem...');
console.log();

const tamperedPackage = { ...messagePackage };
tamperedPackage.ciphertext = Buffer.from('mensagem adulterada').toString('base64');

console.log('    Tentando descriptografar mensagem adulterada...');
const tamperedResult = bob.receiveSecureMessage(tamperedPackage);

console.log();
console.log('    Resultados da validação:');
console.log(`    ✓ Certificado válido: ${tamperedResult.validations.certificateValid ? '✓ SIM' : '✗ NÃO'}`);
console.log(`    ✓ Assinatura válida: ${tamperedResult.validations.signatureValid ? '✗ SIM' : '✓ NÃO (como esperado)'}`);
console.log(`    ✓ Integridade verificada: ${tamperedResult.validations.integrityValid ? '✓ SIM' : '✗ NÃO'}`);
console.log();

if (!tamperedResult.success) {
  console.log('    ✓ SISTEMA DETECTOU ADULTERAÇÃO CORRETAMENTE!');
  console.log('    Erros detectados:');
  tamperedResult.errors.forEach(error => console.log(`      • ${error}`));
} else {
  console.log('    ✗ FALHA: Sistema não detectou adulteração!');
}

console.log();
console.log('='.repeat(70));
console.log('Demonstração concluída!');
console.log('='.repeat(70));
