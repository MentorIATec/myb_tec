/**
 * Módulo para gestionar eventos del calendario
 */

const EventosManager = {
    // URL del endpoint para cargar eventos
    urlEventos: 'https://karenguzmn.github.io/myb_tec/ce/eventos.json',
    
    // Almacenamiento de eventos
    eventos: [],
    
    /**
     * Carga los eventos desde el servidor o caché
     * @param {boolean} forzarRecarga - Fuerza recarga desde el servidor
     * @returns {Promise<Array>} Promesa con los eventos cargados
     */
    cargarEventos: async function(forzarRecarga = false) {
        try {
            // Verificar si hay eventos en caché
            if (!forzarRecarga && this.eventos.length > 0) {
                console.log('Usando eventos en caché');
                return this.eventos;
            }
            
            // Verificar si hay eventos en localStorage
            if (!forzarRecarga && localStorage.getItem('eventos_cache')) {
                try {
                    const eventosCache = JSON.parse(localStorage.getItem('eventos_cache'));
                    const timestamp = localStorage.getItem('eventos_timestamp');
                    const ahora = new Date().getTime();
                    
                    // Caché válido por 1 hora (3600000 ms)
                    if (timestamp && (ahora - timestamp) < 3600000) {
                        console.log('Usando eventos de localStorage');
                        this.eventos = eventosCache;
                        return eventosCache;
                    }
                } catch (e) {
                    console.warn('Error al leer caché:', e);
                }
            }
            
            // Cargar desde el servidor
            console.log('Cargando eventos desde el servidor:', this.urlEventos);
            const response = await fetch(this.urlEventos);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.eventos && Array.isArray(data.eventos)) {
                // Normalizar eventos
                this.eventos = this.normalizarEventos(data.eventos);
                
                // Guardar en localStorage
                localStorage.setItem('eventos_cache', JSON.stringify(this.eventos));
                localStorage.setItem('eventos_timestamp', new Date().getTime().toString());
                
                console.log(`Cargados ${this.eventos.length} eventos`);
                return this.eventos;
            } else {
                throw new Error('Formato de datos incorrecto');
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            
            // Intentar usar caché en caso de error
            if (localStorage.getItem('eventos_cache')) {
                try {
                    const eventosCache = JSON.parse(localStorage.getItem('eventos_cache'));
                    console.warn('Usando eventos en caché debido a un error de carga');
                    this.eventos = eventosCache;
                    return eventosCache;
                } catch (e) {
                    console.error('Error al leer caché:', e);
                }
            }
            
            // Devolver array vacío si no hay caché
            return [];
        }
    },
    
    /**
     * Normaliza los datos de eventos a un formato consistente
     * @param {Array} eventosData - Datos de eventos sin normalizar
     * @returns {Array} Eventos normalizados
     */
    normalizarEventos: function(eventosData) {
        return eventosData.map(evento => {
            // Procesar fechas
            let fechaInicio, fechaFin;
            
            try {
                fechaInicio = new Date(evento.fechaInicio || evento['Fecha Inicio']);
                fechaFin = evento.fechaFin || evento['Fecha Fin'] ? 
                    new Date(evento.fechaFin || evento['Fecha Fin']) : 
                    new Date(fechaInicio);
            } catch (e) {
                console.warn('Error al procesar fechas del evento:', e);
                fechaInicio = new Date();
                fechaFin = new Date();
            }
            
            // Retornar objeto normalizado
            return {
                id: evento.id || evento.ID || Utils.generarId(),
                titulo: evento.titulo || evento.Título || 'Sin título',
                descripcion: evento.descripcion || evento.Descripción || 'Sin descripción',
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                horario: evento.horario || evento.Horario || 'Horario no especificado',
                ubicacion: evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada',
                modalidad: evento.modalidad || evento.Modalidad || 'No especificada',
                categoria: Utils.normalizarCategoria(evento.categoria || evento.Categoría),
                facilidades: evento.facilidades || evento.Facilidades || 'No especificadas',
                estado: evento.estado || evento.Estado || 'disponible'
            };
        });
    },
    
    /**
     * Obtiene eventos para una fecha específica
     * @param {Date} fecha - Fecha para buscar eventos
     * @returns {Array} Eventos para esa fecha
     */
    obtenerEventosPorFecha: function(fecha) {
        if (!fecha || !this.eventos.length) return [];
        
        return this.eventos.filter(evento => {
            return Utils.esMismoDia(evento.fechaInicio, fecha);
        });
    },
    
    /**
     * Obtiene eventos para un mes específico
     * @param {number} mes - Número de mes (0-11)
     * @param {number} anio - Año
     * @returns {Array} Eventos para ese mes
     */
    obtenerEventosPorMes: function(mes, anio) {
        if (!this.eventos.length) return [];
        
        return this.eventos.filter(evento => {
            return evento.fechaInicio.getMonth() === mes && 
                   evento.fechaInicio.getFullYear() === anio;
        });
    },
    
    /**
     * Busca eventos que coincidan con un texto
     * @param {string} texto - Texto a buscar
     * @returns {Array} Eventos que coinciden
     */
    buscarEventos: function(texto) {
        if (!texto || !this.eventos.length) return [];
        
        const textoLower = texto.toLowerCase();
        
        return this.eventos.filter(evento => {
            return evento.titulo.toLowerCase().includes(textoLower) ||
                   evento.descripcion.toLowerCase().includes(textoLower) ||
                   evento.ubicacion.toLowerCase().includes(textoLower);
        });
    },
    
    /**
     * Filtra eventos por categoría
     * @param {string} categoria - Categoría para filtrar
     * @returns {Array} Eventos filtrados
     */
    filtrarPorCategoria: function(categoria) {
        if (!categoria || categoria === 'todos' || !this.eventos.length) {
            return this.eventos;
        }
        
        return this.eventos.filter(evento => {
            return evento.categoria === categoria;
        });
    },
    
    /**
     * Obtiene un evento por su ID
     * @param {string} id - ID del evento
     * @returns {Object|null} Evento encontrado o null
     */
    obtenerEventoPorId: function(id) {
        if (!id || !this.eventos.length) return null;
        
        return this.eventos.find(evento => evento.id === id) || null;
    },
    
    /**
     * Obtiene los siguientes eventos a partir de una fecha
     * @param {Date} fecha - Fecha de inicio
     * @param {number} cantidad - Cantidad de eventos a obtener
     * @returns {Array} Eventos próximos
     */
    obtenerProximosEventos: function(fecha = new Date(), cantidad = 5) {
        if (!this.eventos.length) return [];
        
        // Filtrar eventos que no han pasado
        const eventosFuturos = this.eventos.filter(evento => 
            evento.fechaInicio >= fecha
        );
        
        // Ordenar por fecha
        const eventosOrdenados = eventosFuturos.sort((a, b) => 
            a.fechaInicio - b.fechaInicio
        );
        
        // Devolver la cantidad solicitada
        return eventosOrdenados.slice(0, cantidad);
    },
    
    /**
     * Genera un archivo ICS para un evento
     * @param {Object} evento - Evento a exportar
     * @returns {string} Contenido del archivo ICS
     */
    generarICS: function(evento) {
        if (!evento) return '';
        
        // Crear fechas para el evento
        const fechaInicio = evento.fechaInicio;
        let fechaFin = evento.fechaFin;
        
        // Si es el mismo día, agregar 1 hora por defecto
        if (Utils.esMismoDia(fechaInicio, fechaFin) && 
            fechaInicio.getHours() === fechaFin.getHours() &&
            fechaInicio.getMinutes() === fechaFin.getMinutes()) {
            fechaFin = new Date(fechaInicio);
            fechaFin.setHours(fechaFin.getHours() + 1);
        }
        
        // Ajustar horas según el horario si está disponible
        const infoHorario = Utils.extraerHorario(evento.horario);
        if (infoHorario) {
            if (infoHorario.horaInicio !== undefined) {
                fechaInicio.setHours(infoHorario.horaInicio, infoHorario.minutoInicio || 0, 0);
            }
            
            if (infoHorario.horaFin !== undefined) {
                fechaFin.setHours(infoHorario.horaFin, infoHorario.minutoFin || 0, 0);
            } else if (infoHorario.horaInicio !== undefined) {
                // Si solo tenemos hora de inicio, hora de fin = hora inicio + 1
                fechaFin = new Date(fechaInicio);
                fechaFin.setHours(fechaFin.getHours() + 1);
            }
        }
        
        // Crear contenido ICS
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Consejería Emocional//Eventos//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${evento.id}@visualizador-eventos`,
            `DTSTAMP:${Utils.formatoFechaICS(new Date())}`,
            `DTSTART:${Utils.formatoFechaICS(fechaInicio)}`,
            `DTEND:${Utils.formatoFechaICS(fechaFin)}`,
            `SUMMARY:${evento.titulo}`,
            `DESCRIPTION:${evento.descripcion}`,
            `LOCATION:${evento.ubicacion}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
    },
    
    /**
     * Descarga un evento como archivo ICS
     * @param {Object} evento - Evento a descargar
     */
    descargarEventoICS: function(evento) {
        if (!evento) return;
        
        try {
            const contenidoICS = this.generarICS(evento);
            
            // Crear blob y URL
            const blob = new Blob([contenidoICS], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            // Crear enlace y simular clic
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
            
            Utils.mostrarToast('Evento añadido a tu calendario', 'success');
        } catch (error) {
            console.error('Error al generar/descargar ICS:', error);
            Utils.mostrarToast('Error al añadir evento al calendario', 'error');
        }
    },
    
    /**
     * Comparte un evento utilizando la Web Share API
     * @param {Object} evento - Evento a compartir
     */
    compartirEvento: function(evento) {
        if (!evento) return;
        
        // Verificar si la API Web Share está disponible
        if (navigator.share) {
            // Crear texto descriptivo
            const textoCompartir = `
${evento.titulo}

📅 ${Utils.formatearFecha(evento.fechaInicio)}
🕒 ${evento.horario}
📍 ${evento.ubicacion}

${evento.descripcion}

Compartido desde el Visualizador de Eventos de Consejería Emocional
`;
            
            // Compartir
            navigator.share({
                title: evento.titulo,
                text: textoCompartir,
                url: window.location.href
            })
            .then(() => Utils.mostrarToast('Evento compartido exitosamente', 'success'))
            .catch(error => {
                console.error('Error al compartir:', error);
                if (error.name !== 'AbortError') {
                    Utils.mostrarToast('Error al compartir el evento', 'error');
                }
            });
        } else {
            Utils.mostrarToast('Tu navegador no soporta compartir contenido', 'warning');
            
            // Opción alternativa: copiar al portapapeles
            const textoAlternativo = `${evento.titulo} - ${Utils.formatearFecha(evento.fechaInicio)} - ${evento.horario}`;
            
            try {
                navigator.clipboard.writeText(textoAlternativo).then(() => {
                    Utils.mostrarToast('Información copiada al portapapeles', 'info');
                });
            } catch (error) {
                console.error('Error al copiar:', error);
            }
        }
    }
};
