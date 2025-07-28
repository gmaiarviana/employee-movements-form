document.addEventListener('DOMContentLoaded', function() {
    const exitButton = document.getElementById('exit-button');
    
    exitButton.addEventListener('click', function() {
        window.location.href = '/select-employee';
    });
});
