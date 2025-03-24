/**
 * Módulo para manejar la lógica del calendario
 */

const CalendarioManager = {
    // Fecha actual
    fechaActual: new Date(),
    
    // Mes y año seleccionados
    mesSeleccionado: new Date().getMonth(),
    anioSeleccionado: new Date().getFullYear(),
    
    // Día seleccionado (fecha completa)
    diaSeleccionado: null,
    
    // Referencia a elementos DOM del calendario
    elementos: {
        mesAnio: document.getElementById('mes-anio'),
        calendarioGrid: document.getElementById('calendario-grid')
    },
    
    // Nombres de los meses en español
    meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    
    /**
     * Inicializa el calendario
     */
    inicializar: function() {
        this.actualizarTituloMes();
        this.generarCalendario();
    },
    
    /**
     * Actualiza el título con el mes y año actual
     */
    actualizarTituloMes: function() {
        if (this.elementos.mesAnio) {
            this.elementos.mesAnio.textContent = `${this.meses[this.mesSeleccionado]} ${this.anioSeleccionado}`;
        }
    },
    
    /**
     * Genera el grid del calendario con los días del mes
     */
    generarCalendario: function() {
        if (!this.elementos.calendarioGrid) return;
        
        // Limpiar el calendario
        this.elementos.calendarioGrid.innerHTML = '';
        
        // Primer día del mes
        const primerDia = new Date(this.anioSeleccionado, this.mesSeleccionado, 1);
        
        // Día de la semana del primer día (0: domingo, 6: sábado)
        const primerDiaSemana = primerDia.getDay();
        
        // Último día del mes
        const ultimoDia = new Date(this.anioSeleccionado, this.mesSeleccionado + 1, 0).getDate();
        
        // Crear celdas vacías para los días anteriores al primer día del mes
        for (let i = 0; i < primerDiaSemana; i++) {
            const diaVacio = document.createElement('div');
            diaVacio.className = 'dia-celda otro-mes';
            this.elementos.calendarioGrid.appendChild(diaVacio);
        }
        
        // Crear celdas para cada día del mes
        for (let dia = 1; dia <= ultimoDia; dia++) {
            const fecha = new Date(this.anioSeleccionado, this.mesSeleccionado, dia);
            const celda = document.createElement('div');
            celda.className = 'dia-celda';
            celda.dataset.fecha = fecha.toISOString().split('T')[0];
            
            // Verificar si es el día actual
            const esHoy = this.esHoy(dia);
            if (esHoy) {
                celda.classList.add('dia-actual');
            }
            
            // Verificar si es el día seleccionado
            if (this.esDiaSeleccionado(dia)) {
                celda.classList.add('dia-seleccionado');
            }
            
            // Agregar número de día
            const numeroDiv = document.createElement('div');
            numeroDiv.className = 'numero-dia';
            numeroDiv.textContent = dia;
            celda.appendChild(numeroDiv);
            
            // Verificar eventos para este día
            const eventosDelDia = EventosManager.obtenerEventosPorFecha(fecha);
            
            if (eventosDelDia.length > 0) {
                celda.classList.add('con-eventos');
                celda.dataset.eventos = eventosDelDia.length;
                
                // Mostrar hasta 3 eventos en la celda
                const maxEventos = Math.min(eventosDelDia.length, 3);
                for (let i = 0; i < maxEventos; i++) {
                    const evento = eventosDelDia[i];
                    const eventoDiv = document.createElement('div');
                    eventoDiv.className = `evento-mini evento-${evento.categoria}`;
                    eventoDiv.textContent = evento.titulo;
                    celda.appendChild(eventoDiv);
                }
                
                // Indicar si hay más eventos
                if (eventosDelDia.length > 3) {
                    const masDiv = document.createElement('div');
                    masDiv.className = 'evento-mini';
                    masDiv.style.backgroundColor = '#888';
                    masDiv.textContent = `+ ${eventosDelDia.length - 3} más`;
                    celda.appendChild(masDiv);
                }
            }
            
            // Agregar evento de clic
            celda.addEventListener('click', () => {
                this.seleccionarDia(fecha);
            });
            
            this.elementos.calendarioGrid.appendChild(celda);
        }
    },
    
    /**
     * Verifica si un día es el día actual
     * @param {number} dia - Día del mes
     * @returns {boolean} true si es hoy
     */
    esHoy: function(dia) {
        return this.fechaActual.getDate() === dia && 
               this.fechaActual.getMonth() === this.mesSeleccionado && 
               this.fechaActual.getFullYear() === this.anioSeleccionado;
    },
    
    /**
     * Verifica si un día es el día seleccionado
     * @param {number} dia - Día del mes
     * @returns {boolean} true si es el día seleccionado
     */
    esDiaSeleccionado: function(dia) {
        return this.diaSeleccionado && 
               this.diaSeleccionado.getDate() === dia && 
               this.diaSeleccionado.getMonth() === this.mesSeleccionado && 
               this.diaSeleccionado.getFullYear() === this.anioSeleccionado;
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
     * Navega al mes anterior
     */
    mesAnterior: function() {
        this.mesSeleccionado--;
        if (this.mesSeleccionado < 0) {
            this.mesSeleccionado = 11;
            this.anioSeleccionado--;
        }
        this.actualizarTituloMes();
        this.generarCalendario();
    },
    
    /**
     * Navega al mes siguiente
     */
    mesSiguiente: function() {
        this.mesSeleccionado++;
        if (this.mesSeleccionado > 11) {
            this.mesSeleccionado = 0;
            this.anioSeleccionado++;
        }
        this.actualizarTituloMes();
        this.generarCalendario();
    },
    
    /**
     * Navega a la fecha actual
     */
    irAHoy: function() {
        this.mesSeleccionado = this.fechaActual.getMonth();
        this.anioSeleccionado = this.fechaActual.getFullYear();
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
        
        this.mesSeleccionado = fecha.getMonth();
        this.anioSeleccionado = fecha.getFullYear();
        this.actualizarTituloMes();
        this.generarCalendario();
        
        // Seleccionar el día
        this.seleccionarDia(fecha);
    },
    
    /**
     * Actualiza los eventos del calendario
     * @param {Array} eventos - Eventos actualizados
     */
    actualizarEventos: function() {
        this.generarCalendario();
    }
};
