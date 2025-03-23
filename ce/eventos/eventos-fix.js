/**
 * Script de corrección para el visualizador de eventos
 * Este script reemplaza la función de carga de eventos original
 * y corrige los problemas de carga y formato de fechas
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Iniciando script de corrección para eventos");
    
    // Reemplazar la función original si existe
    if (window.cargarEventos) {
        console.log("Reemplazando función cargarEventos original");
        window.cargarEventosOriginal = window.cargarEventos;
    }
    
    // Nueva implementación de cargarEventos
    window.cargarEventos = async function() {
        mostrarSpinner();
        console.log("Iniciando carga de eventos (versión corregida)");
        
        try {
            // URL correcta según tu otro código
            const jsonUrl = 'https://karenguzmn.github.io/myb_tec/ce/eventos.json';
            console.log("Intentando cargar eventos desde:", jsonUrl);
            
            const response = await fetch(jsonUrl);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Datos JSON recibidos:", data);
            
            // Verificar si los eventos están dentro de una propiedad "eventos"
            let eventosArray;
            if (data.eventos && Array.isArray(data.eventos)) {
                eventosArray = data.eventos;
                console.log("Se encontraron eventos en la propiedad 'eventos':", eventosArray.length);
            } else if (Array.isArray(data)) {
                eventosArray = data;
                console.log("Se encontraron eventos en el array principal:", eventosArray.length);
            } else {
                console.error("Formato JSON inesperado:", data);
                throw new Error("El formato de datos no es el esperado");
            }
            
            // Convertir las fechas al formato correcto y normalizar categorías
            eventos = eventosArray.map(evento => {
                // Normalizar fechas del formato DD/MM/YYYY a formato compatible con JS
                if (evento.fechaInicio && evento.fechaInicio.includes('/')) {
                    const [dia, mes, anio] = evento.fechaInicio.split('/');
                    evento.fechaInicio_original = evento.fechaInicio; // Guardar el original
                    evento.fechaInicio = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                }
                
                if (evento.fechaFin && evento.fechaFin.includes('/')) {
                    const [dia, mes, anio] = evento.fechaFin.split('/');
                    evento.fechaFin_original = evento.fechaFin; // Guardar el original
                    evento.fechaFin = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                }
                
                // Normalizar categoría a minúsculas
                if (evento.categoria) {
                    evento.categoria = evento.categoria.toLowerCase();
                }
                
                return evento;
            });
            
            console.log("Eventos procesados correctamente:", eventos.length);
            
            // Actualizar la UI
            generarCalendario(new Date().getMonth(), new Date().getFullYear());
            mostrarEventosFiltrados();
            
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            alert('Error al cargar eventos. Consulta la consola para más detalles.');
        } finally {
            ocultarSpinner();
        }
    };
    
    // Llamar a la función de carga para inicializar
    console.log("Ejecutando carga inicial de eventos");
    cargarEventos();
    
    // También podemos actualizar la función de init para asegurarnos de que se use nuestra versión
    if (window.init) {
        window.initOriginal = window.init;
        window.init = async function() {
            console.log("Ejecutando función init modificada");
            await cargarEventos(); // Usar nuestra versión corregida
            
            // Configurar el resto de la UI como en el original
            const filtros = document.querySelectorAll('.filtro');
            filtros.forEach(filtro => {
                filtro.addEventListener('click', manejarFiltroCategorias);
            });
            
            const buscador = document.getElementById('buscador');
            if (buscador) {
                buscador.addEventListener('input', manejarBusqueda);
            }
            
            const limpiarBusquedaBtn = document.getElementById('limpiar-busqueda');
            if (limpiarBusquedaBtn) {
                limpiarBusquedaBtn.addEventListener('click', limpiarBusqueda);
            }
        };
    }
});

// Función para depurar en consola la carga de eventos
window.debugEventos = function() {
    console.log("=== INFORMACIÓN DE DEPURACIÓN ===");
    console.log("Número de eventos cargados:", eventos ? eventos.length : 0);
    if (eventos && eventos.length > 0) {
        console.log("Primer evento:", eventos[0]);
        console.log("Formato de fecha del primer evento:", eventos[0].fechaInicio);
        
        // Verificar si hay eventos que deberían aparecer en el calendario actual
        const hoy = new Date();
        const eventosDelMes = eventos.filter(evento => {
            const fechaEvento = new Date(evento.fechaInicio);
            return fechaEvento.getMonth() === hoy.getMonth() &&
                   fechaEvento.getFullYear() === hoy.getFullYear();
        });
        
        console.log(`Eventos para el mes actual (${hoy.getMonth() + 1}/${hoy.getFullYear()}):`, eventosDelMes.length);
    }
    
    console.log("Estado de filtros:", window.categoriaSeleccionada, window.textoBusqueda);
    console.log("Estado del calendario:", window.diaSeleccionado, window.vistaSemanal);
};
