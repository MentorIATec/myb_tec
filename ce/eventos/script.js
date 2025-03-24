/**
 * Solución Mejorada para Carga de Eventos - Consejería Emocional
 * Este archivo contiene las mejoras específicas para resolver problemas de carga de eventos
 * y otras funcionalidades relacionadas con el manejo de datos.
 */

// Estructura de datos principal
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
    
    guardarTimestamp(clave) {
        this.guardarItem(clave, new Date().getTime().toString());
    },
    
    verificarValidezCache(clave, tiempoValidez) {
        const timestamp = this.obtenerItem(clave);
        if (!timestamp) return false;
        
        const ahora = new Date().getTime();
        return (ahora - parseInt(timestamp)) < tiempoValidez;
    },
    
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
 * Servicios de UI para feedback
 */
const UIService = {
    mostrarSpinner() {
        AppState.ui.loading = true;
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'flex';
            return true;
        }
        
        const nuevoSpinner = document.createElement('div');
        nuevoSpinner.id = 'spinner-container';
        nuevoSpinner.className = 'spinner-container';
        nuevoSpinner.innerHTML = '<div class="spinner" role="status" aria-label="Cargando..."></div>';
        document.body.appendChild(nuevoSpinner);
        return true;
    },
    
    ocultarSpinner() {
        AppState.ui.loading = false;
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'none';
            return true;
        }
        return false;
    },
    
    mostrarToast(mensaje, tipo = 'info', duracion = 4000) {
        const toastsPrevios = document.querySelectorAll(`.toast.toast-${tipo}`);
        toastsPrevios.forEach(t => t.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.setAttribute('role', 'alert');
        
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
        
        toast.offsetHeight;
        toast.classList.add('show');
        
                setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, duracion);
    },
    
    debug(mensaje, datos = null, mostrarEnUI = false) {
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
    async obtenerEventos(forzarRecarga = false) {
        UIService.mostrarSpinner();
        
        try {
            if (!forzarRecarga) {
                const eventosCache = StorageService.obtenerItem('eventos_cache', true);
                const cacheEsValido = StorageService.verificarValidezCache('eventos_timestamp', 3600000); // 1 hora
                
                if (eventosCache && cacheEsValido) {
                    AppState.eventos = eventosCache;
                    UIService.debug('Usando datos en caché', eventosCache, false);
                    return eventosCache;
                }
            }
            
            const urls = [
                'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json',
            ];
            
            let response = null;
            let errorMensaje = '';
            
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
                        break;
                    } else {
                        errorMensaje = `Error HTTP ${response.status} al cargar desde ${url}`;
                        UIService.debug(errorMensaje);
                        response = null;
                    }
                } catch (error) {
                    errorMensaje = `Error al cargar desde ${url}: ${error.message}`;
                    UIService.debug(errorMensaje);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(errorMensaje || 'No se pudo cargar eventos de ninguna URL');
            }
            
            const eventosRaw = await response.json();
            const eventosArray = eventosRaw.eventos || eventosRaw;
            
            if (!Array.isArray(eventosArray)) {
                throw new Error('El formato de datos recibido no es válido: no es un array');
            }
            
            UIService.debug(`Eventos cargados: ${eventosArray.length}`, eventosArray);
            const eventosNormalizados = this.normalizarEventos(eventosArray);
            AppState.eventos = eventosNormalizados;
            StorageService.guardarItem('eventos_cache', eventosNormalizados);
            StorageService.guardarTimestamp('eventos_timestamp');
            
            if (forzarRecarga) {
                UIService.mostrarToast(`${eventosNormalizados.length} eventos cargados correctamente`, 'success');
            }
            
            return eventosNormalizados;
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            const eventosCache = StorageService.obtenerItem('eventos_cache', true);
            if (eventosCache && eventosCache.length > 0) {
                UIService.mostrarToast('Error al cargar eventos actualizados. Usando datos guardados anteriormente.', 'warning');
                AppState.eventos = eventosCache;
                return eventosCache;
            }
            UIService.mostrarToast('Error al cargar eventos. Intenta de nuevo más tarde.', 'error');
            return this.cargarEventosDeMuestra();
        } finally {
            UIService.ocultarSpinner();
        }
    },
    
    cargarEventosDeMuestra() {
        return this.normalizarEventos([
            {
                id: 999,
                titulo: "Evento de Prueba 1",
                categoria: "Taller",
                descripcion: "Este es un evento de prueba porque no se pudieron cargar los eventos reales.",
                fechaInicio: "2025-03-24",
                fechaFin: "2025-03-24",
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
                fechaInicio: "2025-03-25",
                fechaFin: "2025-03-25",
                horario: "15:00 - 17:00",
                ubicación: "Por definir",
                modalidad: "Presencial",
                estado: "disponible"            },
            {
                id: 997,
                titulo: "Evento de Prueba 3",
                categoria: "Curso",
                descripcion: "Un evento más para demostración.",
                fechaInicio: "2025-03-26",
                fechaFin: "2025-03-26",
                horario: "9:00 - 11:00",
                ubicación: "Biblioteca Central",
                modalidad: "Presencial",
                estado: "disponible"
            }
        ]);
    },
    
    normalizarEventos(eventos) {
        return eventos.map(evento => {
            const eventoNormalizado = {
                id: evento.ID || `evento-${Math.random().toString(36).substring(2, 11)}`,
                titulo: evento.Título || 'Evento sin título',
                descripcion: evento.Descripción || 'Sin descripción',
                fechaInicio: evento["Fecha Inicio"] || new Date().toISOString().split('T')[0],
                fechaFin: evento["Fecha Fin"] || evento["Fecha Inicio"] || new Date().toISOString().split('T')[0],
                horario: evento.Horario || 'Horario no especificado',
                ubicación: evento.Ubicación || 'Ubicación no especificada',
                modalidad: evento.Modalidad || 'Presencial',
                categoria: this.normalizarCategoria(evento.Categoría || 'otro'),
                facilidades: evento.Facilidades || 'No especificadas',
                estado: evento.Estado || 'disponible',
                urlRegistro: evento["URL Registro"] || '#',
                duracion: evento.Duración || '90 minutos'
            };
            
            return this.normalizarFechas(eventoNormalizado);
        });
    },
    
    normalizarFechas(evento) {
        // Normalizar fechas a formato ISO YYYY-MM-DD
        const formatearFecha = (fecha) => {
            const partes = fecha.split('-');
            return partes.length === 3 ? `${partes[0]}-${partes[1]}-${partes[2]}` : fecha;
        };

        evento.fechaInicio = formatearFecha(evento.fechaInicio);
        evento.fechaFin = formatearFecha(evento.fechaFin);
        
        return evento;
    },
    
    normalizarCategoria(categoria) {
        if (!categoria) return 'otro';
        
        const cat = categoria.toLowerCase();
        const categoriasValidas = {
            'taller': 'taller',
            'curso': 'curso',
            'grupo': 'grupo',
            'activacion': 'activacion',
            'activación': 'activacion',
            'evento': 'evento'
        };
        
        return categoriasValidas[cat] || 'otro';
    },
    
    filtrarEventos() {
        if (!AppState.eventos || AppState.eventos.length === 0) {
            return [];
        }
        
        let eventosFiltrados = [...AppState.eventos];
        const filtros = AppState.filtros;
        
        if (filtros.categoria && filtros.categoria !== 'todos') {
            eventosFiltrados = eventosFiltrados.filter(evento => 
                this.normalizarCategoria(evento.categoria) === filtros.categoria.toLowerCase()
            );
        }
        
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
        
        if (filtros.fechaInicio || filtros.fechaFin) {
            let inicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
            let fin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;
            
            if (fin) {
                fin.setHours(23, 59, 59);
            }
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                const fechaEvento = new Date(evento.fechaInicio);
                if (isNaN(fechaEvento.getTime())) return false;
                
                if (inicio && fin) {
                    return fechaEvento >= inicio && fechaEvento <= fin;
                } else if (inicio) {
                    return fechaEvento >= inicio;
                } else if (fin) {
                    return fechaEvento <= fin;
                }
                
                return true;
            });
        }
        
        if (AppState.calendario.diaSeleccionado) {
                        const dia = AppState.calendario.diaSeleccionado;
            const mes = AppState.calendario.mesActual;
            const anio = AppState.calendario.anioActual;
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                const fechaEvento = new Date(evento.fechaInicio);
                if (isNaN(fechaEvento.getTime())) return false;
                
                return fechaEvento.getDate() === dia && 
                       fechaEvento.getMonth() === mes && 
                       fechaEvento.getFullYear() === anio;
            });
        }
        
        return eventosFiltrados;
    },
    
    obtenerEventosPorDia(dia, mes, anio) {
        if (!AppState.eventos || AppState.eventos.length === 0) {
            return [];
        }
        
        return AppState.eventos.filter(evento => {
            const fechaEvento = new Date(evento.fechaInicio);
            if (isNaN(fechaEvento.getTime())) return false;
            
            return fechaEvento.getDate() === dia && 
                   fechaEvento.getMonth() === mes && 
                   fechaEvento.getFullYear() === anio;
        });
    },
    
    async recargarEventos() {
        StorageService.limpiarCache();
        return await this.obtenerEventos(true);
    }
};

// Funciones de utilidad generales
const Utilidades = {
    formatearFecha(fecha, opciones = {}) {
        try {
            const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
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
    const eventosCache = StorageService.obtenerItem('eventos_cache', true);
    if (eventosCache && eventosCache.length > 0) {
        console.log(`Hay ${eventosCache.length} eventos en caché.`);
    } else {
        console.log('No hay eventos en caché.');
    }
    
    const debugActivado = localStorage.getItem('debug_mode') === 'true';
    if (debugActivado) {
        console.log('Modo debug activado. Usa window.desactivarDebug() para desactivarlo.');
    } else {
        console.log('Modo debug desactivado. Usa window.activarDebug() para activarlo y ver más información.');
    }
});
