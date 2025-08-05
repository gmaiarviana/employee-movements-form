// Admin Dashboard functionality

// Função para carregar e exibir movimentações
async function loadMovements() {
    const loadingElement = document.getElementById('movements-loading');
    const errorElement = document.getElementById('movements-error');
    const listElement = document.getElementById('movements-list');
    
    try {
        // Mostrar loading
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        listElement.innerHTML = '';
        
        // Fazer requisição para a API
        const response = await fetch('/api/movements');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const movements = await response.json();
        
        // Esconder loading
        loadingElement.style.display = 'none';
        
        // Verificar se há movimentações
        if (movements.length === 0) {
            listElement.innerHTML = '<p class="no-movements">Nenhuma movimentação encontrada.</p>';
            return;
        }
        
        // Criar HTML para as movimentações
        const movementsHTML = movements.map(movement => {
            const typeClass = movement.type === 'entry' ? 'movement-entry' : 'movement-exit';
            const typeText = movement.type === 'entry' ? 'Entrada' : 'Saída';
            const formattedDate = new Date(movement.date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="movement-item ${typeClass}">
                    <div class="movement-header">
                        <span class="movement-type">${typeText}</span>
                        <span class="movement-date">${formattedDate}</span>
                    </div>
                    <div class="movement-info">
                        <strong>${movement.employeeName}</strong>
                        ${movement.details ? `<p class="movement-details">${movement.details}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        listElement.innerHTML = movementsHTML;
        
    } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        errorElement.textContent = `Erro ao carregar movimentações: ${error.message}`;
    }
}

function viewEntries() {
    // TODO: Implementar visualização de entradas
    alert('Funcionalidade de visualizar entradas será implementada em breve');
}

function viewExits() {
    // TODO: Implementar visualização de saídas
    alert('Funcionalidade de visualizar saídas será implementada em breve');
}

function viewEmployees() {
    // TODO: Implementar visualização de funcionários
    alert('Funcionalidade de visualizar funcionários será implementada em breve');
}

function viewProjects() {
    // TODO: Implementar visualização de projetos
    alert('Funcionalidade de visualizar projetos será implementada em breve');
}

function goHome() {
    window.location.href = '/';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard loaded successfully');
    // Carregar movimentações ao inicializar a página
    loadMovements();
});
