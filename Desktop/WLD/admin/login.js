document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token en localStorage
            localStorage.setItem('adminToken', data.token);
            // Redirigir al dashboard
            window.location.href = '/admin';
        } else {
            errorMessage.textContent = data.message || 'Error al iniciar sesión';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Error de conexión';
        errorMessage.style.display = 'block';
        console.error('Error:', error);
    }
});
