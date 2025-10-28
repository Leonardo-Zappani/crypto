# Sistema de Comunicação Segura entre Usuários

## 📋 Sobre o Projeto

Trabalho Prático 1 - Implementação de um sistema que demonstra a comunicação segura entre dois usuários (Alice e Bob), utilizando técnicas modernas de criptografia e autenticação.

Este projeto é uma prova de conceito educacional que implementa todos os fundamentos de segurança da informação necessários para garantir **confidencialidade**, **integridade** e **autenticidade** nas comunicações digitais.

## 🎯 Objetivos

Demonstrar na prática os seguintes conceitos de segurança:

- ✅ **Hash (SHA-256)**: Verificação de integridade da mensagem
- ✅ **Criptografia Simétrica (AES-256)**: Proteção do conteúdo da mensagem
- ✅ **Criptografia Assimétrica (RSA-2048)**: Troca segura da chave simétrica
- ✅ **Assinatura Digital**: Autenticação do remetente
- ✅ **Certificado Digital**: Validação da identidade do remetente

## 🏗️ Arquitetura do Sistema

### Fluxo de Comunicação

```
Alice quer enviar mensagem para Bob:

1. Alice cria mensagem em texto plano
2. Alice gera chave simétrica aleatória (AES-256)
3. Alice criptografa mensagem com chave simétrica → ciphertext
4. Alice criptografa chave simétrica com chave pública de Bob (RSA) → encrypted_key
5. Alice assina o ciphertext com sua chave privada → signature
6. Alice calcula hash SHA-256 da mensagem original → hash
7. Alice envia: {ciphertext, encrypted_key, signature, hash, certificado}

Bob recebe e valida:

1. Bob valida certificado de Alice (assinatura, expiração, emissor)
2. Bob verifica assinatura do ciphertext usando chave pública de Alice
3. Bob descriptografa chave simétrica usando sua chave privada → symmetric_key
4. Bob descriptografa mensagem usando chave simétrica → plaintext
5. Bob verifica integridade comparando hash SHA-256
6. ✓ Mensagem recebida com segurança!
```

## 📁 Estrutura do Projeto

```
message-cryptography/
├── src/
│   ├── crypto/
│   │   ├── hash.js                 # SHA-256: Hashing e verificação
│   │   ├── symmetric.js            # AES-256-CBC: Criptografia simétrica
│   │   ├── asymmetric.js           # RSA-2048: Criptografia assimétrica
│   │   ├── digital-signature.js    # Assinatura e verificação digital
│   │   └── certificate.js          # Certificado digital simulado
│   ├── users/
│   │   └── user.js                 # Classe User (Alice/Bob)
│   ├── web/
│   │   ├── server.js               # Servidor Express
│   │   └── public/
│   │       ├── index.html          # Interface web
│   │       ├── style.css           # Estilos
│   │       └── app.js              # Lógica frontend
│   └── index.js                    # Script de demonstração CLI
├── tests/
│   ├── hash.test.js
│   ├── symmetric.test.js
│   ├── asymmetric.test.js
│   ├── digital-signature.test.js
│   ├── certificate.test.js
│   └── integration.test.js         # Teste completo Alice → Bob
└── package.json
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 14+ instalado

### Instalação

```bash
# Instalar dependências
npm install
```

### 🌐 Interface Web (RECOMENDADO)

A melhor forma de visualizar o sistema é através da interface web interativa!

```bash
# Executar interface web
npm run web
```

Acesse no navegador: **http://localhost:3000**

**Funcionalidades da Interface:**
- 👥 Painéis lado a lado para Alice e Bob
- 📤 Enviar mensagens criptografadas
- 📨 Receber e descriptografar mensagens
- ⚠️ Simular ataques de adulteração
- 🔍 Validações de segurança em tempo real
- 📋 Logs detalhados de cada etapa do processo
- ✅ Visualização clara de todas as operações criptográficas

### 💻 Demonstração CLI

```bash
# Executar script de demonstração em linha de comando
npm start
```

Saída esperada:
- Criação da Autoridade Certificadora (CA)
- Geração de chaves RSA para Alice e Bob
- Emissão de certificados digitais
- Alice enviando mensagem criptografada
- Bob recebendo e validando mensagem
- Teste de detecção de adulteração

### 🧪 Executar Testes

```bash
# Executar todos os testes unitários
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 🔬 Resultados dos Testes

O projeto possui **53 testes unitários e de integração** que validam:

### Testes por Módulo

1. **Hash (SHA-256)** - 7 testes
   - Criação de hash
   - Verificação de integridade
   - Detecção de adulteração

2. **Criptografia Simétrica (AES-256)** - 9 testes
   - Geração de chaves
   - Criptografia/descriptografia
   - Validação de IVs únicos
   - Tratamento de erros

3. **Criptografia Assimétrica (RSA)** - 8 testes
   - Geração de pares de chaves
   - Criptografia com chave pública
   - Descriptografia com chave privada
   - Validação de padding OAEP

4. **Assinatura Digital** - 8 testes
   - Criação de assinaturas
   - Verificação de autenticidade
   - Detecção de adulteração
   - Validação de chaves

5. **Certificado Digital** - 9 testes
   - Emissão de certificados
   - Validação de assinaturas
   - Verificação de expiração
   - Serialização JSON

6. **Integração Completa** - 12 testes
   - Comunicação Alice → Bob
   - Validação end-to-end
   - Testes de segurança
   - Detecção de ataques

