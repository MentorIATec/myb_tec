/**
 * Script de corrección para la carga de eventos de Consejería Emocional
 * Esta versión simplificada se enfoca en la ruta correcta y el formato de fechas
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Iniciando script de corrección para eventos");
    
    // Reemplazar la función original
    window.cargarEventos = async function() {
        try {
            const spinner = document.getElementById('spinner-container');
            if (spinner) spinner.style.display = 'flex';
            
            console.log("Cargando eventos desde la URL correcta...");
            
            // URL verificada a la que apuntas
            const jsonUrl = 'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json';
            
            const response = await fetch(jsonUrl, {
                cache: 'no-store', // Evitar caché
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Datos JSON recibidos:", data);
            
            // Acceder a los eventos dentro de la propiedad "eventos"
            if (data.eventos && Array.isArray(data.eventos)) {
                // Convertir las fechas al formato correcto
                window.eventos = data.eventos.map(evento => {
                    // Guardar formato original para referencia
                    evento.fechaInicio_original = evento.fechaInicio;
                    evento.fechaFin_original = evento.fechaFin;
                    
                    // Convertir DD/MM/YYYY a YYYY-MM-DD para JavaScript
                    if (evento.fechaInicio && evento.fechaInicio.includes('/')) {
                        const [dia, mes, anio] = evento.fechaInicio.split('/');
                        evento.fechaInicio = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                    }
                    
                    if (evento.fechaFin && evento.fechaFin.includes('/')) {
                        const [dia, mes, anio] = evento.fechaFin.split('/');
                        evento.fechaFin = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                    }
                    
                    // Normalizar categoría a minúsculas para consistencia en filtrado
                    if (evento.categoria) {
                        evento.categoria_original = evento.categoria;
                        evento.categoria = evento.categoria.toLowerCase();
                    }
                    
                    return evento;
                });
                
                console.log(`${window.eventos.length} eventos procesados correctamente.`);
                
                // Actualizar la UI
                if (typeof generarCalendario === 'function') {
                    generarCalendario(new Date().getMonth(), new Date().getFullYear());
                }
                
                if (typeof mostrarEventosFiltrados === 'function') {
                    mostrarEventosFiltrados();
                }
            } else {
                console.error("Formato inesperado de JSON:", data);
                throw new Error("El formato del JSON no es el esperado");
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            alert('Error al cargar eventos: ' + error.message);
        } finally {
            const spinner = document.getElementById('spinner-container');
            if (spinner) spinner.style.display = 'none';
        }
    };
    
    // También reemplazar las funciones relacionadas para mantener coherencia
    window.mostrarSpinner = function() {
        const spinner = document.getElementById('spinner-container');
        if (spinner) spinner.style.display = 'flex';
    };
    
    window.ocultarSpinner = function() {
        const spinner = document.getElementById('spinner-container');
        if (spinner) spinner.style.display = 'none';
    };
    
    // Función para depuración
    window.depurarEventos = function() {
        console.log("=== INFORMACIÓN DE DEPURACIÓN ===");
        console.log("Número de eventos cargados:", window.eventos ? window.eventos.length : 0);
        
        if (window.eventos && window.eventos.length > 0) {
            console.log("Primer evento:", window.eventos[0]);
            console.log("Formato de fecha del primer evento:", window.eventos[0].fechaInicio);
            
            // Verificar si hay eventos que deberían aparecer en el mes actual
            const hoy = new Date();
            const eventosDelMes = window.eventos.filter(evento => {
                try {
                    const fechaEvento = new Date(evento.fechaInicio);
                    return fechaEvento.getMonth() === hoy.getMonth() &&
                           fechaEvento.getFullYear() === hoy.getFullYear();
                } catch (e) {
                    return false;
                }
            });
            
            console.log(`Eventos para el mes actual (${hoy.getMonth() + 1}/${hoy.getFullYear()}):`, 
                        eventosDelMes.length);
            console.log("Eventos del mes actual:", eventosDelMes);
        }
    };
    
    // Ejecutar la carga de eventos después de un pequeño retraso
    // para asegurar que todos los otros scripts se han cargado
    setTimeout(() => {
        cargarEventos();
    }, 500);
});
