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
        const eventos = await EventosManager.cargarEventos();
        
        if (eventos && eventos.length > 0) {
            console.log(`Cargados ${eventos.length} eventos correctamente`);
            
            // Inicializar calendario
            CalendarioManager.inicializar();
            
            // Si hay eventos en el día actual, seleccionarlo
            const hoy = new Date();
            const eventosHoy = EventosManager.obtenerEventosPorFecha(hoy);
            
            if (eventosHoy.length > 0) {
                CalendarioManager.seleccionarDia(hoy);
            } else {
                // Si no hay eventos hoy, mostrar los próximos eventos
                UIController.mostrarEventosProximos();
            }
            
            // Configurar los controles de vista
            configurarVistaSelector();
            
            console.log('Visualizador de Eventos inicializado correctamente');
        } else {
            console.error('No se pudieron cargar eventos');
            UIController.mostrarError('No se pudieron cargar los eventos. Intente recargar la página.');
        }
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        UIController.mostrarError('Ocurrió un error al cargar la aplicación. Intente recargar la página.');
    }
    
    // Función para configurar los botones de vista
    function configurarVistaSelector() {
        const vistaBtns = document.querySelectorAll('.vista-btn');
        const calendarioContainer = document.getElementById('calendario-container');
        const eventosListContainer = document.getElementById('eventos-list-container');
        
        if (!vistaBtns.length || !calendarioContainer || !eventosListContainer) {
            console.log('No se encontraron elementos para el selector de vista');
            return;
        }
        
        // Estado por defecto
        let vistaActual = 'combinada';
        
        // Función para cambiar la vista
        function cambiarVista(vista) {
            vistaActual = vista;
            
            // Actualizar botones
            vistaBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-vista') === vista);
            });
            
            // Actualizar visibilidad
            if (vista === 'calendario') {
                calendarioContainer.style.display = 'block';
                eventosListContainer.style.display = 'none';
                document.body.classList.add('vista-compacta');
            } else if (vista === 'eventos') {
                calendarioContainer.style.display = 'none';
                eventosListContainer.style.display = 'block';
                document.body.classList.add('vista-compacta');
                
                // Al mostrar solo eventos, mostrar todos
                CalendarioManager.limpiarSeleccionDia();
            } else { // combinada
                calendarioContainer.style.display = 'block';
                eventosListContainer.style.display = 'block';
                document.body.classList.remove('vista-compacta');
            }
        }
        
        // Configurar eventos de clic
        vistaBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                cambiarVista(this.getAttribute('data-vista'));
            });
        });
    }
    
    // Función para la búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            // Esperar a que el usuario termine de escribir (debounce)
            searchTimeout = setTimeout(() => {
                const searchQuery = this.value.trim().toLowerCase();
                
                // Aquí se implementaría la búsqueda usando EventosManager
                const eventosEncontrados = searchQuery ? 
                    EventosManager.buscarEventos(searchQuery) : 
                    EventosManager.eventos;
                
                // Y actualizar la visualización con los resultados
                if (typeof UIController !== 'undefined') {
                    UIController.mostrarEventosFiltrados(eventosEncontrados, searchQuery);
                }
            }, 300);
        });
        
        // También buscar al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                
                const searchQuery = this.value.trim().toLowerCase();
                const eventosEncontrados = searchQuery ? 
                    EventosManager.buscarEventos(searchQuery) : 
                    EventosManager.eventos;
                
                if (typeof UIController !== 'undefined') {
                    UIController.mostrarEventosFiltrados(eventosEncontrados, searchQuery);
                }
            }
        });
    }
    
    // Filtros de categoría
    const categoriasContainer = document.getElementById('categorias-container');
    if (categoriasContainer) {
        categoriasContainer.addEventListener('click', function(e) {
            const categoriaEl = e.target.closest('.categoria-tag');
            if (!categoriaEl) return;
            
            // Actualizar UI
            document.querySelectorAll('.categoria-tag').forEach(tag => {
                tag.classList.toggle('active', tag === categoriaEl);
            });
            
            // Obtener categoría seleccionada
            const categoria = categoriaEl.getAttribute('data-categoria');
            
            // Filtrar eventos
            const eventosFiltrados = categoria === 'todos' ? 
                EventosManager.eventos : 
                EventosManager.filtrarPorCategoria(categoria);
            
            // Actualizar calendario con los eventos filtrados
            CalendarioManager.actualizarEventos();
            
            // Actualizar lista de eventos
            if (typeof UIController !== 'undefined') {
                UIController.mostrarEventosFiltrados(eventosFiltrados, null, categoria);
            }
        });
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
