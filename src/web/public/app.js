/**
 * Aplicação Frontend - Sistema de Comunicação Segura
 */

// Estado da aplicação
let currentMessagePackage = null;
let currentRecipient = null;

// Elementos do DOM
const aliceMessage = document.getElementById('alice-message');
const bobMessage = document.getElementById('bob-message');
const sendAliceToBobBtn = document.getElementById('send-alice-to-bob');
const sendBobToAliceBtn = document.getElementById('send-bob-to-alice');
const receiveBobBtn = document.getElementById('receive-bob');
const tamperMessageBtn = document.getElementById('tamper-message');
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
                `✓ Mensagem criptografada e enviada para ${recipient}!`,
                'success'
            );

            // Habilita botão de receber
            if (recipient === 'Bob') {
                receiveBobBtn.disabled = false;
                tamperMessageBtn.disabled = false;
            }

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
        } else {
            updateStatus(
                recipientStatus,
                `✗ Falha na validação: ${data.errors.join(', ')}`,
                'error'
            );
        }

        // Desabilita botões
        receiveBobBtn.disabled = true;
        tamperMessageBtn.disabled = true;

        return data.success;
    } catch (error) {
        addLog(`Erro ao receber mensagem: ${error.message}`, 'error');
        return false;
    }
}

async function tamperMessage() {
    try {
        addLog('⚠️ SIMULANDO ATAQUE: Adulterando mensagem...', 'error');

        const response = await fetch('/api/tamper-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messagePackage: currentMessagePackage })
        });

        const data = await response.json();

        if (data.success) {
            addLog(`⚠️ ${data.warning}`, 'error');
            currentMessagePackage = data.tamperedPackage;

            updateStatus(
                bobStatus,
                'Mensagem adulterada. Tentando receber mesmo assim...',
                'error'
            );

            // Aguarda 1 segundo e tenta receber
            setTimeout(async () => {
                await receiveMessage(currentRecipient, currentMessagePackage);
            }, 1000);
        }
    } catch (error) {
        addLog(`Erro ao adulterar mensagem: ${error.message}`, 'error');
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

            // Desabilita botões
            receiveBobBtn.disabled = true;
            tamperMessageBtn.disabled = true;

            // Oculta validações
            hideValidations();

            // Limpa logs e adiciona mensagem
            clearLogs();
            addLog('🔄 Sistema reiniciado com sucesso. Novas chaves RSA geradas.', 'success');
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

    await sendMessage('Bob', 'Alice', message);

    // Para Bob enviando para Alice, auto-recebe
    setTimeout(async () => {
        addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
        addLog('📨 Alice recebendo mensagem de Bob...', 'info');
        await receiveMessage('Alice', currentMessagePackage);
    }, 500);

    sendBobToAliceBtn.disabled = false;
});

receiveBobBtn.addEventListener('click', async () => {
    receiveBobBtn.disabled = true;
    tamperMessageBtn.disabled = true;

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    addLog('📨 Bob recebendo mensagem de Alice...', 'info');

    await receiveMessage(currentRecipient, currentMessagePackage);
});

tamperMessageBtn.addEventListener('click', async () => {
    tamperMessageBtn.disabled = true;
    receiveBobBtn.disabled = true;

    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'error');

    await tamperMessage();
});

clearLogsBtn.addEventListener('click', clearLogs);

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
