document.addEventListener('DOMContentLoaded', function() {
    const entryButton = document.getElementById('entry-button');
    const exitButton = document.getElementById('exit-button');
    
    // Event listener para o botão "Entrada de Funcionário"
    if (entryButton) {
        entryButton.addEventListener('click', function() {
            window.location.href = '/entry-form';
        });
    }
    
    // Event listener para o botão "Saída de Funcionário" (mantido inalterado)
    if (exitButton) {
        exitButton.addEventListener('click', function() {
            window.location.href = '/select-employee';
        });
    }
});
