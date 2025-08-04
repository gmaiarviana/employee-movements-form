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
    
    // TODO: Implementar lógica adicional do formulário de entrada
});
