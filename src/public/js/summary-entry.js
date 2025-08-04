// Function to parse URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const data = {};
    
    for (const [key, value] of params) {
        data[key] = decodeURIComponent(value);
    }
    
    return data;
}

// Function to format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Function to map radio button values to readable text
function mapRadioValue(value) {
    return value === 'sim' ? 'Sim' : 'Não';
}

// Async function to load and display summary data
async function loadSummaryData() {
    const summaryContent = document.getElementById('summary-content');
    
    try {
        const data = getUrlParams();
        
        // Check if data is empty or missing required fields
        if (!data || Object.keys(data).length === 0 || !data.fullName) {
            summaryContent.innerHTML = '<p class="error-message">Dados do formulário não encontrados.</p>';
            return;
        }
        
        // Build HTML for displaying the data
        const html = `
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">Nome Completo:</span>
                    <span class="data-value">${data.fullName || ''}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">CPF:</span>
                    <span class="data-value">${data.cpf || ''}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">E-mail:</span>
                    <span class="data-value">${data.email || ''}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">Nome do Instituto:</span>
                    <span class="data-value">${data.instituteName || ''}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">Realizou o treinamento de compliance da HP?</span>
                    <span class="data-value">${mapRadioValue(data.complianceTraining)}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">É faturável?</span>
                    <span class="data-value">${mapRadioValue(data.billable)}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">Data de Início:</span>
                    <span class="data-value">${formatDate(data.startDate)}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">Papel do profissional:</span>
                    <span class="data-value">${data.role || ''}</span>
                </div>
            </div>
            
            <div class="data-group">
                <div class="data-item">
                    <span class="data-label">Nome do projeto HP:</span>
                    <span class="data-value">${data.projectName || ''}</span>
                </div>
            </div>
        `;
        
        summaryContent.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading summary data:', error);
        summaryContent.innerHTML = '<p class="error-message">Erro ao carregar os dados do formulário.</p>';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load summary data when page loads
    loadSummaryData();
    
    // Back button functionality
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    // Confirm button functionality
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            // TODO: Implement confirmation logic (save to database/API)
            alert('Entrada confirmada com sucesso!');
            window.location.href = '/';
        });
    }
});
