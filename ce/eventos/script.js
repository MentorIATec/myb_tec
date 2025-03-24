/**
 * Solución Mejorada para Carga de Eventos - Consejería Emocional
 * Este archivo contiene las mejoras específicas para resolver problemas de carga de eventos
 * y otras funcionalidades relacionadas con el manejo de datos.
 */

// Estructura de datos principal (mantener la misma que en el script original)
const AppState = {
    eventos: [],
    filtros: {
        categoria: 'todos',
        texto: '',
        fechaInicio: null,
        fechaFin: null
    },
    calendario: {
        diaSeleccionado: null,
        mesActual: new Date().getMonth(),
        anioActual: new Date().getFullYear(),
        vistaSemanal: false
    },
    ui: {
        loading: false,
        modoOscuro: localStorage.getItem('modo_oscuro') === 'true'
    }
};

/**
 * Servicios de almacenamiento local (optimizado)
 */
const StorageService = {
    /**
     * Guarda un ítem en localStorage con verificación de errores
     * @param {string} clave - Clave para almacenar
     * @param {*} valor - Valor a almacenar
     * @returns {boolean} - Indica si se guardó correctamente
     */
    guardarItem(clave, valor) {
        try {
            const valorAGuardar = typeof valor === 'object' ? JSON.stringify(valor) : valor;
            localStorage.setItem(clave, valorAGuardar);
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    },
    
    /**
     * Recupera un ítem de localStorage con manejo de errores
     * @param {string} clave - Clave a recuperar
     * @param {boolean} parsearJSON - Si debe intentar parsear como JSON
     * @returns {*} Valor almacenado o null
     */
    obtenerItem(clave, parsearJSON = false) {
        try {
            const item = localStorage.getItem(clave);
            if (!item) return null;
            
            if (parsearJSON) {
                try {
                    return JSON.parse(item);
                } catch (e) {
                    console.warn(`El valor para ${clave} no es un JSON válido:`, e);
                    return item;
                }
            }
            return item;
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return null;
        }
    },
    
    /**
     * Guarda un timestamp actual
     * @param {string} clave - Clave para el timestamp
     */
    guardarTimestamp(clave) {
        this.guardarItem(clave, new Date().getTime().toString());
    },
    
    /**
     * Verifica si un timestamp en caché sigue siendo válido
     * @param {string} clave - Clave del timestamp
     * @param {number} tiempoValidez - Tiempo de validez en ms
     * @returns {boolean} True si el caché es válido
     */
    verificarValidezCache(clave, tiempoValidez) {
        const timestamp = this.obtenerItem(clave);
        if (!timestamp) return false;
        
        const ahora = new Date().getTime();
        return (ahora - parseInt(timestamp)) < tiempoValidez;
    },
    
    /**
     * Limpia todos los datos almacenados relacionados con eventos
     */
    limpiarCache() {
        try {
            localStorage.removeItem('eventos_cache');
            localStorage.removeItem('eventos_timestamp');
            console.log('Caché de eventos limpiada correctamente');
            return true;
        } catch (error) {
            console.error('Error al limpiar caché:', error);
            return false;
        }
    }
};

/**
 * Servicios de UI para feedback (simplificado)
 */
const UIService = {
    /**
     * Muestra el spinner de carga
     */
    mostrarSpinner() {
        AppState.ui.loading = true;
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'flex';
            return true;
        }
        
        // Si no existe el spinner, lo creamos dinámicamente
        const nuevoSpinner = document.createElement('div');
        nuevoSpinner.id = 'spinner-container';
        nuevoSpinner.className = 'spinner-container';
        nuevoSpinner.innerHTML = '<div class="spinner" role="status" aria-label="Cargando..."></div>';
        document.body.appendChild(nuevoSpinner);
        return true;
    },
    
    /**
     * Oculta el spinner de carga
     */
    ocultarSpinner() {
        AppState.ui.loading = false;
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'none';
            return true;
        }
        return false;
    },
    
    /**
     * Muestra una notificación toast con mejor visibilidad
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje (info, error, success, warning)
     * @param {number} duracion - Duración en ms
     */
    mostrarToast(mensaje, tipo = 'info', duracion = 4000) {
        // Eliminar toasts previos del mismo tipo
        const toastsPrevios = document.querySelectorAll(`.toast.toast-${tipo}`);
        toastsPrevios.forEach(t => t.remove());
        
        // Crear nuevo toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.setAttribute('role', 'alert');
        
        // Añadir icono según tipo
        let icono = '';
        switch (tipo) {
            case 'success':
                icono = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
                break;
            case 'error':
                icono = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>';
                break;
            case 'warning':
                icono = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>';
                break;
            default:
                icono = '<i class="fa-solid fa-circle-info" aria-hidden="true"></i>';
        }
        
        toast.innerHTML = `${icono} <span>${mensaje}</span>`;
        document.body.appendChild(toast);
        
        // Trigger reflow para aplicar transición
        toast.offsetHeight;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, duracion);
    },
    
    /**
     * Muestra una notificación de depuración en la consola y opcionalmente en UI
     * @param {string} mensaje - Mensaje a mostrar
     * @param {Object} datos - Datos adicionales para mostrar en consola
     * @param {boolean} mostrarEnUI - Si se debe mostrar en UI
     */
    debug(mensaje, datos = null, mostrarEnUI = false) {
        // Solo mostrar en desarrollo o con debug activado
        const debugActivado = localStorage.getItem('debug_mode') === 'true';
        if (!debugActivado) return;
        
        console.log(`[DEBUG] ${mensaje}`, datos);
        
        if (mostrarEnUI) {
            this.mostrarToast(`DEBUG: ${mensaje}`, 'info', 2000);
        }
    }
};

