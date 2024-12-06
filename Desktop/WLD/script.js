const wldInput = document.getElementById("wldInput");
const copOutput = document.getElementById("copOutput");
const API_URL_WLD = "https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT";
const API_URL_BINANCE = "https://api.binance.com/api/v3/ticker/price?symbol=USDTCOP";

async function obtenerTasaUSDCOP() {
  try {
    const response = await fetch(API_URL_BINANCE);
    const data = await response.json();
    const tasaUSDCOP = parseFloat(data.price);

    if (isNaN(tasaUSDCOP)) {
      throw new Error("No se pudo obtener la tasa de cambio USD/COP.");
    }

    console.log(`Tasa dinámica USD a COP obtenida: ${tasaUSDCOP}`);
    return tasaUSDCOP;
  } catch (error) {
    console.error("Error al obtener la tasa USD/COP:", error);
    throw new Error("No se pudo obtener la tasa de cambio USD/COP.");
  }
}

async function obtenerPrecioWLDUSD() {
  try {
    const response = await fetch(API_URL_WLD);
    const data = await response.json();
    const precioPorWLDUSD = parseFloat(data.price);

    if (isNaN(precioPorWLDUSD)) {
      throw new Error("No se pudo obtener el precio de WLD en USD.");
    }

    console.log(`Precio de WLD en USD obtenido: ${precioPorWLDUSD}`);
    return precioPorWLDUSD;
  } catch (error) {
    console.error("Error al obtener el precio de WLD en USD:", error);
    throw new Error("No se pudo obtener el precio de WLD en USD.");
  }
}

async function calcularValorEnCOP() {
  const cantidadWLD = parseFloat(wldInput.value);

  if (isNaN(cantidadWLD) || cantidadWLD <= 0) {
    copOutput.value = ""; // Limpia el resultado si la entrada no es válida
    return;
  }

  try {
    const precioPorWLDUSD = await obtenerPrecioWLDUSD();
    const tasaUSDCOP = await obtenerTasaUSDCOP();

    const precioPorWLDCOP = precioPorWLDUSD * tasaUSDCOP;
    const feePorWLD = 2670; // Fee por WLD en COP
    const totalCOP = (precioPorWLDCOP - feePorWLD) * cantidadWLD;

    // Mostrar el resultado en el input de solo lectura
    copOutput.value = Math.round(totalCOP).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,  // No mostrar decimales
      maximumFractionDigits: 0   // No mostrar decimales
    });
  } catch (error) {
    console.error("Error en el cálculo:", error);
    copOutput.value = "Error al calcular";
  }
}

// Escucha los cambios en el input de WLD y recalcula automáticamente
wldInput.addEventListener("input", calcularValorEnCOP);

// Selección de elementos
const aceptarBoton = document.querySelector('.btn-aceptar');
const popup = document.getElementById('popup');
const popupConfirm = document.getElementById('popup-confirm');
const popupCancel = document.getElementById('popup-cancel');

// Mostrar la ventana emergente al hacer clic en "ACEPTAR"
aceptarBoton.addEventListener('click', function (event) {
  event.preventDefault(); // Evita que el formulario se envíe automáticamente
  popup.classList.remove('hidden'); // Muestra la ventana emergente
});

// Ocultar la ventana emergente al hacer clic en "Cancelar"
popupCancel.addEventListener('click', function () {
  popup.classList.add('hidden'); // Oculta la ventana emergente
});

// Redirigir al usuario al hacer clic en "Sí, continuar"
popupConfirm.addEventListener('click', function () {
  const valorWLD = document.getElementById('wldInput').value;
  const valorCOP = document.getElementById('copOutput').value.replace(/[^0-9]/g, '');
  const walletAddress = '0x32738053b17601aba6d6941e4c870129f3c4f371'; // Dirección de wallet actualizada

  // Redirigir a la página de confirmación con los parámetros
  window.location.href = `confirmacion.html?wld=${valorWLD}&cop=${valorCOP}&wallet=${walletAddress}`;
});

// Elementos del formulario necesarios
const inputPesosColombianos = document.querySelector('input[placeholder="Pesos Colombianos"]');
const selectMetodoConsignacion = document.getElementById('metodo');

// Elemento del popup donde se mostrará el mensaje dinámico
const popupMessage = document.getElementById('popup-message');

// Actualizar el mensaje dinámico antes de mostrar el popup
if (aceptarBoton && popupMessage) {
  aceptarBoton.addEventListener('click', function () {
    // Captura el valor del input readonly
    const valorPesos = inputPesosColombianos ? inputPesosColombianos.value : "N/A";

    // Captura el valor seleccionado del método de consignación
    const metodoConsignacion = selectMetodoConsignacion ? selectMetodoConsignacion.options[selectMetodoConsignacion.selectedIndex].text : "N/A";

    // Construye el mensaje dinámico
    popupMessage.innerHTML = `
      Recibirás <strong>${valorPesos}</strong> a la cuenta <strong>${metodoConsignacion}</strong>.
    `;
  });
}

