// Funciones para manejar la interfaz de administración
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos iniciales
    loadDashboardData();
    loadTransactions();

    // Configurar búsqueda
    const searchInput = document.querySelector('.header-search input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Configurar botón de exportar
    const exportButton = document.querySelector('.btn-export');
    exportButton.addEventListener('click', exportTransactions);
});

// Función para cargar datos del dashboard
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        // Actualizar estadísticas
        updateStats(data);
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        // Mostrar mensaje de error al usuario
    }
}

// Función para cargar transacciones
async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions');
        const transactions = await response.json();
        
        // Renderizar transacciones en la tabla
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error cargando transacciones:', error);
        // Mostrar mensaje de error al usuario
    }
}

// Función para renderizar transacciones
function renderTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';

    transactions.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.nombre}</td>
            <td>${transaction.email}</td>
            <td>${transaction.metodo}</td>
            <td>${transaction.wld}</td>
            <td>
                <span class="status-tag status-${transaction.estado.toLowerCase()}">
                    ${transaction.estado}
                </span>
            </td>
            <td>
                <button onclick="viewTransaction('${transaction.id}')" class="action-btn">
                    <i class="mdi mdi-eye"></i>
                </button>
                <button onclick="editTransaction('${transaction.id}')" class="action-btn">
                    <i class="mdi mdi-pencil"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para actualizar estadísticas
function updateStats(data) {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers[0].textContent = data.totalUsuarios;
    statNumbers[1].textContent = data.totalWLD;
    statNumbers[2].textContent = data.totalTransacciones;
}

// Función para manejar la búsqueda
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#transactionsBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Función para exportar transacciones
async function exportTransactions() {
    try {
        const response = await fetch('/api/transactions/export');
        const blob = await response.blob();
        
        // Crear link de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transacciones.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exportando transacciones:', error);
        // Mostrar mensaje de error al usuario
    }
}

// Función para ver detalles de una transacción
function viewTransaction(id) {
    // Implementar vista detallada de la transacción
    console.log('Ver transacción:', id);
}

// Función para editar una transacción
function editTransaction(id) {
    // Implementar edición de la transacción
    console.log('Editar transacción:', id);
}

// Utilidad para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
