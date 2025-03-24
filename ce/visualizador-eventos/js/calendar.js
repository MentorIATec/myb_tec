/**
 * Módulo para manejar la lógica del calendario (Modificado - Solo días laborales)
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
     * Genera el grid del calendario con los días laborales del mes (lunes a viernes)
     */
    generarCalendario: function() {
        if (!this.elementos.calendarioGrid) return;
        
        // Limpiar el calendario
        this.elementos.calendarioGrid.innerHTML = '';
        
        // Primer día del mes
        const primerDia = new Date(this.anioSeleccionado, this.mesSeleccionado, 1);
        
        // Último día del mes
        const ultimoDia = new Date(this.anioSeleccionado, this.mesSeleccionado + 1, 0).getDate();
        
        // Crear estructura de semanas
        let diaActual = 1;
        let semanasEnMes = Math.ceil((ultimoDia + this.obtenerDiasAntes(primerDia)) / 7);
        
        for (let semana = 0; semana < semanasEnMes; semana++) {
            for (let diaSemana = 1; diaSemana <= 5; diaSemana++) { // 1=lunes, 5=viernes
                // Calcular fecha para esta celda
                let diaCalendario;
                
                // Primera semana: puede tener días del mes anterior
                if (semana === 0 && diaSemana < this.obtenerDiaSemana(primerDia)) {
                    const celda = document.createElement('div');
                    celda.className = 'dia-celda otro-mes';
                    this.elementos.calendarioGrid.appendChild(celda);
                    continue;
                }
                
                // Calcular el día del mes
                const indiceDia = (semana * 7) + diaSemana - this.obtenerDiaSemana(primerDia);
                
                // Si ya pasamos el último día del mes
                if (indiceDia > ultimoDia) {
                    const celda = document.createElement('div');
                    celda.className = 'dia-celda otro-mes';
                    this.elementos.calendarioGrid.appendChild(celda);
                    continue;
                }
                
                // Si es un día válido dentro del mes actual
                if (indiceDia > 0 && indiceDia <= ultimoDia) {
                    this.crearCeldaDia(indiceDia);
                }
            }
        }
    },
    
    /**
     * Obtiene el día de la semana ajustado (0=domingo, 1=lunes, ..., 6=sábado)
     * Para nosotros interesa: 1=lunes, 2=martes, ..., 5=viernes
     */
    obtenerDiaSemana: function(fecha) {
        const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
        return diaSemana === 0 ? 6 : diaSemana; // Convertir domingo (0) a 6, el resto igual
    },
    
    /**
     * Obtiene cuántos días hay que añadir antes del primer día
     */
    obtenerDiasAntes: function(primerDia) {
        const primerDiaSemana = this.obtenerDiaSemana(primerDia);
        return primerDiaSemana - 1; // -1 porque 1=lunes ya está bien
    },
    
    /**
     * Crea una celda para un día específico
     */
    crearCeldaDia: function(dia) {
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
    },
    
    /**
     * Verifica si un día es el día actual
     */
    esHoy: function(dia) {
        return this.fechaActual.getDate() === dia && 
               this.fechaActual.getMonth() === this.mesSeleccionado && 
               this.fechaActual.getFullYear() === this.anioSeleccionado;
    },
    
    /**
     * Verifica si un día es el día seleccionado
     */
    esDiaSeleccionado: function(dia) {
        return this.diaSeleccionado && 
               this.diaSeleccionado.getDate() === dia && 
               this.diaSeleccionado.getMonth() === this.mesSeleccionado && 
               this.diaSeleccionado.getFullYear() === this.anioSeleccionado;
    },
    
    /**
     * Selecciona un día del calendario
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
     */
    actualizarEventos: function() {
        this.generarCalendario();
    }
};
