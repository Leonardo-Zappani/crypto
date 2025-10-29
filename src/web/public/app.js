/**
 * Aplicação Frontend - Sistema de Comunicação Segura
 */

// Estado da aplicação
let currentMessagePackage = null;
let currentRecipient = null;

// Histórico de mensagens
const messageHistory = {
  Alice: [],
  Bob: []
};

// Elementos do DOM
const aliceMessage = document.getElementById('alice-message');
const bobMessage = document.getElementById('bob-message');
const sendAliceToBobBtn = document.getElementById('send-alice-to-bob');
const sendBobToAliceBtn = document.getElementById('send-bob-to-alice');
const clearLogsBtn = document.getElementById('clear-logs');
const resetSystemBtn = document.getElementById('reset-system');
const logsContainer = document.getElementById('logs');
const aliceStatus = document.getElementById('alice-status');
const bobStatus = document.getElementById('bob-status');
const validationsContainer = document.getElementById('validations-container');

// Funções auxiliares
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR');
}

function addLog(message, type = 'info') {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `
        <span class="log-time">${getCurrentTime()}</span>
        <span class="log-message">${message}</span>
    `;
    logsContainer.appendChild(logItem);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function clearLogs() {
    logsContainer.innerHTML = '';
    addLog('Logs limpos. Sistema pronto para nova comunicação.', 'info');
}

function updateStatus(element, message, type) {
    element.textContent = message;
    element.className = `status-box ${type}`;
}

function showValidations(validations) {
    validationsContainer.style.display = 'block';

    const certValidation = document.getElementById('cert-validation');
    const sigValidation = document.getElementById('sig-validation');
    const integrityValidation = document.getElementById('integrity-validation');

    // Certificado
    if (validations.certificateValid) {
        certValidation.className = 'validation-item valid';
        certValidation.querySelector('.validation-icon').textContent = '✓';
    } else {
        certValidation.className = 'validation-item invalid';
        certValidation.querySelector('.validation-icon').textContent = '✗';
    }

    // Assinatura
    if (validations.signatureValid) {
        sigValidation.className = 'validation-item valid';
        sigValidation.querySelector('.validation-icon').textContent = '✓';
    } else {
        sigValidation.className = 'validation-item invalid';
        sigValidation.querySelector('.validation-icon').textContent = '✗';
    }

    // Integridade
    if (validations.integrityValid) {
        integrityValidation.className = 'validation-item valid';
        integrityValidation.querySelector('.validation-icon').textContent = '✓';
    } else {
        integrityValidation.className = 'validation-item invalid';
        integrityValidation.querySelector('.validation-icon').textContent = '✗';
    }
}

function hideValidations() {
    validationsContainer.style.display = 'none';
}

// === Funções de Histórico de Mensagens ===

// Adiciona mensagem ao histórico
function addToMessageHistory(user, direction, plaintext, messagePackage, validations = {}) {
    const messageItem = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        direction: direction, // 'sent' ou 'received'
        plaintext: plaintext,
        timestamp: new Date().toISOString(),
        from: messagePackage.from,
        to: messagePackage.to,
        crypto: {
            plaintext: plaintext,
            messageHash: messagePackage.messageHash,
            ciphertext: messagePackage.ciphertext,
            iv: messagePackage.iv,
            encryptedSymmetricKey: messagePackage.encryptedSymmetricKey,
            signature: messagePackage.signature
        },
        validations: validations,
        certificate: messagePackage.senderCertificate
    };

    messageHistory[user].push(messageItem);
    renderMessageHistory(user);

    return messageItem;
}

// Renderiza o histórico de mensagens de um usuário
function renderMessageHistory(user) {
    const listElement = document.getElementById(`${user.toLowerCase()}-message-list`);
    if (!listElement) return;

    listElement.innerHTML = '';

    messageHistory[user].forEach(msg => {
        const messageEl = createMessageElement(msg);
        listElement.appendChild(messageEl);
    });

    // Scroll para o final
    listElement.scrollTop = listElement.scrollHeight;
}

