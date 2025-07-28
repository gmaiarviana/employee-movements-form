// Função para extrair parâmetros da URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        employeeId: params.get('employeeId'),
        exitDate: params.get('exitDate'),
        reason: params.get('reason')
    };
}

// Função para carregar detalhes do funcionário e projeto
async function loadEmployeeDetails() {
    const params = getUrlParams();
    const employeeSection = document.getElementById('employee-section');
    const projectSection = document.getElementById('project-section');
    
    if (!params.employeeId) {
        employeeSection.innerHTML = '<h3>Dados do Funcionário</h3><p class="error-message">ID do funcionário não encontrado.</p>';
        projectSection.innerHTML = '<h3>Dados do Projeto</h3><p class="error-message">Não foi possível carregar os dados do projeto.</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/employees/${params.employeeId}/details`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do funcionário');
        }
        
        const data = await response.json();
        
        // Popula seção do funcionário
        employeeSection.innerHTML = `
            <h3>Dados do Funcionário</h3>
            <div class="data-item">
                <span class="data-label">ID:</span>
                <span class="data-value">${data.employee.id}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Nome:</span>
                <span class="data-value">${data.employee.name}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Email:</span>
                <span class="data-value">${data.employee.email}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Cargo:</span>
                <span class="data-value">${data.employee.role}</span>
            </div>
        `;
        
        // Popula seção do projeto
        projectSection.innerHTML = `
            <h3>Dados do Projeto</h3>
            <div class="data-item">
                <span class="data-label">Nome do Projeto:</span>
                <span class="data-value">${data.project.name}</span>
            </div>
            <div class="data-item">
                <span class="data-label">Tipo:</span>
                <span class="data-value">${data.project.type}</span>
            </div>
            <div class="data-item">
                <span class="data-label">SOW:</span>
                <span class="data-value">${data.project.sow}</span>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        employeeSection.innerHTML = '<h3>Dados do Funcionário</h3><p class="error-message">Erro ao carregar dados do funcionário.</p>';
        projectSection.innerHTML = '<h3>Dados do Projeto</h3><p class="error-message">Erro ao carregar dados do projeto.</p>';
    }
}

// Função para exibir dados da saída
function displayExitData() {
    const params = getUrlParams();
    const exitSection = document.getElementById('exit-section');
    
    if (!params.exitDate || !params.reason) {
        exitSection.innerHTML = '<h3>Dados da Saída</h3><p class="error-message">Dados da saída incompletos.</p>';
        return;
    }
    
    // Formatar a data
    const formatDate = (dateString) => {
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
    
    const reasonText = reasonMap[params.reason] || params.reason;
    
    exitSection.innerHTML = `
        <h3>Dados da Saída</h3>
        <div class="data-item">
            <span class="data-label">Data de Saída:</span>
            <span class="data-value">${formatDate(params.exitDate)}</span>
        </div>
        <div class="data-item">
            <span class="data-label">Motivo da Saída:</span>
            <span class="data-value">${reasonText}</span>
        </div>
    `;
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
    // Carregar detalhes do funcionário e dados da saída quando a página carrega
    loadEmployeeDetails();
    displayExitData();
    
    // Event listener para o botão voltar
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', handleBackButton);
    
    // Event listener para o botão confirmar
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.addEventListener('click', handleConfirm);
});