## ✅ Resultados Esperados

### Cenário 1: Comunicação Normal

✓ Mensagem é criptografada corretamente
✓ Certificado é validado
✓ Assinatura digital é verificada
✓ Integridade é confirmada
✓ Mensagem é descriptografada com sucesso

### Cenário 2: Tentativa de Adulteração

✗ Sistema detecta assinatura inválida
✗ Sistema rejeita mensagem adulterada
✗ Integridade falha na verificação
✗ Certificado corrompido é rejeitado

## 🔐 Tecnologias e Algoritmos

### Módulo Crypto do Node.js

Todos os algoritmos utilizam o módulo `crypto` nativo do Node.js, garantindo implementações testadas e seguras:

| Conceito | Algoritmo | Uso |
|----------|-----------|-----|
| Hash | SHA-256 | Verificação de integridade |
| Cifragem Simétrica | AES-256-CBC | Criptografia da mensagem |
| Cifragem Assimétrica | RSA-2048 OAEP | Troca da chave simétrica |
| Assinatura | RSA + SHA-256 | Autenticação do remetente |
| Certificado | JSON + RSA | Validação de identidade |

### Parâmetros de Segurança

- **Chave AES**: 256 bits (32 bytes)
- **IV (Initialization Vector)**: 128 bits (16 bytes)
- **Chave RSA**: 2048 bits
- **Padding RSA**: OAEP com SHA-256
- **Hash**: SHA-256 (256 bits)

## 📚 Fundamentação Teórica

### 1. Hash (SHA-256)

Função criptográfica de mão única que gera uma "impressão digital" da mensagem. Qualquer alteração no conteúdo resulta em hash completamente diferente.

**Propriedades:**
- Determinístico (mesma entrada = mesmo hash)
- Resistente a colisões
- Não reversível
- Efeito avalanche

### 2. Criptografia Simétrica (AES-256)

Algoritmo de cifragem que usa a mesma chave para criptografar e descriptografar. Muito rápido e eficiente para grandes volumes de dados.

**Vantagens:**
- Alta performance
- Segurança comprovada
- Padrão da indústria

### 3. Criptografia Assimétrica (RSA-2048)

Utiliza par de chaves (pública/privada). O que uma criptografa, apenas a outra descriptografa. Usada para trocar a chave simétrica de forma segura.

**Características:**
- Chave pública pode ser compartilhada
- Chave privada deve ser mantida em segredo
- Mais lenta que simétrica (por isso híbrida)

### 4. Assinatura Digital

Prova matemática de autenticidade. Remetente assina com chave privada, destinatário verifica com chave pública.

**Garante:**
- Autenticação (quem enviou)
- Não-repúdio (não pode negar)
- Integridade (não foi alterado)

### 5. Certificado Digital

Documento eletrônico que vincula uma chave pública a uma identidade. Assinado por uma Autoridade Certificadora (CA) confiável.

**Contém:**
- Identidade do titular
- Chave pública
- Emissor (CA)
- Validade
- Assinatura digital da CA

## 🛡️ Demonstração de Segurança

O sistema demonstra defesa contra:

### Ataques Detectados

1. **Man-in-the-Middle**: Assinatura digital detecta alteração
2. **Replay Attack**: Timestamp na mensagem
3. **Spoofing**: Certificado valida identidade
4. **Tampering**: Hash detecta qualquer modificação
5. **Key Interception**: RSA protege troca de chaves

## 🧪 Execução dos Testes

```bash
$ npm test

PASS tests/hash.test.js
PASS tests/symmetric.test.js
PASS tests/digital-signature.test.js
PASS tests/asymmetric.test.js
PASS tests/certificate.test.js
PASS tests/integration.test.js

Test Suites: 6 passed, 6 total
Tests:       53 passed, 53 total
```

## 📖 Exemplo de Uso

```javascript
const User = require('./src/users/user');
const { CertificateAuthority } = require('./src/crypto/certificate');

// 1. Criar CA
const ca = new CertificateAuthority('Academic CA');

// 2. Criar usuários
const alice = new User('Alice');
const bob = new User('Bob');

// 3. Emitir certificados
alice.setCertificate(ca.issueCertificate('Alice', alice.publicKey));
bob.setCertificate(ca.issueCertificate('Bob', bob.publicKey));

// 4. Alice envia mensagem
const message = 'Mensagem secreta!';
const package = alice.sendSecureMessage(message, bob);

// 5. Bob recebe mensagem
const result = bob.receiveSecureMessage(package);

console.log(result.message); // 'Mensagem secreta!'
console.log(result.validations); // Todas as validações passam
```

## 👥 Autores

Trabalho Prático - Segurança da Informação

## 📝 Licença

ISC - Projeto educacional

## 🎓 Conclusão

Este projeto demonstra com sucesso a implementação de um sistema de comunicação segura, integrando todos os conceitos fundamentais de criptografia moderna:

- ✅ Confidencialidade através de AES-256
- ✅ Integridade através de SHA-256
- ✅ Autenticidade através de assinaturas digitais
- ✅ Não-repúdio através de certificados digitais
- ✅ Segurança na troca de chaves através de RSA

O sistema é capaz de detectar e rejeitar tentativas de adulteração, garantindo a segurança, integridade e autenticidade das comunicações conforme especificado nos requisitos do trabalho.
