/**
 * Archivo principal de inicialización
 * Coordina todos los módulos del Visualizador de Eventos
 */

// Esperar a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando Visualizador de Eventos...');
    
    try {
        // Inicializar controlador de UI
        UIController.inicializar();
        
        // Mostrar indicador de carga
        UIController.mostrarCargando();
        
        // Cargar eventos
        await EventosManager.cargarEventos();
        
        // Inicializar calendario
        CalendarioManager.inicializar();
        
        // Si hay eventos en el día actual, seleccionarlo
        const hoy = new Date();
        const eventosHoy = EventosManager.obtenerEventosPorFecha(hoy);
        
        if (eventosHoy.length > 0) {
            CalendarioManager.seleccionarDia(hoy);
        } else {
            // Si no hay eventos hoy, mostrar los próximos eventos
            const eventosProximos = EventosManager.obtenerProximosEventos(hoy, 10);
            
            if (eventosProximos.length > 0) {
                // Mostrar próximos eventos
                UIController.elementos.eventosTitulo.textContent = 'Próximos eventos';
                UIController.elementos.contadorEventos.textContent = `${eventosProximos.length} eventos`;
                
                UIController.elementos.listaEventos.innerHTML = '';
                
                eventosProximos.forEach(evento => {
                    UIController.crearTarjetaEvento(evento);
                });
            } else {
                UIController.mostrarMensajeVacio('No hay eventos programados próximamente');
            }
        }
        
        console.log('Visualizador de Eventos inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        UIController.mostrarError('Ocurrió un error al cargar la aplicación. Por favor, recarga la página.');
    }
});

// Permitir acceso global a las funciones principales para depuración
window.app = {
    recargarEventos: async function() {
        try {
            await EventosManager.cargarEventos(true);
            CalendarioManager.actualizarEventos();
            return true;
        } catch (error) {
            console.error('Error al recargar eventos:', error);
            return false;
        }
    },
    
    irAFecha: function(fecha) {
        if (typeof fecha === 'string') {
            fecha = new Date(fecha);
        }
        
        if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
            console.error('Fecha inválida:', fecha);
            return false;
        }
        
        CalendarioManager.irAFecha(fecha);
        return true;
    },
    
    version: '1.0.0'
};

// Registrar service worker si está disponible (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
            function(registration) {
                console.log('Service Worker registrado con éxito:', registration.scope);
            },
            function(error) {
                console.log('Registro de Service Worker fallido:', error);
            }
        );
    });
}
