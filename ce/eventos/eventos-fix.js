/**
 * Archivo de corrección para la carga de eventos
 * Este script soluciona los problemas de carga de eventos y proporciona
 * los controladores necesarios para la visualización.
 */

// Controlador de Calendario
const CalendarioController = {
    mesActual: new Date().getMonth(),
    anioActual: new Date().getFullYear(),
    diaSeleccionado: null,
    
    // Inicializar calendario
    init() {
        this.actualizarTituloMes();
        this.generarCalendario();
        this.configurarEventos();
    },
    
    // Actualizar el título del mes y año actual
    actualizarTituloMes() {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const mesActualElement = document.getElementById('mes-actual');
        if (mesActualElement) {
            mesActualElement.textContent = `${meses[this.mesActual]} ${this.anioActual}`;
        }
    },
    
    // Generar la vista del calendario
    generarCalendario() {
        const calendarioMes = document.getElementById('calendario-mes');
        if (!calendarioMes) return;
        
        // Limpiar el calendario actual
        calendarioMes.innerHTML = '';
        
        // Crear encabezados de días de la semana
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        diasSemana.forEach(dia => {
            const diaHeader = document.createElement('div');
            diaHeader.className = 'dia-encabezado';
            diaHeader.textContent = dia;
            calendarioMes.appendChild(diaHeader);
        });
        
        // Calcular primer día del mes y último día
        const primerDia = new Date(this.anioActual, this.mesActual, 1);
        const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
        
        // Día de la semana del primer día (0=domingo, 6=sábado)
        const primerDiaSemana = primerDia.getDay();
        
        // Días del mes anterior para completar la primera semana
        for (let i = 0; i < primerDiaSemana; i++) {
            const diaElement = document.createElement('div');
            diaElement.className = 'dia vacio';
            calendarioMes.appendChild(diaElement);
        }
        
        // Crear los días del mes actual
        const hoy = new Date();
        const esHoyMesActual = hoy.getMonth() === this.mesActual && hoy.getFullYear() === this.anioActual;
        
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const fechaDia = new Date(this.anioActual, this.mesActual, dia);
            const eventos = EventosController.obtenerEventosPorFecha(fechaDia);
            
            const diaElement = document.createElement('div');
            diaElement.className = 'dia';
            diaElement.setAttribute('tabindex', '0');
            diaElement.setAttribute('role', 'button');
            diaElement.setAttribute('aria-label', `${dia} de ${Utilidades.formatearFecha(fechaDia, {month: 'long'})} ${eventos.length > 0 ? `con ${eventos.length} eventos` : 'sin eventos'}`);
            
            // Verificar si es el día de hoy
            if (esHoyMesActual && hoy.getDate() === dia) {
                diaElement.classList.add('hoy');
            }
            
            // Verificar si es el día seleccionado
            if (this.diaSeleccionado && 
                this.diaSeleccionado.getDate() === dia && 
                this.diaSeleccionado.getMonth() === this.mesActual && 
                this.diaSeleccionado.getFullYear() === this.anioActual) {
                diaElement.classList.add('seleccionado');
            }
            
            // Agregar número del día
            const numeroElement = document.createElement('span');
            numeroElement.textContent = dia;
            diaElement.appendChild(numeroElement);
            
            // Agregar indicadores de eventos si hay eventos en este día
            if (eventos.length > 0) {
                diaElement.classList.add('con-evento');
                diaElement.setAttribute('data-eventos', eventos.length);
                
                // Agregar puntos de colores según categorías
                const puntosContainer = document.createElement('div');
                puntosContainer.className = 'evento-puntos';
                
                // Mostrar hasta 3 puntos (para no sobrecargar visualmente)
                const maxPuntos = Math.min(eventos.length, 3);
                
                // Crear un Set para evitar duplicar categorías
                const categoriasVistas = new Set();
                
                for (let i = 0; i < eventos.length; i++) {
                    if (categoriasVistas.size >= maxPuntos) break;
                    
                    const categoria = eventos[i].categoria.toLowerCase();
                    if (!categoriasVistas.has(categoria)) {
                        categoriasVistas.add(categoria);
                        
                        const punto = document.createElement('span');
                        punto.className = `punto ${categoria}`;
                        puntosContainer.appendChild(punto);
                    }
                }
                
                diaElement.appendChild(puntosContainer);
                
                // Agregar evento click para seleccionar este día
                diaElement.addEventListener('click', () => {
                    this.seleccionarDia(new Date(this.anioActual, this.mesActual, dia));
                });
            }
            
            calendarioMes.appendChild(diaElement);
        }
    },
    
    // Configurar eventos para los controles del calendario
    configurarEventos() {
        const mesAnteriorBtn = document.getElementById('mes-anterior');
        const mesSiguienteBtn = document.getElementById('mes-siguiente');
        const todayButton = document.getElementById('today-button');
        
        if (mesAnteriorBtn) {
            mesAnteriorBtn.addEventListener('click', () => {
                this.mesActual--;
                if (this.mesActual < 0) {
                    this.mesActual = 11;
                    this.anioActual--;
                }
                this.actualizarTituloMes();
                this.generarCalendario();
            });
        }
        
        if (mesSiguienteBtn) {
            mesSiguienteBtn.addEventListener('click', () => {
                this.mesActual++;
                if (this.mesActual > 11) {
                    this.mesActual = 0;
                    this.anioActual++;
                }
                this.actualizarTituloMes();
                this.generarCalendario();
            });
        }
        
        if (todayButton) {
            todayButton.addEventListener('click', () => {
                const hoy = new Date();
                this.mesActual = hoy.getMonth();
                this.anioActual = hoy.getFullYear();
                this.actualizarTituloMes();
                this.generarCalendario();
                
                // Seleccionar el día de hoy si tiene eventos
                const eventosHoy = EventosController.obtenerEventosPorFecha(hoy);
                if (eventosHoy.length > 0) {
                    this.seleccionarDia(hoy);
                }
            });
        }
    },
    
    // Seleccionar un día específico
    seleccionarDia(fecha) {
        this.diaSeleccionado = fecha;
        AppState.calendario.diaSeleccionado = fecha.getDate();
        
        // Actualizar UI
        this.generarCalendario();
        
        // Actualizar lista de eventos
        EventosController.renderizarEventos();
    }
};

