// Variables globales
let currentPage = 1;
const usersPerPage = 10;

// Función para cargar usuarios
async function loadUsers(page = 1, search = '') {
    try {
        const response = await fetch(`/api/admin/users?page=${page}&search=${search}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Si no está autorizado, redirigir al login
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Error al cargar usuarios');
        }

        const data = await response.json();
        displayUsers(data.users);
        setupPagination(data.total);
    } catch (error) {
        console.error('Error:', error);
        // Mostrar mensaje de error al usuario
    }
}

// Función para mostrar usuarios en la tabla
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td>${user.documento}</td>
            <td>${user.telefono}</td>
            <td>${user.totalWLD || 0} WLD</td>
            <td>${user.ultimaTransaccion ? new Date(user.ultimaTransaccion).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn-icon" onclick="viewUserDetails('${user._id}')">
                    <i class="mdi mdi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para configurar la paginación
function setupPagination(total) {
    const totalPages = Math.ceil(total / usersPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => loadUsers(currentPage - 1);
    pagination.appendChild(prevButton);

    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.onclick = () => loadUsers(i);
        pagination.appendChild(button);
    }

    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => loadUsers(currentPage + 1);
    pagination.appendChild(nextButton);
}

// Función para ver detalles del usuario
function viewUserDetails(userId) {
    // Implementar vista de detalles
    console.log('Ver detalles del usuario:', userId);
}

// Búsqueda de usuarios
const searchInput = document.getElementById('searchUsers');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadUsers(1, e.target.value);
    }, 300);
});

// Cargar usuarios al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
