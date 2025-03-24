/**
 * Visualizador de Eventos - Script Mejorado
 * Versión 2.0
 * 
 * Mejoras implementadas:
 * - Exportación de eventos a calendarios (.ics)
 * - Compartir eventos usando Web Share API
 * - Modo oscuro/claro con persistencia
 * - Caché local para uso offline
 * - Mejoras en manejo de errores
 * - Mejoras de accesibilidad
 */
document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const jsonUrl = 'https://karenguzmn.github.io/myb_tec/ce/eventos.json'; // URL del archivo JSON
    const CACHE_KEY = 'visualizador_eventos_cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    const THEME_KEY = 'visualizador_theme';
    
    // Variables de estado
    let allEventos = [];
    let filteredEventos = [];
    let fechaActual = new Date();
    let mesActual = fechaActual.getMonth();
    let anioActual = fechaActual.getFullYear();
    let categoriaSeleccionada = 'todos';
    let diaSeleccionado = null;
    let vistaActual = 'combinada';
    let searchQuery = '';
    let isDarkMode = localStorage.getItem(THEME_KEY) === 'dark';
    
    // Elementos DOM
    const mesAnteriorBtn = document.getElementById('mes-anterior');
    const mesSiguienteBtn = document.getElementById('mes-siguiente');
    const mesActualEl = document.getElementById('mes-actual');
    const calendarioGrid = document.getElementById('calendario-grid');
    const eventosGrid = document.getElementById('eventos-grid');
    const eventosCounter = document.getElementById('eventos-counter');
    const categoriasContainer = document.getElementById('categorias-container');
    const searchInput = document.getElementById('search-input');
    const calendarioContainer = document.getElementById('calendario-container');
    const eventosListContainer = document.getElementById('eventos-list-container');
    const vistaBtns = document.querySelectorAll('.vista-btn');
    
    // Modales
    const diaModal = document.getElementById('dia-modal');
    const diaModalTitle = document.getElementById('dia-modal-title');
    const diaModalClose = document.getElementById('dia-modal-close');
    const diaEventosLista = document.getElementById('dia-eventos-lista');
    
    const eventoModal = document.getElementById('evento-modal');
    const eventoModalTitle = document.getElementById('evento-modal-title');
    const eventoModalSubtitle = document.getElementById('evento-modal-subtitle');
    const eventoModalInfo = document.getElementById('evento-modal-info');
    const eventoModalDescription = document.getElementById('evento-modal-description');
    const eventoModalStatus = document.getElementById('evento-modal-status');
    const eventoModalAction = document.getElementById('evento-modal-action');
    const eventoModalClose = document.getElementById('evento-modal-close');
    
    // Meses en español
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Clases de categorías (añadida la categoría "evento")
    const categoriaClases = {
        'curso': 'curso',
        'taller': 'taller',
        'grupo': 'grupo',
        'activacion': 'activacion',
        'evento': 'evento'
    };
    
    // Inyectar botón de tema y botones de acción adicionales
    function inyectarControlesUI() {
        // 1. Crear botón de tema oscuro/claro
        const headerControles = document.querySelector('.controles-derecha');
        if (headerControles) {
            const themeToggle = document.createElement('button');
            themeToggle.id = 'theme-toggle';
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
            themeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
            themeToggle.addEventListener('click', toggleTheme);
            headerControles.appendChild(themeToggle);
        }
        
        // 2. Añadir botones de acción en modal de evento
        if (eventoModal) {
            const footerModal = eventoModal.querySelector('.evento-modal-footer');
            if (footerModal) {
                // Botón para añadir a calendario
                const calendarBtn = document.createElement('button');
                calendarBtn.id = 'evento-calendar-btn';
                calendarBtn.className = 'evento-action secondary';
                calendarBtn.innerHTML = '📅 Añadir a calendario';
                calendarBtn.addEventListener('click', () => {
                    const eventoId = eventoModal.getAttribute('data-evento-id');
                    if (eventoId) {
                        const evento = obtenerEventoPorId(eventoId);
                        if (evento) exportarEventoACalendario(evento);
                    }
                });
                
                // Botón para compartir
                const shareBtn = document.createElement('button');
                shareBtn.id = 'evento-share-btn';
                shareBtn.className = 'evento-action secondary';
                shareBtn.innerHTML = '🔗 Compartir';
                shareBtn.addEventListener('click', () => {
                    const eventoId = eventoModal.getAttribute('data-evento-id');
                    if (eventoId) {
                        const evento = obtenerEventoPorId(eventoId);
                        if (evento) compartirEvento(evento);
                    }
                });
                
                // Crear contenedor para botones secundarios
                const botonesSecundarios = document.createElement('div');
                botonesSecundarios.className = 'evento-actions-secondary';
                botonesSecundarios.appendChild(calendarBtn);
                
                // Solo añadir botón de compartir si Web Share API está disponible
                if (navigator.share) {
                    botonesSecundarios.appendChild(shareBtn);
                }
                
                // Añadir antes del botón principal
                footerModal.insertBefore(botonesSecundarios, eventoModalAction);
            }
        }
        
        // 3. Añadir estilos CSS necesarios
        const estilosAdicionales = `
            .theme-toggle {
                width: 36px;
                height: 36px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.3s ease;
            }
            
            .theme-toggle:hover {
                background: var(--primary-light);
                border-color: var(--primary);
            }
            
            body.dark-mode {
                background-color: #121212;
                color: #f5f5f5;
            }
            
            body.dark-mode .eventos-title,
            body.dark-mode .eventos-list-title {
                color: #e0f0ff;
            }
            
            body.dark-mode .eventos-description {
                color: #aaa;
            }
            
            body.dark-mode .filtros-container,
            body.dark-mode .calendario-container,
            body.dark-mode .evento-card,
            body.dark-mode .leyenda-container,
            body.dark-mode .theme-toggle,
            body.dark-mode .info-item {
                background-color: #1e1e1e;
                border-color: #333;
            }
            
            body.dark-mode .calendario-grid .dia-container {
                background-color: #252525;
                border-color: #333;
            }
            
            body.dark-mode .calendario-grid .dia-container.otro-mes {
                background-color: #1a1a1a;
                color: #666;
            }
            
            body.dark-mode .calendario-grid .dia-container.has-eventos {
                background-color: rgba(49, 116, 173, 0.2);
            }
            
            body.dark-mode .calendario-grid .dia-container.seleccionado {
                background-color: rgba(49, 116, 173, 0.4);
            }
            
            body.dark-mode .search-input {
                background-color: #252525;
                color: #fff;
                border-color: #333;
            }
            
            body.dark-mode .evento-footer,
            body.dark-mode .dia-evento-item,
            body.dark-mode .evento-modal-footer {
                background-color: #252525;
            }
            
            body.dark-mode .leyenda-item {
                color: #aaa;
            }
            
            body.dark-mode .eventos-message {
                background-color: #252525;
                color: #aaa;
            }
            
            body.dark-mode .evento-modal-content,
            body.dark-mode .dia-modal-content {
                background-color: #1e1e1e;
                color: #f5f5f5;
            }
            
            body.dark-mode .evento-modal-title {
                color: #e0f0ff;
            }
            
            .evento-actions-secondary {
                display: flex;
                gap: 10px;
                margin-right: 10px;
            }
            
            .evento-action.secondary {
                background: var(--secondary);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 13px;
                border: none;
                cursor: pointer;
                font-weight: 600;
                transition: var(--transition-normal);
            }
            
            .evento-action.secondary:hover {
                background: #5a9ed0;
                transform: translateY(-2px);
            }
            
            .toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .toast {
                padding: 12px 20px;
                background-color: var(--primary);
                color: white;
                border-radius: 5px;
                margin-bottom: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
                max-width: 300px;
            }
            
            .toast.success { background-color: var(--success); }
            .toast.error { background-color: var(--danger); }
            .toast.warning { background-color: var(--warning); color: #333; }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .offline-indicator {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--warning);
                color: #333;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 9999;
                display: none;
            }
            
            .offline-indicator.visible {
                display: block;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background-color: var(--primary);
                color: white;
                padding: 8px 15px;
                border-radius: 0 0 5px 0;
                font-weight: 600;
                transition: top 0.3s ease;
                z-index: 1001;
                text-decoration: none;
            }
            
            .skip-link:focus {
                top: 0;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = estilosAdicionales;
        document.head.appendChild(styleElement);
        
        // 4. Añadir indicador de modo offline
        const offlineIndicator = document.createElement('div');
        offlineIndicator.className = 'offline-indicator';
        offlineIndicator.textContent = '📶 Modo sin conexión - Usando datos almacenados';
        offlineIndicator.id = 'offline-indicator';
        document.body.appendChild(offlineIndicator);
        
        // 5. Añadir contenedor para toasts
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // 6. Añadir enlace de salto para accesibilidad
        const skipLink = document.createElement('a');
        skipLink.href = '#eventos-grid';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Saltar al contenido principal';
        document.body.prepend(skipLink);
        
        // 7. Aplicar modo oscuro si está habilitado
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Función para cargar eventos del JSON con soporte offline
    async function cargarEventos() {
        try {
            // Verificar si hay datos en caché y no están expirados
            const cachedData = obtenerCacheLocal();
            const isOffline = !navigator.onLine;
            
            // Si estamos offline y tenemos cache, usamos la cache
            if (isOffline && cachedData) {
                mostrarToast('Usando datos almacenados en caché', 'warning');
                document.getElementById('offline-indicator').classList.add('visible');
                
                // Procesar los eventos de la caché
                procesarEventos(cachedData);
                return;
            }
            
            // Si estamos online, intentamos obtener los datos frescos
            const response = await fetch(jsonUrl);
            
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de eventos');
            }
            
            const data = await response.json();
            
            // Guardar en caché local
            guardarCacheLocal(data);
            
            // Procesar los eventos
            procesarEventos(data);
            
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            
            // Si hay un error pero tenemos caché, usamos la caché
            const cachedData = obtenerCacheLocal();
            if (cachedData) {
                mostrarToast('Error de conexión. Usando datos guardados localmente.', 'warning');
                document.getElementById('offline-indicator').classList.add('visible');
                procesarEventos(cachedData);
            } else {
                // No hay caché ni conexión
                calendarioGrid.innerHTML = `
                    <div class="eventos-message">
                        <p>Error al cargar el calendario. No se pudieron obtener los datos.</p>
                        <button id="retry-button" class="evento-action" style="margin-top:15px;">Reintentar</button>
                    </div>
                `;
                
                eventosGrid.innerHTML = `
                    <div class="eventos-message">
                        <p>Error al cargar eventos. No se pudieron obtener los datos.</p>
                    </div>
                `;
                
                // Botón para reintentar
                const retryButton = document.getElementById('retry-button');
                if (retryButton) {
                    retryButton.addEventListener('click', cargarEventos);
                }
            }
        }
    }
    
    // Función para procesar los eventos cargados
    function procesarEventos(data) {
        // Guardar todos los eventos
        allEventos = data.eventos || [];
        
        // Formatear las fechas a objetos Date y corregir inconsistencias
        allEventos.forEach(evento => {
            // Verificar y corregir el formato de fecha
            evento.fechaInicioObj = parsearFecha(evento.fechaInicio);
            evento.fechaFinObj = parsearFecha(evento.fechaFin || evento.fechaInicio);
            
            // Normalizar categorías (convertir a minúscula)
            evento.categoria = evento.categoria.toLowerCase();
            
            // Normalizar formato de horario
            if (evento.horario) {
                evento.horario = normalizarHorario(evento.horario);
            }
        });
        
        // Ordenar eventos por fecha
        allEventos.sort((a, b) => {
            if (!a.fechaInicioObj || !b.fechaInicioObj) return 0;
            return a.fechaInicioObj - b.fechaInicioObj;
        });
        
        // Inicializar visualización
        filteredEventos = [...allEventos];
        actualizarMesActual();
        generarCalendario();
        mostrarEventos();
        
        // Si hay eventos para el día actual, seleccionarlo
        const hoy = new Date();
        const eventosHoy = obtenerEventosPorFecha(hoy);
        if (eventosHoy.length > 0) {
            seleccionarDia(hoy);
        }
        
        document.getElementById('offline-indicator').classList.remove('visible');
    }
    
    // Guardar datos en cache local
    function guardarCacheLocal(data) {
        if (!data) return;
        
        try {
            const cacheData = {
                timestamp: Date.now(),
                data: data
            };
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error al guardar en caché local:', error);
        }
    }
    
    // Obtener datos de cache local
    function obtenerCacheLocal() {
        try {
            const cacheData = localStorage.getItem(CACHE_KEY);
            if (!cacheData) return null;
            
            const { timestamp, data } = JSON.parse(cacheData);
            const ahora = Date.now();
            
            // Verificar si la caché ha expirado
            if (ahora - timestamp > CACHE_DURATION) {
                // Caché expirada, eliminarla
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error al obtener caché local:', error);
            return null;
        }
    }
    
    // Función mejorada para parsear fechas con detección inteligente de formato
    function parsearFecha(fechaStr) {
        if (!fechaStr) return null;
        
        // Intentar detectar formato
        const partes = fechaStr.split('/');
        if (partes.length !== 3) return null;
        
        // Verificar si es MM/DD/YYYY o DD/MM/YYYY
        let mes, dia, anio;
        
        // Valores numéricos
        const parte1 = parseInt(partes[0]);
        const parte2 = parseInt(partes[1]);
        const parte3 = parseInt(partes[2]);
        
        // Asumimos MM/DD/YYYY por defecto
        mes = parte1 - 1; // Restar 1 porque en JS los meses van de 0-11
        dia = parte2;
        anio = parte3;
        
        // Si el primer valor parece día (>12) y el segundo valor parece mes (≤12)
        if (parte1 > 12 && parte2 <= 12) {
            // Es DD/MM/YYYY
            dia = parte1;
            mes = parte2 - 1;
        }
        
        // Crear la fecha
        const fecha = new Date(anio, mes, dia);
        
        // Verificar validez (si la fecha es inválida, Date() normalizará)
        if (isNaN(fecha.getTime())) {
            console.warn(`Fecha inválida: ${fechaStr}`);
            return null;
        }
        
        return fecha;
    }
    
    // Función para normalizar formato de horario
    function normalizarHorario(horarioStr) {
        if (!horarioStr) return 'Horario por definir';
        
        // Mantener el formato original pero con consistencia
        return horarioStr.trim();
    }
    
    // Función para formatear fechas a formato legible
    function formatoFecha(fecha, incluirSemana = true) {
        if (!fecha) return 'Fecha por definir';
        
        const opciones = incluirSemana ? 
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } : 
            { year: 'numeric', month: 'long', day: 'numeric' };
        
        return fecha.toLocaleDateString('es-ES', opciones);
    }
    
    // Función para formatear fechas a formato ICS
    function formatoFechaICS(fecha) {
        if (!fecha) return '';
        
        // Formato: YYYYMMDDTHHMMSSZ
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');
        const seconds = String(fecha.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }
    
    // Exportar evento a calendario (.ics)
    function exportarEventoACalendario(evento) {
        if (!evento) return;
        
        try {
            // Crear fechas con hora para inicio y fin
            let fechaInicio = new Date(evento.fechaInicioObj);
            let fechaFin = new Date(evento.fechaFinObj);
            
            // Extraer información de horario si está disponible
            const infoHorario = extraerHorario(evento.horario);
            
            if (infoHorario) {
                // Aplicar horario a fechas
                if (infoHorario.horaInicio !== undefined && infoHorario.minutoInicio !== undefined) {
                    fechaInicio.setHours(infoHorario.horaInicio, infoHorario.minutoInicio, 0);
                }
                
                if (infoHorario.horaFin !== undefined && infoHorario.minutoFin !== undefined) {
                    fechaFin.setHours(infoHorario.horaFin, infoHorario.minutoFin, 0);
                } else if (infoHorario.horaInicio !== undefined) {
                    // Si solo tenemos hora de inicio, asumimos 1 hora de duración
                    fechaFin = new Date(fechaInicio);
                    fechaFin.setHours(fechaFin.getHours() + 1);
                }
            } else {
                // Si no hay horario específico, establecer 9am-10am como predeterminado
                fechaInicio.setHours(9, 0, 0);
                fechaFin.setHours(10, 0, 0);
            }
            
            // Si es el mismo día y no se ha establecido hora de fin, añadir 1 hora
            if (esMismaFecha(fechaInicio, fechaFin) && 
                fechaInicio.getHours() === fechaFin.getHours() &&
                fechaInicio.getMinutes() === fechaFin.getMinutes()) {
                fechaFin.setHours(fechaFin.getHours() + 1);
            }
            
            // Crear contenido ICS
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Consejería Emocional//Eventos//ES',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${evento.id}@consejeria-emocional`,
                `DTSTAMP:${formatoFechaICS(new Date())}`,
                `DTSTART:${formatoFechaICS(fechaInicio)}`,
                `DTEND:${formatoFechaICS(fechaFin)}`,
                `SUMMARY:${evento.titulo}`,
                `DESCRIPTION:${evento.descripcion || evento.descripción || ''}`,
                `LOCATION:${evento.ubicacion || evento.ubicación || ''}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');
            
            // Crear y descargar archivo
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `evento_${evento.id}.ics`;
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            mostrarToast('Evento añadido a tu calendario', 'success');
        } catch (error) {
            console.error('Error al exportar evento a calendario:', error);
            mostrarToast('Error al añadir evento al calendario', 'error');
        }
    }
    
    // Extraer información de horario de un string
    function extraerHorario(horarioStr) {
        if (!horarioStr) return null;
        
        // Buscar patrones de tiempo en formato HH:MM (puede haber varios)
        const tiempos = horarioStr.match(/(\d{1,2}):(\d{2})(?: *(?:AM|PM|am|pm)?)/g);
        if (!tiempos || tiempos.length === 0) return null;
        
        const resultado = {};
        
        // Procesar el primer tiempo (hora de inicio)
        if (tiempos.length >= 1) {
            const [horas, minutos] = tiempos[0].split(':');
            resultado.horaInicio = parseInt(horas);
            resultado.minutoInicio = parseInt(minutos);
            
            // Ajustar para PM si es necesario
            if (tiempos[0].toLowerCase().includes('pm') && resultado.horaInicio < 12) {
                resultado.horaInicio += 12;
            }
        }
        
        // Procesar el segundo tiempo (hora de fin)
        if (tiempos.length >= 2) {
            const [horas, minutos] = tiempos[1].split(':');
            resultado.horaFin = parseInt(horas);
            resultado.minutoFin = parseInt(minutos);
            
            // Ajustar para PM si es necesario
            if (tiempos[1].toLowerCase().includes('pm') && resultado.horaFin < 12) {
                resultado.horaFin += 12;
            }
        }
        
        return resultado;
    }
    
    // Compartir evento usando Web Share API
    function compartirEvento(evento) {
        if (!evento) return;
        
        if (navigator.share) {
            // Crear texto descriptivo
            const textoCompartir = `
${evento.titulo}

📅 ${formatoFecha(evento.fechaInicioObj)}
🕒 ${evento.horario}
📍 ${evento.ubicacion || evento.ubicación || 'Ubicación no especificada'}

${evento.descripcion || evento.descripción || ''}

Compartido desde el Calendario de Eventos de Consejería Emocional
`;
            
            navigator.share({
                title: evento.titulo,
                text: textoCompartir,
                url: window.location.href
            })
            .then(() => {
                mostrarToast('Evento compartido exitosamente', 'success');
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Error al compartir:', error);
                    mostrarToast('Error al compartir evento', 'error');
                }
            });
        } else {
            // Fallback: copiar al portapapeles
            const textoAlternativo = `${evento.titulo} - ${formatoFecha(evento.fechaInicioObj)} - ${evento.horario}`;
            
            try {
                navigator.clipboard.writeText(textoAlternativo)
                    .then(() => {
                        mostrarToast('Información copiada al portapapeles', 'success');
                    })
                    .catch(error => {
                        console.error('Error al copiar:', error);
                        mostrarToast('No se pudo copiar la información', 'error');
                    });
            } catch (error) {
                console.error('Error al copiar:', error);
                mostrarToast('No se pudo copiar la información', 'error');
            }
        }
    }
    
    // Función para mostrar toasts
    function mostrarToast(mensaje, tipo = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        
        toastContainer.appendChild(toast);
        
        // Eliminar el toast después de 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Alternar tema claro/oscuro
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(THEME_KEY, 'dark');
            if (themeToggle) {
                themeToggle.innerHTML = '☀️';
                themeToggle.setAttribute('aria-label', 'Cambiar a tema claro');
            }
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem(THEME_KEY, 'light');
            if (themeToggle) {
                themeToggle.innerHTML = '🌙';
                themeToggle.setAttribute('aria-label', 'Cambiar a tema oscuro');
            }
        }
        
        mostrarToast(`Tema ${isDarkMode ? 'oscuro' : 'claro'} activado`, 'info');
    }
    
    // Función para obtener eventos para una fecha específica
    function obtenerEventosPorFecha(fecha) {
        if (!fecha) return [];
        
        return filteredEventos.filter(evento => {
            // Verificar si la fecha está entre la fecha de inicio y fin del evento
            return esMismaFecha(evento.fechaInicioObj, fecha) || 
                esMismaFecha(evento.fechaFinObj, fecha) || 
                (evento.fechaInicioObj < fecha && evento.fechaFinObj > fecha);
        });
    }
    
    // Obtener evento por ID
    function obtenerEventoPorId(id) {
        return allEventos.find(evento => evento.id == id);
    }
    
    // Comparar si dos fechas son el mismo día
    function esMismaFecha(fecha1, fecha2) {
        if (!fecha1 || !fecha2) return false;
        
        return fecha1.getDate() === fecha2.getDate() &&
            fecha1.getMonth() === fecha2.getMonth() &&
            fecha1.getFullYear() === fecha2.getFullYear();
    }
    
    // Función para actualizar el título del mes actual
    function actualizarMesActual() {
        mesActualEl.textContent = `${meses[mesActual]} ${anioActual}`;
    }
    
    // Función para generar el calendario del mes actual
    function generarCalendario() {
        // Limpiar grid
        calendarioGrid.innerHTML = '';
        
        // Día 1 del mes actual
        const primerDia = new Date(anioActual, mesActual, 1);
        // Día de la semana del primer día (0: domingo, 6: sábado)
        const primerDiaSemana = primerDia.getDay();
        
        // Último día del mes actual
        const ultimoDia = new Date(anioActual, mesActual + 1, 0).getDate();
        
        // Último día del mes anterior
        const ultimoDiaMesAnterior = new Date(anioActual, mesActual, 0).getDate();
        
        // Total de celdas necesarias (42 = 6 semanas de 7 días)
        const totalCeldas = 42;
        
        // Fecha actual para marcar el día de hoy
        const fechaHoy = new Date();
        const esHoyMesActual = fechaHoy.getMonth() === mesActual && 
                            fechaHoy.getFullYear() === anioActual;
        
        // Generar celdas para el calendario
        for (let i = 0; i < totalCeldas; i++) {
            let dia;
            let mes = mesActual;
            let anio = anioActual;
            let esOtroMes = false;
            
            // Días del mes anterior
            if (i < primerDiaSemana) {
                dia = ultimoDiaMesAnterior - primerDiaSemana + i + 1;
                mes = mesActual - 1;
                if (mes < 0) {
                    mes = 11;
                    anio = anioActual - 1;
                }
                esOtroMes = true;
            }
            // Días del mes actual
            else if (i >= primerDiaSemana && i < primerDiaSemana + ultimoDia) {
                dia = i - primerDiaSemana + 1;
            }
            // Días del mes siguiente
            else {
                dia = i - primerDiaSemana - ultimoDia + 1;
                mes = mesActual + 1;
                if (mes > 11) {
                    mes = 0;
                    anio = anioActual + 1;
                }
                esOtroMes = true;
            }
            
            // Fecha para este día
            const fechaDia = new Date(anio, mes, dia);
            
            // Determinar si es el día seleccionado
            const esSeleccionado = diaSeleccionado && esMismaFecha(diaSeleccionado, fechaDia);
            
            // Determinar si es el día de hoy
            const esHoy = esHoyMesActual && fechaHoy.getDate() === dia && !esOtroMes;
            
            // Obtener eventos para esta fecha
            const eventosDia = obtenerEventosPorFecha(fechaDia);
            const tieneEventos = eventosDia.length > 0;
            
            // Crear elemento para el día
            const diaEl = document.createElement('div');
            diaEl.className = 'dia-container';
            if (esOtroMes) diaEl.classList.add('otro-mes');
            if (tieneEventos) diaEl.classList.add('has-eventos');
            if (esHoy) diaEl.classList.add('hoy');
            if (esSeleccionado) diaEl.classList.add('seleccionado');
            
            // Guardar fecha como atributo
            diaEl.setAttribute('data-fecha', `${anio}-${mes+1}-${dia}`);
            
            // Mejorar accesibilidad
            diaEl.setAttribute('role', 'button');
            diaEl.setAttribute('aria-label', `${dia} de ${meses[mes]} de ${anio}${tieneEventos ? `, ${eventosDia.length} eventos` : ''}`);
            if (tieneEventos) diaEl.setAttribute('tabindex', '0');
            
            // Contenido del día
            diaEl.innerHTML = `
                <div class="dia-numero">${dia}</div>
                ${tieneEventos ? `<div class="dia-indicadores">
                    ${generarIndicadoresDia(eventosDia)}
                </div>` : ''}
            `;
            
            // Evento de clic para mostrar eventos del día
            if (tieneEventos) {
                diaEl.addEventListener('click', function() {
                    const [anio, mes, dia] = this.getAttribute('data-fecha').split('-').map(Number);
                    const fecha = new Date(anio, mes-1, dia);
                    seleccionarDia(fecha);
                    mostrarEventosDia(fecha);
                });
                
                // Mejorar accesibilidad - soporte para teclado
                diaEl.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const [anio, mes, dia] = this.getAttribute('data-fecha').split('-').map(Number);
                        const fecha = new Date(anio, mes-1, dia);
                        seleccionarDia(fecha);
                        mostrarEventosDia(fecha);
                    }
                });
            }
            
            // Agregar al grid
            calendarioGrid.appendChild(diaEl);
            
            // Si pasamos 4 semanas y ya estamos en el mes siguiente, salir
            if (i >= 28 && dia > 7 && mes !== mesActual) break;
        }
    }
    
    // Generar indicadores para eventos del día
    function generarIndicadoresDia(eventos) {
        // Usando un objeto para contar eventos por categoría
        const categorias = {};
        eventos.forEach(evento => {
            const cat = evento.categoria.toLowerCase();
            if (!categorias[cat]) categorias[cat] = 0;
            categorias[cat]++;
        });
        
        // Convertir a array para mostrar
        const categoriasArray = Object.keys(categorias);
        
        // Máximo 3 indicadores por día
        const maxIndicadores = Math.min(3, categoriasArray.length);
        let indicadoresHTML = '';
        
        // Mostrar hasta maxIndicadores
        for (let i = 0; i < maxIndicadores; i++) {
            const categoria = categoriasArray[i];
            indicadoresHTML += `<div class="dia-indicador ${categoriaClases[categoria] || ''}"></div>`;
        }
        
        return indicadoresHTML;
    }
    
    // Función para seleccionar un día
    function seleccionarDia(fecha) {
        // Deseleccionar día anterior
        const diaSeleccionadoEl = document.querySelector('.dia-container.seleccionado');
        if (diaSeleccionadoEl) {
            diaSeleccionadoEl.classList.remove('seleccionado');
        }
        
        // Guardar la nueva fecha seleccionada
        diaSeleccionado = fecha;
        
        // Seleccionar el nuevo día
        const nuevoDiaEl = document.querySelector(`.dia-container[data-fecha="${fecha.getFullYear()}-${fecha.getMonth()+1}-${fecha.getDate()}"]`);
        if (nuevoDiaEl) {
            nuevoDiaEl.classList.add('seleccionado');
        }
        
        // Actualizar eventos mostrados (solo mostrar eventos del día seleccionado)
        mostrarEventos();
    }
    
    // Función para mostrar eventos del día en el modal
    function mostrarEventosDia(fecha) {
        const eventosDia = obtenerEventosPorFecha(fecha);
        
        if (eventosDia.length === 0) return;
        
        // Actualizar título del modal
        diaModalTitle.textContent = `Eventos para el ${formatoFecha(fecha)}`;
        
        // Limpiar lista de eventos
        diaEventosLista.innerHTML = '';
        
        // Ordenar eventos por hora
        eventosDia.sort((a, b) => {
            // Si no tienen horario, mantener el orden
            if (!a.horario || !b.horario) return 0;
            return a.horario.localeCompare(b.horario);
        });
        
        // Mostrar cada evento
        eventosDia.forEach(evento => {
            const eventoEl = document.createElement('div');
            eventoEl.className = `dia-evento-item ${categoriaClases[evento.categoria.toLowerCase()] || ''}`;
            
            // Mejorar accesibilidad
            eventoEl.setAttribute('role', 'button');
            eventoEl.setAttribute('tabindex', '0');
            eventoEl.setAttribute('aria-label', `${evento.titulo}, ${evento.horario}, ${evento.categoria}`);
            
            eventoEl.innerHTML = `
                <div class="dia-evento-hora">
                    <span class="info-icon">⏱️</span>
                    ${evento.horario || 'Horario no especificado'}
                </div>
                <div class="dia-evento-titulo">
                    ${evento.titulo}
                    <span class="dia-evento-cat ${categoriaClases[evento.categoria.toLowerCase()] || ''}">${capitalizarPrimera(evento.categoria)}</span>
                </div>
                <div class="dia-evento-ubicacion">
                    <span class="info-icon">📍</span>
                    ${evento.ubicacion || evento.ubicación || 'Ubicación por definir'}
                </div>
            `;
            
            // Evento de clic para ver detalles
            eventoEl.addEventListener('click', function() {
                mostrarDetallesEvento(evento.id);
                cerrarModalDia();
            });
            
            // Soporte para teclado
            eventoEl.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    mostrarDetallesEvento(evento.id);
                    cerrarModalDia();
                }
            });
            
            diaEventosLista.appendChild(eventoEl);
        });
        
        // Mostrar modal
        diaModal.style.display = 'flex';
        
        // Enfocar el modal para accesibilidad
        diaModalTitle.focus();
        
        document.body.style.overflow = 'hidden';
    }
    
    // Función para mostrar eventos filtrados
    function mostrarEventos() {
        // Aplicar filtros
        filtrarEventos();
        
        // Si hay día seleccionado, solo mostrar eventos de ese día
        let eventosAMostrar = filteredEventos;
        if (diaSeleccionado) {
            eventosAMostrar = obtenerEventosPorFecha(diaSeleccionado);
        }
        
        // Actualizar contador
        eventosCounter.textContent = `${eventosAMostrar.length} ${eventosAMostrar.length === 1 ? 'evento' : 'eventos'}`;
        
        // Si no hay eventos
        if (eventosAMostrar.length === 0) {
            eventosGrid.innerHTML = `
                <div class="eventos-message">
                    No hay eventos para mostrar.
                    ${diaSeleccionado ? '<br><button id="limpiar-seleccion" class="evento-action" style="margin-top:15px;padding:8px 15px;">Ver todos los eventos</button>' : ''}
                </div>
            `;
            
            // Botón para limpiar selección
            const limpiarBtn = document.getElementById('limpiar-seleccion');
            if (limpiarBtn) {
                limpiarBtn.addEventListener('click', limpiarSeleccionDia);
            }
            
            return;
        }
        
        // Limpiar grid
        eventosGrid.innerHTML = '';
        
        // Ordenar eventos por fecha
        eventosAMostrar.sort((a, b) => {
            // Si no tienen fecha, mantener el orden
            if (!a.fechaInicioObj || !b.fechaInicioObj) return 0;
            return a.fechaInicioObj - b.fechaInicioObj;
        });
        
        // Mostrar cada evento
        eventosAMostrar.forEach(evento => {
            const eventoEl = document.createElement('div');
            eventoEl.className = `evento-card ${categoriaClases[evento.categoria.toLowerCase()] || ''}`;
            eventoEl.setAttribute('data-id', evento.id);
            
            // Mejorar accesibilidad
            eventoEl.setAttribute('role', 'article');
            eventoEl.setAttribute('aria-labelledby', `evento-titulo-${evento.id}`);
            
            // Estado de disponibilidad
            let estadoClase = 'status-available';
            let estadoTexto = 'Cupos disponibles';
            
            if (evento.estado === 'limitado') {
                estadoClase = 'status-limited';
                estadoTexto = 'Pocos cupos disponibles';
            } else if (evento.estado === 'lleno') {
                estadoClase = 'status-full';
                estadoTexto = 'Sin cupos disponibles';
            }
            
            // Generar HTML del evento
            eventoEl.innerHTML = `
                <span class="evento-badge ${categoriaClases[evento.categoria.toLowerCase()] || ''}">${capitalizarPrimera(evento.categoria)}</span>
                <div class="evento-header">
                    <h3 class="evento-title" id="evento-titulo-${evento.id}">${evento.titulo}</h3>
                    <div class="evento-meta">
                        <div class="evento-meta-item">
                            <span class="meta-icon">📅</span>
                            <span>${formatoFecha(evento.fechaInicioObj, false)}</span>
                        </div>
                        <div class="evento-meta-item">
                            <span class="meta-icon">⏱️</span>
                            <span>${evento.horario || 'Horario por definir'}</span>
                        </div>
                    </div>
                </div>
                <div class="evento-content">
                    <p class="evento-description">${truncarTexto(evento.descripcion || evento.descripción, 120)}</p>
                    <div class="evento-details">
                        ${evento.duracion ? `
                        <div class="evento-detail">
                            <span class="detail-icon">⌛</span>
                            <span>${evento.duracion}</span>
                        </div>
                        ` : ''}
                        ${evento.ubicacion || evento.ubicación ? `
                        <div class="evento-detail">
                            <span class="detail-icon">📍</span>
                            <span>${evento.ubicacion || evento.ubicación}</span>
                        </div>
                        ` : ''}
                        ${evento.modalidad ? `
                        <div class="evento-detail">
                            <span class="detail-icon">${evento.modalidad === 'Presencial' ? '🏢' : '💻'}</span>
                            <span>${evento.modalidad}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="evento-footer">
                    <div class="evento-status">
                        <span class="status-icon ${estadoClase}">●</span>
                        <span>${estadoTexto}</span>
                    </div>
                    <button class="evento-action" data-id="${evento.id}" aria-label="Ver más sobre ${evento.titulo}">
                        Ver más
                    </button>
                </div>
            `;
            
            // Agregar al grid
            eventosGrid.appendChild(eventoEl);
            
            // Botón para ver detalles
            const verMasBtn = eventoEl.querySelector('.evento-action');
            verMasBtn.addEventListener('click', function() {
                mostrarDetallesEvento(this.getAttribute('data-id'));
            });
        });
    }

    // Función para aplicar filtros a los eventos
    function filtrarEventos() {
        // Restaurar todos los eventos
        filteredEventos = [...allEventos];
        
        // Aplicar filtro de categoría
        if (categoriaSeleccionada !== 'todos') {
            filteredEventos = filteredEventos.filter(evento => 
                evento.categoria.toLowerCase() === categoriaSeleccionada
            );
        }
        
        // Aplicar filtro de búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredEventos = filteredEventos.filter(evento => 
                evento.titulo.toLowerCase().includes(query) ||
                (evento.descripcion && evento.descripcion.toLowerCase().includes(query)) ||
                (evento.descripción && evento.descripción.toLowerCase().includes(query)) ||
                (evento.ubicacion && evento.ubicacion.toLowerCase().includes(query)) ||
                (evento.ubicación && evento.ubicación.toLowerCase().includes(query))
            );
        }
        
        // Actualizar calendario para reflejar los filtros
        generarCalendario();
    }
    
    // Función para mostrar detalles de un evento
    function mostrarDetallesEvento(eventoId) {
        const evento = allEventos.find(e => e.id == eventoId);
        
        if (!evento) {
            console.error('Evento no encontrado:', eventoId);
            return;
        }
        
        // Guardar ID del evento en el modal para referencias futuras
        eventoModal.setAttribute('data-evento-id', evento.id);
        
        // Llenar detalles del modal
        eventoModalTitle.textContent = evento.titulo;
        eventoModalSubtitle.textContent = `${capitalizarPrimera(evento.categoria)} • ${evento.duracion || 'Duración variable'}`;
        
        // Información detallada
        eventoModalInfo.innerHTML = `
            <div class="info-item">
                <div class="info-label">Fecha de inicio</div>
                <div class="info-value">
                    <span class="info-icon">📅</span>
                    <span>${formatoFecha(evento.fechaInicioObj)}</span>
                </div>
            </div>
            ${evento.fechaFinObj && !esMismaFecha(evento.fechaInicioObj, evento.fechaFinObj) ? `
            <div class="info-item">
                <div class="info-label">Fecha de finalización</div>
                <div class="info-value">
                    <span class="info-icon">📅</span>
                    <span>${formatoFecha(evento.fechaFinObj)}</span>
                </div>
            </div>
            ` : ''}
            <div class="info-item">
                <div class="info-label">Horario</div>
                <div class="info-value">
                    <span class="info-icon">⏱️</span>
                    <span>${evento.horario || 'Por definir'}</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Ubicación</div>
                <div class="info-value">
                    <span class="info-icon">📍</span>
                    <span>${evento.ubicacion || evento.ubicación || 'Por definir'}</span>
                </div>
            </div>
            ${evento.modalidad ? `
            <div class="info-item">
                <div class="info-label">Modalidad</div>
                <div class="info-value">
                    <span class="info-icon">${evento.modalidad === 'Presencial' ? '🏢' : '💻'}</span>
                    <span>${evento.modalidad}</span>
                </div>
            </div>
            ` : ''}
            ${evento.facilidades ? `
            <div class="info-item">
                <div class="info-label">Facilidades especiales</div>
                <div class="info-value">
                    <span class="info-icon">✅</span>
                    <span>${evento.facilidades}</span>
                </div>
            </div>
            ` : ''}
        `;
        
        // Descripción
        eventoModalDescription.textContent = evento.descripcion || evento.descripción || 'No hay descripción disponible.';
        
        // Estado de disponibilidad
        let estadoClase = 'status-available';
        let estadoTexto = 'Cupos disponibles';
        
        if (evento.estado === 'limitado') {
            estadoClase = 'status-limited';
            estadoTexto = 'Pocos cupos disponibles';
        } else if (evento.estado === 'lleno') {
            estadoClase = 'status-full';
            estadoTexto = 'Sin cupos disponibles';
        }
        
        eventoModalStatus.innerHTML = `
            <span class="status-icon ${estadoClase}">●</span>
            <span>${estadoTexto}</span>
        `;
        
        // Botón de acción
        eventoModalAction.href = evento.urlRegistro || '#';
        eventoModalAction.textContent = 'Inscribirme';
        
        if (!evento.urlRegistro) {
            eventoModalAction.style.display = 'none';
        } else {
            eventoModalAction.style.display = 'inline-block';
            
            if (evento.estado === 'lleno') {
                eventoModalAction.classList.add('disabled');
                eventoModalAction.textContent = 'Sin cupos disponibles';
            } else {
                eventoModalAction.classList.remove('disabled');
            }
        }
        
        // Mostrar modal
        eventoModal.style.display = 'flex';
        
        // Enfocar el título para accesibilidad
        eventoModalTitle.focus();
        
        document.body.style.overflow = 'hidden';
    }
    
    // Función para cerrar modales
    function cerrarModalEvento() {
        eventoModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Devolver el foco al elemento apropiado
        const eventoId = eventoModal.getAttribute('data-evento-id');
        if (eventoId) {
            const eventoElement = document.querySelector(`.evento-card[data-id="${eventoId}"] .evento-action`);
            if (eventoElement) {
                eventoElement.focus();
            }
        }
    }
    
    function cerrarModalDia() {
        diaModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Devolver el foco al día seleccionado
        if (diaSeleccionado) {
            const diaElement = document.querySelector(`.dia-container.seleccionado`);
            if (diaElement) {
                diaElement.focus();
            }
        }
    }
    
    // Función para limpiar la selección de día
    function limpiarSeleccionDia() {
        const diaSeleccionadoEl = document.querySelector('.dia-container.seleccionado');
        if (diaSeleccionadoEl) {
            diaSeleccionadoEl.classList.remove('seleccionado');
        }
        
        diaSeleccionado = null;
        mostrarEventos();
    }
    
    // Función para cambiar la vista (calendario, eventos, combinada)
    function cambiarVista(vista) {
        vistaActual = vista;
        
        // Actualizar botones de vista
        vistaBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-vista') === vista);
            
            // Actualizar ARIA para accesibilidad
            if (btn.getAttribute('data-vista') === vista) {
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.setAttribute('aria-pressed', 'false');
            }
        });
        
        // Actualizar visibilidad de las secciones
        if (vista === 'calendario') {
            calendarioContainer.style.display = 'block';
            eventosListContainer.style.display = 'none';
            document.body.classList.add('vista-compacta');
            
            // Anunciar para lectores de pantalla
            anunciarParaAccesibilidad('Vista de calendario activada');
        } else if (vista === 'eventos') {
            calendarioContainer.style.display = 'none';
            eventosListContainer.style.display = 'block';
            document.body.classList.add('vista-compacta');
            limpiarSeleccionDia(); // Al mostrar solo eventos, limpiar selección de día
            
            // Anunciar para lectores de pantalla
            anunciarParaAccesibilidad('Vista de eventos activada');
        } else { // combinada
            calendarioContainer.style.display = 'block';
            eventosListContainer.style.display = 'block';
            document.body.classList.remove('vista-compacta');
            
            // Anunciar para lectores de pantalla
            anunciarParaAccesibilidad('Vista combinada activada');
        }
    }
    
    // Función para anunciar mensajes para lectores de pantalla
    function anunciarParaAccesibilidad(mensaje) {
        // Crear o usar un elemento existente para lector de pantalla
        let anunciador = document.getElementById('screen-reader-announcer');
        
        if (!anunciador) {
            anunciador = document.createElement('div');
            anunciador.id = 'screen-reader-announcer';
            anunciador.setAttribute('aria-live', 'polite');
            anunciador.setAttribute('aria-atomic', 'true');
            anunciador.className = 'sr-only';
            anunciador.style.position = 'absolute';
            anunciador.style.width = '1px';
            anunciador.style.height = '1px';
            anunciador.style.padding = '0';
            anunciador.style.margin = '-1px';
            anunciador.style.overflow = 'hidden';
            anunciador.style.clip = 'rect(0, 0, 0, 0)';
            anunciador.style.whiteSpace = 'nowrap';
            anunciador.style.border = '0';
            document.body.appendChild(anunciador);
        }
        
        anunciador.textContent = '';
        
        // Pequeño retraso para asegurar que el cambio se anuncia
        setTimeout(() => {
            anunciador.textContent = mensaje;
        }, 100);
    }
    
    // Función para truncar texto
    function truncarTexto(texto, maxLongitud) {
        if (!texto) return 'Sin descripción disponible';
        if (texto.length <= maxLongitud) return texto;
        return texto.substring(0, maxLongitud) + '...';
    }
    
    // Función para capitalizar primera letra
    function capitalizarPrimera(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }
    
    // Events Listeners
    
    // Navegación de meses
    mesAnteriorBtn.addEventListener('click', function() {
        mesActual--;
        if (mesActual < 0) {
            mesActual = 11;
            anioActual--;
        }
        actualizarMesActual();
        generarCalendario();
    });
    
    mesSiguienteBtn.addEventListener('click', function() {
        mesActual++;
        if (mesActual > 11) {
            mesActual = 0;
            anioActual++;
        }
        actualizarMesActual();
        generarCalendario();
    });
    
    // Filtros de categoría
    categoriasContainer.addEventListener('click', function(e) {
        const categoriaEl = e.target.closest('.categoria-tag');
        if (!categoriaEl) return;
        
        // Actualizar categoría seleccionada
        categoriaSeleccionada = categoriaEl.getAttribute('data-categoria');
        
        // Actualizar UI
        document.querySelectorAll('.categoria-tag').forEach(tag => {
            tag.classList.toggle('active', tag === categoriaEl);
            
            // Actualizar ARIA para accesibilidad
            if (tag === categoriaEl) {
                tag.setAttribute('aria-pressed', 'true');
            } else {
                tag.setAttribute('aria-pressed', 'false');
            }
        });
        
        // Filtrar eventos
        filtrarEventos();
        mostrarEventos();
        
        // Anunciar para accesibilidad
        anunciarParaAccesibilidad(`Filtrado por categoría: ${categoriaSeleccionada}`);
    });
    
    // Búsqueda
    searchInput.addEventListener('input', function() {
        searchQuery = this.value.trim().toLowerCase();
        filtrarEventos();
        mostrarEventos();
    });
    
    // También agregar evento para buscar al presionar Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery = this.value.trim().toLowerCase();
            filtrarEventos();
            mostrarEventos();
            
            // Anunciar para accesibilidad
            const resultCount = filteredEventos.length;
            anunciarParaAccesibilidad(`Búsqueda completada. ${resultCount} resultados encontrados.`);
        }
    });
    
    // Modales
    eventoModalClose.addEventListener('click', cerrarModalEvento);
    diaModalClose.addEventListener('click', cerrarModalDia);
    
    eventoModal.addEventListener('click', function(e) {
        if (e.target === eventoModal) cerrarModalEvento();
    });
    
    diaModal.addEventListener('click', function(e) {
        if (e.target === diaModal) cerrarModalDia();
    });
    
    // Cambio de vista
    vistaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            cambiarVista(this.getAttribute('data-vista'));
        });
        
        // Añadir ARIA roles para accesibilidad
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    });
    
    // Tecla ESC para cerrar modales
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModalEvento();
            cerrarModalDia();
        }
    });
    
    // Detectar cambios en la conexión
    window.addEventListener('online', function() {
        document.getElementById('offline-indicator').classList.remove('visible');
        mostrarToast('Conexión restaurada', 'success');
        
        // Opcionalmente refrescar datos
        cargarEventos();
    });
    
    window.addEventListener('offline', function() {
        document.getElementById('offline-indicator').classList.add('visible');
        mostrarToast('Sin conexión - usando datos almacenados', 'warning');
    });
    
    // Inicialización
    inyectarControlesUI();
    
    // Mejorar accesibilidad para los elementos iniciales
    document.querySelectorAll('.categoria-tag').forEach(tag => {
        tag.setAttribute('role', 'button');
        tag.setAttribute('aria-pressed', tag.classList.contains('active') ? 'true' : 'false');
        tag.setAttribute('tabindex', '0');
        
        // Soporte para navegación por teclado
        tag.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Iniciar carga de eventos
    cargarEventos();
});
