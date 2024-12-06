// Manejo del menú desplegable de usuario
document.querySelector('.user-menu').addEventListener('click', function(e) {
    this.querySelector('.dropdown-menu').classList.toggle('show');
});

// Cerrar el menú cuando se hace clic fuera de él
document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu')) {
        document.querySelector('.dropdown-menu').classList.remove('show');
    }
});

// Función de cierre de sesión
document.getElementById('logoutButton').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Limpiar el token del localStorage
    localStorage.removeItem('adminToken');
    
    // Redirigir al login
    window.location.href = '/admin/login';
});
