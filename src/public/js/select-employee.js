// Função para carregar funcionários da equipe
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees/EMP001/team-members');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const employeeSelect = document.getElementById('employee-select');
        
        // Limpa as opções antes de adicionar novas
        employeeSelect.innerHTML = '<option value="">Selecione um funcionário...</option>';
        
        if (data.teamMembers && data.teamMembers.length > 0) {
            data.teamMembers.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = `${employee.name} - ${employee.role}`;
                employeeSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Nenhum membro da equipe encontrado";
            option.disabled = true;
            employeeSelect.appendChild(option);
        }
        
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        const employeeSelect = document.getElementById('employee-select');
        employeeSelect.innerHTML = '<option value="">Erro ao carregar funcionários. Tente novamente.</option>';
    }
}

// Função para verificar se um funcionário foi selecionado e habilitar/desabilitar o botão
function updateContinueButton() {
    const employeeSelect = document.getElementById('employee-select');
    const continueButton = document.getElementById('continue-button');
    
    continueButton.disabled = !employeeSelect.value;
}

// Event listener para mudanças na seleção
function handleEmployeeSelection() {
    const employeeSelect = document.getElementById('employee-select');
    const continueButton = document.getElementById('continue-button');
    
    employeeSelect.addEventListener('change', updateContinueButton);
    
    continueButton.addEventListener('click', function() {
        const selectedEmployeeId = employeeSelect.value;
        if (selectedEmployeeId) {
            // Redireciona para a página de formulário de saída com o ID do funcionário
            window.location.href = `/exit-form?employeeId=${selectedEmployeeId}`;
        }
    });
}

// Event listener para o botão "Voltar"
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back-button');
    
    backButton.addEventListener('click', function() {
        window.location.href = '/';
    });
    
    // Configura os event listeners para seleção
    handleEmployeeSelection();
    
    // Carrega a lista de funcionários quando a página é carregada
    loadEmployees();
});
