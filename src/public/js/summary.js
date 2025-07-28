// Função para extrair parâmetros da URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        employeeId: params.get('employeeId'),
        exitDate: params.get('exitDate'),
        reason: params.get('reason')
    };
}

// Função para carregar e exibir todas as informações de forma integrada
async function loadSummaryData() {
    const params = getUrlParams();
    const summaryContent = document.getElementById('summary-content');
    
    if (!params.employeeId) {
        summaryContent.innerHTML = '<p class="error-message">ID do funcionário não encontrado.</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/employees/${params.employeeId}/details`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do funcionário');
        }
        
        const data = await response.json();
        
        // Formatar a data
        const formatDate = (dateString) => {
            if (!dateString) return 'Data não informada';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        };
        
        // Mapear valores para texto legível
        const reasonMap = {
            'interno-externo': 'Interno → Externo',
            'externo-interno': 'Externo → Interno',
            'interno-interno': 'Interno → Interno',
            'externo-externo': 'Externo → Externo',
            'saida-projeto': 'Saída do projeto'
        };
        
        const reasonText = reasonMap[params.reason] || params.reason || 'Motivo não informado';
        
        // Criar layout integrado
        summaryContent.innerHTML = `
            <div class="integrated-summary-card">
                <div class="summary-grid">
                    <div class="data-row">
                        <span class="data-label">Funcionário:</span>
                        <span class="data-value">${data.employee.name}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">ID:</span>
                        <span class="data-value">${data.employee.id}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Email:</span>
                        <span class="data-value">${data.employee.email}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Cargo:</span>
                        <span class="data-value">${data.employee.role}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Empresa:</span>
                        <span class="data-value">${data.employee.company}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Projeto:</span>
                        <span class="data-value">${data.project.name}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Tipo de Projeto:</span>
                        <span class="data-value">${data.project.type}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">SOW:</span>
                        <span class="data-value">${data.project.sow}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Data de Saída:</span>
                        <span class="data-value">${formatDate(params.exitDate)}</span>
                    </div>
                    <div class="data-row highlight">
                        <span class="data-label">Motivo da Saída:</span>
                        <span class="data-value">${reasonText}</span>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        summaryContent.innerHTML = '<p class="error-message">Erro ao carregar informações do resumo.</p>';
    }
}

// Função para exibir dados da saída
function displayExitData() {
    // Esta função foi integrada na loadSummaryData()
    // Mantida apenas para compatibilidade, mas não é mais usada
}

// Função para lidar com a confirmação
function handleConfirm() {
    alert('Saída confirmada com sucesso!');
    window.location.href = '/';
}

// Função para lidar com o botão voltar
function handleBackButton() {
    const params = getUrlParams();
    window.location.href = `/exit-form?employeeId=${params.employeeId}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar todas as informações de forma integrada
    loadSummaryData();
    
    // Event listener para o botão voltar
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', handleBackButton);
    
    // Event listener para o botão confirmar
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.addEventListener('click', handleConfirm);
});