// Controlador de Eventos
const EventosController = {
    init() {
        this.configurarFiltros();
        this.cargarEventosIniciales();
    },
    
    // Configurar los filtros de categoría y búsqueda
    configurarFiltros() {
        // Configurar filtros de categoría
        const filtrosCategorias = document.getElementById('filtro-categorias');
        if (filtrosCategorias) {
            filtrosCategorias.addEventListener('click', (e) => {
                const filtroBtn = e.target.closest('.filtro');
                if (!filtroBtn) return;
                
                // Remover la clase 'active' de todos los botones
                document.querySelectorAll('.filtro').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                // Agregar la clase 'active' al botón clicado
                filtroBtn.classList.add('active');
                filtroBtn.setAttribute('aria-pressed', 'true');
                
                // Actualizar filtro en el estado
                AppState.filtros.categoria = filtroBtn.dataset.categoria;
                
                // Renderizar eventos con el nuevo filtro
                this.renderizarEventos();
            });
        }
        
        // Configurar búsqueda
        const buscador = document.getElementById('buscador');
        const limpiarBusqueda = document.getElementById('limpiar-busqueda');
        
        if (buscador) {
            buscador.addEventListener('input', () => {
                AppState.filtros.texto = buscador.value.trim();
                this.renderizarEventos();
            });
        }
        
        if (limpiarBusqueda) {
            limpiarBusqueda.addEventListener('click', () => {
                if (buscador) buscador.value = '';
                AppState.filtros.texto = '';
                this.renderizarEventos();
            });
        }
        
        // Configurar filtros de fecha
        const fechaInicio = document.getElementById('fecha-inicio');
        const fechaFin = document.getElementById('fecha-fin');
        const limpiarFechas = document.getElementById('limpiar-fechas');
        
        if (fechaInicio) {
            fechaInicio.addEventListener('change', () => {
                AppState.filtros.fechaInicio = fechaInicio.value || null;
                this.renderizarEventos();
            });
        }
        
        if (fechaFin) {
            fechaFin.addEventListener('change', () => {
                AppState.filtros.fechaFin = fechaFin.value || null;
                this.renderizarEventos();
            });
        }
        
        if (limpiarFechas) {
            limpiarFechas.addEventListener('click', () => {
                if (fechaInicio) fechaInicio.value = '';
                if (fechaFin) fechaFin.value = '';
                AppState.filtros.fechaInicio = null;
                AppState.filtros.fechaFin = null;
                this.renderizarEventos();
            });
        }
        
        // Configurar cambio de vista
        const toggleVista = document.getElementById('toggle-vista');
        if (toggleVista) {
            toggleVista.addEventListener('click', () => {
                AppState.calendario.vistaSemanal = !AppState.calendario.vistaSemanal;
                
                // Actualizar texto e ícono del botón
                if (AppState.calendario.vistaSemanal) {
                    toggleVista.innerHTML = '<i class="fa-solid fa-calendar-month" aria-hidden="true"></i> Vista Mensual';
                } else {
                    toggleVista.innerHTML = '<i class="fa-solid fa-calendar-week" aria-hidden="true"></i> Vista Semanal';
                }
                
                // Regenerar calendario
                CalendarioController.generarCalendario();
            });
        }
    },
    
    // Cargar eventos desde el JSON al inicio
    async cargarEventosIniciales() {
        try {
            await EventoService.obtenerEventos();
            this.renderizarEventos();
            CalendarioController.generarCalendario();
            
            // Seleccionar el día actual si tiene eventos
            const hoy = new Date();
            const eventosHoy = this.obtenerEventosPorFecha(hoy);
            if (eventosHoy.length > 0) {
                CalendarioController.seleccionarDia(hoy);
            }
        } catch (error) {
            console.error('Error al cargar eventos iniciales:', error);
            UIService.mostrarToast('Error al cargar eventos. Intente más tarde.', 'error');
        }
    },
    
    // Obtener eventos para una fecha específica
    obtenerEventosPorFecha(fecha) {
        return EventoService.obtenerEventosPorDia(
            fecha.getDate(),
            fecha.getMonth(),
            fecha.getFullYear()
        );
    },
    
    // Renderizar eventos en la lista
    renderizarEventos() {
        const listaEventos = document.getElementById('lista-eventos');
        if (!listaEventos) return;
        
        const eventosAMostrar = EventoService.filtrarEventos();
        
        // Actualizar contador
        const contadorEventos = document.getElementById('contador-eventos');
        if (contadorEventos) {
            contadorEventos.textContent = `Eventos encontrados: ${eventosAMostrar.length}`;
        }
        
        // Limpiar lista actual
        listaEventos.innerHTML = '';
        
        // Si no hay eventos, mostrar mensaje
        if (eventosAMostrar.length === 0) {
            const mensajeVacio = document.createElement('div');
            mensajeVacio.className = 'mensaje-vacio';
            mensajeVacio.innerHTML = `
                <i class="fa-solid fa-calendar-xmark fa-2x" aria-hidden="true"></i>
                <p>No se encontraron eventos con los filtros actuales</p>
            `;
            listaEventos.appendChild(mensajeVacio);
            return;
        }
        
        // Ordenar eventos por fecha
        eventosAMostrar.sort((a, b) => {
            return new Date(a.fechaInicio) - new Date(b.fechaInicio);
        });
        
        // Plantilla para eventos
        const plantilla = document.getElementById('plantilla-evento');
        
        // Crear y agregar cada evento
        eventosAMostrar.forEach(evento => {
            if (!plantilla) {
                // Si no hay plantilla, crear elemento manualmente
                const eventoElement = document.createElement('article');
                eventoElement.className = `evento ${evento.categoria}`;
                eventoElement.setAttribute('role', 'article');
                eventoElement.setAttribute('tabindex', '0');
                
                eventoElement.innerHTML = `
                    <div class="evento-categoria" aria-hidden="true"></div>
                    <h3 class="evento-titulo">${evento.titulo}</h3>
                    <p class="evento-descripcion">${evento.descripcion || 'Sin descripción'}</p>
                    <div class="evento-metadata">
                        <p class="evento-fecha">
                            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                            <span>${Utilidades.formatearFecha(evento.fechaInicio)}</span>
                        </p>
                        <p class="evento-horario">
                            <i class="fa-regular fa-clock" aria-hidden="true"></i>
                            <span>${evento.horario || 'Horario no especificado'}</span>
                        </p>
                        <p class="evento-ubicacion">
                            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                            <span>${evento.ubicación || 'Ubicación no especificada'}</span>
                        </p>
                    </div>
                    <div class="evento-acciones">
                        <button class="ver-detalles" aria-label="Ver detalles">
                            <i class="fa-solid fa-eye" aria-hidden="true"></i>
                            Ver Detalles
                        </button>
                        <button class="agregar-calendario" aria-label="Añadir a mi calendario">
                            <i class="fa-solid fa-calendar-plus" aria-hidden="true"></i>
                        </button>
                    </div>
                `;
                
                // Agregar evento a la lista
                listaEventos.appendChild(eventoElement);
                
                // Configurar botones de acciones
                const verDetallesBtn = eventoElement.querySelector('.ver-detalles');
                if (verDetallesBtn) {
                    verDetallesBtn.addEventListener('click', () => {
                        this.mostrarDetalleEvento(evento);
                    });
                }
            } else {
                // Usar la plantilla
                const clone = plantilla.content.cloneNode(true);
                
                // Llenar datos del evento
                clone.querySelector('.evento').classList.add(evento.categoria);
                clone.querySelector('.evento-titulo').textContent = evento.titulo;
                clone.querySelector('.evento-descripcion').textContent = evento.descripcion || 'Sin descripción';
                
                const fechaSpan = clone.querySelector('.evento-fecha span');
                if (fechaSpan) fechaSpan.textContent = Utilidades.formatearFecha(evento.fechaInicio);
                
                const horarioSpan = clone.querySelector('.evento-horario span');
                if (horarioSpan) horarioSpan.textContent = evento.horario || 'Horario no especificado';
                
                const ubicacionSpan = clone.querySelector('.evento-ubicacion span');
                if (ubicacionSpan) ubicacionSpan.textContent = evento.ubicación || 'Ubicación no especificada';
                
                // Configurar botones
                const verDetallesBtn = clone.querySelector('.ver-detalles');
                if (verDetallesBtn) {
                    verDetallesBtn.addEventListener('click', () => {
                        this.mostrarDetalleEvento(evento);
                    });
                }
                
                const agregarCalendarioBtn = clone.querySelector('.agregar-calendario');
                if (agregarCalendarioBtn) {
                    agregarCalendarioBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.exportarEvento(evento);
                    });
                }
                
                // Agregar evento a la lista
                listaEventos.appendChild(clone);
            }
        });
    },
    
    // Mostrar detalle de un evento en el modal
    mostrarDetalleEvento(evento) {
        const modal = document.getElementById('modal-evento');
        if (!modal) return;
        
        // Llenar información en el modal
        const titulo = document.getElementById('modal-titulo');
        const descripcion = document.getElementById('modal-descripcion');
        const fecha = document.getElementById('modal-fecha');
        const horario = document.getElementById('modal-horario');
        const ubicacion = document.getElementById('modal-ubicacion');
        const modalidad = document.getElementById('modal-modalidad');
        const facilidades = document.getElementById('modal-facilidades');
        const cupo = document.getElementById('modal-cupo');
        
        if (titulo) titulo.textContent = evento.titulo;
        if (descripcion) descripcion.textContent = evento.descripcion || 'No hay descripción disponible.';
        if (fecha) fecha.textContent = Utilidades.formatearFecha(evento.fechaInicio);
        if (horario) horario.textContent = evento.horario || 'No especificado';
        if (ubicacion) ubicacion.textContent = evento.ubicación || 'No especificada';
        if (modalidad) modalidad.textContent = evento.modalidad || 'No especificada';
        if (facilidades) facilidades.textContent = evento.facilidades || 'No especificadas';
        if (cupo) cupo.textContent = evento.estado === 'disponible' ? 'Cupos disponibles' : 'Cupos limitados';
        
        // Configurar botones del modal
        const compartirBtn = document.getElementById('compartir-evento');
        const exportarBtn = document.getElementById('exportar-evento');
        
        if (compartirBtn) {
            compartirBtn.onclick = () => this.compartirEvento(evento);
        }
        
        if (exportarBtn) {
            exportarBtn.onclick = () => this.exportarEvento(evento);
        }
        
        // Mostrar el modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
        
        // Configurar cierre del modal
        const cerrarModal = modal.querySelector('.close');
        if (cerrarModal) {
            cerrarModal.addEventListener('click', () => {
                modal.classList.remove('visible');
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                }, 300);
            });
        }
    },
    
    // Compartir un evento
    compartirEvento(evento) {
        if (!navigator.share) {
            UIService.mostrarToast('Tu navegador no soporta la API de compartir', 'error');
            return;
        }
        
        const textoCompartir = `
            ${evento.titulo}
            📅 ${Utilidades.formatearFecha(evento.fechaInicio)}
            🕒 ${evento.horario || 'Horario no especificado'}
            📍 ${evento.ubicación || 'Ubicación no especificada'}
            
            ${evento.descripcion || 'Sin descripción'}
        `;
        
        navigator.share({
            title: evento.titulo,
            text: textoCompartir,
            url: window.location.href
        })
        .then(() => UIService.mostrarToast('Evento compartido con éxito', 'success'))
        .catch(error => {
            console.error('Error al compartir:', error);
            UIService.mostrarToast('Error al compartir el evento', 'error');
        });
    },
    
    // Exportar evento a calendario
    exportarEvento(evento) {
        try {
            // Crear fechas para el evento
            const fechaInicio = new Date(evento.fechaInicio);
            let fechaFin;
            
            if (evento.fechaFin) {
                fechaFin = new Date(evento.fechaFin);
            } else {
                // Si no hay fecha fin, usar fecha inicio + 1 hora
                fechaFin = new Date(fechaInicio);
                fechaFin.setHours(fechaFin.getHours() + 1);
            }
            
            // Si hay un horario específico, intentar parsearlo
            if (evento.horario) {
                const horarios = evento.horario.split('-').map(h => h.trim());
                if (horarios.length === 2) {
                    const [horaInicio, minInicio] = horarios[0].split(':').map(Number);
                    if (!isNaN(horaInicio)) {
                        fechaInicio.setHours(horaInicio, minInicio || 0, 0);
                        
                        const [horaFin, minFin] = horarios[1].split(':').map(Number);
                        if (!isNaN(horaFin)) {
                            fechaFin.setHours(horaFin, minFin || 0, 0);
                        }
                    }
                }
            }
            
            // Formato estándar de iCalendar
            const now = new Date();
            const formatoFechaICS = (fecha) => {
                return fecha.toISOString().replace(/-|:|\.\d+/g, '');
            };
            
            const evento_ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Consejería Emocional TEC//Eventos//ES',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${evento.id || new Date().getTime()}@karenguzmn.github.io`,
                `DTSTAMP:${formatoFechaICS(now)}`,
                `DTSTART:${formatoFechaICS(fechaInicio)}`,
                `DTEND:${formatoFechaICS(fechaFin)}`,
                `SUMMARY:${evento.titulo}`,
                `DESCRIPTION:${evento.descripcion || 'Sin descripción'}`,
                `LOCATION:${evento.ubicación || 'Ubicación no especificada'}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');
            
            // Crear link para descargar
            const blob = new Blob([evento_ics], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${evento.titulo.replace(/\s+/g, '_')}.ics`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            UIService.mostrarToast('Evento añadido a tu calendario', 'success');
        } catch (error) {
            console.error('Error al exportar evento:', error);
            UIService.mostrarToast('Error al añadir evento al calendario', 'error');
        }
    }
};

