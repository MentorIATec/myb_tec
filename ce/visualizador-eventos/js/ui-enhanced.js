/**
 * Controlador de UI mejorado para el visualizador de eventos
 * Soluciona problemas de interacción, navegación y visualización
 */

const UIController = {
    elementos: null,
    
    /**
     * Inicializa el controlador de UI
     */
    inicializar: function() {
        console.log('Inicializando UI Controller Mejorado...');
        
        // Inicializar referencias a elementos
        this.iniciarReferencias();
        
        // Configurar event listeners principales
        this.configurarEventosUI();
        
        console.log('UI Controller Mejorado inicializado correctamente');
    },
    
    /**
     * Inicializa referencias a elementos del DOM
     */
    iniciarReferencias: function() {
        this.elementos = {
            // Contenedores
            listaEventos: document.getElementById('lista-eventos'),
            eventosTitulo: document.getElementById('eventos-titulo'),
            contadorEventos: document.getElementById('contador-eventos'),
            
            // Modal
            modal: document.getElementById('modal-evento'),
            modalTitulo: document.getElementById('modal-titulo'),
            modalSubtitulo: document.getElementById('modal-subtitulo'),
            modalInfo: document.getElementById('modal-info'),
            modalDescripcion: document.getElementById('modal-descripcion'),
            modalCerrar: document.getElementById('modal-cerrar'),
            modalAgregar: document.getElementById('modal-agregar'),
            modalCompartir: document.getElementById('modal-compartir'),
            
            // Botones
            btnHoy: document.getElementById('btn-hoy'),
            mesAnteriorBtn: document.getElementById('mes-anterior'),
            mesSiguienteBtn: document.getElementById('mes-siguiente')
        };
        
        // Verificar elementos críticos
        ['listaEventos', 'eventosTitulo', 'contadorEventos'].forEach(id => {
            if (!this.elementos[id]) {
                console.error(`Elemento crítico no encontrado: ${id}`);
            }
        });
    },
    
    /**
     * Configura los event listeners para la UI
     */
    configurarEventosUI: function() {
        // Botón Hoy
        if (this.elementos.btnHoy) {
            this.elementos.btnHoy.addEventListener('click', () => {
                console.log('Botón Hoy clickeado');
                if (typeof CalendarioManager !== 'undefined' && CalendarioManager.irAHoy) {
                    CalendarioManager.irAHoy();
                }
            });
        }
        
        // Navegación de meses
        if (this.elementos.mesAnteriorBtn) {
            this.elementos.mesAnteriorBtn.addEventListener('click', () => {
                console.log('Botón Mes Anterior clickeado');
                if (typeof CalendarioManager !== 'undefined' && CalendarioManager.mesAnterior) {
                    CalendarioManager.mesAnterior();
                }
            });
        }
        
        if (this.elementos.mesSiguienteBtn) {
            this.elementos.mesSiguienteBtn.addEventListener('click', () => {
                console.log('Botón Mes Siguiente clickeado');
                if (typeof CalendarioManager !== 'undefined' && CalendarioManager.mesSiguiente) {
                    CalendarioManager.mesSiguiente();
                }
            });
        }
        
        // Modal - Botón cerrar
        if (this.elementos.modalCerrar) {
            this.elementos.modalCerrar.addEventListener('click', () => {
                this.cerrarModal();
            });
        }
        
        // Modal - Botones de acción
        if (this.elementos.modalAgregar) {
            this.elementos.modalAgregar.addEventListener('click', () => {
                this.agregarEventoACalendario();
            });
        }
        
        if (this.elementos.modalCompartir) {
            this.elementos.modalCompartir.addEventListener('click', () => {
                this.compartirEvento();
            });
        }
        
        // Modal - Cierre con Escape o click fuera
        if (this.elementos.modal) {
            // Clic fuera del modal
            this.elementos.modal.addEventListener('click', (e) => {
                if (e.target === this.elementos.modal) {
                    this.cerrarModal();
                }
            });
            
            // Tecla Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.elementos.modal && 
                    this.elementos.modal.style.display === 'flex') {
                    this.cerrarModal();
                }
            });
        }
    },
    
    /**
     * Muestra los eventos de un día específico
     */
    mostrarEventosDia: function(fecha) {
        console.log('Mostrando eventos para fecha:', fecha);
        
        if (!fecha || !this.elementos.listaEventos) {
            console.error('Fecha o lista de eventos no disponible');
            return;
        }
        
        // Formatear fecha
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
        
        // Obtener eventos para esta fecha
        let eventosDelDia = [];
        
        if (typeof EventosManager !== 'undefined' && EventosManager.obtenerEventosPorFecha) {
            eventosDelDia = EventosManager.obtenerEventosPorFecha(fecha);
            console.log(`Encontrados ${eventosDelDia.length} eventos para ${fechaFormateada}`);
        } else {
            console.error('EventosManager no está disponible');
        }
        
        // Actualizar título y contador
        if (this.elementos.eventosTitulo) {
            this.elementos.eventosTitulo.textContent = `Eventos para ${fechaFormateada}`;
        }
        
        if (this.elementos.contadorEventos) {
            this.elementos.contadorEventos.textContent = `${eventosDelDia.length} eventos`;
        }
        
        // Limpiar lista
        this.elementos.listaEventos.innerHTML = '';
        
        // Verificar si hay eventos
        if (eventosDelDia.length === 0) {
            this.mostrarMensajeVacio('No hay eventos para esta fecha');
            return;
        }
        
        // Crear elementos para cada evento
        eventosDelDia.forEach(evento => {
            this.crearTarjetaEvento(evento);
        });
    },
    
    /**
     * Crea una tarjeta para un evento específico
     */
    crearTarjetaEvento: function(evento) {
        if (!evento || !this.elementos.listaEventos) return;
        
        // Crear elemento de tarjeta
        const eventoEl = document.createElement('div');
        eventoEl.className = `evento-item ${evento.categoria || 'otro'}`;
        eventoEl.setAttribute('data-id', evento.id);
        
        // Determinar si tiene URL de registro
        const tieneURL = evento.urlRegistro && evento.urlRegistro !== '#';
        
        // Crear contenido HTML
        eventoEl.innerHTML = `
            <h3 class="evento-titulo">${evento.titulo}</h3>
            <div class="evento-meta">
                <span><i class="fa-regular fa-clock"></i> ${evento.horario}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${evento.ubicacion}</span>
                <span><i class="fa-solid fa-tag"></i> ${this.capitalizar(evento.categoria)}</span>
            </div>
            <p class="evento-descripcion">${this.truncarTexto(evento.descripcion, 150)}</p>
            <div class="evento-acciones">
                <button class="evento-btn ver-detalles">
                    <i class="fa-solid fa-eye"></i>
                    Ver detalles
                </button>
                ${tieneURL ? `
                <a href="${evento.urlRegistro}" target="_blank" class="evento-btn agregar-url">
                    <i class="fa-solid fa-external-link-alt"></i>
                    Registro
                </a>
                ` : ''}
                <button class="evento-btn agregar-calendario">
                    <i class="fa-solid fa-calendar-plus"></i>
                    Añadir a calendario
                </button>
            </div>
        `;
        
        // Añadir evento a la lista
        this.elementos.listaEventos.appendChild(eventoEl);
        
        // Configurar event listeners
        const verDetallesBtn = eventoEl.querySelector('.ver-detalles');
        if (verDetallesBtn) {
            verDetallesBtn.addEventListener('click', () => {
                console.log('Ver detalles de evento:', evento.id);
                this.mostrarDetallesEvento(evento);
            });
        }
        
        const agregarCalendarioBtn = eventoEl.querySelector('.agregar-calendario');
        if (agregarCalendarioBtn) {
            agregarCalendarioBtn.addEventListener('click', () => {
                console.log('Añadir evento a calendario:', evento.id);
                if (typeof EventosManager !== 'undefined' && EventosManager.descargarEventoICS) {
                    EventosManager.descargarEventoICS(evento);
                }
            });
        }
    },
    
    /**
     * Muestra los detalles de un evento en el modal
     */
    mostrarDetallesEvento: function(evento) {
        if (!evento || !this.elementos.modal) return;
        
        console.log('Mostrando detalles del evento:', evento.id);
        
        // Guardar ID del evento actual
        this.elementos.modal.dataset.eventoId = evento.id;
        
        // Formatear fecha
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = evento.fechaInicio.toLocaleDateString('es-ES', opciones);
        
        // Actualizar título y subtítulo
        if (this.elementos.modalTitulo) {
            this.elementos.modalTitulo.textContent = evento.titulo;
        }
        
        if (this.elementos.modalSubtitulo) {
            this.elementos.modalSubtitulo.textContent = `${this.capitalizar(evento.categoria)} • ${evento.horario}`;
        }
        
        // Actualizar información
        if (this.elementos.modalInfo) {
            const tieneURL = evento.urlRegistro && evento.urlRegistro !== '#';
            
            this.elementos.modalInfo.innerHTML = `
                <div class="info-grupo">
                    <div class="info-etiqueta">Fecha</div>
                    <div class="info-valor">${fechaFormateada}</div>
                </div>
                <div class="info-grupo">
                    <div class="info-etiqueta">Horario</div>
                    <div class="info-valor">${evento.horario}</div>
                </div>
                <div class="info-grupo">
                    <div class="info-etiqueta">Ubicación</div>
                    <div class="info-valor">${evento.ubicacion}</div>
                </div>
                <div class="info-grupo">
                    <div class="info-etiqueta">Modalidad</div>
                    <div class="info-valor">${evento.modalidad || 'No especificada'}</div>
                </div>
                ${tieneURL ? `
                <div class="info-grupo">
                    <div class="info-etiqueta">Registro</div>
                    <div class="info-valor">
                        <a href="${evento.urlRegistro}" target="_blank">Enlace de registro</a>
                    </div>
                </div>
                ` : ''}
            `;
        }
        
        // Actualizar descripción
        if (this.elementos.modalDescripcion) {
            this.elementos.modalDescripcion.textContent = evento.descripcion;
        }
        
        // Mostrar modal
        this.elementos.modal.style.display = 'flex';
    },
    
    /**
     * Cierra el modal de evento
     */
    cerrarModal: function() {
        if (this.elementos.modal) {
            this.elementos.modal.style.display = 'none';
        }
    },
    
    /**
     * Añade el evento actual a calendario
     */
    agregarEventoACalendario: function() {
        if (!this.elementos.modal) return;
        
        const eventoId = this.elementos.modal.dataset.eventoId;
        if (!eventoId) return;
        
        if (typeof EventosManager !== 'undefined' && EventosManager.obtenerEventoPorId && EventosManager.descargarEventoICS) {
            const evento = EventosManager.obtenerEventoPorId(eventoId);
            if (evento) {
                EventosManager.descargarEventoICS(evento);
            }
        }
    },
    
    /**
     * Comparte el evento actual
     */
    compartirEvento: function() {
        if (!this.elementos.modal) return;
        
        const eventoId = this.elementos.modal.dataset.eventoId;
        if (!eventoId) return;
        
        if (typeof EventosManager !== 'undefined' && EventosManager.obtenerEventoPorId && EventosManager.compartirEvento) {
            const evento = EventosManager.obtenerEventoPorId(eventoId);
            if (evento) {
                EventosManager.compartirEvento(evento);
            }
        }
    },
    
    /**
     * Muestra un mensaje cuando no hay eventos
     */
    mostrarMensajeVacio: function(mensaje) {
        if (!this.elementos.listaEventos) return;
        
        this.elementos.listaEventos.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fa-regular fa-calendar"></i>
                <p>${mensaje}</p>
            </div>
        `;
    },
    
    /**
     * Muestra un mensaje de error
     */
    mostrarError: function(mensaje) {
        if (!this.elementos.listaEventos) return;
        
        this.elementos.listaEventos.innerHTML = `
            <div class="mensaje-vacio">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>${mensaje}</p>
            </div>
        `;
    },
    
    /**
     * Muestra un mensaje de carga
     */
    mostrarCargando: function() {
        if (!this.elementos.listaEventos) return;
        
        this.elementos.listaEventos.innerHTML = `
            <div class="mensaje-vacio">
                <div class="spinner"></div>
                <p>Cargando eventos...</p>
            </div>
        `;
    },
    
    /**
     * Utilitario: Trunca un texto a una longitud específica
     */
    truncarTexto: function(texto, longitud = 150) {
        if (!texto) return '';
        if (texto.length <= longitud) return texto;
        return texto.substring(0, longitud) + '...';
    },
    
    /**
     * Utilitario: Capitaliza la primera letra de un texto
     */
    capitalizar: function(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
};