/**
 * Servicios mejorados para manejo de eventos
 */
const EventoService = {
    /**
     * Recupera eventos del servidor o caché con manejo mejorado de errores
     * @param {boolean} forzarRecarga - Si debe ignorar caché y forzar petición
     * @returns {Promise<Array>} Array de eventos
     */
    async obtenerEventos(forzarRecarga = false) {
        UIService.mostrarSpinner();
        
        try {
            // Verificar caché (solo si no se fuerza recarga)
            if (!forzarRecarga) {
                const eventosCache = StorageService.obtenerItem('eventos_cache', true);
                const cacheEsValido = StorageService.verificarValidezCache('eventos_timestamp', 3600000); // 1 hora
                
                if (eventosCache && cacheEsValido) {
                    AppState.eventos = eventosCache;
                    UIService.debug('Usando datos en caché', eventosCache, false);
                    return eventosCache;
                }
            }
            
            // Lista de URLs a intentar, en orden de prioridad
            const urls = [
                'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json', // URL correcta según estructura observada
            ];
            
            let response = null;
            let errorMensaje = '';
            
            // Intentar cada URL hasta que una funcione
            for (const url of urls) {
                try {
                    UIService.debug(`Intentando cargar desde: ${url}`);
                    
                    response = await fetch(url, {
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        cache: 'no-store'
                    });
                    
                    if (response.ok) {
                        UIService.debug(`Éxito al cargar desde: ${url}`);
                        break; // Salir del bucle si la carga fue exitosa
                    } else {
                        errorMensaje = `Error HTTP ${response.status} al cargar desde ${url}`;
                        UIService.debug(errorMensaje);
                        response = null; // Resetear response para el siguiente intento
                    }
                } catch (error) {
                    errorMensaje = `Error al cargar desde ${url}: ${error.message}`;
                    UIService.debug(errorMensaje);
                }
            }
            
            // Si ninguna URL funcionó, lanzar error
            if (!response || !response.ok) {
                throw new Error(errorMensaje || 'No se pudo cargar eventos de ninguna URL');
            }
            
            // Procesar respuesta
            const eventosRaw = await response.json();
            
            // Extraer array de eventos (puede estar dentro de propiedad "eventos" o ser el array directamente)
            const eventosArray = eventosRaw.eventos || eventosRaw;
            
            if (!Array.isArray(eventosArray)) {
                throw new Error('El formato de datos recibido no es válido: no es un array');
            }
            
            UIService.debug(`Eventos cargados: ${eventosArray.length}`, eventosArray);
            
            // Normalizar datos
            const eventosNormalizados = this.normalizarEventos(eventosArray);
            
            // Guardar en estado
            AppState.eventos = eventosNormalizados;
            
            // Guardar en caché
            StorageService.guardarItem('eventos_cache', eventosNormalizados);
            StorageService.guardarTimestamp('eventos_timestamp');
            
            // Mostrar mensaje de éxito solo si fue forzado (recarga manual)
            if (forzarRecarga) {
                UIService.mostrarToast(`${eventosNormalizados.length} eventos cargados correctamente`, 'success');
            }
            
            return eventosNormalizados;
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            
            // Intentar recuperar eventos de respaldo en localStorage
            const eventosCache = StorageService.obtenerItem('eventos_cache', true);
            if (eventosCache && eventosCache.length > 0) {
                UIService.mostrarToast('Error al cargar eventos actualizados. Usando datos guardados anteriormente.', 'warning');
                AppState.eventos = eventosCache;
                return eventosCache;
            }
            
            // Si no hay caché, cargar eventos de muestra (para desarrollo)
            UIService.mostrarToast('Error al cargar eventos. Intenta de nuevo más tarde.', 'error');
            
            // Cargar eventos de muestra para desarrollo (en producción podrías retornar [])
            return this.cargarEventosDeMuestra();
        } finally {
            UIService.ocultarSpinner();
        }
    },
    
    /**
     * Carga eventos de muestra para demostración/depuración
     * @returns {Array} Array con eventos de muestra
     */
    cargarEventosDeMuestra() {
        // 3 eventos de muestra para desarrollo/pruebas
        return this.normalizarEventos([
            {
                id: 999,
                titulo: "Evento de Prueba 1",
                categoria: "Taller",
                descripcion: "Este es un evento de prueba porque no se pudieron cargar los eventos reales.",
                fechaInicio: new Date().toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/'),
                horario: "10:00 - 12:00",
                ubicación: "Campus Virtual",
                modalidad: "En línea",
                estado: "disponible"
            },
            {
                id: 998,
                titulo: "Evento de Prueba 2",
                categoria: "Grupo",
                descripcion: "Otro evento de prueba para mostrar datos de ejemplo.",
                fechaInicio: new Date(Date.now() + 86400000).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/'),
                horario: "15:00 - 17:00",
                ubicación: "Por definir",
                modalidad: "Presencial",
                estado: "disponible"
            },
            {
                id: 997,
                titulo: "Evento de Prueba 3",
                categoria: "Curso",
                descripcion: "Un evento más para demostración.",
                fechaInicio: new Date(Date.now() + 172800000).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/'),
                horario: "9:00 - 11:00",
                ubicación: "Biblioteca Central",
                modalidad: "Presencial",
                estado: "disponible"
            }
        ]);
    },
    
    /**
     * Normaliza los eventos para garantizar consistencia de datos
     * @param {Array} eventos - Eventos crudos del API
     * @returns {Array} Eventos normalizados
     */
    normalizarEventos(eventos) {
        return eventos.map(evento => {
            // Crear objeto base con valores predeterminados para campos faltantes
            const eventoNormalizado = {
                id: evento.id || `evento-${Math.random().toString(36).substring(2, 11)}`,
                titulo: evento.titulo || 'Evento sin título',
                descripcion: evento.descripcion || 'Sin descripción',
                fechaInicio: evento.fechaInicio || new Date().toISOString().split('T')[0],
                fechaFin: evento.fechaFin || evento.fechaInicio || new Date().toISOString().split('T')[0],
                horario: evento.horario || 'Horario no especificado',
                ubicación: evento.ubicación || 'Ubicación no especificada',
                modalidad: evento.modalidad || 'Presencial',
                categoria: this.normalizarCategoria(evento.categoria || 'otro'),
                facilidades: evento.facilidades || 'No especificadas',
                cupo: evento.cupo || 'Sin límite',
                urlRegistro: evento.urlRegistro || '#',
                estado: evento.estado || 'disponible',
                duracion: evento.duracion || evento.horario || '90 minutos'
            };
            
            // Normalizar fechas y retornar objeto completo
            return this.normalizarFechas(eventoNormalizado);
        });
    },
    
    /**
     * Normaliza el formato de fechas para compatibilidad
     * @param {Object} evento - Evento a normalizar
     * @returns {Object} Evento con fechas normalizadas
     */
    normalizarFechas(evento) {
        // Convertir formato DD/MM/YYYY a formato ISO YYYY-MM-DD
        if (evento.fechaInicio && typeof evento.fechaInicio === 'string' && evento.fechaInicio.includes('/')) {
            const partes = evento.fechaInicio.split('/');
            if (partes.length === 3) {
                // Ajuste por si las fechas vienen con formato diferente
                let dia, mes, anio;
                
                // Detectar formato: Si el primer valor es ≤ 31, asumimos DD/MM/YYYY
                if (parseInt(partes[0]) <= 31 && partes[2].length === 4) {
                    [dia, mes, anio] = partes;
                } else if (parseInt(partes[2]) <= 31 && partes[0].length === 4) {
                    // Formato YYYY/MM/DD
                    [anio, mes, dia] = partes;
                } else {
                    // Si no podemos determinar, usar el formato como está
                    return evento;
                }
                
                // Asegurar que mes y día tengan dos dígitos
                dia = dia.padStart(2, '0');
                mes = mes.padStart(2, '0');
                
                evento.fechaInicio = `${anio}-${mes}-${dia}`;
            }
        }
        
        // También normalizar fecha fin si existe
        if (evento.fechaFin && typeof evento.fechaFin === 'string' && evento.fechaFin.includes('/')) {
            const partes = evento.fechaFin.split('/');
            if (partes.length === 3) {
                let dia, mes, anio;
                
                if (parseInt(partes[0]) <= 31 && partes[2].length === 4) {
                    [dia, mes, anio] = partes;
                } else if (parseInt(partes[2]) <= 31 && partes[0].length === 4) {
                    [anio, mes, dia] = partes;
                } else {
                    return evento;
                }
                
                dia = dia.padStart(2, '0');
                mes = mes.padStart(2, '0');
                
                evento.fechaFin = `${anio}-${mes}-${dia}`;
            }
        }
        
        return evento;
    },
    
    /**
     * Normaliza las categorías para consistencia en filtrado y visualización
     * @param {string} categoria - Categoría original del evento
     * @returns {string} Categoría normalizada
     */
    normalizarCategoria(categoria) {
        if (!categoria) return 'otro';
        
        // Convertir a minúsculas para comparación
        const cat = categoria.toLowerCase();
        
        // Mapa de normalización
        const categoriasValidas = {
            'taller': 'taller',
            'curso': 'curso',
            'grupo': 'grupo',
            'activacion': 'activacion',
            'activación': 'activacion',
            'evento': 'evento'
        };
        
        // Devolver categoría normalizada o 'otro' si no coincide
        return categoriasValidas[cat] || 'otro';
    },
    
    /**
     * Filtra eventos según los criterios actuales con mejor manejo
     * @returns {Array} Array de eventos filtrados
     */
    filtrarEventos() {
        // Si no hay eventos, devolver array vacío
        if (!AppState.eventos || AppState.eventos.length === 0) {
            return [];
        }
        
        let eventosFiltrados = [...AppState.eventos];
        const filtros = AppState.filtros;
        
        // Filtrar por categoría
        if (filtros.categoria && filtros.categoria !== 'todos') {
            eventosFiltrados = eventosFiltrados.filter(evento => 
                this.normalizarCategoria(evento.categoria) === filtros.categoria.toLowerCase()
            );
        }
        
        // Filtrar por texto (búsqueda más amplia incluyendo más campos)
        if (filtros.texto && filtros.texto.trim() !== '') {
            const textoLower = filtros.texto.toLowerCase().trim();
            eventosFiltrados = eventosFiltrados.filter(evento => 
                (evento.titulo && evento.titulo.toLowerCase().includes(textoLower)) ||
                (evento.descripcion && evento.descripcion.toLowerCase().includes(textoLower)) ||
                (evento.ubicación && evento.ubicación.toLowerCase().includes(textoLower)) ||
                (evento.modalidad && evento.modalidad.toLowerCase().includes(textoLower)) ||
                (evento.facilidades && evento.facilidades.toLowerCase().includes(textoLower))
            );
        }
        
        // Filtrar por rango de fechas
        if (filtros.fechaInicio || filtros.fechaFin) {
            let inicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
            let fin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;
            
            // Si hay fecha fin, incluir todo el día
            if (fin) {
                fin.setHours(23, 59, 59);
            }
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                try {
                    const fechaEvento = new Date(evento.fechaInicio);
                    
                    // Validar que la fecha sea válida
                    if (isNaN(fechaEvento.getTime())) return false;
                    
                    if (inicio && fin) {
                        return fechaEvento >= inicio && fechaEvento <= fin;
                    } else if (inicio) {
                        return fechaEvento >= inicio;
                    } else if (fin) {
                        return fechaEvento <= fin;
                    }
                    
                    return true;
                } catch (e) {
                    console.warn('Error al filtrar fecha para evento', evento.id, e);
                    return false;
                }
            });
        }
        
        // Filtrar por día seleccionado en el calendario
        if (AppState.calendario.diaSeleccionado) {
            const dia = AppState.calendario.diaSeleccionado;
            const mes = AppState.calendario.mesActual;
            const anio = AppState.calendario.anioActual;
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                try {
                    const fechaEvento = new Date(evento.fechaInicio);
                    
                    // Validar que la fecha sea válida
                    if (isNaN(fechaEvento.getTime())) return false;
                    
                    return fechaEvento.getDate() === dia && 
                           fechaEvento.getMonth() === mes && 
                           fechaEvento.getFullYear() === anio;
                } catch (e) {
                    console.warn('Error al filtrar por día seleccionado para evento', evento.id, e);
                    return false;
                }
            });
        }
        
        return eventosFiltrados;
    },
    
    /**
     * Obtiene eventos para un día específico con manejo de errores mejorado
     * @param {number} dia - Día del mes
     * @param {number} mes - Mes (0-11)
     * @param {number} anio - Año
     * @returns {Array} Eventos del día especificado
     */
    obtenerEventosPorDia(dia, mes, anio) {
        if (!AppState.eventos || AppState.eventos.length === 0) {
            return [];
        }
        
        return AppState.eventos.filter(evento => {
            try {
                const fechaEvento = new Date(evento.fechaInicio);
                
                // Validar que la fecha sea válida
                if (isNaN(fechaEvento.getTime())) return false;
                
                return fechaEvento.getDate() === dia && 
                       fechaEvento.getMonth() === mes && 
                       fechaEvento.getFullYear() === anio;
            } catch (e) {
                console.warn('Error al obtener eventos por día para evento', evento.id, e);
                return false;
            }
        });
    },
    
    /**
     * Fuerza una recarga completa de eventos limpiando caché
     * @returns {Promise<Array>} Eventos recargados
     */
    async recargarEventos() {
        // Limpiar caché antes de recargar
        StorageService.limpiarCache();
        
        // Forzar recarga desde el servidor
        return await this.obtenerEventos(true);
    }
};