// Controlador de tema oscuro/claro
const TemaController = {
    init() {
        // Verificar preferencia guardada
        const modoOscuro = localStorage.getItem('modo_oscuro') === 'true';
        if (modoOscuro) {
            document.body.classList.add('dark-mode');
            this.actualizarBotonTema(true);
        }
        
        // Configurar botón de cambio de tema
        const toggleTheme = document.getElementById('toggle-theme');
        if (toggleTheme) {
            toggleTheme.addEventListener('click', () => {
                const esModoOscuro = document.body.classList.toggle('dark-mode');
                localStorage.setItem('modo_oscuro', esModoOscuro);
                this.actualizarBotonTema(esModoOscuro);
            });
        }
    },
    
    actualizarBotonTema(esModoOscuro) {
        const toggleTheme = document.getElementById('toggle-theme');
        if (!toggleTheme) return;
        
        if (esModoOscuro) {
            toggleTheme.innerHTML = '<i class="fa-regular fa-sun" aria-hidden="true"></i> Modo Claro';
            toggleTheme.setAttribute('aria-pressed', 'true');
        } else {
            toggleTheme.innerHTML = '<i class="fa-regular fa-moon" aria-hidden="true"></i> Modo Oscuro';
            toggleTheme.setAttribute('aria-pressed', 'false');
        }
    }
};

// Configuración de modales
const ModalController = {
    init() {
        // Configurar cierre del modal de evento
        const modal = document.getElementById('modal-evento');
        if (modal) {
            // Cerrar al hacer click en X
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.cerrarModal(modal);
                });
            }
            
            // Cerrar al hacer click fuera del contenido
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal(modal);
                }
            });
            
            // Cerrar al presionar Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    this.cerrarModal(modal);
                }
            });
        }
    },
    
    cerrarModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }, 300);
    }
};

// Inicialización cuando el documento está listo
document.addEventListener('DOMContentLoaded', async function() {
    // Corregir la URL de carga de eventos
    EventoService.obtenerEventos = async function(forzarRecarga = false) {
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
            
            // URL CORREGIDA: La diferencia principal está aquí
            const urls = [
                'https://karenguzmn.github.io/myb_tec/ce/eventos.json',
                // URL alternativa como respaldo
                'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json'
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
    };
    
    // Inicializar controladores
    try {
        TemaController.init();
        ModalController.init();
        await EventosController.init();
        CalendarioController.init();
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        UIService.mostrarToast('Error al inicializar la aplicación. Intenta recargar la página.', 'error');
    }
});
