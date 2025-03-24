/**
 * Módulo para manejar la lógica del calendario
 */

const CalendarioManager = {
    // Fecha actual
    fechaActual: new Date(),
    
    // Mes y año seleccionados
    mesActual: new Date().getMonth(),
    anioActual: new Date().getFullYear(),
    
    // Día seleccionado (fecha completa)
    diaSeleccionado: null,
    
    // Referencia a elementos DOM del calendario
    elementos: {
        mesAnio: document.getElementById('mes-anio'),
        calendarioGrid: document.getElementById('calendario-grid')
    },
    
    // Nombres de los meses en español
    meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    
    // Clases para categorías
    categoriaClases: {
        'curso': 'curso',
        'taller': 'taller',
        'grupo': 'grupo',
        'activacion': 'activacion',
        'evento': 'evento',
        'otro': 'otro'
    },
    
    /**
     * Inicializa el calendario
     */
    inicializar: function() {
        // Actualizar referencias DOM (en caso de que hayan cambiado)
        this.elementos = {
            mesAnio: document.getElementById('mes-anio'),
            calendarioGrid: document.getElementById('calendario-grid')
        };
        
        this.actualizarTituloMes();
        this.generarCalendario();
    },
    
    /**
     * Actualiza el título con el mes y año actual
     */
    actualizarTituloMes: function() {
        if (this.elementos.mesAnio) {
            this.elementos.mesAnio.textContent = `${this.meses[this.mesActual]} ${this.anioActual}`;
        }
    },
    
    /**
     * Genera el grid del calendario con los días del mes
     */
    generarCalendario: function() {
        if (!this.elementos.calendarioGrid) {
            console.error("No se encontró el elemento del calendario");
            return;
        }
        
        // Limpiar el calendario
        this.elementos.calendarioGrid.innerHTML = '';
        
        // Primer día del mes
        const primerDia = new Date(this.anioActual, this.mesActual, 1);
        
        // Día de la semana del primer día (0: domingo, 6: sábado)
        const primerDiaSemana = primerDia.getDay();
        
        // Último día del mes
        const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
        
        // Último día del mes anterior
        const ultimoDiaMesAnterior = new Date(this.anioActual, this.mesActual, 0).getDate();
        
        // Total de celdas necesarias (42 = 6 semanas de 7 días)
        const totalCeldas = 42;
        
        // Fecha actual para marcar el día de hoy
        const esHoyMesActual = this.fechaActual.getMonth() === this.mesActual && 
                             this.fechaActual.getFullYear() === this.anioActual;
        
        // Generar celdas para el calendario
        for (let i = 0; i < totalCeldas; i++) {
            let dia;
            let mes = this.mesActual;
            let anio = this.anioActual;
            let esOtroMes = false;
            
            // Días del mes anterior
            if (i < primerDiaSemana) {
                dia = ultimoDiaMesAnterior - primerDiaSemana + i + 1;
                mes = this.mesActual - 1;
                if (mes < 0) {
                    mes = 11;
                    anio = this.anioActual - 1;
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
                mes = this.mesActual + 1;
                if (mes > 11) {
                    mes = 0;
                    anio = this.anioActual + 1;
                }
                esOtroMes = true;
            }
            
            // Fecha para este día
            const fechaDia = new Date(anio, mes, dia);
            
            // Determinar si es el día seleccionado
            const esSeleccionado = this.diaSeleccionado && 
                               this.diaSeleccionado.getDate() === dia && 
                               this.diaSeleccionado.getMonth() === mes && 
                               this.diaSeleccionado.getFullYear() === anio;
            
            // Determinar si es el día de hoy
            const esHoy = esHoyMesActual && this.fechaActual.getDate() === dia && !esOtroMes;
            
            // Obtener eventos para esta fecha
            const eventosDia = EventosManager.obtenerEventosPorFecha(fechaDia);
            const tieneEventos = eventosDia.length > 0;
            
            // Crear elemento para el día
            const diaEl = document.createElement('div');
            diaEl.className = 'dia-celda';
            if (esOtroMes) diaEl.classList.add('otro-mes');
            if (tieneEventos) diaEl.classList.add('has-eventos');
            if (esHoy) diaEl.classList.add('hoy');
            if (esSeleccionado) diaEl.classList.add('seleccionado');
            
            // Guardar fecha como atributo
            diaEl.setAttribute('data-fecha', `${anio}-${mes+1}-${dia}`);
            
            // Contenido del día
            diaEl.innerHTML = `
                <div class="dia-numero">${dia}</div>
                ${tieneEventos ? `<div class="dia-indicadores">
                    ${this.generarIndicadoresDia(eventosDia)}
                </div>` : ''}
            `;
            
            // Evento de clic para mostrar eventos del día
            if (tieneEventos) {
                diaEl.addEventListener('click', () => {
                    this.seleccionarDia(fechaDia);
                    this.mostrarEventosDia(fechaDia);
                });
            }
            
            this.elementos.calendarioGrid.appendChild(diaEl);
            
            // Si pasamos 4 semanas y ya estamos en el mes siguiente, podríamos salir
            // para no mostrar filas vacías, pero dejamos la cuadrícula completa por consistencia
        }
    },
    
    /**
     * Genera los indicadores visuales de eventos por categoría
     * @param {Array} eventos - Lista de eventos del día
     * @returns {string} HTML con los indicadores
     */
    generarIndicadoresDia: function(eventos) {
        // Usando un objeto para contar eventos por categoría
        const categorias = {};
        eventos.forEach(evento => {
            const cat = (evento.categoria || 'otro').toLowerCase();
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
            indicadoresHTML += `<div class="dia-indicador ${this.categoriaClases[categoria] || 'otro'}"></div>`;
        }
        
        return indicadoresHTML;
    },
    
    /**
     * Selecciona un día del calendario
     * @param {Date} fecha - Fecha a seleccionar
     */
    seleccionarDia: function(fecha) {
        // Guardar día seleccionado
        this.diaSeleccionado = fecha;
        
        // Actualizar visualización del calendario
        this.generarCalendario();
        
        // Notificar al controlador de UI
        if (typeof UIController !== 'undefined') {
            UIController.mostrarEventosDia(fecha);
        }
    },
    
    /**
     * Muestra los eventos de un día específico en un modal
     * @param {Date} fecha - Fecha para mostrar eventos
     */
    mostrarEventosDia: function(fecha) {
        // Obtener referencias a elementos del modal
        const diaModal = document.getElementById('dia-modal');
        const diaModalTitle = document.getElementById('dia-modal-title');
        const diaEventosLista = document.getElementById('dia-eventos-lista');
        
        if (!diaModal || !diaModalTitle || !diaEventosLista) {
            console.error("No se encontraron elementos del modal del día");
            return;
        }
        
        const eventosDia = EventosManager.obtenerEventosPorFecha(fecha);
        
        if (eventosDia.length === 0) return;
        
        // Formatear fecha para el título
        const fechaFormateada = Utils.formatearFecha(fecha);
        
        // Actualizar título del modal
        diaModalTitle.textContent = `Eventos para el ${fechaFormateada}`;
        
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
            eventoEl.className = `dia-evento-item ${this.categoriaClases[evento.categoria.toLowerCase()] || 'otro'}`;
            
            eventoEl.innerHTML = `
                <div class="dia-evento-hora">
                    <span class="info-icon">⏱️</span>
                    ${evento.horario || 'Horario no especificado'}
                </div>
                <div class="dia-evento-titulo">
                    ${evento.titulo}
                    <span class="dia-evento-cat ${this.categoriaClases[evento.categoria.toLowerCase()] || 'otro'}">${Utils.capitalizar(evento.categoria)}</span>
                </div>
                <div class="dia-evento-ubicacion">
                    <span class="info-icon">📍</span>
                    ${evento.ubicacion || 'Ubicación por definir'}
                </div>
            `;
            
            // Evento de clic para ver detalles
            eventoEl.addEventListener('click', function() {
                // Cerrar este modal
                diaModal.style.display = 'none';
                
                // Mostrar detalles en el modal de evento
                if (typeof UIController !== 'undefined') {
                    UIController.mostrarDetallesEvento(evento);
                }
            });
            
            diaEventosLista.appendChild(eventoEl);
        });
        
        // Mostrar modal
        diaModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Configurar cierre del modal
        const diaModalClose = document.getElementById('dia-modal-close');
        if (diaModalClose) {
            diaModalClose.onclick = function() {
                diaModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            };
        }
        
        // Cerrar al hacer clic fuera
        diaModal.onclick = function(e) {
            if (e.target === diaModal) {
                diaModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    },
    
    /**
     * Navega al mes anterior
     */
    mesAnterior: function() {
        this.mesActual--;
        if (this.mesActual < 0) {
            this.mesActual = 11;
            this.anioActual--;
        }
        this.actualizarTituloMes();
        this.generarCalendario();
    },
    
    /**
     * Navega al mes siguiente
     */
    mesSiguiente: function() {
        this.mesActual++;
        if (this.mesActual > 11) {
            this.mesActual = 0;
            this.anioActual++;
        }
        this.actualizarTituloMes();
        this.generarCalendario();
    },
    
    /**
     * Navega a la fecha actual
     */
    irAHoy: function() {
        this.mesActual = this.fechaActual.getMonth();
        this.anioActual = this.fechaActual.getFullYear();
        this.actualizarTituloMes();
        this.generarCalendario();
        
        // Seleccionar el día actual
        this.seleccionarDia(this.fechaActual);
    },
    
    /**
     * Navega a una fecha específica
     * @param {Date} fecha - Fecha a la que navegar
     */
    irAFecha: function(fecha) {
        if (!fecha) return;
        
        this.mesActual = fecha.getMonth();
        this.anioActual = fecha.getFullYear();
        this.actualizarTituloMes();
        this.generarCalendario();
        
        // Seleccionar el día
        this.seleccionarDia(fecha);
    },
    
    /**
     * Actualiza los eventos del calendario
     */
    actualizarEventos: function() {
        this.generarCalendario();
    },
    
    /**
     * Limpia la selección del día actual
     */
    limpiarSeleccionDia: function() {
        this.diaSeleccionado = null;
        this.generarCalendario();
        
        if (typeof UIController !== 'undefined') {
            UIController.mostrarEventosProximos();
        }
    }
};
