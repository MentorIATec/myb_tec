/**
 * Visualizador de Eventos - Consejería Emocional
 * Script principal con arquitectura modular y mejoras de rendimiento
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
 * Servicios de almacenamiento local
 */
const StorageService = {
    /**
     * Guarda un ítem en localStorage
     * @param {string} clave - Clave para almacenar
     * @param {*} valor - Valor a almacenar
     */
    guardarItem(clave, valor) {
        try {
            localStorage.setItem(clave, typeof valor === 'object' ? JSON.stringify(valor) : valor);
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    },
    
    /**
     * Recupera un ítem de localStorage
     * @param {string} clave - Clave a recuperar
     * @param {boolean} parsearJSON - Si debe intentar parsear como JSON
     * @returns {*} Valor almacenado o null
     */
    obtenerItem(clave, parsearJSON = false) {
        try {
            const item = localStorage.getItem(clave);
            if (item && parsearJSON) {
                return JSON.parse(item);
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
    }
};

/**
 * Servicios de UI
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
        }
    },
    
    /**
     * Oculta el spinner de carga
     */
    ocultarSpinner() {
        AppState.ui.loading = false;
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = 'none';
        }
    },
    
    /**
     * Muestra una notificación toast
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje (info, error, success)
     */
    mostrarToast(mensaje, tipo = 'info') {
        // Eliminar toasts previos
        const toastsPrevios = document.querySelectorAll('.toast');
        toastsPrevios.forEach(t => t.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.setAttribute('role', 'alert');
        toast.textContent = mensaje;
        
        document.body.appendChild(toast);
        
        // Trigger reflow para aplicar transición
        toast.offsetHeight;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    },
    
    /**
     * Activa o desactiva el modo oscuro
     * @param {boolean} [forzar] - Si se provee, fuerza el estado
     */
    toggleModoOscuro(forzar) {
        const nuevoEstado = forzar !== undefined ? forzar : !AppState.ui.modoOscuro;
        AppState.ui.modoOscuro = nuevoEstado;
        
        document.body.classList.toggle('dark-mode', nuevoEstado);
        
        const botonTema = document.getElementById('toggle-theme');
        if (botonTema) {
            const iconoTema = botonTema.querySelector('i');
            
            if (nuevoEstado) {
                botonTema.textContent = ' Modo Claro';
                if (iconoTema) {
                    iconoTema.className = 'fa-regular fa-sun';
                } else {
                    botonTema.prepend(document.createElement('i')).className = 'fa-regular fa-sun';
                }
            } else {
                botonTema.textContent = ' Modo Oscuro';
                if (iconoTema) {
                    iconoTema.className = 'fa-regular fa-moon';
                } else {
                    botonTema.prepend(document.createElement('i')).className = 'fa-regular fa-moon';
                }
            }
            
            botonTema.setAttribute('aria-pressed', nuevoEstado);
        }
        
        // Guardar preferencia en localStorage
        StorageService.guardarItem('modo_oscuro', nuevoEstado);
    },
    
    /**
     * Formatea una fecha en formato legible
     * @param {string|Date} fecha - Fecha a formatear
     * @param {Object} opciones - Opciones de formato
     * @returns {string} Fecha formateada
     */
    formatearFecha(fecha, opciones = {}) {
        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
        const opcionesDefault = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            ...opciones
        };
        
        return fechaObj.toLocaleDateString('es-ES', opcionesDefault);
    },
    
    /**
     * Formatea un horario para mostrar
     * @param {string} horario - String de horario
     * @returns {string} Horario formateado
     */
    formatearHorario(horario) {
        if (!horario) return 'Horario no especificado';
        
        // Si ya tiene formato "HH:MM - HH:MM", devolverlo como está
        if (/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/.test(horario)) {
            return horario;
        }
        
        // Intentar formatear otros tipos de formatos de horario
        try {
            // Caso: hora de inicio sin fin
            if (/^\d{1,2}:\d{2}$/.test(horario)) {
                return `${horario} hrs`;
            }
            
            return horario;
        } catch (e) {
            return horario;
        }
    }
};

/**
 * Servicios para gestionar eventos
 */
const EventoService = {
    /**
     * Recupera eventos del servidor o caché
     * @returns {Promise<Array>} Array de eventos
     */
    async obtenerEventos() {
        UIService.mostrarSpinner();
        
        try {
            // Verificar caché
            const eventosCache = StorageService.obtenerItem('eventos_cache', true);
            const cacheEsValido = StorageService.verificarValidezCache('eventos_timestamp', 3600000); // 1 hora
            
            if (eventosCache && cacheEsValido) {
                AppState.eventos = eventosCache;
                console.log('Usando datos en caché');
                return eventosCache;
            }
            
            // Obtener datos frescos si no hay caché válida
            const response = await fetch('https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const eventos = await response.json();
            
            // Normalizar datos (garantizar tipos consistentes y propiedades requeridas)
            const eventosNormalizados = this.normalizarEventos(eventos);
            
            // Guardar en estado
            AppState.eventos = eventosNormalizados;
            
            // Guardar en caché
            StorageService.guardarItem('eventos_cache', eventosNormalizados);
            StorageService.guardarTimestamp('eventos_timestamp');
            
            return eventosNormalizados;
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            UIService.mostrarToast('Error al cargar eventos. Intenta de nuevo más tarde.', 'error');
            return [];
        } finally {
            UIService.ocultarSpinner();
        }
    },
    
    /**
     * Normaliza los eventos para garantizar consistencia de datos
     * @param {Array} eventos - Eventos crudos del API
     * @returns {Array} Eventos normalizados
     */
    normalizarEventos(eventos) {
        return eventos.map(evento => ({
            id: evento.id || `evento-${Math.random().toString(36).substring(2, 11)}`,
            titulo: evento.titulo || 'Evento sin título',
            descripcion: evento.descripcion || 'Sin descripción',
            fechaInicio: evento.fechaInicio || new Date().toISOString(),
            fechaFin: evento.fechaFin || evento.fechaInicio || new Date().toISOString(),
            horario: evento.horario || 'Horario no especificado',
            ubicación: evento.ubicación || 'Ubicación no especificada',
            modalidad: evento.modalidad || 'Presencial',
            categoria: evento.categoria || 'otro',
            facilidades: evento.facilidades || 'No especificadas',
            cupo: evento.cupo || 'Sin límite',
            urlRegistro: evento.urlRegistro || '#'
        }));
    },
    
    /**
     * Filtra eventos según los criterios actuales
     * @returns {Array} Array de eventos filtrados
     */
    filtrarEventos() {
        let eventosFiltrados = AppState.eventos;
        const filtros = AppState.filtros;
        
        // Filtrar por categoría
        if (filtros.categoria !== 'todos') {
            eventosFiltrados = eventosFiltrados.filter(evento => 
                evento.categoria.toLowerCase() === filtros.categoria
            );
        }
        
        // Filtrar por texto
        if (filtros.texto) {
            const textoLower = filtros.texto.toLowerCase();
            eventosFiltrados = eventosFiltrados.filter(evento => 
                evento.titulo.toLowerCase().includes(textoLower) ||
                evento.descripcion.toLowerCase().includes(textoLower) ||
                evento.ubicación.toLowerCase().includes(textoLower) ||
                evento.modalidad.toLowerCase().includes(textoLower)
            );
        }
        
        // Filtrar por rango de fechas
        if (filtros.fechaInicio && filtros.fechaFin) {
            const inicio = new Date(filtros.fechaInicio);
            const fin = new Date(filtros.fechaFin);
            fin.setHours(23, 59, 59); // Incluir todo el día final
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                const fechaEvento = new Date(evento.fechaInicio);
                return fechaEvento >= inicio && fechaEvento <= fin;
            });
        } else if (filtros.fechaInicio) {
            const inicio = new Date(filtros.fechaInicio);
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                const fechaEvento = new Date(evento.fechaInicio);
                return fechaEvento >= inicio;
            });
        } else if (filtros.fechaFin) {
            const fin = new Date(filtros.fechaFin);
            fin.setHours(23, 59, 59); // Incluir todo el día final
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                const fechaEvento = new Date(evento.fechaInicio);
                return fechaEvento <= fin;
            });
        }
        
        // Filtrar por día seleccionado
        if (AppState.calendario.diaSeleccionado) {
            const dia = AppState.calendario.diaSeleccionado;
            const mes = AppState.calendario.mesActual;
            const anio = AppState.calendario.anioActual;
            
            eventosFiltrados = eventosFiltrados.filter(evento => {
                const fechaEvento = new Date(evento.fechaInicio);
                return fechaEvento.getDate() === dia && 
                       fechaEvento.getMonth() === mes && 
                       fechaEvento.getFullYear() === anio;
            });
        }
        
        return eventosFiltrados;
    },
    
    /**
     * Obtiene eventos para un día específico
     * @param {number} dia - Día del mes
     * @param {number} mes - Mes (0-11)
     * @param {number} anio - Año
     * @returns {Array} Eventos del día especificado
     */
    obtenerEventosPorDia(dia, mes, anio) {
        return AppState.eventos.filter(evento => {
            const fechaEvento = new Date(evento.fechaInicio);
            return fechaEvento.getDate() === dia && 
                   fechaEvento.getMonth() === mes && 
                   fechaEvento.getFullYear() === anio;
        });
    },
    
    /**
     * Exporta un evento a formato iCalendar
     * @param {Object} evento - Evento a exportar
     * @returns {string} Texto en formato iCalendar
     */
    exportarEventoICS(evento) {
        const fechaInicio = new Date(evento.fechaInicio);
        
        // Parsear el horario para obtener hora inicio y fin
        const [horaInicio, horaFin] = this.parsearHorario(evento.horario);
        
        // Configurar fecha y hora de inicio
        const fechaInicioCompleta = new Date(fechaInicio);
        if (horaInicio) {
            const [horaI, minI] = horaInicio.split(':').map(n => parseInt(n));
            fechaInicioCompleta.setHours(horaI, minI);
        }
        
        // Configurar fecha y hora de fin
        let fechaFinCompleta;
        if (evento.fechaFin && evento.fechaFin !== evento.fechaInicio) {
            fechaFinCompleta = new Date(evento.fechaFin);
            if (horaFin) {
                const [horaF, minF] = horaFin.split(':').map(n => parseInt(n));
                fechaFinCompleta.setHours(horaF, minF);
            } else {
                fechaFinCompleta.setHours(23, 59, 59);
            }
        } else {
            fechaFinCompleta = new Date(fechaInicio);
            if (horaFin) {
                const [horaF, minF] = horaFin.split(':').map(n => parseInt(n));
                fechaFinCompleta.setHours(horaF, minF);
            } else if (horaInicio) {
                const [horaI, minI] = horaInicio.split(':').map(n => parseInt(n));
                fechaFinCompleta.setHours(horaI + 1, minI); // Si no hay hora fin, asumir 1 hora
            } else {
                fechaFinCompleta.setHours(fechaInicioCompleta.getHours() + 1);
            }
        }
        
        // Formatear fechas para iCalendar (formato: 20210321T080000Z)
        const formatoFecha = fecha => {
            return fecha.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ConsejeriaEmocional//VisualizadorEventos//ES
BEGIN:VEVENT
UID:${evento.id}@karenguzmn.github.io
DTSTAMP:${formatoFecha(new Date())}
DTSTART:${formatoFecha(fechaInicioCompleta)}
DTEND:${formatoFecha(fechaFinCompleta)}
SUMMARY:${evento.titulo}
DESCRIPTION:${evento.descripcion.replace(/\n/g, '\\n')}
LOCATION:${evento.ubicación}
URL:${evento.urlRegistro || ''}
END:VEVENT
END:VCALENDAR`;
    },
    
    /**
     * Parsea el string de horario y devuelve hora inicio y fin
     * @param {string} horario - String con formato "HH:MM - HH:MM"
     * @returns {Array} Array con [horaInicio, horaFin]
     */
    parsearHorario(horario) {
        if (!horario) return [null, null];
        
        // Intentar varios formatos comunes de horario
        const formatoEstandar = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
        const formatoSoloInicio = /^(\d{1,2}:\d{2})$/;
        
        if (formatoEstandar.test(horario)) {
            const coincidencias = horario.match(formatoEstandar);
            return [coincidencias[1], coincidencias[2]];
        } else if (formatoSoloInicio.test(horario)) {
            const coincidencias = horario.match(formatoSoloInicio);
            return [coincidencias[1], null];
        }
        
        return [null, null];
    }
};

/**
 * Controlador para el calendario
 */
const CalendarioController = {
    /**
     * Inicializa el controlador del calendario
     */
    init() {
        // Configurar controles de navegación
        const btnMesAnterior = document.getElementById('mes-anterior');
        const btnMesSiguiente = document.getElementById('mes-siguiente');
        const btnToggleVista = document.getElementById('toggle-vista');
        
        if (btnMesAnterior) {
            btnMesAnterior.addEventListener('click', () => this.cambiarMes(-1));
        }
        
        if (btnMesSiguiente) {
            btnMesSiguiente.addEventListener('click', () => this.cambiarMes(1));
        }
        
        if (btnToggleVista) {
            btnToggleVista.addEventListener('click', () => this.toggleVista());
        }
        
        // Generar calendario inicial
        this.generarCalendario();
    },
    
    /**
     * Cambia al mes anterior o siguiente
     * @param {number} direccion - Dirección del cambio (+1 o -1)
     */
    cambiarMes(direccion) {
        const fechaActual = new Date(AppState.calendario.anioActual, AppState.calendario.mesActual);
        fechaActual.setMonth(fechaActual.getMonth() + direccion);
        
        AppState.calendario.mesActual = fechaActual.getMonth();
        AppState.calendario.anioActual = fechaActual.getFullYear();
        AppState.calendario.diaSeleccionado = null; // Resetear día seleccionado
        
        this.generarCalendario();
        EventosController.renderizarEventos();
    },
    
    /**
     * Cambia entre vista semanal y mensual
     */
    toggleVista() {
        AppState.calendario.vistaSemanal = !AppState.calendario.vistaSemanal;
        
        const btnToggleVista = document.getElementById('toggle-vista');
        if (btnToggleVista) {
            const textoBtn = AppState.calendario.vistaSemanal ? 'Vista Mensual' : 'Vista Semanal';
            const iconoBtn = AppState.calendario.vistaSemanal ? 'fa-calendar-days' : 'fa-calendar-week';
            
            btnToggleVista.innerHTML = `<i class="fa-solid ${iconoBtn}" aria-hidden="true"></i> ${textoBtn}`;
        }
        
        this.generarCalendario();
    },
    
    /**
     * Genera el calendario según el estado actual
     */
    generarCalendario() {
        const calendarioMes = document.getElementById('calendario-mes');
        if (!calendarioMes) return;
        
        calendarioMes.innerHTML = '';
        
        const mes = AppState.calendario.mesActual;
        const anio = AppState.calendario.anioActual;
        
        // Actualizar título del mes/año
        const tituloMes = document.getElementById('mes-actual');
        if (tituloMes) {
            const fecha = new Date(anio, mes, 1);
            tituloMes.textContent = UIService.formatearFecha(fecha, { 
                year: 'numeric', 
                month: 'long',
                weekday: undefined,
                day: undefined 
            });
        }
        
        if (AppState.calendario.vistaSemanal) {
            this.generarVistaSemanal(mes, anio);
        } else {
            this.generarVistaMensual(mes, anio);
        }
    },
    
    /**
     * Genera vista mensual del calendario
     * @param {number} mes - Mes (0-11)
     * @param {number} anio - Año
     */
    generarVistaMensual(mes, anio) {
        const calendarioMes = document.getElementById('calendario-mes');
        const diasDelMes = new Date(anio, mes + 1, 0).getDate();
        const primerDia = new Date(anio, mes, 1).getDay();
        
        // Añadir encabezados de días de la semana
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        diasSemana.forEach(dia => {
            const encabezado = document.createElement('div');
            encabezado.classList.add('dia-encabezado');
            encabezado.textContent = dia;
            encabezado.setAttribute('role', 'columnheader');
            calendarioMes.appendChild(encabezado);
        });
        
        // Crear espacios vacíos para los días antes del primer día del mes
        for (let i = 0; i < primerDia; i++) {
            const diaVacio = document.createElement('div');
            diaVacio.classList.add('dia', 'vacio');
            calendarioMes.appendChild(diaVacio);
        }
        
        // Crear los días del mes
        for (let dia = 1; dia <= diasDelMes; dia++) {
            const diaElemento = this.crearDiaElemento(dia, mes, anio);
            calendarioMes.appendChild(diaElemento);
        }
    },
    
    /**
     * Genera vista semanal del calendario
     * @param {number} mes - Mes (0-11)
     * @param {number} anio - Año
     */
    generarVistaSemanal(mes, anio) {
        const calendarioMes = document.getElementById('calendario-mes');
        let fechaInicio;
        
        // Si hay un día seleccionado, mostrar la semana que lo contiene
        if (AppState.calendario.diaSeleccionado) {
            fechaInicio = new Date(anio, mes, AppState.calendario.diaSeleccionado);
        } else {
            // Si no, mostrar la primera semana del mes
            fechaInicio = new Date(anio, mes, 1);
        }
        
        // Retroceder hasta el domingo
        const diaSemana = fechaInicio.getDay();
        fechaInicio.setDate(fechaInicio.getDate() - diaSemana);
        
        // Añadir encabezados de días de la semana
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        diasSemana.forEach(dia => {
            const encabezado = document.createElement('div');
            encabezado.classList.add('dia-encabezado');
            encabezado.textContent = dia;
            encabezado.setAttribute('role', 'columnheader');
            calendarioMes.appendChild(encabezado);
        });
        
        // Crear días para la semana (7 días desde domingo)
        for (let i = 0; i < 7; i++) {
            const fechaDia = new Date(fechaInicio);
            fechaDia.setDate(fechaInicio.getDate() + i);
            
            const diaElemento = this.crearDiaElemento(
                fechaDia.getDate(), 
                fechaDia.getMonth(), 
                fechaDia.getFullYear()
            );
            
            // Destacar si el día es de otro mes
            if (fechaDia.getMonth() !== mes) {
                diaElemento.classList.add('otro-mes');
            }
            
            calendarioMes.appendChild(diaElemento);
        }
    },
    
    /**
     * Crea elemento de día para el calendario
     * @param {number} dia - Día del mes
     * @param {number} mes - Mes (0-11)
     * @param {number} anio - Año
     * @returns {HTMLElement} Elemento del día
     */
    crearDiaElemento(dia, mes, anio) {
        const diaElemento = document.createElement('div');
        diaElemento.classList.add('dia');
        diaElemento.textContent = dia;
        diaElemento.setAttribute('tabindex', '0');
        diaElemento.setAttribute('role', 'gridcell');
        diaElemento.setAttribute('aria-label', `${dia} de ${new Date(anio, mes, 1).toLocaleDateString('es-ES', {month: 'long'})}`);
        
        // Verificar si es el día actual
        const hoy = new Date();
        if (dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()) {
            diaElemento.classList.add('hoy');
            diaElemento.setAttribute('aria-current', 'date');
        }
        
        // Verificar si es el día seleccionado
        if (dia === AppState.calendario.diaSeleccionado && 
            mes === AppState.calendario.mesActual && 
            anio === AppState.calendario.anioActual) {
            diaElemento.classList.add('seleccionado');
        }
        
        // Buscar eventos para este día
        const eventosDelDia = EventoService.obtenerEventosPorDia(dia, mes, anio);
        
        // Si hay eventos, añadir marcadores
        if (eventosDelDia.length > 0) {
            diaElemento.classList.add('con-evento');
            diaElemento.setAttribute('data-eventos', eventosDelDia.length);
            
            // Crear tooltip con títulos de eventos
            const titulosEventos = eventosDelDia.map(e => e.titulo).join(', ');
            const tooltipText = document.createElement('span');
            tooltipText.className = 'tooltiptext';
            tooltipText.textContent = `Eventos: ${titulosEventos}`;
            diaElemento.classList.add('tooltip');
            diaElemento.appendChild(tooltipText);
            
            // Añadir puntos indicadores de eventos
            if (eventosDelDia.length <= 3) {
                const puntosContainer = document.createElement('div');
                puntosContainer.className = 'evento-puntos';
                
                eventosDelDia.forEach(evento => {
                    const punto = document.createElement('span');
                    punto.className = `punto ${evento.categoria}`;
                    puntosContainer.appendChild(punto);
                });
                
                diaElemento.appendChild(puntosContainer);
            }
        }
        
        // Agregar evento de clic para seleccionar el día
        diaElemento.addEventListener('click', () => {
            // Desmarcar día anteriormente seleccionado
            const diaAnterior = document.querySelector('.dia.seleccionado');
            if (diaAnterior) {
                diaAnterior.classList.remove('seleccionado');
            }
            
            // Marcar nuevo día seleccionado
            diaElemento.classList.add('seleccionado');
            
            // Actualizar estado
            AppState.calendario.diaSeleccionado = dia;
            if (mes !== AppState.calendario.mesActual || anio !== AppState.calendario.anioActual) {
                AppState.calendario.mesActual = mes;
                AppState.calendario.anioActual = anio;
                this.generarCalendario();
            }
            
            // Actualizar eventos filtrados
            EventosController.renderizarEventos();
        });
        
        // Manejar navegación por teclado
        diaElemento.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                diaElemento.click();
            }
        });
        
        return diaElemento;
    }
};

/**
 * Controlador para los eventos
 */
const EventosController = {
    /**
     * Inicializa el controlador de eventos
     */
    init() {
        // Configurar filtros de categoría
        const filtrosBtns = document.querySelectorAll('#filtro-categorias .filtro');
        filtrosBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filtrarPorCategoria(e.currentTarget));
        });
        
        // Configurar buscador
        const buscador = document.getElementById('buscador');
        if (buscador) {
            buscador.addEventListener('input', () => this.filtrarPorTexto(buscador.value));
        }
        
        // Configurar botón de limpiar búsqueda
        const btnLimpiarBusqueda = document.getElementById('limpiar-busqueda');
        if (btnLimpiarBusqueda) {
            btnLimpiarBusqueda.addEventListener('click', () => this.limpiarBusqueda());
        }
        
        // Configurar filtros de fecha
        const fechaInicio = document.getElementById('fecha-inicio');
        const fechaFin = document.getElementById('fecha-fin');
        
        if (fechaInicio) {
            fechaInicio.addEventListener('change', () => this.filtrarPorFechas());
        }
        
        if (fechaFin) {
            fechaFin.addEventListener('change', () => this.filtrarPorFechas());
        }
        
        // Configurar botón de limpiar fechas
        const btnLimpiarFechas = document.getElementById('limpiar-fechas');
        if (btnLimpiarFechas) {
            btnLimpiarFechas.addEventListener('click', () => this.limpiarFechas());
        }
        
        // Configurar modal
        this.configurarModal();
    },
    
    /**
     * Filtra eventos por categoría
     * @param {HTMLElement} boton - Botón de categoría pulsado
     */
    filtrarPorCategoria(boton) {
        const categoria = boton.dataset.categoria;
        
        // Actualizar estado
        AppState.filtros.categoria = categoria;
        
        // Actualizar UI de botones
        const todosLosBtn = document.querySelectorAll('#filtro-categorias .filtro');
        todosLosBtn.forEach(btn => {
            const esActivo = btn === boton;
            btn.classList.toggle('active', esActivo);
            btn.setAttribute('aria-pressed', esActivo);
        });
        
        // Actualizar eventos mostrados
        this.renderizarEventos();
    },
    
    /**
     * Filtra eventos por texto de búsqueda
     * @param {string} texto - Texto de búsqueda
     */
    filtrarPorTexto(texto) {
        AppState.filtros.texto = texto;
        this.renderizarEventos();
    },
    
    /**
     * Limpia el campo de búsqueda
     */
    limpiarBusqueda() {
        const buscador = document.getElementById('buscador');
        if (buscador) {
            buscador.value = '';
        }
        
        AppState.filtros.texto = '';
        this.renderizarEventos();
    },
    
    /**
     * Filtra eventos por el rango de fechas seleccionado
     */
    filtrarPorFechas() {
        const fechaInicio = document.getElementById('fecha-inicio');
        const fechaFin = document.getElementById('fecha-fin');
        
        AppState.filtros.fechaInicio = fechaInicio ? fechaInicio.value : null;
        AppState.filtros.fechaFin = fechaFin ? fechaFin.value : null;
        
        this.renderizarEventos();
    },
    
    /**
     * Limpia los campos de fecha
     */
    limpiarFechas() {
        const fechaInicio = document.getElementById('fecha-inicio');
        const fechaFin = document.getElementById('fecha-fin');
        
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        
        AppState.filtros.fechaInicio = null;
        AppState.filtros.fechaFin = null;
        
        this.renderizarEventos();
    },
    
    /**
     * Configura el modal y sus eventos
     */
    configurarModal() {
        const modal = document.getElementById('modal-evento');
        const cerrarModal = document.querySelector('.close');
        
        if (modal && cerrarModal) {
            // Cerrar al hacer clic en la X
            cerrarModal.addEventListener('click', () => {
                modal.classList.remove('visible');
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                }, 300);
            });
            
            // Cerrar al hacer clic fuera del modal
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cerrarModal.click();
                }
            });
            
            // Cerrar con la tecla Escape
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    cerrarModal.click();
                }
            });
        }
    },
    
    /**
     * Muestra un evento en el modal
     * @param {Object} evento - Evento a mostrar
     */
    mostrarDetallesEvento(evento) {
        const modal = document.getElementById('modal-evento');
        if (!modal) return;
        
        const modalTitulo = document.getElementById('modal-titulo');
        const modalDescripcion = document.getElementById('modal-descripcion');
        const modalFecha = document.getElementById('modal-fecha');
        const modalHorario = document.getElementById('modal-horario');
        const modalUbicacion = document.getElementById('modal-ubicacion');
        const modalModalidad = document.getElementById('modal-modalidad');
        const modalFacilidades = document.getElementById('modal-facilidades');
        const modalCupo = document.getElementById('modal-cupo');
        
        // Llenar el modal con los datos del evento
        if (modalTitulo) modalTitulo.textContent = evento.titulo;
        if (modalDescripcion) modalDescripcion.textContent = evento.descripcion;
        if (modalFecha) modalFecha.textContent = UIService.formatearFecha(evento.fechaInicio);
        if (modalHorario) modalHorario.textContent = UIService.formatearHorario(evento.horario);
        if (modalUbicacion) modalUbicacion.textContent = evento.ubicación;
        if (modalModalidad) modalModalidad.textContent = evento.modalidad;
        if (modalFacilidades) modalFacilidades.textContent = evento.facilidades;
        if (modalCupo) modalCupo.textContent = `Cupo: ${evento.cupo}`;
        
        // Configurar botón de compartir
        const compartirBtn = document.getElementById('compartir-evento');
        if (compartirBtn) {
            compartirBtn.onclick = () => this.compartirEvento(evento);
        }
        
        // Configurar botón de exportar a calendario
        const exportarBtn = document.getElementById('exportar-evento');
        if (exportarBtn) {
            exportarBtn.onclick = () => this.exportarEventoACalendario(evento);
        }
        
        // Mostrar el modal con animación
        modal.style.display = 'block';
        // Forzar reflow para que la transición funcione
        modal.offsetHeight;
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        
        // Enfocar el título del modal para accesibilidad
        if (modalTitulo) modalTitulo.focus();
    },
    
    /**
     * Comparte un evento
     * @param {Object} evento - Evento a compartir
     */
    compartirEvento(evento) {
        const shareText = `¡No te pierdas el evento "${evento.titulo}"! El ${UIService.formatearFecha(evento.fechaInicio)} a las ${evento.horario}. ${evento.descripcion.substring(0, 100)}...`;
        
        if (navigator.share) {
            navigator.share({
                title: evento.titulo,
                text: shareText,
                url: evento.urlRegistro
            }).then(() => {
                UIService.mostrarToast('Evento compartido exitosamente', 'success');
            }).catch((error) => {
                console.error('Error al compartir:', error);
                UIService.mostrarToast('No se pudo compartir el evento', 'error');
                this.copiarAlPortapapeles(shareText + '\n' + evento.urlRegistro);
            });
        } else {
            this.copiarAlPortapapeles(shareText + '\n' + evento.urlRegistro);
        }
    },
    
    /**
     * Copia un texto al portapapeles
     * @param {string} texto - Texto a copiar
     */
    copiarAlPortapapeles(texto) {
        // Crear elemento temporal
        const input = document.createElement('textarea');
        input.value = texto;
        document.body.appendChild(input);
        
        // Seleccionar y copiar
        input.select();
        input.setSelectionRange(0, 99999);
        document.execCommand('copy');
        
        // Eliminar elemento temporal
        document.body.removeChild(input);
        
        UIService.mostrarToast('Información copiada al portapapeles', 'info');
    },
    
    /**
     * Exporta un evento al calendario del usuario
     * @param {Object} evento - Evento a exportar
     */
    exportarEventoACalendario(evento) {
        const contenidoICS = EventoService.exportarEventoICS(evento);
        const blob = new Blob([contenidoICS], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `evento-${evento.id}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        UIService.mostrarToast('Evento añadido a tu calendario', 'success');
    },
    
    /**
     * Renderiza los eventos filtrados
     */
    renderizarEventos() {
        const listaEventos = document.getElementById('lista-eventos');
        if (!listaEventos) return;
        
        // Limpiar lista
        listaEventos.innerHTML = '';
        
        // Obtener eventos filtrados
        const eventosFiltrados = EventoService.filtrarEventos();
        
        // Actualizar contador
        const contadorEventos = document.getElementById('contador-eventos');
        if (contadorEventos) {
            contadorEventos.textContent = `Eventos encontrados: ${eventosFiltrados.length}`;
        }
        
        // Si no hay eventos, mostrar mensaje
        if (eventosFiltrados.length === 0) {
            const mensajeVacio = document.createElement('div');
            mensajeVacio.className = 'mensaje-vacio';
            mensajeVacio.innerHTML = `
                <i class="fa-solid fa-calendar-xmark fa-2x" aria-hidden="true"></i>
                <p>No se encontraron eventos que coincidan con los filtros aplicados.</p>
            `;
            listaEventos.appendChild(mensajeVacio);
            return;
        }
        
        // Plantilla para crear eventos
        const plantilla = document.getElementById('plantilla-evento');
        
        // Renderizar cada evento
        eventosFiltrados.forEach(evento => {
            // Clonar la plantilla
            const eventoElemento = plantilla.content.cloneNode(true);
            
            // Configurar las clases según la categoría
            const articuloEvento = eventoElemento.querySelector('.evento');
            articuloEvento.classList.add(evento.categoria.toLowerCase());
            
            // Llenar los datos
            eventoElemento.querySelector('.evento-titulo').textContent = evento.titulo;
            eventoElemento.querySelector('.evento-descripcion').textContent = 
                evento.descripcion.length > 150 ? 
                evento.descripcion.substring(0, 150) + '...' : 
                evento.descripcion;
            
            eventoElemento.querySelector('.evento-fecha span').textContent = UIService.formatearFecha(evento.fechaInicio);
            eventoElemento.querySelector('.evento-horario span').textContent = UIService.formatearHorario(evento.horario);
            eventoElemento.querySelector('.evento-ubicacion span').textContent = evento.ubicación;
            
            // Configurar botones de acciones
            const btnVerDetalles = eventoElemento.querySelector('.ver-detalles');
            const btnCalendario = eventoElemento.querySelector('.agregar-calendario');
            
            if (btnVerDetalles) {
                btnVerDetalles.addEventListener('click', () => this.mostrarDetallesEvento(evento));
                btnVerDetalles.setAttribute('aria-label', `Ver detalles de ${evento.titulo}`);
            }
            
            if (btnCalendario) {
                btnCalendario.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.exportarEventoACalendario(evento);
                });
                btnCalendario.setAttribute('aria-label', `Añadir ${evento.titulo} a mi calendario`);
            }
            
            // Hacer que todo el elemento sea clickeable para ver detalles
            articuloEvento.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.mostrarDetallesEvento(evento);
                }
            });
            
            // Añadir a la lista
            listaEventos.appendChild(eventoElemento);
        });
    }
};

