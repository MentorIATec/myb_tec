/**
 * ARREGLO PARA EL CALENDARIO Y LA INTERACCIÓN CON EVENTOS
 * Este script corrige específicamente la generación del calendario
 */

// Esperar a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("📅 Iniciando arreglo para el calendario...");
    
    // Esperar un momento para asegurarnos de que otros scripts han terminado
    setTimeout(function() {
        // 1. Inicializar variables globales
        const eventosGlobales = window.eventosDiagnostico || [];
        let mesActual = new Date().getMonth();
        let anioActual = new Date().getFullYear();
        
        // 2. Inicializar controladores
        inicializarCalendario();
        configurarControles();
        
        // 3. Función principal para generar el calendario
        function inicializarCalendario() {
            console.log("📅 Inicializando calendario...");
            
            // Actualizar título del mes
            actualizarTituloMes();
            
            // Generar calendario
            generarCalendario();
        }
        
        // 4. Actualizar el título del mes actual
        function actualizarTituloMes() {
            const meses = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            
            const mesActualElement = document.getElementById('mes-actual');
            if (mesActualElement) {
                mesActualElement.textContent = `${meses[mesActual]} ${anioActual}`;
                console.log(`📅 Mes actualizado: ${meses[mesActual]} ${anioActual}`);
            }
        }
        
        // 5. Generar el calendario con días
        function generarCalendario() {
            const calendarioMes = document.getElementById('calendario-mes');
            if (!calendarioMes) {
                console.error("No se encontró el contenedor del calendario");
                return;
            }
            
            // Limpiar el calendario
            calendarioMes.innerHTML = '';
            
            // Crear encabezados de días de la semana
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            diasSemana.forEach(dia => {
                const diaHeader = document.createElement('div');
                diaHeader.className = 'dia-encabezado';
                diaHeader.textContent = dia;
                calendarioMes.appendChild(diaHeader);
            });
            
            // Obtener primer día del mes y último día
            const primerDia = new Date(anioActual, mesActual, 1);
            const ultimoDia = new Date(anioActual, mesActual + 1, 0);
            
            // Día de la semana del primer día (0=domingo, 6=sábado)
            const primerDiaSemana = primerDia.getDay();
            
            // Días del mes anterior para completar la primera semana
            for (let i = 0; i < primerDiaSemana; i++) {
                const diaVacio = document.createElement('div');
                diaVacio.className = 'dia vacio';
                calendarioMes.appendChild(diaVacio);
            }
            
            // Generar días del mes actual
            const hoy = new Date();
            const esHoyMesActual = hoy.getMonth() === mesActual && hoy.getFullYear() === anioActual;
            
            for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
                const diaContainer = document.createElement('div');
                diaContainer.className = 'dia';
                diaContainer.setAttribute('tabindex', '0');
                diaContainer.setAttribute('role', 'button');
                
                // Número del día
                const numeroDia = document.createElement('span');
                numeroDia.textContent = dia;
                diaContainer.appendChild(numeroDia);
                
                // Verificar si es hoy
                if (esHoyMesActual && hoy.getDate() === dia) {
                    diaContainer.classList.add('hoy');
                }
                
                // Verificar si hay eventos para este día
                const fecha = new Date(anioActual, mesActual, dia);
                const eventosDelDia = obtenerEventosFecha(fecha);
                
                if (eventosDelDia.length > 0) {
                    diaContainer.classList.add('con-evento');
                    diaContainer.setAttribute('data-eventos', eventosDelDia.length);
                    
                    // Agregar puntos para indicar eventos
                    const eventoPuntos = document.createElement('div');
                    eventoPuntos.className = 'evento-puntos';
                    
                    // Obtener categorías únicas
                    const categorias = new Set();
                    eventosDelDia.forEach(e => {
                        const cat = e.categoria || e.Categoría || 'otro';
                        categorias.add(cat.toLowerCase());
                    });
                    
                    // Mostrar hasta 3 puntos
                    Array.from(categorias).slice(0, 3).forEach(categoria => {
                        const punto = document.createElement('div');
                        punto.className = `punto ${categoria}`;
                        eventoPuntos.appendChild(punto);
                    });
                    
                    diaContainer.appendChild(eventoPuntos);
                    
                    // Agregar evento de clic
                    diaContainer.addEventListener('click', function() {
                        seleccionarDia(dia, eventosDelDia);
                    });
                }
                
                calendarioMes.appendChild(diaContainer);
            }
            
            console.log(`📅 Calendario generado con ${ultimoDia.getDate()} días`);
        }
        
        // 6. Obtener eventos para una fecha específica
        function obtenerEventosFecha(fecha) {
            if (!eventosGlobales || !Array.isArray(eventosGlobales) || eventosGlobales.length === 0) {
                return [];
            }
            
            return eventosGlobales.filter(evento => {
                // Intentar con diferentes formatos de fecha
                const fechaEvento = new Date(evento.fechaInicio || evento['Fecha Inicio'] || '');
                
                if (isNaN(fechaEvento.getTime())) {
                    return false;
                }
                
                return fechaEvento.getDate() === fecha.getDate() && 
                       fechaEvento.getMonth() === fecha.getMonth() && 
                       fechaEvento.getFullYear() === fecha.getFullYear();
            });
        }
        
        // 7. Seleccionar un día y mostrar sus eventos
        function seleccionarDia(dia, eventos) {
            console.log(`📅 Día seleccionado: ${dia} con ${eventos.length} eventos`);
            
            // Deseleccionar día anterior
            const diaSeleccionado = document.querySelector('.dia.seleccionado');
            if (diaSeleccionado) {
                diaSeleccionado.classList.remove('seleccionado');
            }
            
            // Seleccionar nuevo día
            const nuevoDia = document.querySelector(`.dia:nth-child(${dia + 7})`); // +7 por los encabezados
            if (nuevoDia) {
                nuevoDia.classList.add('seleccionado');
            }
            
            // Mostrar eventos del día
            mostrarEventosDia(eventos, dia);
        }
        
        // 8. Mostrar eventos de un día específico
        function mostrarEventosDia(eventos, dia) {
            const listaEventos = document.getElementById('lista-eventos');
            if (!listaEventos) return;
            
            // Actualizar título
            const fecha = new Date(anioActual, mesActual, dia);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const tituloEventos = document.getElementById('eventos-titulo');
            if (tituloEventos) {
                tituloEventos.textContent = `Eventos para ${fechaFormateada}`;
            }
            
            // Limpiar lista
            listaEventos.innerHTML = '';
            
            // Actualizar contador
            const contadorEventos = document.getElementById('contador-eventos');
            if (contadorEventos) {
                contadorEventos.textContent = `Eventos encontrados: ${eventos.length}`;
            }
            
            // Verificar si hay eventos
            if (eventos.length === 0) {
                const mensajeVacio = document.createElement('div');
                mensajeVacio.className = 'mensaje-vacio';
                mensajeVacio.innerHTML = `
                    <i class="fa-solid fa-calendar-xmark fa-2x" aria-hidden="true"></i>
                    <p>No hay eventos para este día</p>
                `;
                listaEventos.appendChild(mensajeVacio);
                return;
            }
            
            // Ordenar eventos por horario
            eventos.sort((a, b) => {
                const horarioA = a.horario || a.Horario || '';
                const horarioB = b.horario || b.Horario || '';
                return horarioA.localeCompare(horarioB);
            });
            
            // Crear elementos para cada evento
            eventos.forEach(evento => {
                // Usar la plantilla si existe
                const plantilla = document.getElementById('plantilla-evento');
                
                if (plantilla) {
                    const clone = document.importNode(plantilla.content, true);
                    
                    // Establecer categoría
                    const categoria = evento.categoria || evento.Categoría || 'otro';
                    clone.querySelector('.evento').classList.add(categoria.toLowerCase());
                    
                    // Establecer título
                    clone.querySelector('.evento-titulo').textContent = evento.titulo || evento.Título || '';
                    
                    // Establecer descripción
                    clone.querySelector('.evento-descripcion').textContent = evento.descripcion || evento.Descripción || '';
                    
                    // Establecer fecha
                    const fechaSpan = clone.querySelector('.evento-fecha span');
                    if (fechaSpan) {
                        fechaSpan.textContent = fechaFormateada;
                    }
                    
                    // Establecer horario
                    const horarioSpan = clone.querySelector('.evento-horario span');
                    if (horarioSpan) {
                        horarioSpan.textContent = evento.horario || evento.Horario || 'Horario no especificado';
                    }
                    
                    // Establecer ubicación
                    const ubicacionSpan = clone.querySelector('.evento-ubicacion span');
                    if (ubicacionSpan) {
                        ubicacionSpan.textContent = evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada';
                    }
                    
                    // Configurar botón de detalles
                    const botonDetalles = clone.querySelector('.ver-detalles');
                    if (botonDetalles) {
                        botonDetalles.addEventListener('click', function() {
                            mostrarDetallesEvento(evento);
                        });
                    }
                    
                    // Configurar botón de calendario
                    const botonCalendario = clone.querySelector('.agregar-calendario');
                    if (botonCalendario) {
                        botonCalendario.addEventListener('click', function(e) {
                            e.stopPropagation();
                            exportarEvento(evento, fechaFormateada);
                        });
                    }
                    
                    listaEventos.appendChild(clone);
                } else {
                    // Crear elemento manualmente si no hay plantilla
                    const eventoEl = document.createElement('article');
                    eventoEl.className = `evento ${(evento.categoria || evento.Categoría || 'otro').toLowerCase()}`;
                    eventoEl.setAttribute('role', 'article');
                    eventoEl.setAttribute('tabindex', '0');
                    
                    eventoEl.innerHTML = `
                        <div class="evento-categoria" aria-hidden="true"></div>
                        <h3 class="evento-titulo">${evento.titulo || evento.Título || ''}</h3>
                        <p class="evento-descripcion">${evento.descripcion || evento.Descripción || ''}</p>
                        <div class="evento-metadata">
                            <p class="evento-fecha">
                                <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                                <span>${fechaFormateada}</span>
                            </p>
                            <p class="evento-horario">
                                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                                <span>${evento.horario || evento.Horario || 'Horario no especificado'}</span>
                            </p>
                            <p class="evento-ubicacion">
                                <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                                <span>${evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada'}</span>
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
                    
                    // Configurar botones
                    const botonDetalles = eventoEl.querySelector('.ver-detalles');
                    if (botonDetalles) {
                        botonDetalles.addEventListener('click', function() {
                            mostrarDetallesEvento(evento);
                        });
                    }
                    
                    const botonCalendario = eventoEl.querySelector('.agregar-calendario');
                    if (botonCalendario) {
                        botonCalendario.addEventListener('click', function(e) {
                            e.stopPropagation();
                            exportarEvento(evento, fechaFormateada);
                        });
                    }
                    
                    listaEventos.appendChild(eventoEl);
                }
            });
            
            console.log(`📅 Mostrados ${eventos.length} eventos para el día ${dia}`);
        }
        
        // 9. Mostrar detalles del evento en modal
        function mostrarDetallesEvento(evento) {
            console.log("📅 Mostrando detalles del evento:", evento.titulo || evento.Título);
            
            const modal = document.getElementById('modal-evento');
            if (!modal) return;
            
            // Formatear fecha
            const fechaEvento = new Date(evento.fechaInicio || evento['Fecha Inicio']);
            const fechaFormateada = fechaEvento.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Rellenar datos del modal
            const titulo = document.getElementById('modal-titulo');
            const descripcion = document.getElementById('modal-descripcion');
            const fecha = document.getElementById('modal-fecha');
            const horario = document.getElementById('modal-horario');
            const ubicacion = document.getElementById('modal-ubicacion');
            const modalidad = document.getElementById('modal-modalidad');
            const facilidades = document.getElementById('modal-facilidades');
            const cupo = document.getElementById('modal-cupo');
            
            if (titulo) titulo.textContent = evento.titulo || evento.Título || '';
            if (descripcion) descripcion.textContent = evento.descripcion || evento.Descripción || '';
            if (fecha) fecha.textContent = fechaFormateada;
            if (horario) horario.textContent = evento.horario || evento.Horario || 'No especificado';
            if (ubicacion) ubicacion.textContent = evento.ubicacion || evento.ubicación || evento.Ubicación || 'No especificada';
            if (modalidad) modalidad.textContent = evento.modalidad || evento.Modalidad || 'No especificada';
            if (facilidades) facilidades.textContent = evento.facilidades || evento.Facilidades || 'No especificadas';
            if (cupo) cupo.textContent = (evento.estado || evento.Estado) === 'lleno' ? 'Sin cupos disponibles' : 'Cupos disponibles';
            
            // Configurar botones
            const compartirBtn = document.getElementById('compartir-evento');
            const exportarBtn = document.getElementById('exportar-evento');
            
            if (compartirBtn) {
                compartirBtn.onclick = function() {
                    compartirEvento(evento, fechaFormateada);
                };
            }
            
            if (exportarBtn) {
                exportarBtn.onclick = function() {
                    exportarEvento(evento, fechaFormateada);
                };
            }
            
            // Mostrar modal
            modal.style.display = 'block';
            modal.classList.add('visible');
            
            // Configurar cierre
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    cerrarModal();
                };
            }
            
            // También cerrar si se hace clic fuera del contenido
            modal.onclick = function(event) {
                if (event.target === modal) {
                    cerrarModal();
                }
            };
        }
        
        // 10. Cerrar modal
        function cerrarModal() {
            const modal = document.getElementById('modal-evento');
            if (!modal) return;
            
            modal.classList.remove('visible');
            setTimeout(function() {
                modal.style.display = 'none';
            }, 300);
        }
        
        // 11. Compartir evento
        function compartirEvento(evento, fechaFormateada) {
            console.log("📅 Compartiendo evento:", evento.titulo || evento.Título);
            
            // Verificar si la API Web Share está disponible
            if (navigator.share) {
                const textoCompartir = `
                    ${evento.titulo || evento.Título}
                    📅 ${fechaFormateada}
                    🕒 ${evento.horario || evento.Horario || 'Horario no especificado'}
                    📍 ${evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada'}
                    
                    ${evento.descripcion || evento.Descripción || 'Sin descripción'}
                `;
                
                navigator.share({
                    title: evento.titulo || evento.Título,
                    text: textoCompartir,
                    url: window.location.href
                })
                .then(() => console.log("Evento compartido exitosamente"))
                .catch(error => console.error("Error al compartir:", error));
            } else {
                alert("La función de compartir no está disponible en tu navegador");
            }
        }
        
        // 12. Exportar evento a calendario
        function exportarEvento(evento, fechaFormateada) {
            console.log("📅 Exportando evento a calendario:", evento.titulo || evento.Título);
            
            try {
                // Crear fechas
                const fechaInicio = new Date(evento.fechaInicio || evento['Fecha Inicio']);
                let fechaFin;
                
                if (evento.fechaFin || evento['Fecha Fin']) {
                    fechaFin = new Date(evento.fechaFin || evento['Fecha Fin']);
                } else {
                    // Por defecto, un evento dura 1 hora
                    fechaFin = new Date(fechaInicio);
                    fechaFin.setHours(fechaFin.getHours() + 1);
                }
                
                // Ajustar horas según el horario
                const horario = evento.horario || evento.Horario || '';
                const horasMinutos = horario.match(/(\d{1,2}):(\d{2})/g);
                
                if (horasMinutos && horasMinutos.length >= 1) {
                    // Primer horario (inicio)
                    const [horaInicio, minInicio] = horasMinutos[0].split(':').map(Number);
                    fechaInicio.setHours(horaInicio, minInicio, 0);
                    
                    // Segundo horario (fin) si existe
                    if (horasMinutos.length >= 2) {
                        const [horaFin, minFin] = horasMinutos[1].split(':').map(Number);
                        fechaFin.setHours(horaFin, minFin, 0);
                    } else {
                        // Por defecto, un evento dura 1 hora
                        fechaFin = new Date(fechaInicio);
                        fechaFin.setHours(fechaFin.getHours() + 1);
                    }
                }
                
                // Formatear para iCalendar
                const formatoFechaICS = fecha => {
                    return fecha.toISOString().replace(/-|:|\.\d+/g, '');
                };
                
                // Crear contenido del archivo ICS
                const eventoICS = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'PRODID:-//Consejería Emocional TEC//Eventos//ES',
                    'CALSCALE:GREGORIAN',
                    'METHOD:PUBLISH',
                    'BEGIN:VEVENT',
                    `UID:${evento.id || Date.now()}@karenguzmn.github.io`,
                    `DTSTAMP:${formatoFechaICS(new Date())}`,
                    `DTSTART:${formatoFechaICS(fechaInicio)}`,
                    `DTEND:${formatoFechaICS(fechaFin)}`,
                    `SUMMARY:${evento.titulo || evento.Título || 'Evento'}`,
                    `DESCRIPTION:${evento.descripcion || evento.Descripción || 'Sin descripción'}`,
                    `LOCATION:${evento.ubicacion || evento.ubicación || evento.Ubicación || 'Sin ubicación'}`,
                    'END:VEVENT',
                    'END:VCALENDAR'
                ].join('\r\n');
                
                // Crear el archivo y descargarlo
                const blob = new Blob([eventoICS], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${(evento.titulo || evento.Título || 'evento').replace(/\s+/g, '_')}.ics`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log("📅 Evento exportado exitosamente");
                mostrarMensaje("Evento añadido al calendario", "success");
            } catch (error) {
                console.error("Error al exportar evento:", error);
                mostrarMensaje("Error al exportar evento", "error");
            }
        }
        
        // 13. Mostrar mensaje
        function mostrarMensaje(texto, tipo = 'info') {
            // Usar el servicio de UI si existe
            if (typeof UIService !== 'undefined' && UIService.mostrarToast) {
                UIService.mostrarToast(texto, tipo);
                return;
            }
            
            // Crear un toast propio
            const toast = document.createElement('div');
            toast.className = `toast toast-${tipo}`;
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '4px';
            toast.style.backgroundColor = tipo === 'success' ? '#4CAF50' : 
                                        tipo === 'error' ? '#F44336' : 
                                        tipo === 'warning' ? '#FF9800' : '#2196F3';
            toast.style.color = 'white';
            toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            toast.style.zIndex = '9999';
            toast.style.transition = 'opacity 0.3s ease';
            
            // Icono según tipo
            const icono = tipo === 'success' ? '✅' : 
                        tipo === 'error' ? '❌' : 
                        tipo === 'warning' ? '⚠️' : 'ℹ️';
            
            toast.textContent = `${icono} ${texto}`;
            
            document.body.appendChild(toast);
            
            // Eliminar después de un tiempo
            setTimeout(function() {
                toast.style.opacity = '0';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }, 3000);
        }
        
        // 14. Configurar controles del calendario
        function configurarControles() {
            console.log("📅 Configurando controles del calendario...");
            
            // Navegación de meses
            const mesAnterior = document.getElementById('mes-anterior');
            const mesSiguiente = document.getElementById('mes-siguiente');
            
            if (mesAnterior) {
                mesAnterior.addEventListener('click', function() {
                    mesActual--;
                    if (mesActual < 0) {
                        mesActual = 11;
                        anioActual--;
                    }
                    actualizarTituloMes();
                    generarCalendario();
                });
            }
            
            if (mesSiguiente) {
                mesSiguiente.addEventListener('click', function() {
                    mesActual++;
                    if (mesActual > 11) {
                        mesActual = 0;
                        anioActual++;
                    }
                    actualizarTituloMes();
                    generarCalendario();
                });
            }
            
            // Botón "Hoy"
            const hoyBtn = document.getElementById('today-button');
            if (hoyBtn) {
                hoyBtn.addEventListener('click', function() {
                    const fechaHoy = new Date();
                    mesActual = fechaHoy.getMonth();
                    anioActual = fechaHoy.getFullYear();
                    actualizarTituloMes();
                    generarCalendario();
                    
                    // Seleccionar el día de hoy si tiene eventos
                    const eventosHoy = obtenerEventosFecha(fechaHoy);
                    if (eventosHoy.length > 0) {
                        seleccionarDia(fechaHoy.getDate(), eventosHoy);
                    }
                });
            }
            
            // Botón de vista semanal/mensual
            const toggleVistaBtn = document.getElementById('toggle-vista');
            if (toggleVistaBtn) {
                toggleVistaBtn.addEventListener('click', function() {
                    const esVistaSemanal = this.textContent.includes('Vista Semanal');
                    
                    if (esVistaSemanal) {
                        this.innerHTML = '<i class="fa-solid fa-calendar-month" aria-hidden="true"></i> Vista Mensual';
                        // Aquí se implementaría la lógica para cambiar a vista semanal
                    } else {
                        this.innerHTML = '<i class="fa-solid fa-calendar-week" aria-hidden="true"></i> Vista Semanal';
                        // Aquí se implementaría la lógica para cambiar a vista mensual
                    }
                    
                    generarCalendario();
                });
            }
            
            // Botón de vista semanal centralizado
            const vistaSemanalBtn = document.getElementById('Vista Semanal');
            if (vistaSemanalBtn) {
                vistaSemanalBtn.addEventListener('click', function() {
                    // Aquí se implementaría la lógica para cambiar a vista semanal
                    generarCalendario();
                });
            }
            
            // Filtros de categoría
            const filtrosCategorias = document.querySelectorAll('#filtro-categorias .filtro');
            filtrosCategorias.forEach(filtro => {
                filtro.addEventListener('click', function() {
                    // Deseleccionar todos los filtros
                    filtrosCategorias.forEach(f => {
                        f.classList.remove('active');
                        f.setAttribute('aria-pressed', 'false');
                    });
                    
                    // Seleccionar el filtro actual
                    this.classList.add('active');
                    this.setAttribute('aria-pressed', 'true');
                    
                    // Volver a generar el calendario con el filtro aplicado
                    generarCalendario();
                });
            });
            
            // Buscador
            const buscador = document.getElementById('buscador');
            const limpiarBusqueda = document.getElementById('limpiar-busqueda');
            
            if (buscador) {
                buscador.addEventListener('input', function() {
                    // Regenerar calendario con la búsqueda aplicada
                    generarCalendario();
                });
                
                buscador.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        generarCalendario();
                    }
                });
            }
            
            if (limpiarBusqueda) {
                limpiarBusqueda.addEventListener('click', function() {
                    if (buscador) {
                        buscador.value = '';
                        generarCalendario();
                    }
                });
            }
            
            // Rango de fechas
            const fechaInicio = document.getElementById('fecha-inicio');
            const fechaFin = document.getElementById('fecha-fin');
            const limpiarFechas = document.getElementById('limpiar-fechas');
            
            if (fechaInicio) {
                fechaInicio.addEventListener('change', function() {
                    generarCalendario();
                });
            }
            
            if (fechaFin) {
                fechaFin.addEventListener('change', function() {
                    generarCalendario();
                });
            }
            
            if (limpiarFechas) {
                limpiarFechas.addEventListener('click', function() {
                    if (fechaInicio) fechaInicio.value = '';
                    if (fechaFin) fechaFin.value = '';
                    generarCalendario();
                });
            }
            
            console.log("📅 Controles configurados correctamente");
        }
        
        // 15. Intentar arreglar el CSS de las tarjetas
        function arreglarEstilosTarjetas() {
            // Agregar estilos personalizados para asegurar que las tarjetas se vean bien
            const estilos = document.createElement('style');
            estilos.textContent = `
                /* Arreglos para el calendario */
                .dia {
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 40px;
                    position: relative;
                }
                
                .dia.vacio {
                    background-color: #f5f5f5;
                    cursor: default;
                }
                
                .dia.hoy {
                    border: 2px solid var(--color-acento, #FF5800);
                    font-weight: bold;
                }
                
                .dia.con-evento {
                    background-color: rgba(0, 114, 206, 0.1);
                    border-color: var(--color-primario, #0072CE);
                }
                
                .dia.seleccionado {
                    background-color: var(--color-primario, #0072CE);
                    color: white;
                    font-weight: bold;
                }
                
                .evento-puntos {
                    display: flex;
                    gap: 3px;
                    justify-content: center;
                    margin-top: 3px;
                }
                
                .punto {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: var(--color-primario, #0072CE);
                }
                
                .punto.taller {
                    background-color: var(--color-taller, #FF5800);
                }
                
                .punto.grupo {
                    background-color: var(--color-grupo, #9C27B0);
                }
                
                .punto.activacion {
                    background-color: var(--color-activacion, #009688);
                }
                
                /* Arreglos para eventos */
                .evento {
                    position: relative;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    color: white;
                }
                
                .evento.curso {
                    background-color: var(--color-curso, #0072CE);
                }
                
                .evento.taller {
                    background-color: var(--color-taller, #FF5800);
                }
                
                .evento.grupo {
                    background-color: var(--color-grupo, #9C27B0);
                }
                
                .evento.activacion {
                    background-color: var(--color-activacion, #009688);
                }
                
                .evento h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                
                .evento-metadata {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                    font-size: 0.9em;
                }
                
                .evento-acciones {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                }
                
                .ver-detalles, .agregar-calendario {
                    background-color: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .ver-detalles:hover, .agregar-calendario:hover {
                    background-color: rgba(255,255,255,0.3);
                }
            `;
            
            document.head.appendChild(estilos);
            console.log("📅 Estilos de tarjetas arreglados");
        }
        
        // Ejecutar arreglo de estilos
        arreglarEstilosTarjetas();
        
        // Mostrar mensaje de inicialización
        console.log("📅 Arreglo de calendario inicializado correctamente");
        mostrarMensaje("Calendario inicializado. Selecciona un día para ver eventos.", "success");
    }, 1000); // Esperar 1 segundo para que otros scripts terminen de cargarse
});
