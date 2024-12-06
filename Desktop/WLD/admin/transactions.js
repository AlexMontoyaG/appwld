// Variables globales
let currentPage = 1;
const transactionsPerPage = 10;

// Función para cargar transacciones
async function loadTransactions(page = 1, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            ...filters
        });

        const response = await fetch(`/api/admin/transactions?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Error al cargar transacciones');
        }

        const data = await response.json();
        displayTransactions(data.transactions);
        setupPagination(data.total);
    } catch (error) {
        console.error('Error:', error);
        // Mostrar mensaje de error al usuario
    }
}

// Función para mostrar transacciones en la tabla
function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction._id}</td>
            <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
            <td>${transaction.nombre}</td>
            <td>${transaction.metodo}</td>
            <td>${transaction.wld} WLD</td>
            <td>
                <span class="status-badge ${transaction.estado}">
                    ${transaction.estado}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="updateStatus('${transaction._id}')">
                    <i class="mdi mdi-pencil"></i>
                </button>
                <button class="btn-icon" onclick="viewDetails('${transaction._id}')">
                    <i class="mdi mdi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para configurar la paginación
function setupPagination(total) {
    const totalPages = Math.ceil(total / transactionsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => loadTransactions(currentPage - 1, getFilters());
    pagination.appendChild(prevButton);

    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.onclick = () => loadTransactions(i, getFilters());
        pagination.appendChild(button);
    }

    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => loadTransactions(currentPage + 1, getFilters());
    pagination.appendChild(nextButton);
}

// Función para obtener los filtros actuales
function getFilters() {
    return {
        status: document.getElementById('statusFilter').value,
        date: document.getElementById('dateFilter').value,
        search: document.getElementById('searchTransactions').value
    };
}

// Función para actualizar el estado de una transacción
async function updateStatus(transactionId) {
    const newStatus = prompt('Ingrese el nuevo estado (pendiente/completado/cancelado):');
    if (!newStatus) return;

    try {
        const response = await fetch(`/api/admin/transactions/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ estado: newStatus })
        });

        if (!response.ok) throw new Error('Error al actualizar estado');

        // Recargar transacciones
        loadTransactions(currentPage, getFilters());
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el estado');
    }
}

// Función para ver detalles de una transacción
function viewDetails(transactionId) {
    // Implementar vista de detalles
    console.log('Ver detalles de la transacción:', transactionId);
}

// Event listeners para filtros
document.getElementById('statusFilter').addEventListener('change', () => {
    loadTransactions(1, getFilters());
});

document.getElementById('dateFilter').addEventListener('change', () => {
    loadTransactions(1, getFilters());
});

// Búsqueda de transacciones
const searchInput = document.getElementById('searchTransactions');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadTransactions(1, getFilters());
    }, 300);
});

// Exportar transacciones
document.getElementById('exportButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/admin/transactions/export', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) throw new Error('Error al exportar');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transacciones-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al exportar transacciones');
    }
});

// Cargar transacciones al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
});