/**
 * Controlador principal de la aplicación
 */
const AppController = {
    /**
     * Inicializa toda la aplicación
     */
    async init() {
        // Inicializar el modo oscuro primero
        UIService.toggleModoOscuro(AppState.ui.modoOscuro);
        
        try {
            // Cargar los eventos
            await EventoService.obtenerEventos();
            
            // Inicializar controladores
            CalendarioController.init();
            EventosController.init();
            
            // Configurar el botón de tema
            this.configurarBotonTema();
            
            // Configurar el botón de hoy
            this.configurarBotonHoy();
            
            // Renderizar eventos iniciales
            EventosController.renderizarEventos();
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            UIService.mostrarToast('Error al cargar la aplicación. Por favor, intenta recargar la página.', 'error');
        }
    },
    
    /**
     * Configura el botón de modo oscuro/claro
     */
    configurarBotonTema() {
        const btnToggleTheme = document.getElementById('toggle-theme');
        if (btnToggleTheme) {
            btnToggleTheme.addEventListener('click', () => {
                UIService.toggleModoOscuro();
            });
        }
    },
    
    /**
     * Configura el botón para ir a la fecha actual
     */
    configurarBotonHoy() {
        const btnHoy = document.getElementById('today-button');
        if (btnHoy) {
            btnHoy.addEventListener('click', () => {
                const hoy = new Date();
                
                AppState.calendario.mesActual = hoy.getMonth();
                AppState.calendario.anioActual = hoy.getFullYear();
                AppState.calendario.diaSeleccionado = hoy.getDate();
                
                CalendarioController.generarCalendario();
                EventosController.renderizarEventos();
                
                UIService.mostrarToast('Mostrando eventos para hoy', 'info');
            });
        }
    }
};

// Iniciar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});
