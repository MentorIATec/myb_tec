document.addEventListener('DOMContentLoaded', function() {
            // Configuración
            const jsonUrl = 'https://karenguzmn.github.io/myb_tec/ce/eventos.json'; // URL del archivo JSON
            
            // Variables de estado
            let allEventos = [];
            let filteredEventos = [];
            let fechaActual = new Date();
            let mesActual = fechaActual.getMonth();
            let anioActual = fechaActual.getFullYear();
            let categoriaSeleccionada = 'todos';
            let diaSeleccionado = null;
            let vistaActual = 'combinada';
            let searchQuery = '';
            
            // Elementos DOM
            const mesAnteriorBtn = document.getElementById('mes-anterior');
            const mesSiguienteBtn = document.getElementById('mes-siguiente');
            const mesActualEl = document.getElementById('mes-actual');
            const calendarioGrid = document.getElementById('calendario-grid');
            const eventosGrid = document.getElementById('eventos-grid');
            const eventosCounter = document.getElementById('eventos-counter');
            const categoriasContainer = document.getElementById('categorias-container');
            const searchInput = document.getElementById('search-input');
            const calendarioContainer = document.getElementById('calendario-container');
            const eventosListContainer = document.getElementById('eventos-list-container');
            const vistaBtns = document.querySelectorAll('.vista-btn');
            
            // Modales
            const diaModal = document.getElementById('dia-modal');
            const diaModalTitle = document.getElementById('dia-modal-title');
            const diaModalClose = document.getElementById('dia-modal-close');
            const diaEventosLista = document.getElementById('dia-eventos-lista');
            
            const eventoModal = document.getElementById('evento-modal');
            const eventoModalTitle = document.getElementById('evento-modal-title');
            const eventoModalSubtitle = document.getElementById('evento-modal-subtitle');
            const eventoModalInfo = document.getElementById('evento-modal-info');
            const eventoModalDescription = document.getElementById('evento-modal-description');
            const eventoModalStatus = document.getElementById('evento-modal-status');
            const eventoModalAction = document.getElementById('evento-modal-action');
            const eventoModalClose = document.getElementById('evento-modal-close');
            
            // Meses en español
            const meses = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            
            // Clases de categorías (añadida la categoría "evento")
            const categoriaClases = {
                'curso': 'curso',
                'taller': 'taller',
                'grupo': 'grupo',
                'activacion': 'activacion',
                'evento': 'evento'
            };
            
            // Función para cargar eventos del JSON
            function cargarEventos() {
                fetch(jsonUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('No se pudo cargar el archivo de eventos');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Guardar todos los eventos
                        allEventos = data.eventos || [];
                        
                        // Formatear las fechas a objetos Date y corregir inconsistencias
                        allEventos.forEach(evento => {
                            // Verificar y corregir el formato de fecha
                            evento.fechaInicioObj = parsearFecha(evento.fechaInicio);
                            evento.fechaFinObj = parsearFecha(evento.fechaFin || evento.fechaInicio);
                            
                            // Normalizar categorías (convertir a minúscula)
                            evento.categoria = evento.categoria.toLowerCase();
                            
                            // Normalizar formato de horario
                            if (evento.horario) {
                                evento.horario = normalizarHorario(evento.horario);
                            }
                        });
                        
                        // Ordenar eventos por fecha
                        allEventos.sort((a, b) => {
                            if (!a.fechaInicioObj || !b.fechaInicioObj) return 0;
                            return a.fechaInicioObj - b.fechaInicioObj;
                        });
                        
                        // Inicializar visualización
                        filteredEventos = [...allEventos];
                        actualizarMesActual();
                        generarCalendario();
                        mostrarEventos();
                        
                        // Si hay eventos para el día actual, seleccionarlo
                        const hoy = new Date();
                        const eventosHoy = obtenerEventosPorFecha(hoy);
                        if (eventosHoy.length > 0) {
                            seleccionarDia(hoy);
                        }
                    })
                    .catch(error => {
                        console.error('Error al cargar eventos:', error);
                        calendarioGrid.innerHTML = `
                            <div class="eventos-message">
                                Error al cargar el calendario. Por favor, intenta más tarde.
                            </div>
                        `;
                        eventosGrid.innerHTML = `
                            <div class="eventos-message">
                                Error al cargar eventos. Por favor, intenta más tarde.
                            </div>
                        `;
                    });
            }
            
            // Función mejorada para parsear fechas con detección inteligente de formato
            function parsearFecha(fechaStr) {
                if (!fechaStr) return null;
                
                // Intentar detectar formato
                const partes = fechaStr.split('/');
                if (partes.length !== 3) return null;
                
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
                
                // Verificar validez (si la fecha es inválida, Date() normalizará)
                if (isNaN(fecha.getTime())) {
                    console.warn(`Fecha inválida: ${fechaStr}`);
                    return null;
                }
                
                return fecha;
            }
            
            // Función para normalizar formato de horario
            function normalizarHorario(horarioStr) {
                if (!horarioStr) return 'Horario por definir';
                
                // Mantener el formato original pero con consistencia
                return horarioStr.trim();
            }
            
            // Función para formatear fechas a formato legible
            function formatoFecha(fecha, incluirSemana = true) {
                if (!fecha) return 'Fecha por definir';
                
                const opciones = incluirSemana ? 
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } : 
                    { year: 'numeric', month: 'long', day: 'numeric' };
                
                return fecha.toLocaleDateString('es-ES', opciones);
            }
            
            // Función para obtener eventos para una fecha específica
            function obtenerEventosPorFecha(fecha) {
                if (!fecha) return [];
                
                return filteredEventos.filter(evento => {
                    // Verificar si la fecha está entre la fecha de inicio y fin del evento
                    return esMismaFecha(evento.fechaInicioObj, fecha) || 
                        esMismaFecha(evento.fechaFinObj, fecha) || 
                        (evento.fechaInicioObj < fecha && evento.fechaFinObj > fecha);
                });
            }
            
            // Comparar si dos fechas son el mismo día
            function esMismaFecha(fecha1, fecha2) {
                if (!fecha1 || !fecha2) return false;
                
                return fecha1.getDate() === fecha2.getDate() &&
                    fecha1.getMonth() === fecha2.getMonth() &&
                    fecha1.getFullYear() === fecha2.getFullYear();
            }
            
            // Función para actualizar el título del mes actual
            function actualizarMesActual() {
                mesActualEl.textContent = `${meses[mesActual]} ${anioActual}`;
            }
            
            // Función para generar el calendario del mes actual
            function generarCalendario() {
                // Limpiar grid
                calendarioGrid.innerHTML = '';
                
                // Día 1 del mes actual
                const primerDia = new Date(anioActual, mesActual, 1);
                // Día de la semana del primer día (0: domingo, 6: sábado)
                const primerDiaSemana = primerDia.getDay();
                
                // Último día del mes actual
                const ultimoDia = new Date(anioActual, mesActual + 1, 0).getDate();
                
                // Último día del mes anterior
                const ultimoDiaMesAnterior = new Date(anioActual, mesActual, 0).getDate();
                
                // Total de celdas necesarias (42 = 6 semanas de 7 días)
                const totalCeldas = 42;
                
                // Fecha actual para marcar el día de hoy
                const fechaHoy = new Date();
                const esHoyMesActual = fechaHoy.getMonth() === mesActual && 
                                    fechaHoy.getFullYear() === anioActual;
                
                // Generar celdas para el calendario
                for (let i = 0; i < totalCeldas; i++) {
                    let dia;
                    let mes = mesActual;
                    let anio = anioActual;
                    let esOtroMes = false;
                    
                    // Días del mes anterior
                    if (i < primerDiaSemana) {
                        dia = ultimoDiaMesAnterior - primerDiaSemana + i + 1;
                        mes = mesActual - 1;
                        if (mes < 0) {
                            mes = 11;
                            anio = anioActual - 1;
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
                        mes = mesActual + 1;
                        if (mes > 11) {
                            mes = 0;
                            anio = anioActual + 1;
                        }
                        esOtroMes = true;
                    }
                    
                    // Fecha para este día
                    const fechaDia = new Date(anio, mes, dia);
                    
                    // Determinar si es el día seleccionado
                    const esSeleccionado = diaSeleccionado && esMismaFecha(diaSeleccionado, fechaDia);
                    
                    // Determinar si es el día de hoy
                    const esHoy = esHoyMesActual && fechaHoy.getDate() === dia && !esOtroMes;
                    
                    // Obtener eventos para esta fecha
                    const eventosDia = obtenerEventosPorFecha(fechaDia);
                    const tieneEventos = eventosDia.length > 0;
                    
                    // Crear elemento para el día
                    const diaEl = document.createElement('div');
                    diaEl.className = 'dia-container';
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
                            ${generarIndicadoresDia(eventosDia)}
                        </div>` : ''}
                    `;
                    
                    // Evento de clic para mostrar eventos del día
                    if (tieneEventos) {
                        diaEl.addEventListener('click', function() {
                            const [anio, mes, dia] = this.getAttribute('data-fecha').split('-').map(Number);
                            const fecha = new Date(anio, mes-1, dia);
                            seleccionarDia(fecha);
                            mostrarEventosDia(fecha);
                        });
                    }
                    
                    // Agregar al grid
                    calendarioGrid.appendChild(diaEl);
                    
                    // Si pasamos 4 semanas y ya estamos en el mes siguiente, salir
                    if (i >= 28 && dia > 7 && mes !== mesActual) break;
                }
            }
            
            // Generar indicadores para eventos del día
            function generarIndicadoresDia(eventos) {
                // Usando un objeto para contar eventos por categoría
                const categorias = {};
                eventos.forEach(evento => {
                    const cat = evento.categoria.toLowerCase();
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
                    indicadoresHTML += `<div class="dia-indicador ${categoriaClases[categoria] || ''}"></div>`;
                }
                
                return indicadoresHTML;
            }
            
            // Función para seleccionar un día
            function seleccionarDia(fecha) {
                // Deseleccionar día anterior
                const diaSeleccionadoEl = document.querySelector('.dia-container.seleccionado');
                if (diaSeleccionadoEl) {
                    diaSeleccionadoEl.classList.remove('seleccionado');
                }
                
                // Guardar la nueva fecha seleccionada
                diaSeleccionado = fecha;
                
                // Seleccionar el nuevo día
                const nuevoDiaEl = document.querySelector(`.dia-container[data-fecha="${fecha.getFullYear()}-${fecha.getMonth()+1}-${fecha.getDate()}"]`);
                if (nuevoDiaEl) {
                    nuevoDiaEl.classList.add('seleccionado');
                }
                
                // Actualizar eventos mostrados (solo mostrar eventos del día seleccionado)
                mostrarEventos();
            }
            
            // Función para mostrar eventos del día en el modal
            function mostrarEventosDia(fecha) {
                const eventosDia = obtenerEventosPorFecha(fecha);
                
                if (eventosDia.length === 0) return;
                
                // Actualizar título del modal
                diaModalTitle.textContent = `Eventos para el ${formatoFecha(fecha)}`;
                
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
                    eventoEl.className = `dia-evento-item ${categoriaClases[evento.categoria.toLowerCase()] || ''}`;
                    
                    eventoEl.innerHTML = `
                        <div class="dia-evento-hora">
                            <span class="info-icon">⏱️</span>
                            ${evento.horario || 'Horario no especificado'}
                        </div>
                        <div class="dia-evento-titulo">
                            ${evento.titulo}
                            <span class="dia-evento-cat ${categoriaClases[evento.categoria.toLowerCase()] || ''}">${capitalizarPrimera(evento.categoria)}</span>
                        </div>
                        <div class="dia-evento-ubicacion">
                            <span class="info-icon">📍</span>
                            ${evento.ubicacion || evento.ubicación || 'Ubicación por definir'}
                        </div>
                    `;
                    
                    // Evento de clic para ver detalles
                    eventoEl.addEventListener('click', function() {
                        mostrarDetallesEvento(evento.id);
                        cerrarModalDia();
                    });
                    
                    diaEventosLista.appendChild(eventoEl);
                });
                
                // Mostrar modal
                diaModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            
            // Función para mostrar eventos filtrados
            function mostrarEventos() {
                // Aplicar filtros
                filtrarEventos();
                
                // Si hay día seleccionado, solo mostrar eventos de ese día
                let eventosAMostrar = filteredEventos;
                if (diaSeleccionado) {
                    eventosAMostrar = obtenerEventosPorFecha(diaSeleccionado);
                }
                
                // Actualizar contador
                eventosCounter.textContent = `${eventosAMostrar.length} ${eventosAMostrar.length === 1 ? 'evento' : 'eventos'}`;
                
                // Si no hay eventos
                if (eventosAMostrar.length === 0) {
                    eventosGrid.innerHTML = `
                        <div class="eventos-message">
                            No hay eventos para mostrar.
                            ${diaSeleccionado ? '<br><button id="limpiar-seleccion" style="margin-top:15px;padding:8px 15px;background:var(--primary);color:white;border:none;border-radius:20px;cursor:pointer;">Ver todos los eventos</button>' : ''}
                        </div>
                    `;
                    
                    // Botón para limpiar selección
                    const limpiarBtn = document.getElementById('limpiar-seleccion');
                    if (limpiarBtn) {
                        limpiarBtn.addEventListener('click', limpiarSeleccionDia);
                    }
                    
                    return;
                }
                
                // Limpiar grid
                eventosGrid.innerHTML = '';
                
                // Ordenar eventos por fecha
                eventosAMostrar.sort((a, b) => {
                    // Si no tienen fecha, mantener el orden
                    if (!a.fechaInicioObj || !b.fechaInicioObj) return 0;
                    return a.fechaInicioObj - b.fechaInicioObj;
                });
                
                // Mostrar cada evento
                eventosAMostrar.forEach(evento => {
                    const eventoEl = document.createElement('div');
                    eventoEl.className = `evento-card ${categoriaClases[evento.categoria.toLowerCase()] || ''}`;
                    
                    // Estado de disponibilidad
                    let estadoClase = 'status-available';
                    let estadoTexto = 'Cupos disponibles';
                    
                    if (evento.estado === 'limitado') {
                        estadoClase = 'status-limited';
                        estadoTexto = 'Pocos cupos disponibles';
                    } else if (evento.estado === 'lleno') {
                        estadoClase = 'status-full';
                        estadoTexto = 'Sin cupos disponibles';
                    }
                    
                    // Generar HTML del evento
                    eventoEl.innerHTML = `
                        <span class="evento-badge ${categoriaClases[evento.categoria.toLowerCase()] || ''}">${capitalizarPrimera(evento.categoria)}</span>
                        <div class="evento-header">
                            <h3 class="evento-title">${evento.titulo}</h3>
                            <div class="evento-meta">
                                <div class="evento-meta-item">
                                    <span class="meta-icon">📅</span>
                                    <span>${formatoFecha(evento.fechaInicioObj, false)}</span>
                                </div>
                                <div class="evento-meta-item">
                                    <span class="meta-icon">⏱️</span>
                                    <span>${evento.horario || 'Horario por definir'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="evento-content">
                            <p class="evento-description">${truncarTexto(evento.descripcion || evento.descripción, 120)}</p>
                            <div class="evento-details">
                                ${evento.duracion ? `
                                <div class="evento-detail">
                                    <span class="detail-icon">⌛</span>
                                    <span>${evento.duracion}</span>
                                </div>
                                ` : ''}
                                ${evento.ubicacion || evento.ubicación ? `
                                <div class="evento-detail">
                                    <span class="detail-icon">📍</span>
                                    <span>${evento.ubicacion || evento.ubicación}</span>
                                </div>
                                ` : ''}
                                ${evento.modalidad ? `
                                <div class="evento-detail">
                                    <span class="detail-icon">${evento.modalidad === 'Presencial' ? '🏢' : '💻'}</span>
                                    <span>${evento.modalidad}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="evento-footer">
                            <div class="evento-status">
                                <span class="status-icon ${estadoClase}">●</span>
                                <span>${estadoTexto}</span>
                            </div>
                            <button class="evento-action" data-id="${evento.id}">
                                Ver más
                            </button>
                        </div>
                    `;
                    
                    // Agregar al grid
                    eventosGrid.appendChild(eventoEl);
                    
                    // Botón para ver detalles
                    const verMasBtn = eventoEl.querySelector('.evento-action');
                    verMasBtn.addEventListener('click', function() {
                        mostrarDetallesEvento(this.getAttribute('data-id'));
                    });
                });
            }
    
            // Función para aplicar filtros a los eventos
            function filtrarEventos() {
                // Restaurar todos los eventos
                filteredEventos = [...allEventos];
                
                // Aplicar filtro de categoría
                if (categoriaSeleccionada !== 'todos') {
                    filteredEventos = filteredEventos.filter(evento => 
                        evento.categoria.toLowerCase() === categoriaSeleccionada
                    );
                }
                
                // Aplicar filtro de búsqueda
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filteredEventos = filteredEventos.filter(evento => 
                        evento.titulo.toLowerCase().includes(query) ||
                        (evento.descripcion && evento.descripcion.toLowerCase().includes(query)) ||
                        (evento.descripción && evento.descripción.toLowerCase().includes(query)) ||
                        (evento.ubicacion && evento.ubicacion.toLowerCase().includes(query)) ||
                        (evento.ubicación && evento.ubicación.toLowerCase().includes(query))
                    );
                }
                
                // Actualizar calendario para reflejar los filtros
                generarCalendario();
            }
            
            // Función para mostrar detalles de un evento
            function mostrarDetallesEvento(eventoId) {
                const evento = allEventos.find(e => e.id == eventoId);
                
                if (!evento) {
                    console.error('Evento no encontrado:', eventoId);
                    return;
                }
                
                // Llenar detalles del modal
                eventoModalTitle.textContent = evento.titulo;
                eventoModalSubtitle.textContent = `${capitalizarPrimera(evento.categoria)} • ${evento.duracion || 'Duración variable'}`;
                
                // Información detallada
                eventoModalInfo.innerHTML = `
                    <div class="info-item">
                        <div class="info-label">Fecha de inicio</div>
                        <div class="info-value">
                            <span class="info-icon">📅</span>
                            <span>${formatoFecha(evento.fechaInicioObj)}</span>
                        </div>
                    </div>
                    ${evento.fechaFinObj && !esMismaFecha(evento.fechaInicioObj, evento.fechaFinObj) ? `
                    <div class="info-item">
                        <div class="info-label">Fecha de finalización</div>
                        <div class="info-value">
                            <span class="info-icon">📅</span>
                            <span>${formatoFecha(evento.fechaFinObj)}</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-label">Horario</div>
                        <div class="info-value">
                            <span class="info-icon">⏱️</span>
                            <span>${evento.horario || 'Por definir'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Ubicación</div>
                        <div class="info-value">
                            <span class="info-icon">📍</span>
                            <span>${evento.ubicacion || evento.ubicación || 'Por definir'}</span>
                        </div>
                    </div>
                    ${evento.modalidad ? `
                    <div class="info-item">
                        <div class="info-label">Modalidad</div>
                        <div class="info-value">
                            <span class="info-icon">${evento.modalidad === 'Presencial' ? '🏢' : '💻'}</span>
                            <span>${evento.modalidad}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${evento.facilidades ? `
                    <div class="info-item">
                        <div class="info-label">Facilidades especiales</div>
                        <div class="info-value">
                            <span class="info-icon">✅</span>
                            <span>${evento.facilidades}</span>
                        </div>
                    </div>
                    ` : ''}
                `;
                
                // Descripción
                eventoModalDescription.textContent = evento.descripcion || evento.descripción || 'No hay descripción disponible.';
                
                // Estado de disponibilidad
                let estadoClase = 'status-available';
                let estadoTexto = 'Cupos disponibles';
                
                if (evento.estado === 'limitado') {
                    estadoClase = 'status-limited';
                    estadoTexto = 'Pocos cupos disponibles';
                } else if (evento.estado === 'lleno') {
                    estadoClase = 'status-full';
                    estadoTexto = 'Sin cupos disponibles';
                }
                
                eventoModalStatus.innerHTML = `
                    <span class="status-icon ${estadoClase}">●</span>
                    <span>${estadoTexto}</span>
                `;
                
                // Botón de acción
                eventoModalAction.href = evento.urlRegistro || '#';
                eventoModalAction.textContent = 'Inscribirme';
                
                if (!evento.urlRegistro) {
                    eventoModalAction.style.display = 'none';
                } else {
                    eventoModalAction.style.display = 'inline-block';
                    
                    if (evento.estado === 'lleno') {
                        eventoModalAction.classList.add('disabled');
                        eventoModalAction.textContent = 'Sin cupos disponibles';
                    } else {
                        eventoModalAction.classList.remove('disabled');
                    }
                }
                
                // Mostrar modal
                eventoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            
            // Función para cerrar modales
            function cerrarModalEvento() {
                eventoModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            function cerrarModalDia() {
                diaModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Función para limpiar la selección de día
            function limpiarSeleccionDia() {
                const diaSeleccionadoEl = document.querySelector('.dia-container.seleccionado');
                if (diaSeleccionadoEl) {
                    diaSeleccionadoEl.classList.remove('seleccionado');
                }
                
                diaSeleccionado = null;
                mostrarEventos();
            }
            
            // Función para cambiar la vista (calendario, eventos, combinada)
            function cambiarVista(vista) {
                vistaActual = vista;
                
                // Actualizar botones de vista
                vistaBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-vista') === vista);
                });
                
                // Actualizar visibilidad de las secciones
                if (vista === 'calendario') {
                    calendarioContainer.style.display = 'block';
                    eventosListContainer.style.display = 'none';
                    document.body.classList.add('vista-compacta');
                } else if (vista === 'eventos') {
                    calendarioContainer.style.display = 'none';
                    eventosListContainer.style.display = 'block';
                    document.body.classList.add('vista-compacta');
                    limpiarSeleccionDia(); // Al mostrar solo eventos, limpiar selección de día
                } else { // combinada
                    calendarioContainer.style.display = 'block';
                    eventosListContainer.style.display = 'block';
                    document.body.classList.remove('vista-compacta');
                }
            }
            
            // Función para truncar texto
            function truncarTexto(texto, maxLongitud) {
                if (!texto) return 'Sin descripción disponible';
                if (texto.length <= maxLongitud) return texto;
                return texto.substring(0, maxLongitud) + '...';
            }
            
            // Función para capitalizar primera letra
            function capitalizarPrimera(texto) {
                if (!texto) return '';
                return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
            }
            
            // Events Listeners
            
            // Navegación de meses
            mesAnteriorBtn.addEventListener('click', function() {
                mesActual--;
                if (mesActual < 0) {
                    mesActual = 11;
                    anioActual--;
                }
                actualizarMesActual();
                generarCalendario();
            });
            
            mesSiguienteBtn.addEventListener('click', function() {
                mesActual++;
                if (mesActual > 11) {
                    mesActual = 0;
                    anioActual++;
                }
                actualizarMesActual();
                generarCalendario();
            });
            
            // Filtros de categoría
            categoriasContainer.addEventListener('click', function(e) {
                const categoriaEl = e.target.closest('.categoria-tag');
                if (!categoriaEl) return;
                
                // Actualizar categoría seleccionada
                categoriaSeleccionada = categoriaEl.getAttribute('data-categoria');
                
                // Actualizar UI
                document.querySelectorAll('.categoria-tag').forEach(tag => {
                    tag.classList.toggle('active', tag === categoriaEl);
                });
                
                // Filtrar eventos
                filtrarEventos();
                mostrarEventos();
            });
            
            // Búsqueda
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.trim().toLowerCase();
                filtrarEventos();
                mostrarEventos();
            });
            
            // También agregar evento para buscar al presionar Enter
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchQuery = this.value.trim().toLowerCase();
                    filtrarEventos();
                    mostrarEventos();
                }
            });
            
            // Modales
            eventoModalClose.addEventListener('click', cerrarModalEvento);
            diaModalClose.addEventListener('click', cerrarModalDia);
            
            eventoModal.addEventListener('click', function(e) {
                if (e.target === eventoModal) cerrarModalEvento();
            });
            
            diaModal.addEventListener('click', function(e) {
                if (e.target === diaModal) cerrarModalDia();
            });
            
            // Cambio de vista
            vistaBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    cambiarVista(this.getAttribute('data-vista'));
                });
            });
            
            // Tecla ESC para cerrar modales
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    cerrarModalEvento();
                    cerrarModalDia();
                }
            });
        
            // Inicializar
            cargarEventos();
        });
