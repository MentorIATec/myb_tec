/**
 * Controlador de la interfaz de usuario (VERSIÓN CORREGIDA)
 * Esta versión simplifica y mejora el funcionamiento del visualizador
 */

const UIController = {
    // Referencias a elementos de la UI
    elementos: null,
    
    /**
     * Inicializa los manejadores de eventos de la UI
     */
    inicializar: function() {
        // Inicializar referencias a elementos DOM
        this.iniciarReferencias();
        
        // Configurar botones de navegación
        if (this.elementos.btnHoy) {
            this.elementos.btnHoy.addEventListener('click', () => {
                CalendarioManager.irAHoy();
            });
        }
        
        if (this.elementos.mesAnteriorBtn) {
            this.elementos.mesAnteriorBtn.addEventListener('click', () => {
                CalendarioManager.mesAnterior();
            });
        }
        
        if (this.elementos.mesSiguienteBtn) {
            this.elementos.mesSiguienteBtn.addEventListener('click', () => {
                CalendarioManager.mesSiguiente();
            });
        }
        
        // Configurar modal
        if (this.elementos.modalCerrar) {
            this.elementos.modalCerrar.addEventListener('click', () => {
                this.cerrarModal();
            });
        }
        
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
        
        if (this.elementos.modal) {
            // Cerrar modal al hacer clic fuera
            this.elementos.modal.addEventListener('click', (e) => {
                if (e.target === this.elementos.modal) {
                    this.cerrarModal();
                }
            });
        }
        
        // Tecla ESC para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elementos.modal && this.elementos.modal.style.display === 'flex') {
                this.cerrarModal();
            }
        });
        
        console.log('UI inicializada correctamente');
    },
    
    /**
     * Inicia referencias a elementos del DOM
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
        
        // Verificar que los elementos existan
        for (const key in this.elementos) {
            if (this.elementos[key] === null) {
                console.warn(`Elemento ${key} no encontrado en el DOM`);
            }
        }
    },
    
    /**
     * Muestra los eventos de un día específico
     * @param {Date} fecha - Fecha de los eventos a mostrar
     */
    mostrarEventosDia: function(fecha) {
        if (!fecha || !this.elementos.listaEventos) return;
        
        const eventosDelDia = EventosManager.obtenerEventosPorFecha(fecha);
        
        // Formatear fecha
        const fechaFormateada = Utils.formatearFecha(fecha);
        
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
        
        // Ordenar eventos por hora
        eventosDelDia.sort((a, b) => {
            const horaA = a.horario || '';
            const horaB = b.horario || '';
            return horaA.localeCompare(horaB);
        });
        
        // Crear elementos para cada evento
        eventosDelDia.forEach(evento => {
            this.crearTarjetaEvento(evento);
        });
    },
    
    /**
     * Crea una tarjeta para un evento
     * @param {Object} evento - Evento a mostrar
     */
    crearTarjetaEvento: function(evento) {
        if (!evento || !this.elementos.listaEventos) return;
        
        const eventoEl = document.createElement('div');
        eventoEl.className = `evento-item ${evento.categoria}`;
        
        eventoEl.innerHTML = `
            <h3>${evento.titulo}</h3>
            <div class="evento-meta">
                <span><i class="fa-regular fa-clock"></i> ${evento.horario}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${evento.ubicacion}</span>
                <span><i class="fa-solid fa-tag"></i> ${Utils.capitalizar(evento.categoria)}</span>
            </div>
            <p>${Utils.truncarTexto(evento.descripcion, 150)}</p>
            <div class="evento-acciones">
                <button class="evento-btn ver-detalles">
                    <i class="fa-solid fa-eye"></i>
                    Ver detalles
                </button>
                <button class="evento-btn agregar-calendario">
                    <i class="fa-solid fa-calendar-plus"></i>
                    Añadir a calendario
                </button>
            </div>
        `;
        
        // Añadir evento a la lista
        this.elementos.listaEventos.appendChild(eventoEl);
        
        // Configurar botones
        const verDetallesBtn = eventoEl.querySelector('.ver-detalles');
        if (verDetallesBtn) {
            verDetallesBtn.addEventListener('click', () => {
                this.mostrarDetallesEvento(evento);
            });
        }
        
        const agregarCalendarioBtn = eventoEl.querySelector('.agregar-calendario');
        if (agregarCalendarioBtn) {
            agregarCalendarioBtn.addEventListener('click', () => {
                EventosManager.descargarEventoICS(evento);
            });
        }
    },
    
    /**
     * Muestra los detalles de un evento en el modal
     * @param {Object} evento - Evento a mostrar
     */
    mostrarDetallesEvento: function(evento) {
        if (!evento || !this.elementos.modal) return;
        
        // Guardar ID del evento actual
        this.elementos.modal.dataset.eventoId = evento.id;
        
        // Formatear fecha
        const fechaFormateada = Utils.formatearFecha(evento.fechaInicio);
        
        // Actualizar título y subtítulo
        if (this.elementos.modalTitulo) {
            this.elementos.modalTitulo.textContent = evento.titulo;
        }
        
        if (this.elementos.modalSubtitulo) {
            this.elementos.modalSubtitulo.textContent = `${Utils.capitalizar(evento.categoria)} • ${evento.horario}`;
        }
        
        // Actualizar información
        if (this.elementos.modalInfo) {
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
                    <div class="info-valor">${evento.modalidad}</div>
                </div>
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
        
        const evento = EventosManager.obtenerEventoPorId(eventoId);
        if (evento) {
            EventosManager.descargarEventoICS(evento);
        }
    },
    
    /**
     * Comparte el evento actual
     */
    compartirEvento: function() {
        if (!this.elementos.modal) return;
        
        const eventoId = this.elementos.modal.dataset.eventoId;
        if (!eventoId) return;
        
        const evento = EventosManager.obtenerEventoPorId(eventoId);
        if (evento) {
            EventosManager.compartirEvento(evento);
        }
    },
    
    /**
     * Muestra un mensaje cuando no hay eventos
     * @param {string} mensaje - Mensaje a mostrar
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
     * @param {string} mensaje - Mensaje de error
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
    }
};
