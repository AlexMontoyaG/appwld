document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('message');

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
        messageDiv.textContent = 'Las contraseñas nuevas no coinciden';
        messageDiv.className = 'message error';
        return;
    }

    try {
        const response = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Contraseña actualizada exitosamente';
            messageDiv.className = 'message success';
            // Limpiar el formulario
            e.target.reset();
        } else {
            messageDiv.textContent = data.message || 'Error al cambiar la contraseña';
            messageDiv.className = 'message error';
        }
    } catch (error) {
        messageDiv.textContent = 'Error de conexión';
        messageDiv.className = 'message error';
        console.error('Error:', error);
    }
});