// Funciones de utilidad generales
const Utilidades = {
    /**
     * Formatea una fecha para mostrar
     * @param {Date|string} fecha - Fecha a formatear
     * @param {Object} opciones - Opciones de formato
     * @returns {string} Fecha formateada
     */
    formatearFecha(fecha, opciones = {}) {
        try {
            const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
            
            // Verificar si la fecha es válida
            if (isNaN(fechaObj.getTime())) {
                console.warn('Fecha inválida:', fecha);
                return 'Fecha no disponible';
            }
            
            const opcionesDefault = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                ...opciones
            };
            
            return fechaObj.toLocaleDateString('es-ES', opcionesDefault);
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return String(fecha);
        }
    },
    
    /**
     * Activa el modo de depuración para la aplicación
     * @param {boolean} activar - Si se activa o desactiva
     */
    activarModoDebug(activar = true) {
        localStorage.setItem('debug_mode', activar.toString());
        if (activar) {
            console.log('Modo debug activado');
            UIService.mostrarToast('Modo debug activado', 'info');
        } else {
            console.log('Modo debug desactivado');
        }
    }
};

// Exportar funciones para acceso global
window.EventoService = EventoService;
window.StorageService = StorageService;
window.UIService = UIService;
window.Utilidades = Utilidades;

// Funciones para integrar fácilmente en el script original
window.recargarEventos = async function() {
    try {
        await EventoService.recargarEventos();
        // Llamar a las funciones de actualización de UI que existan en el script principal
        if (typeof EventosController !== 'undefined' && EventosController.renderizarEventos) {
            EventosController.renderizarEventos();
        }
        if (typeof CalendarioController !== 'undefined' && CalendarioController.generarCalendario) {
            CalendarioController.generarCalendario();
        }
        return true;
    } catch (error) {
        console.error('Error al recargar eventos:', error);
        UIService.mostrarToast('Error al recargar eventos', 'error');
        return false;
    }
};

window.activarDebug = function() {
    Utilidades.activarModoDebug(true);
};

window.desactivarDebug = function() {
    Utilidades.activarModoDebug(false);
};

// Al cargar el documento, verificar si hay localStorage y mostrar información
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay caché de eventos
    const eventosCache = StorageService.obtenerItem('eventos_cache', true);
    if (eventosCache && eventosCache.length > 0) {
        console.log(`Hay ${eventosCache.length} eventos en caché.`);
    } else {
        console.log('No hay eventos en caché.');
    }
    
    // Comprobar modo debug
    const debugActivado = localStorage.getItem('debug_mode') === 'true';
    if (debugActivado) {
        console.log('Modo debug activado. Usa window.desactivarDebug() para desactivarlo.');
    } else {
        console.log('Modo debug desactivado. Usa window.activarDebug() para activarlo y ver más información.');
    }
    
    // No inicializar automáticamente AppController para evitar conflictos
    // con el script principal
});
