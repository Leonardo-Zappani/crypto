/**
 * Servidor Web para Interface de Demonstração
 * Sistema de Comunicação Segura - Alice e Bob
 */

const express = require('express');
const path = require('path');
const User = require('../users/user');
const { CertificateAuthority } = require('../crypto/certificate');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa CA e usuários
let ca, alice, bob;

function initializeSystem() {
  // Criar CA
  ca = new CertificateAuthority('Academic CA');

  // Criar Alice e Bob
  alice = new User('Alice');
  bob = new User('Bob');

  // Emitir certificados
  const aliceCert = ca.issueCertificate('Alice', alice.publicKey);
  const bobCert = ca.issueCertificate('Bob', bob.publicKey);

  alice.setCertificate(aliceCert);
  bob.setCertificate(bobCert);

  console.log('✓ Sistema inicializado: CA, Alice e Bob prontos');
}

// Inicializa ao startar
initializeSystem();

// Endpoint: Reiniciar sistema
app.post('/api/reset', (req, res) => {
  try {
    initializeSystem();
    res.json({
      success: true,
      message: 'Sistema reiniciado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint: Alice envia mensagem para Bob
app.post('/api/send-message', (req, res) => {
  try {
    const { message, sender, recipient } = req.body;

    let senderUser, recipientUser;

    // Determina quem envia e quem recebe
    if (sender === 'Alice' && recipient === 'Bob') {
      senderUser = alice;
      recipientUser = bob;
    } else if (sender === 'Bob' && recipient === 'Alice') {
      senderUser = bob;
      recipientUser = alice;
    } else {
      throw new Error('Remetente ou destinatário inválido');
    }

    // Cria logs detalhados do processo
    const logs = [];

    logs.push({
      step: 1,
      action: 'Iniciando processo de envio',
      description: `${sender} está preparando mensagem para ${recipient}`,
      type: 'info'
    });

    logs.push({
      step: 2,
      action: 'Hash SHA-256 calculado',
      description: 'Hash da mensagem original gerado para verificação de integridade',
      type: 'crypto'
    });

    logs.push({
      step: 3,
      action: 'Chave simétrica AES-256 gerada',
      description: 'Chave aleatória de 256 bits criada para criptografar a mensagem',
      type: 'crypto'
    });

    logs.push({
      step: 4,
      action: 'Mensagem criptografada com AES-256-CBC',
      description: 'Texto original transformado em ciphertext usando chave simétrica',
      type: 'crypto'
    });

    logs.push({
      step: 5,
      action: 'Chave simétrica criptografada com RSA',
      description: `Chave AES protegida com chave pública de ${recipient}`,
      type: 'crypto'
    });

    logs.push({
      step: 6,
      action: 'Assinatura digital criada',
      description: `${sender} assinou o ciphertext com sua chave privada`,
      type: 'crypto'
    });

    // Envia a mensagem
    const messagePackage = senderUser.sendSecureMessage(message, recipientUser);

    // ===== CONSOLE LOG DETALHADO DO PACOTE =====
    console.log('\n' + '='.repeat(80));
    console.log(`📤 ${sender} → ${recipient} | Pacote Criptografado Criado`);
    console.log('='.repeat(80));
    console.log(`📝 Mensagem Original: "${message}"`);
    console.log('\n🔐 COMPONENTES DO PACOTE CRIPTOGRAFADO:');
    console.log('─'.repeat(80));

    console.log('\n1️⃣  CIPHERTEXT (Mensagem Criptografada com AES-256-CBC):');
    console.log(`   Tamanho: ${messagePackage.ciphertext.length} caracteres (base64)`);
    console.log(`   Primeiros 100 chars: ${messagePackage.ciphertext.substring(0, 100)}...`);

    console.log('\n2️⃣  IV (Initialization Vector):');
    console.log(`   Tamanho: ${messagePackage.iv.length} caracteres (base64)`);
    console.log(`   Valor: ${messagePackage.iv}`);

    console.log('\n3️⃣  CHAVE SIMÉTRICA CRIPTOGRAFADA (com RSA):');
    console.log(`   Tamanho: ${messagePackage.encryptedSymmetricKey.length} caracteres (base64)`);
    console.log(`   Primeiros 100 chars: ${messagePackage.encryptedSymmetricKey.substring(0, 100)}...`);

    console.log('\n4️⃣  ASSINATURA DIGITAL (RSA + SHA-256):');
    console.log(`   Tamanho: ${messagePackage.signature.length} caracteres (base64)`);
    console.log(`   Primeiros 100 chars: ${messagePackage.signature.substring(0, 100)}...`);

    console.log('\n5️⃣  HASH SHA-256 (Integridade):');
    console.log(`   Tamanho: ${messagePackage.messageHash.length} caracteres (base64)`);
    console.log(`   Valor: ${messagePackage.messageHash}`);

    console.log('\n6️⃣  CERTIFICADO DIGITAL (Remetente):');
    console.log(`   Titular: ${messagePackage.senderCertificate.subject}`);
    console.log(`   Emissor: ${messagePackage.senderCertificate.issuer}`);
    console.log(`   Serial: ${messagePackage.senderCertificate.serialNumber}`);
    console.log(`   Validade: ${messagePackage.senderCertificate.issuedAt} até ${messagePackage.senderCertificate.expiresAt}`);

    console.log('\n📊 METADADOS:');
    console.log(`   De: ${messagePackage.from}`);
    console.log(`   Para: ${messagePackage.to}`);
    console.log(`   Timestamp: ${messagePackage.timestamp}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Pacote pronto para transmissão segura!');
    console.log('='.repeat(80) + '\n');

    logs.push({
      step: 7,
      action: 'Pacote de mensagem criado',
      description: 'Todos os componentes empacotados juntos',
      type: 'success'
    });

    res.json({
      success: true,
      messagePackage,
      logs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint: Receber e descriptografar mensagem
app.post('/api/receive-message', (req, res) => {
  try {
    const { messagePackage, recipient } = req.body;

    let recipientUser;

    // Determina quem recebe
    if (recipient === 'Bob') {
      recipientUser = bob;
    } else if (recipient === 'Alice') {
      recipientUser = alice;
    } else {
      throw new Error('Destinatário inválido');
    }

    // Cria logs detalhados do processo de recebimento
    const logs = [];

    logs.push({
      step: 1,
      action: 'Mensagem recebida',
      description: `${recipient} recebeu pacote criptografado`,
      type: 'info'
    });

    logs.push({
      step: 2,
      action: 'Validando certificado digital',
      description: 'Verificando assinatura, expiração e emissor do certificado',
      type: 'validation'
    });

    // ===== CONSOLE LOG DO RECEBIMENTO =====
    console.log('\n' + '='.repeat(80));
    console.log(`📨 ${recipient} | Recebendo e Descriptografando Mensagem`);
    console.log('='.repeat(80));
    console.log(`📦 Pacote recebido de: ${messagePackage.from}`);
    console.log(`⏰ Timestamp: ${messagePackage.timestamp}`);

    // Recebe e descriptografa
    const result = recipientUser.receiveSecureMessage(messagePackage);

    console.log('\n🔍 PROCESSO DE VALIDAÇÃO E DESCRIPTOGRAFIA:');
    console.log('─'.repeat(80));

    console.log('\n1️⃣  VALIDAÇÃO DO CERTIFICADO DIGITAL:');
    console.log(`   Status: ${result.validations.certificateValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
    if (result.validations.certificateValid) {
      console.log(`   Titular: ${messagePackage.senderCertificate.subject}`);
      console.log(`   Emissor: ${messagePackage.senderCertificate.issuer}`);
      console.log(`   ✓ Assinatura da CA verificada`);
      console.log(`   ✓ Certificado não expirado`);
    } else {
      console.log(`   ✗ Erro: ${result.errors.join(', ')}`);
    }

    console.log('\n2️⃣  VALIDAÇÃO DA ASSINATURA DIGITAL:');
    console.log(`   Status: ${result.validations.signatureValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
    if (result.validations.signatureValid) {
      console.log(`   ✓ Assinatura verificada com chave pública de ${messagePackage.from}`);
      console.log(`   ✓ Remetente autenticado`);
      console.log(`   ✓ Ciphertext não foi adulterado`);
    } else {
      console.log(`   ✗ Assinatura não corresponde ao ciphertext`);
      console.log(`   ✗ Possível adulteração ou remetente falso`);
    }

    if (result.success) {
      console.log('\n3️⃣  DESCRIPTOGRAFIA DA CHAVE SIMÉTRICA:');
      console.log(`   ✓ ${recipient} usou chave privada RSA para descriptografar`);
      console.log(`   ✓ Chave AES-256 recuperada com sucesso`);

      console.log('\n4️⃣  DESCRIPTOGRAFIA DA MENSAGEM:');
      console.log(`   ✓ Usando chave AES-256 + IV para descriptografar`);
      console.log(`   ✓ Ciphertext convertido para texto original`);

      console.log('\n5️⃣  VERIFICAÇÃO DE INTEGRIDADE (Hash SHA-256):');
      console.log(`   Status: ${result.validations.integrityValid ? '✅ ÍNTEGRA' : '❌ CORROMPIDA'}`);
      if (result.validations.integrityValid) {
        console.log(`   ✓ Hash SHA-256 calculado corresponde ao hash original`);
        console.log(`   ✓ Mensagem não foi alterada durante transmissão`);
      } else {
        console.log(`   ✗ Hash não corresponde - mensagem foi modificada`);
      }

      console.log('\n📝 MENSAGEM DESCRIPTOGRAFADA:');
      console.log(`   "${result.message}"`);

      console.log('\n' + '='.repeat(80));
      console.log('✅ Mensagem recebida e validada com SUCESSO!');
      console.log('='.repeat(80) + '\n');
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('❌ FALHA NA VALIDAÇÃO - Mensagem REJEITADA!');
      console.log(`   Erros: ${result.errors.join(', ')}`);
      console.log('='.repeat(80) + '\n');
    }

    if (result.validations.certificateValid) {
      logs.push({
        step: 3,
        action: '✓ Certificado válido',
        description: 'Certificado verificado com sucesso',
        type: 'success'
      });
    } else {
      logs.push({
        step: 3,
        action: '✗ Certificado inválido',
        description: result.errors.join(', '),
        type: 'error'
      });
    }

    logs.push({
      step: 4,
      action: 'Verificando assinatura digital',
      description: 'Validando autenticidade com chave pública do remetente',
      type: 'validation'
    });

    if (result.validations.signatureValid) {
      logs.push({
        step: 5,
        action: '✓ Assinatura válida',
        description: 'Mensagem autenticada com sucesso',
        type: 'success'
      });
    } else {
      logs.push({
        step: 5,
        action: '✗ Assinatura inválida',
        description: 'Possível adulteração detectada',
        type: 'error'
      });
    }

    if (result.success) {
      logs.push({
        step: 6,
        action: 'Descriptografando chave simétrica',
        description: `${recipient} usou sua chave privada RSA para recuperar chave AES`,
        type: 'crypto'
      });

      logs.push({
        step: 7,
        action: 'Descriptografando mensagem',
        description: 'Usando chave AES para recuperar texto original',
        type: 'crypto'
      });

      logs.push({
        step: 8,
        action: 'Verificando integridade',
        description: 'Comparando hash SHA-256 da mensagem',
        type: 'validation'
      });

      if (result.validations.integrityValid) {
        logs.push({
          step: 9,
          action: '✓ Integridade verificada',
          description: 'Hash corresponde - mensagem íntegra',
          type: 'success'
        });
      }

      logs.push({
        step: 10,
        action: '✓ MENSAGEM DESCRIPTOGRAFADA COM SUCESSO',
        description: 'Todas as validações passaram',
        type: 'success'
      });
    }

    res.json({
      success: result.success,
      message: result.message,
      validations: result.validations,
      errors: result.errors,
      logs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint: Simular ataque (adulteração)
app.post('/api/tamper-message', (req, res) => {
  try {
    const { messagePackage } = req.body;

    // ===== CONSOLE LOG DO ATAQUE =====
    console.log('\n' + '⚠'.repeat(80));
    console.log('⚠️  SIMULAÇÃO DE ATAQUE - ADULTERAÇÃO DE MENSAGEM');
    console.log('⚠'.repeat(80));
    console.log('🎭 Cenário: Atacante intercepta e modifica o ciphertext');
    console.log('🔍 Objetivo: Demonstrar que a segurança detecta adulteração\n');

    console.log('📦 CIPHERTEXT ORIGINAL:');
    console.log(`   Tamanho: ${messagePackage.ciphertext.length} chars`);
    console.log(`   Primeiros 80 chars: ${messagePackage.ciphertext.substring(0, 80)}...`);
    console.log(`   Assinatura digital: ${messagePackage.signature.substring(0, 60)}...`);

    // Adultera o ciphertext
    const tamperedPackage = { ...messagePackage };
    const originalCiphertext = tamperedPackage.ciphertext;
    tamperedPackage.ciphertext = Buffer.from('MENSAGEM ADULTERADA').toString('base64');

    console.log('\n💀 CIPHERTEXT ADULTERADO:');
    console.log(`   Tamanho: ${tamperedPackage.ciphertext.length} chars`);
    console.log(`   Novo valor: ${tamperedPackage.ciphertext}`);
    console.log(`   Assinatura (não modificada): ${tamperedPackage.signature.substring(0, 60)}...`);

    console.log('\n⚠️  IMPACTO:');
    console.log('   ✗ Ciphertext foi modificado');
    console.log('   ✗ Assinatura digital NÃO corresponde mais ao novo ciphertext');
    console.log('   ✗ Validação de assinatura FALHARÁ');
    console.log('   ✗ Mensagem será REJEITADA pelo destinatário');

    console.log('\n' + '⚠'.repeat(80));
    console.log('🔐 Sistema de segurança detectará a adulteração!');
    console.log('⚠'.repeat(80) + '\n');

    res.json({
      success: true,
      tamperedPackage,
      warning: 'Mensagem foi adulterada intencionalmente para demonstração'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('INTERFACE WEB - SISTEMA DE COMUNICAÇÃO SEGURA');
  console.log('='.repeat(70));
  console.log(`\n✓ Servidor rodando em: http://localhost:${PORT}`);
  console.log('✓ Abra o navegador para acessar a interface\n');
  console.log('='.repeat(70));
});