// Cria elemento DOM de uma mensagem
function createMessageElement(messageItem) {
    const div = document.createElement('div');
    div.className = `message-item ${messageItem.direction}`;

    const time = new Date(messageItem.timestamp).toLocaleTimeString('pt-BR');
    const directionText = messageItem.direction === 'sent' ? '📤 Enviado' : '📥 Recebido';
    const directionInfo = messageItem.direction === 'sent'
        ? `para ${messageItem.to}`
        : `de ${messageItem.from}`;

    // Cria badges de validação
    let validationBadges = '';
    if (Object.keys(messageItem.validations).length > 0) {
        const labels = {
            certificateValid: 'Certificado',
            signatureValid: 'Assinatura',
            integrityValid: 'Integridade'
        };

        validationBadges = Object.entries(messageItem.validations)
            .map(([key, value]) => {
                const status = value ? 'valid' : 'invalid';
                const icon = value ? '✓' : '✗';
                return `<span class="validation-badge ${status}">${icon} ${labels[key]}</span>`;
            })
            .join('');
    }

    div.innerHTML = `
        <div class="message-header">
            <span class="message-direction">${directionText} ${directionInfo}</span>
            <span class="message-time">${time}</span>
        </div>

        <div class="message-content">
            <p class="plaintext">${escapeHtml(messageItem.plaintext)}</p>
        </div>

        ${validationBadges ? `<div class="message-validation">${validationBadges}</div>` : ''}

        <button class="btn-expand-crypto" onclick="toggleCryptoDetails('${messageItem.id}')">
            ⚙️ Ver Detalhes Criptográficos
        </button>

        <div class="crypto-details" id="crypto-${messageItem.id}" style="display: none;">
            ${createCryptoDetailsHTML(messageItem)}
        </div>
    `;

    return div;
}

// Cria HTML dos detalhes criptográficos
function createCryptoDetailsHTML(messageItem) {
    const crypto = messageItem.crypto;
    const cert = messageItem.certificate;

    return `
        <div class="crypto-section">
            <h5>📝 Mensagem Original (Plaintext)</h5>
            <div class="crypto-value">${escapeHtml(crypto.plaintext)}</div>
        </div>

        <div class="crypto-section">
            <h5>🔐 Hash SHA-256 (Integridade)</h5>
            <div class="crypto-value">${crypto.messageHash}</div>
        </div>

        <div class="crypto-section">
            <h5>🔒 Ciphertext (AES-256-CBC)</h5>
            <div class="crypto-value">${crypto.ciphertext}</div>
        </div>

        <div class="crypto-section">
            <h5>🎲 IV (Initialization Vector)</h5>
            <div class="crypto-value">${crypto.iv}</div>
        </div>

        <div class="crypto-section">
            <h5>🔑 Chave Simétrica Criptografada (RSA)</h5>
            <div class="crypto-value">${crypto.encryptedSymmetricKey}</div>
        </div>

        <div class="crypto-section">
            <h5>✍️ Assinatura Digital (RSA + SHA-256)</h5>
            <div class="crypto-value">${crypto.signature}</div>
        </div>

        <div class="crypto-section">
            <h5>📜 Certificado Digital</h5>
            <div class="cert-info">
                <p><strong>Titular:</strong> ${cert.subject}</p>
                <p><strong>Emissor:</strong> ${cert.issuer}</p>
                <p><strong>Serial:</strong> ${cert.serialNumber}</p>
                <p><strong>Emitido em:</strong> ${cert.issuedAt}</p>
                <p><strong>Expira em:</strong> ${cert.expiresAt}</p>
            </div>
        </div>
    `;
}

// Alterna visibilidade dos detalhes criptográficos
function toggleCryptoDetails(messageId) {
    const detailsDiv = document.getElementById(`crypto-${messageId}`);
    const button = event.target;

    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        button.textContent = '⬆️ Ocultar Detalhes Criptográficos';
    } else {
        detailsDiv.style.display = 'none';
        button.textContent = '⚙️ Ver Detalhes Criptográficos';
    }
}

// Limpa o histórico de mensagens de um usuário
function clearMessageHistory(user) {
    messageHistory[user] = [];
    renderMessageHistory(user);
    addLog(`Histórico de ${user} limpo.`, 'info');
}

// Atualiza as validações da última mensagem recebida
function updateLastMessageValidations(user, validations, plaintextIfFailed) {
    const history = messageHistory[user];
    if (history.length === 0) return;

    // Encontra a última mensagem recebida
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].direction === 'received') {
            history[i].validations = validations;
            // Se falhou, atualiza o plaintext
            if (plaintextIfFailed && !validations.signatureValid) {
                history[i].plaintext = plaintextIfFailed;
            }
            break;
        }
    }

    renderMessageHistory(user);
}

