/**
 * Funciones de utilidad para el Visualizador de Eventos
 */

const Utils = {
    /**
     * Formatea una fecha como texto legible
     * @param {Date} fecha - Fecha a formatear
     * @param {Object} opciones - Opciones de formato
     * @returns {string} Fecha formateada
     */
    formatearFecha: function(fecha, opciones = {}) {
        if (!fecha) return 'Fecha no disponible';
        
        const opcionesDefault = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...opciones
        };
        
        try {
            return fecha.toLocaleDateString('es-ES', opcionesDefault);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return String(fecha);
        }
    },
    
    /**
     * Trunca un texto a una longitud específica y añade puntos suspensivos
     * @param {string} texto - Texto a truncar
     * @param {number} longitud - Longitud máxima
     * @returns {string} Texto truncado
     */
    truncarTexto: function(texto, longitud) {
        if (!texto) return '';
        if (texto.length <= longitud) return texto;
        return texto.substring(0, longitud) + '...';
    },
    
    /**
     * Capitaliza la primera letra de un texto
     * @param {string} texto - Texto a capitalizar
     * @returns {string} Texto con la primera letra en mayúscula
     */
    capitalizar: function(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    },
    
    /**
     * Genera un ID único para un evento
     * @returns {string} ID único
     */
    generarId: function() {
        return Math.random().toString(36).substring(2, 11);
    },
    
    /**
     * Extrae información horaria de un string de horario
     * @param {string} horario - String de horario (ej. "10:00 AM - 12:00 PM")
     * @returns {Object} Objeto con horas y minutos de inicio y fin
     */
    extraerHorario: function(horario) {
        if (!horario) return null;
        
        // Buscar patrones de hora en el formato HH:MM
        const horasMinutos = horario.match(/(\d{1,2}):(\d{2})/g);
        
        if (!horasMinutos || horasMinutos.length === 0) return null;
        
        const resultado = {};
        
        // Primer horario (inicio)
        if (horasMinutos.length >= 1) {
            const [hora, minutos] = horasMinutos[0].split(':').map(Number);
            resultado.horaInicio = hora;
            resultado.minutoInicio = minutos;
        }
        
        // Segundo horario (fin) si existe
        if (horasMinutos.length >= 2) {
            const [hora, minutos] = horasMinutos[1].split(':').map(Number);
            resultado.horaFin = hora;
            resultado.minutoFin = minutos;
        }
        
        return resultado;
    },
    
    /**
     * Muestra un mensaje toast en la pantalla
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje (success, error, info, warning)
     * @param {number} duracion - Duración en milisegundos
     */
    mostrarToast: function(mensaje, tipo = 'info', duracion = 3000) {
        // Verificar si ya existe un toast y eliminarlo
        const toastExistente = document.querySelector('.toast');
        if (toastExistente) {
            toastExistente.remove();
        }
        
        // Crear nuevo toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '4px';
        toast.style.backgroundColor = 
            tipo === 'success' ? '#4CAF50' : 
            tipo === 'error' ? '#F44336' : 
            tipo === 'warning' ? '#FF9800' : 
            '#2196F3';
        toast.style.color = 'white';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        // Icono según tipo
        const icono = 
            tipo === 'success' ? '✅' : 
            tipo === 'error' ? '❌' : 
            tipo === 'warning' ? '⚠️' : 
            'ℹ️';
        
        toast.textContent = `${icono} ${mensaje}`;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Eliminar después de la duración
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duracion);
    },
    
    /**
     * Normaliza una categoría de evento a un valor estandarizado
     * @param {string} categoria - Categoría a normalizar
     * @returns {string} Categoría normalizada
     */
    normalizarCategoria: function(categoria) {
        if (!categoria) return 'otro';
        
        const cat = categoria.toLowerCase();
        
        if (cat.includes('taller')) return 'taller';
        if (cat.includes('curso')) return 'curso';
        if (cat.includes('grupo')) return 'grupo';
        if (cat.includes('activacion') || cat.includes('activación')) return 'activacion';
        
        return 'otro';
    },
    
    /**
     * Verifica si dos fechas son el mismo día
     * @param {Date} fecha1 - Primera fecha
     * @param {Date} fecha2 - Segunda fecha
     * @returns {boolean} true si son el mismo día
     */
    esMismoDia: function(fecha1, fecha2) {
        return fecha1.getDate() === fecha2.getDate() &&
               fecha1.getMonth() === fecha2.getMonth() &&
               fecha1.getFullYear() === fecha2.getFullYear();
    },
    
    /**
     * Formatea una fecha para uso en ICS (formato iCalendar)
     * @param {Date} fecha - Fecha a formatear
     * @returns {string} Fecha en formato ICS
     */
    formatoFechaICS: function(fecha) {
        return fecha.toISOString().replace(/-|:|\.\d+/g, '');
    }
};
