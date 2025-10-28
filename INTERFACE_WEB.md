# 🌐 Guia da Interface Web

## Como Usar a Interface

### 1. Iniciar o Servidor

```bash
npm run web
```

Acesse: **http://localhost:3000**

### 2. Layout da Interface

A interface é dividida em 3 seções principais:

#### **Painéis Superiores** (Alice e Bob lado a lado)
- **Alice (Esquerda)**: Remetente com painel azul
- **Bob (Direita)**: Destinatário com painel rosa
- Cada painel contém:
  - Área de texto para mensagem
  - Botões de ação
  - Status da operação

#### **Validações de Segurança** (Centro)
Aparece após receber mensagem mostrando:
- ✓ Certificado Digital válido
- ✓ Assinatura Digital válida
- ✓ Integridade (Hash) verificada

#### **Logs de Comunicação** (Inferior)
Mostra em tempo real:
- Cada etapa do processo de criptografia
- Validações de segurança
- Detecção de adulterações
- Logs coloridos por tipo de operação

### 3. Fluxo Básico de Comunicação

#### **Alice envia para Bob:**

1. Digite uma mensagem no campo de Alice
2. Clique em **"📤 Enviar para Bob"**
3. Observe os logs mostrando:
   - Hash SHA-256 calculado
   - Chave AES-256 gerada
   - Mensagem criptografada
   - Chave protegida com RSA
   - Assinatura digital criada
4. Botão **"📨 Receber Mensagem"** de Bob fica habilitado
5. Clique em **"📨 Receber Mensagem"** no painel de Bob
6. Veja as validações de segurança aparecerem
7. Status de Bob mostra a mensagem descriptografada

#### **Bob responde para Alice:**

1. Digite a resposta no campo de Bob
2. Clique em **"📥 Bob Responde"**
3. Sistema automaticamente processa envio e recebimento
4. Alice recebe a resposta

### 4. Simular Ataque (Adulteração)

1. Alice envia mensagem para Bob
2. **ANTES** de Bob receber, clique em **"⚠️ Simular Ataque"**
3. Sistema adultera o ciphertext
4. Bob tenta receber a mensagem adulterada
5. Observe que as validações **FALHAM**:
   - ✗ Assinatura Digital inválida
   - Mensagem é rejeitada
   - Logs mostram detecção de adulteração

### 5. Recursos Adicionais

- **Limpar Logs**: Remove todos os logs e inicia nova sessão
- **Reiniciar Sistema**: Gera novas chaves RSA e certificados para Alice e Bob

## 🎨 Cores dos Logs

- **Azul** 🔵: Operações criptográficas (AES, RSA, Hash)
- **Amarelo** 🟡: Validações em andamento
- **Verde** 🟢: Sucesso / Validação aprovada
- **Vermelho** 🔴: Erro / Ataque detectado
- **Cinza** ⚪: Informações gerais

## 💡 Dicas para Apresentação

1. **Demonstração Normal**
   - Mostre o fluxo completo Alice → Bob
   - Destaque cada etapa nos logs
   - Aponte as validações verdes

2. **Demonstração de Segurança**
   - Mostre o ataque de adulteração
   - Explique como a assinatura detecta
   - Mostre que a mensagem é rejeitada

3. **Comunicação Bidirecional**
   - Alice envia para Bob
   - Bob responde para Alice
   - Mostre que funciona nos dois sentidos

4. **Conceitos Demonstrados**
   - **Confidencialidade**: Ninguém lê a mensagem (AES)
   - **Integridade**: Detecta alterações (Hash)
   - **Autenticidade**: Prova quem enviou (Assinatura)
   - **Não-repúdio**: Remetente não pode negar (Certificado)

## 🚀 Mensagens de Exemplo

Para tornar a demonstração mais interessante:

```
"Olá Bob! Confirmando a reunião às 15h. Senha do cofre: 1234-5678 🔐"
```

```
"Alice, dados bancários recebidos com segurança. Transação autorizada! ✓"
```

```
"Informações confidenciais do projeto X anexadas. TOP SECRET! 🔒"
```

## 🔧 Solução de Problemas

- **Porta já em uso**: Mude a porta no arquivo `src/web/server.js` (linha `const PORT = 3000`)
- **Botões desabilitados**: Clique em "Reiniciar Sistema"
- **Logs muito longos**: Use "Limpar Logs" para limpar

## 📱 Responsividade

A interface é responsiva e funciona em:
- 💻 Desktop (melhor experiência)
- 📱 Tablet (painéis empilham verticalmente)
- 📱 Mobile (funcional mas recomenda-se desktop)