// Funciones de validación en tiempo real
function validarNombre(nombre) {
  const regex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{3,50}$/;
  return regex.test(nombre);
}

function validarDocumento(documento) {
  const regex = /^\d{8,12}$/;
  return regex.test(documento);
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarTelefono(telefono) {
  const regex = /^\d{10}$/;
  return regex.test(telefono);
}

function validarCuenta(cuenta) {
  const regex = /^\d{8,20}$/;
  return regex.test(cuenta);
}

function mostrarError(input, mensaje) {
  const errorDiv = input.nextElementSibling;
  if (!errorDiv || !errorDiv.classList.contains('error-message')) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.style.color = '#ff4444';
    div.style.fontSize = '12px';
    div.style.marginTop = '5px';
    input.parentNode.insertBefore(div, input.nextSibling);
  }
  input.nextElementSibling.textContent = mensaje;
  input.style.borderColor = '#ff4444';
}

function limpiarError(input) {
  const errorDiv = input.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains('error-message')) {
    errorDiv.textContent = '';
  }
  input.style.borderColor = '';
}

// Agregar listeners para validación en tiempo real
document.getElementById('nombre').addEventListener('input', function() {
  if (!validarNombre(this.value)) {
    mostrarError(this, 'El nombre debe contener solo letras y espacios (3-50 caracteres)');
  } else {
    limpiarError(this);
  }
});

document.getElementById('documento').addEventListener('input', function() {
  if (!validarDocumento(this.value)) {
    mostrarError(this, 'El documento debe tener entre 8 y 12 dígitos');
  } else {
    limpiarError(this);
  }
});

document.getElementById('email').addEventListener('input', function() {
  if (!validarEmail(this.value)) {
    mostrarError(this, 'Ingresa un correo electrónico válido');
  } else {
    limpiarError(this);
  }
});

document.getElementById('telefono').addEventListener('input', function() {
  if (!validarTelefono(this.value)) {
    mostrarError(this, 'El teléfono debe tener 10 dígitos');
  } else {
    limpiarError(this);
  }
});

document.getElementById('cuenta').addEventListener('input', function() {
  if (!validarCuenta(this.value)) {
    mostrarError(this, 'El número de cuenta debe tener entre 8 y 20 dígitos');
  } else {
    limpiarError(this);
  }
});

// Modificar el evento del botón aceptar para validar todo antes de mostrar el popup
aceptarBoton.addEventListener('click', function(event) {
  event.preventDefault();
  
  // Validar todos los campos
  const nombre = document.getElementById('nombre');
  const documento = document.getElementById('documento');
  const email = document.getElementById('email');
  const telefono = document.getElementById('telefono');
  const cuenta = document.getElementById('cuenta');
  const metodo = document.getElementById('metodo');
  
  let isValid = true;
  
  if (!validarNombre(nombre.value)) {
    mostrarError(nombre, 'El nombre debe contener solo letras y espacios (3-50 caracteres)');
    isValid = false;
  }
  
  if (!validarDocumento(documento.value)) {
    mostrarError(documento, 'El documento debe tener entre 8 y 12 dígitos');
    isValid = false;
  }
  
  if (!validarEmail(email.value)) {
    mostrarError(email, 'Ingresa un correo electrónico válido');
    isValid = false;
  }
  
  if (!validarTelefono(telefono.value)) {
    mostrarError(telefono, 'El teléfono debe tener 10 dígitos');
    isValid = false;
  }
  
  if (!validarCuenta(cuenta.value)) {
    mostrarError(cuenta, 'El número de cuenta debe tener entre 8 y 20 dígitos');
    isValid = false;
  }
  
  if (metodo.value === "") {
    mostrarError(metodo, 'Selecciona un método de consignación');
    isValid = false;
  }
  
  // Verificar checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    if (!checkbox.checked) {
      isValid = false;
      const label = checkbox.parentElement;
      label.style.color = '#ff4444';
    } else {
      const label = checkbox.parentElement;
      label.style.color = '';
    }
  });
  
  if (isValid) {
    popup.classList.remove('hidden');
    // Actualizar mensaje del popup con los datos ingresados
    const valorWLD = document.getElementById('wldInput').value;
    const valorCOP = document.getElementById('copOutput').value;
    popupMessage.innerHTML = `
      ¿Confirmas la compra de ${valorWLD} WLD por ${valorCOP}?<br><br>
      Nombre: ${nombre.value}<br>
      Método de pago: ${metodo.options[metodo.selectedIndex].text}
    `;
  }
});
