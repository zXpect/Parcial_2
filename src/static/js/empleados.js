document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('empleado-form');
    const mensajeEl = document.getElementById('mensaje');

    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.setProperty('--animation-order', index + 1);
    });


    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {

        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });


        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });


    form.addEventListener('submit', function (e) {
        e.preventDefault();


        let isValid = validateForm();

        if (!isValid) {
            showToast('Por favor complete todos los campos correctamente', 'error');
            return;
        }


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

                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;

                if (data.status === 'success') {

                    mensajeEl.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
                    mensajeEl.className = 'mensaje success active';


                    showToast('Empleado guardado exitosamente', 'success');


                    form.reset();
                    inputs.forEach(input => {
                        input.parentElement.classList.remove('focused');
                    });

                    form.classList.add('reset-animation');
                    setTimeout(() => {
                        form.classList.remove('reset-animation');
                    }, 500);


                    setTimeout(() => {
                        mensajeEl.classList.remove('active');
                    }, 5000);
                } else {

                    mensajeEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${data.message}`;
                    mensajeEl.className = 'mensaje error active';

                    showToast(`Error: ${data.message}`, 'error');

                    setTimeout(() => {
                        mensajeEl.classList.remove('active');
                    }, 5000);
                }
            })
            .catch(error => {
                // Restaurar botón
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;

                console.error('Error:', error);

                mensajeEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error de conexión con el servidor';
                mensajeEl.className = 'mensaje error active';


                showToast('Error de conexión con el servidor', 'error');


                setTimeout(() => {
                    mensajeEl.classList.remove('active');
                }, 3000);
            });
    });

    function validateForm() {
        let isValid = true;

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

    function markInvalid(input, message) {
        input.classList.add('invalid');

        let errorEl = input.parentElement.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            input.parentElement.appendChild(errorEl);
        }

        errorEl.textContent = message;
        errorEl.style.display = 'block';

        input.addEventListener('input', function onInput() {
            input.classList.remove('invalid');
            if (errorEl) errorEl.style.display = 'none';
            input.removeEventListener('input', onInput);
        }, { once: true });
    }

    function markValid(input) {
        input.classList.remove('invalid');
        const errorEl = input.parentElement.querySelector('.error-message');
        if (errorEl) errorEl.style.display = 'none';
    }
});


function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;


    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    // Construir contenido de la notificación
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