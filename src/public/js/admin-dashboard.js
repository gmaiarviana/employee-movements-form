// Admin Dashboard functionality

// Função para carregar e exibir movimentações
async function loadMovements(startDate = null, endDate = null) {
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
        
        let movements = await response.json();
        
        // Aplicar filtro por data no frontend
        if (startDate || endDate) {
            movements = filterMovementsByDate(movements, startDate, endDate);
        }
        
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

// Função para filtrar movimentações por data
function filterMovementsByDate(movements, startDate, endDate) {
    return movements.filter(movement => {
        const movementDate = new Date(movement.date);
        
        // Se startDate estiver definida, verificar se a data da movimentação é >= startDate
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // Início do dia
            if (movementDate < start) {
                return false;
            }
        }
        
        // Se endDate estiver definida, verificar se a data da movimentação é <= endDate
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Final do dia
            if (movementDate > end) {
                return false;
            }
        }
        
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Manter ordenação cronológica (mais recente primeiro)
}

// Função chamada pelo botão filtrar
function filterMovements() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    const startDate = startDateInput.value || null;
    const endDate = endDateInput.value || null;
    
    // Carregar movimentações com os filtros aplicados
    loadMovements(startDate, endDate);
}

// Função para exportar dados (simulada)
function exportData() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const movementsList = document.getElementById('movements-list');
    
    // Verificar se há movimentações visíveis na tela
    const visibleMovements = movementsList.querySelectorAll('.movement-item');
    const movementsCount = visibleMovements.length;
    
    // Preparar informações sobre os filtros aplicados
    let filterInfo = '';
    if (startDateInput.value || endDateInput.value) {
        const startDate = startDateInput.value ? new Date(startDateInput.value).toLocaleDateString('pt-BR') : 'não definida';
        const endDate = endDateInput.value ? new Date(endDateInput.value).toLocaleDateString('pt-BR') : 'não definida';
        filterInfo = `\n\nFiltros aplicados:\n- Data início: ${startDate}\n- Data fim: ${endDate}`;
    } else {
        filterInfo = '\n\nSem filtros aplicados (todos os dados).';
    }
    
    // Simular a exportação com uma mensagem detalhada
    const message = `⚠️ FUNCIONALIDADE EM DESENVOLVIMENTO ⚠️\n\nA exportação de dados não está implementada neste protótipo.\n\nSe estivesse implementada, seria exportado:\n- ${movementsCount} movimentação(ões) atualmente visível(is) na tela${filterInfo}\n\nFormatos que seriam suportados: CSV, Excel, PDF.`;
    
    alert(message);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard loaded successfully');
    // Carregar movimentações ao inicializar a página
    loadMovements();
});
