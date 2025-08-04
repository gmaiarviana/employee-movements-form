/**
 * entry-form.js
 * 
 * JavaScript para o formulário de entrada de funcionários
 * Este arquivo contém a lógica para validação, manipulação e envio
 * dos dados do formulário de registro de entrada de funcionários.
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o botão "Voltar"
    const backButton = document.getElementById('back-button');
    
    // Adiciona event listener para o clique no botão "Voltar"
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Redireciona para a página inicial (index.html)
            window.location.href = '/';
        });
    }
    
    // Seleciona o formulário de entrada
    const entryForm = document.getElementById('entry-form');
    
    // Adiciona event listener para o envio do formulário
    if (entryForm) {
        entryForm.addEventListener('submit', function(event) {
            // Previne o envio padrão do formulário
            event.preventDefault();
            
            // Coleta os valores dos campos do formulário
            const fullName = document.getElementById('full-name').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            const email = document.getElementById('email').value.trim();
            const instituteName = document.getElementById('institute-name').value.trim();
            const startDate = document.getElementById('start-date').value;
            const role = document.getElementById('role').value.trim();
            const projectName = document.getElementById('project-name').value.trim();
            
            // Obtém os valores dos radio buttons
            const complianceTraining = document.querySelector('input[name="compliance-training"]:checked')?.value;
            const billable = document.querySelector('input[name="billable"]:checked')?.value;
            
            // Validação básica - verifica se todos os campos obrigatórios estão preenchidos
            if (!fullName || !cpf || !email || !instituteName || !complianceTraining || 
                !billable || !startDate || !role || !projectName) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Cria o objeto com os dados do formulário
            const formData = {
                fullName: fullName,
                cpf: cpf,
                email: email,
                instituteName: instituteName,
                complianceTraining: complianceTraining,
                billable: billable,
                startDate: startDate,
                role: role,
                projectName: projectName
            };
            
            // Constrói a URL com os parâmetros de consulta
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(formData)) {
                params.append(key, encodeURIComponent(value));
            }
            
            // Redireciona para a página de resumo com os dados
            const redirectUrl = `/summary-entry.html?${params.toString()}`;
            window.location.href = redirectUrl;
        });
    }
});
