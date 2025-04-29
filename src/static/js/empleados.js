/**
 * Sistema de Gestión de Nómina
 * empleados.js - Maneja la interacción del formulario de empleados
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('empleado-form');
    const mensajeEl = document.getElementById('mensaje');
    
    // Inicializar contadores para animación secuencial
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.setProperty('--animation-order', index + 1);
    });
    
    // Efecto de focus en campos de formulario
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Efecto al enfocar
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        // Efecto al perder foco
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Mantener clase si tiene valor al cargar
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Validación y envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos antes de enviar
        let isValid = validateForm();
        
        if (!isValid) {
            showToast('Por favor complete todos los campos correctamente', 'error');
            return;
        }
        
        // Mostrar animación de carga en el botón
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        // Obtener datos del formulario
        const formData = new FormData(this);
        
        // Enviar datos mediante fetch
        fetch('/empleados', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Restaurar botón
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            if (data.status === 'success') {
                // Mostrar mensaje de éxito
                mensajeEl.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
                mensajeEl.className = 'mensaje success active';
                
                // Mostrar notificación toast
                showToast('Empleado guardado exitosamente', 'success');
                
                // Limpiar formulario con animación
                form.reset();
                inputs.forEach(input => {
                    input.parentElement.classList.remove('focused');
                });
                
                // Efecto de "shake" en el formulario para confirmar el reset
                form.classList.add('reset-animation');
                setTimeout(() => {
                    form.classList.remove('reset-animation');
                }, 500);
                
                // Ocultar mensaje después de un tiempo
                setTimeout(() => {
                    mensajeEl.classList.remove('active');
                }, 5000);
            } else {
                // Mostrar mensaje de error
                mensajeEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${data.message}`;
                mensajeEl.className = 'mensaje error active';
                
                // Mostrar notificación toast de error
                showToast(`Error: ${data.message}`, 'error');
                
                // Ocultar mensaje después de un tiempo
                setTimeout(() => {
                    mensajeEl.classList.remove('active');
                }, 5000);
            }
        })
        .catch(error => {
            // Restaurar botón
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            // Mostrar error en consola
            console.error('Error:', error);
            
            // Mostrar mensaje de error genérico
            mensajeEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error de conexión con el servidor';
            mensajeEl.className = 'mensaje error active';
            
            // Mostrar notificación toast de error
            showToast('Error de conexión con el servidor', 'error');
            
            // Ocultar mensaje después de un tiempo
            setTimeout(() => {
                mensajeEl.classList.remove('active');
            }, 5000);
        });
    });
    
    /**
     * Valida todos los campos del formulario
     * @returns {boolean} - True si todos los campos son válidos, false en caso contrario
     */
    function validateForm() {
        let isValid = true;
        
        // Validar cada campo
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                markInvalid(input, 'Este campo es obligatorio');
                isValid = false;
            } else if (input.id === 'salario_empleado' && input.value <= 0) {
                markInvalid(input, 'El salario debe ser mayor que 0');
                isValid = false;
            } else {
                markValid(input);
            }
        });
        
        return isValid;
    }
    
    /**
     * Marca un campo como inválido
     * @param {HTMLElement} input - El elemento input a marcar
     * @param {string} message - El mensaje de error a mostrar
     */
    function markInvalid(input, message) {
        input.classList.add('invalid');
        
        // Buscar o crear el mensaje de error
        let errorEl = input.parentElement.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            input.parentElement.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        
        // Quitar clase inválida cuando el usuario corrija
        input.addEventListener('input', function onInput() {
            input.classList.remove('invalid');
            if (errorEl) errorEl.style.display = 'none';
            input.removeEventListener('input', onInput);
        }, { once: true });
    }
    
    /**
     * Marca un campo como válido
     * @param {HTMLElement} input - El elemento input a marcar
     */
    function markValid(input) {
        input.classList.remove('invalid');
        const errorEl = input.parentElement.querySelector('.error-message');
        if (errorEl) errorEl.style.display = 'none';
    }
});

/**
 * Muestra una notificación toast
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - El tipo de notificación ('success' o 'error')
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icono según tipo
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    // Construir contenido del toast
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <div class="toast-progress"></div>
    `;
    
    // Añadir al contenedor
    container.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Ocultar y eliminar después de 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        
        // Eliminar del DOM después de la animación
        setTimeout(() => {
            container.removeChild(toast);
        }, 500);
    }, 5000);
}