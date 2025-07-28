// Função para extrair parâmetros da URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        employeeId: params.get('employeeId'),
        exitDate: params.get('exitDate'),
        reason: params.get('reason'),
        replacement: params.get('replacement'),
        machineId: params.get('machineId')
    };
}

// Função para carregar o resumo
function loadSummary() {
    const params = getUrlParams();
    const summaryDiv = document.getElementById('summary-content');
    
    if (!params.employeeId || !params.exitDate || !params.reason || !params.replacement || !params.machineId) {
        summaryDiv.innerHTML = '<p class="error-message">Dados incompletos. Por favor, retorne ao formulário.</p>';
        return;
    }
    
    // Formatar a data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };
    
    // Formatar replacement
    const replacementText = params.replacement === 'sim' ? 'Sim' : 'Não';
    
    summaryDiv.innerHTML = `
        <div class="summary-section">
            <h3>Dados do Funcionário</h3>
            <p><strong>ID:</strong> ${params.employeeId}</p>
            <p><strong>Nome:</strong> Funcionário ${params.employeeId}</p>
        </div>
        
        <div class="summary-section">
            <h3>Detalhes da Saída</h3>
            <p><strong>Data de Saída:</strong> ${formatDate(params.exitDate)}</p>
            <p><strong>Motivo:</strong> ${params.reason}</p>
            <p><strong>Haverá Replacement:</strong> ${replacementText}</p>
            <p><strong>Tombo da Máquina:</strong> ${params.machineId}</p>
        </div>
    `;
}

// Função para lidar com o botão voltar
function handleBackButton() {
    const params = getUrlParams();
    window.location.href = `/exit-form?employeeId=${params.employeeId}`;
}

// Função para lidar com a confirmação
function handleConfirmButton() {
    alert('Saída confirmada! Em uma implementação real, aqui seria enviado para o servidor.');
    window.location.href = '/';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar resumo quando a página carrega
    loadSummary();
    
    // Event listener para o botão voltar
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', handleBackButton);
    
    // Event listener para o botão confirmar
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.addEventListener('click', handleConfirmButton);
});
