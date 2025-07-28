// Função para carregar funcionários subordinados
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees/EMP001/subordinates');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const employeesList = document.getElementById('employees-list');
        
        // Limpa a lista antes de adicionar novos elementos
        employeesList.innerHTML = '';
        
        if (data.teamMembers && data.teamMembers.length > 0) {
            data.teamMembers.forEach(employee => {
                const employeeCard = createEmployeeCard(employee);
                employeesList.appendChild(employeeCard);
            });
        } else {
            employeesList.innerHTML = '<p class="no-employees">Nenhum funcionário subordinado encontrado.</p>';
        }
        
        // Adiciona event listeners para os botões "Selecionar"
        addSelectButtonListeners();
        
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        const employeesList = document.getElementById('employees-list');
        employeesList.innerHTML = '<p class="error-message">Erro ao carregar a lista de funcionários. Tente novamente.</p>';
    }
}

// Função para criar um item de funcionário
function createEmployeeCard(employee) {
    const listItem = document.createElement('div');
    listItem.className = 'employee-item';
    
    listItem.innerHTML = `
        <div class="employee-info">
            <span class="employee-name">${employee.name}</span>
            <span class="employee-details">${employee.role} • ${employee.project}</span>
        </div>
        <button class="select-button" data-employee-id="${employee.id}">
            Selecionar
        </button>
    `;
    
    return listItem;
}

// Função para adicionar event listeners aos botões de seleção
function addSelectButtonListeners() {
    const selectButtons = document.querySelectorAll('.select-button');
    
    selectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-employee-id');
            
            // Redireciona para a página de formulário de saída com o ID do funcionário
            window.location.href = `/exit-form?employeeId=${employeeId}`;
        });
    });
}

// Event listener para o botão "Voltar"
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back-button');
    
    backButton.addEventListener('click', function() {
        window.location.href = '/';
    });
    
    // Carrega a lista de funcionários quando a página é carregada
    loadEmployees();
});