// Helper: Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Funções de API
async function sendMessage(sender, recipient, message) {
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sender, recipient, message })
        });

        const data = await response.json();

        if (data.success) {
            // Adiciona logs do processo de envio
            data.logs.forEach(log => {
                addLog(`[${log.step}] ${log.action}: ${log.description}`, log.type);
            });

            // Armazena o pacote
            currentMessagePackage = data.messagePackage;
            currentRecipient = recipient;

            // Atualiza status do remetente
            const senderStatus = sender === 'Alice' ? aliceStatus : bobStatus;
            updateStatus(
                senderStatus,
                `✓ Mensagem enviada para ${recipient}!`,
                'success'
            );

            // NOVO: Adiciona mensagem ao histórico do remetente
            addToMessageHistory(sender, 'sent', message, data.messagePackage);

            // NOVO: Adiciona mensagem ao histórico do destinatário (sem validações ainda)
            addToMessageHistory(recipient, 'received', message, data.messagePackage, {});

            // NOVO: Automaticamente descriptografa e valida a mensagem no destinatário
            setTimeout(async () => {
                await receiveMessage(recipient, data.messagePackage);
            }, 500);

            return true;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        addLog(`Erro ao enviar mensagem: ${error.message}`, 'error');
        return false;
    }
}

async function receiveMessage(recipient, messagePackage) {
    try {
        const response = await fetch('/api/receive-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipient, messagePackage })
        });

        const data = await response.json();

        // Adiciona logs do processo de recebimento
        if (data.logs) {
            data.logs.forEach(log => {
                addLog(`[${log.step}] ${log.action}: ${log.description}`, log.type);
            });
        }

        // Mostra validações
        if (data.validations) {
            showValidations(data.validations);
        }

        const recipientStatus = recipient === 'Bob' ? bobStatus : aliceStatus;

        if (data.success) {
            updateStatus(
                recipientStatus,
                `✓ Mensagem recebida e descriptografada: "${data.message}"`,
                'success'
            );

            // NOVO: Atualiza validações da última mensagem recebida
            updateLastMessageValidations(recipient, data.validations);
        } else {
            updateStatus(
                recipientStatus,
                `✗ Falha na validação: ${data.errors.join(', ')}`,
                'error'
            );

            // NOVO: Atualiza validações com falha
            updateLastMessageValidations(recipient, data.validations, '[Mensagem rejeitada - adulterada]');
        }

        return data.success;
    } catch (error) {
        addLog(`Erro ao receber mensagem: ${error.message}`, 'error');
        return false;
    }
}

async function resetSystem() {
    try {
        const response = await fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Limpa estado
            currentMessagePackage = null;
            currentRecipient = null;

            // Limpa status
            aliceStatus.textContent = '';
            aliceStatus.className = 'status-box';
            bobStatus.textContent = '';
            bobStatus.className = 'status-box';

            // Oculta validações
            hideValidations();

            // Limpa logs e adiciona mensagem
            clearLogs();
            addLog('🔄 Sistema reiniciado com sucesso. Novas chaves RSA geradas.', 'success');

            // NOVO: Limpa históricos de mensagens
            messageHistory.Alice = [];
            messageHistory.Bob = [];
            renderMessageHistory('Alice');
            renderMessageHistory('Bob');
        }
    } catch (error) {
        addLog(`Erro ao reiniciar sistema: ${error.message}`, 'error');
    }
}

// Event Listeners
sendAliceToBobBtn.addEventListener('click', async () => {
    const message = aliceMessage.value.trim();
    if (!message) {
        addLog('Por favor, digite uma mensagem para enviar.', 'error');
        return;
    }

    sendAliceToBobBtn.disabled = true;
    hideValidations();

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    addLog('🚀 Alice iniciando envio de mensagem para Bob...', 'info');

    const success = await sendMessage('Alice', 'Bob', message);

    sendAliceToBobBtn.disabled = false;
});

sendBobToAliceBtn.addEventListener('click', async () => {
    const message = bobMessage.value.trim();
    if (!message) {
        addLog('Por favor, digite uma mensagem para enviar.', 'error');
        return;
    }

    sendBobToAliceBtn.disabled = true;
    hideValidations();

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    addLog('🚀 Bob iniciando envio de mensagem para Alice...', 'info');

    const success = await sendMessage('Bob', 'Alice', message);

    sendBobToAliceBtn.disabled = false;
});

clearLogsBtn.addEventListener('click', clearLogs);

// NOVO: Event listeners para limpar histórico
document.getElementById('clear-alice-history').addEventListener('click', () => {
    if (confirm('Deseja limpar o histórico de mensagens de Alice?')) {
        clearMessageHistory('Alice');
    }
});

document.getElementById('clear-bob-history').addEventListener('click', () => {
    if (confirm('Deseja limpar o histórico de mensagens de Bob?')) {
        clearMessageHistory('Bob');
    }
});

resetSystemBtn.addEventListener('click', async () => {
    if (confirm('Deseja reiniciar o sistema? Novas chaves serão geradas.')) {
        await resetSystem();
    }
});

// Inicialização
addLog('✓ Sistema inicializado com sucesso!', 'success');
addLog('✓ Autoridade Certificadora (CA) criada', 'success');
addLog('✓ Alice e Bob prontos com chaves RSA e certificados válidos', 'success');
addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
