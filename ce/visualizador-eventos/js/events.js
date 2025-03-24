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
        // Siempre muestra indicador de carga
        if (typeof UIController !== 'undefined' && UIController.mostrarCargando) {
            UIController.mostrarCargando();
        }
        
        // Verificar si hay que forzar recarga
        if (forzarRecarga) {
            localStorage.removeItem('eventos_cache');
            localStorage.removeItem('eventos_timestamp');
            console.log('Forzando recarga de eventos desde servidor');
        }
        
        // Si hay eventos en caché local y no se fuerza recarga, usarlos
        if (!forzarRecarga && this.eventos.length > 0) {
            console.log('Usando eventos en memoria');
            return this.eventos;
        }
        
        // Si hay eventos en localStorage y son recientes, usarlos
        if (!forzarRecarga && localStorage.getItem('eventos_cache')) {
            try {
                const eventosCache = JSON.parse(localStorage.getItem('eventos_cache'));
                const timestamp = localStorage.getItem('eventos_timestamp');
                const ahora = new Date().getTime();
                
                // Caché válido por 15 minutos (900000 ms)
                if (timestamp && (ahora - timestamp) < 900000) {
                    console.log('Usando eventos de localStorage');
                    this.eventos = eventosCache;
                    return eventosCache;
                }
            } catch (e) {
                console.warn('Error al leer caché, ignorando:', e);
                // En caso de error con caché, continuar con carga desde servidor
            }
        }
        
        // Probar carga directa desde archivo local
        try {
            const response = await fetch('ce/eventos.json');
            
            if (response.ok) {
                const data = await response.json();
                if (data.eventos && Array.isArray(data.eventos)) {
                    this.eventos = this.normalizarEventos(data.eventos);
                    localStorage.setItem('eventos_cache', JSON.stringify(this.eventos));
                    localStorage.setItem('eventos_timestamp', new Date().getTime().toString());
                    console.log(`Cargados ${this.eventos.length} eventos localmente`);
                    return this.eventos;
                }
            }
        } catch (error) {
            console.warn('Error al cargar localmente, intentando URLs remotas:', error);
        }
        
        // Cargar desde URLs remotas
        const urls = [
            'https://karenguzmn.github.io/myb_tec/ce/eventos.json',
            'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json'
        ];
        
        for (const url of urls) {
            try {
                console.log(`Intentando cargar desde: ${url}`);
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.warn(`Error HTTP ${response.status} en ${url}`);
                    continue;
                }
                
                const data = await response.json();
                
                if (data.eventos && Array.isArray(data.eventos)) {
                    this.eventos = this.normalizarEventos(data.eventos);
                    localStorage.setItem('eventos_cache', JSON.stringify(this.eventos));
                    localStorage.setItem('eventos_timestamp', new Date().getTime().toString());
                    console.log(`Cargados ${this.eventos.length} eventos desde ${url}`);
                    return this.eventos;
                } else {
                    console.warn('Formato de datos incorrecto en', url);
                }
            } catch (error) {
                console.error(`Error al cargar desde ${url}:`, error);
            }
        }
        
        // Si llegamos aquí, todos los intentos fallaron
        throw new Error('No se pudieron cargar los eventos desde ninguna fuente');
        
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        
        // Intentar usar caché en caso de error sin importar la edad
        if (localStorage.getItem('eventos_cache')) {
            try {
                const eventosCache = JSON.parse(localStorage.getItem('eventos_cache'));
                console.warn('Usando eventos en caché debido a un error de carga');
                this.eventos = eventosCache;
                return eventosCache;
            } catch (e) {
                console.error('Error al leer caché de respaldo:', e);
            }
        }
        
        // Mostrar error en la UI
        if (typeof UIController !== 'undefined' && UIController.mostrarError) {
            UIController.mostrarError('No se pudieron cargar los eventos. Por favor, recarga la página.');
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
                fechaInicio = this.parsearFecha(evento.fechaInicio || evento['Fecha Inicio']);
                fechaFin = evento.fechaFin || evento['Fecha Fin'] ? 
                    this.parsearFecha(evento.fechaFin || evento['Fecha Fin']) : 
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
                fechaInicioObj: fechaInicio, // Para compatibilidad con visualizer.html
                fechaFinObj: fechaFin,       // Para compatibilidad con visualizer.html
                horario: this.normalizarHorario(evento.horario || evento.Horario),
                ubicacion: evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada',
                modalidad: evento.modalidad || evento.Modalidad || 'No especificada',
                categoria: evento.categoria || evento.Categoría || 'otro',
                facilidades: evento.facilidades || evento.Facilidades || 'No especificadas',
                estado: evento.estado || evento.Estado || 'disponible',
                urlRegistro: evento.urlRegistro || evento['URL Registro'] || '#'
            };
        });
    },
    
    /**
     * Parsea una fecha desde un string con diferentes formatos posibles
     * @param {string} fechaStr - String de fecha a parsear
     * @returns {Date} Fecha parseada o null si es inválida
     */
    parsearFecha: function(fechaStr) {
        if (!fechaStr) return new Date();
        
        // Si ya es un objeto Date, devolverlo
        if (fechaStr instanceof Date) return fechaStr;
        
        try {
            // Intentar detectar formato
            const partes = fechaStr.split('/');
            if (partes.length === 3) {
                // Verificar si es MM/DD/YYYY o DD/MM/YYYY
                let mes, dia, anio;
                
                // Valores numéricos
                const parte1 = parseInt(partes[0]);
                const parte2 = parseInt(partes[1]);
                const parte3 = parseInt(partes[2]);
                
                // Asumimos MM/DD/YYYY por defecto
                mes = parte1 - 1; // Restar 1 porque en JS los meses van de 0-11
                dia = parte2;
                anio = parte3;
                
                // Si el primer valor parece día (>12) y el segundo valor parece mes (≤12)
                if (parte1 > 12 && parte2 <= 12) {
                    // Es DD/MM/YYYY
                    dia = parte1;
                    mes = parte2 - 1;
                }
                
                // Crear la fecha
                const fecha = new Date(anio, mes, dia);
                
                // Verificar validez
                if (isNaN(fecha.getTime())) {
                    console.warn(`Fecha inválida: ${fechaStr}`);
                    return new Date(); // Fecha actual como fallback
                }
                
                return fecha;
            } else {
                // Intentar otros formatos (ISO, etc.)
                const fecha = new Date(fechaStr);
                
                if (isNaN(fecha.getTime())) {
                    console.warn(`Fecha inválida (formato no reconocido): ${fechaStr}`);
                    return new Date(); // Fecha actual como fallback
                }
                
                return fecha;
            }
        } catch (error) {
            console.error('Error al parsear fecha:', error);
            return new Date(); // Fecha actual como fallback
        }
    },
    
    /**
     * Normaliza el formato de horario
     * @param {string} horarioStr - String de horario a normalizar
     * @returns {string} Horario normalizado
     */
    normalizarHorario: function(horarioStr) {
        if (!horarioStr) return 'Horario no especificado';
        return horarioStr.trim();
    },
    
    /**
     * Obtiene eventos para una fecha específica
     * @param {Date} fecha - Fecha para buscar eventos
     * @returns {Array} Eventos para esa fecha
     */
    obtenerEventosPorFecha: function(fecha) {
        if (!fecha || !this.eventos.length) return [];
        
        return this.eventos.filter(evento => {
            // Verificar si la fecha está entre la fecha de inicio y fin del evento
            return this.esMismaFecha(evento.fechaInicio, fecha) || 
                this.esMismaFecha(evento.fechaFin, fecha) || 
                (evento.fechaInicio < fecha && evento.fechaFin > fecha);
        });
    },
    
    /**
     * Compara si dos fechas son el mismo día
     * @param {Date} fecha1 - Primera fecha
     * @param {Date} fecha2 - Segunda fecha
     * @returns {boolean} true si son el mismo día
     */
    esMismaFecha: function(fecha1, fecha2) {
        if (!fecha1 || !fecha2) return false;
        
        return fecha1.getDate() === fecha2.getDate() &&
               fecha1.getMonth() === fecha2.getMonth() &&
               fecha1.getFullYear() === fecha2.getFullYear();
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
            return evento.categoria.toLowerCase() === categoria.toLowerCase();
        });
    },
    
    /**
     * Obtiene un evento por su ID
     * @param {string} id - ID del evento
     * @returns {Object|null} Evento encontrado o null
     */
    obtenerEventoPorId: function(id) {
        if (!id || !this.eventos.length) return null;
        
        return this.eventos.find(evento => evento.id == id) || null;
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
        if (this.esMismaFecha(fechaInicio, fechaFin) && 
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
