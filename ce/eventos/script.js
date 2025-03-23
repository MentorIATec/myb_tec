document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const jsonUrl = 'https://karenguzmn.github.io/myb_tec/ce/eventos.json'; // URL del archivo JSON
    // Variables globales
    let eventos = []; // Almacenar eventos globalmente
    let categoriaSeleccionada = 'todos'; // Categoría seleccionada
    let textoBusqueda = ''; // Texto de búsqueda
    let vistaSemanal = false; // Estado de la vista (mensual/semanal)
    let mesActual = new Date(); // Mes actual para navegación del calendario
    
    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        // Mostrar indicador de carga
        mostrarCargando();
        
        // Cargar eventos
        cargarEventos();
        
        // Configurar navegación de calendario
        document.getElementById('mes-anterior').addEventListener('click', function() {
            mesActual.setMonth(mesActual.getMonth() - 1);
            actualizarCalendario();
        });
        
        document.getElementById('mes-siguiente').addEventListener('click', function() {
            mesActual.setMonth(mesActual.getMonth() + 1);
            actualizarCalendario();
        });
        
        // Configurar botón "Hoy"
        if (document.getElementById('btn-hoy')) {
            document.getElementById('btn-hoy').addEventListener('click', function() {
                mesActual = new Date();
                actualizarCalendario();
            });
        }
        
        // Configurar filtros de eventos
        document.querySelectorAll('.filtro-btn').forEach(boton => {
            boton.addEventListener('click', () => {
                // Limpiar selección anterior
                document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('seleccionado'));
                
                // Establecer la categoría seleccionada
                categoriaSeleccionada = boton.getAttribute('data-categoria');
                boton.classList.add('seleccionado');
        
                // Actualizar la visualización de eventos y el calendario
                mostrarEventos();
                actualizarCalendario();
            });
        });
        
        // Manejar la búsqueda de eventos
        document.getElementById('buscador').addEventListener('input', (event) => {
            textoBusqueda = event.target.value;
            mostrarEventos();
            actualizarCalendario();
        });
        
        // Limpiar la búsqueda
        document.getElementById('limpiar-busqueda').addEventListener('click', () => {
            textoBusqueda = '';
            document.getElementById('buscador').value = '';
            mostrarEventos();
            actualizarCalendario();
        });
        
        // Cambiar entre vista mensual y semanal
        document.getElementById('toggle-vista').addEventListener('click', () => {
            vistaSemanal = !vistaSemanal;
            document.getElementById('toggle-vista').innerText = vistaSemanal ? 'Vista Mensual' : 'Vista Semanal';
            actualizarCalendario();
        });
        
        // Cambiar entre modo claro y oscuro
        document.getElementById('toggle-theme').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Opcional: guardar preferencia en localStorage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('modo-tema', 'oscuro');
            } else {
                localStorage.setItem('modo-tema', 'claro');
            }
        });
        
        // Configurar cierre de modal
        document.querySelector('.close').onclick = function() {
            cerrarModal();
        };
        
        // Cerrar modal al hacer clic fuera de él
        window.onclick = function(event) {
            if (event.target === document.getElementById('modal-evento')) {
                cerrarModal();
            }
        };
        
        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && document.getElementById('modal-evento').classList.contains('show')) {
                cerrarModal();
            }
        });
        
        // Configurar los botones para compartir
        if (document.getElementById('compartir-email')) {
            document.getElementById('compartir-email').addEventListener('click', compartirPorEmail);
        }
        
        if (document.getElementById('compartir-redes')) {
            document.getElementById('compartir-redes').addEventListener('click', compartirEnRedes);
        }
        
        // Cargar preferencia de tema
        cargarTemaPreferido();
    });
    
    // Cargar eventos desde la URL JSON
    async function cargarEventos() {
        try {
            mostrarCargando();
            const response = await fetch('https://karenguzmn.github.io/myb_tec/ce/eventos.json');
            if (!response.ok) {
                throw new Error('Error al cargar los eventos');
            }
            eventos = await response.json();
            ocultarCargando();
            mostrarEventos();
            actualizarCalendario();
            actualizarProximosEventos(); // Actualizar la sección de próximos eventos
        } catch (error) {
            console.error('Error:', error);
            mostrarErrorCarga('No se pudieron cargar los eventos. Intenta nuevamente más tarde.');
        }
    }
    
    // Mostrar eventos en formato lista
    function mostrarEventos() {
        const listaEventos = document.getElementById('lista-eventos');
        const contadorEventos = document.getElementById('contador-eventos');
        listaEventos.innerHTML = ''; // Limpiar lista existente
        
        const eventosFiltrados = filtrarEventos();
        
        if (eventosFiltrados.length === 0) {
            listaEventos.innerHTML = '<p class="sin-eventos">No hay eventos disponibles con los filtros actuales. Prueba con otros criterios de búsqueda.</p>';
            contadorEventos.innerText = 'Eventos mostrados: 0';
            return;
        }
        
        eventosFiltrados.forEach(evento => {
            const eventoDiv = document.createElement('div');
            eventoDiv.className = 'evento ' + evento.categoria.toLowerCase();
            
            eventoDiv.innerHTML = `
                <h3 class="titulo">${evento.titulo}</h3>
                <p class="descripcion">${evento.descripcion}</p>
                <p class="fecha">${formatearFechaLegible(evento.fechaInicio)} (${evento.horario})</p>
                <div class="evento-acciones">
                    <button class="ver-detalle" data-id="${evento.id}">Ver Detalle</button>
                    <a href="${evento.urlRegistro}" target="_blank" class="registro">Registro</a>
                </div>
            `;
            
            listaEventos.appendChild(eventoDiv);
            
            // Añadir evento de clic para ver detalles
            eventoDiv.querySelector('.ver-detalle').addEventListener('click', function() {
                mostrarDetalleEvento(evento.id);
            });
        });
        
        // Actualizar el contador de eventos mostrados
        contadorEventos.innerText = `Eventos mostrados: ${eventosFiltrados.length}`;
        
        // Añadir efectos de entrada
        animarEntradaEventos();
    }
    
    // Animar entrada de eventos con un pequeño retraso entre cada uno
    function animarEntradaEventos() {
        const eventos = document.querySelectorAll('.evento');
        eventos.forEach((evento, index) => {
            evento.style.opacity = '0';
            evento.style.transform = 'translateY(20px)';
            setTimeout(() => {
                evento.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                evento.style.opacity = '1';
                evento.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    // Filtrar eventos según la categoría seleccionada y el texto de búsqueda
    function filtrarEventos() {
        return eventos.filter(evento => {
            const coincideCategoria = (categoriaSeleccionada === 'todos' || evento.categoria.toLowerCase() === categoriaSeleccionada);
            const coincideBusqueda = textoBusqueda === '' || 
                                     evento.titulo.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
                                     evento.descripcion.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
                                     evento.ubicación.toLowerCase().includes(textoBusqueda.toLowerCase());
            return coincideCategoria && coincideBusqueda;
        });
    }
    
    // Actualizar vista del calendario
    function actualizarCalendario() {
        // Actualizar texto del mes actual
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('mes-actual').textContent = `${meses[mesActual.getMonth()]} ${mesActual.getFullYear()}`;
        
        // Generar vista del calendario
        generarCalendario();
    }
    
    // Generar el calendario
    function generarCalendario() {
        const calendarioMes = document.getElementById('calendario-mes');
        calendarioMes.innerHTML = ''; // Limpiar calendario existente
        
        const anio = mesActual.getFullYear();
        const mes = mesActual.getMonth();
        
        // Configurar la vista según sea mensual o semanal
        if (vistaSemanal) {
            generarVistaSemanal();
        } else {
            generarVistaMensual(anio, mes);
        }
    }
    
    // Generar vista mensual del calendario
    function generarVistaMensual(anio, mes) {
        const calendarioMes = document.getElementById('calendario-mes');
        
        // Obtener el primer día del mes y total de días
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        
        // Día actual para resaltarlo
        const hoy = new Date();
        const esMesActual = hoy.getMonth() === mes && hoy.getFullYear() === anio;
        
        // Agregar días vacíos para el primer día del mes
        for (let i = 0; i < primerDia.getDay(); i++) {
            const diaVacio = document.createElement('div');
            diaVacio.className = 'dia vacio';
            calendarioMes.appendChild(diaVacio);
        }
        
        // Agregar días del mes
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaDia = new Date(anio, mes, dia);
            const diaDiv = document.createElement('div');
            diaDiv.className = 'dia';
            diaDiv.setAttribute('tabindex', '0'); // Para navegación por teclado
            
            // Añadir número del día
            const numeroDiv = document.createElement('div');
            numeroDiv.className = 'dia-numero';
            numeroDiv.textContent = dia;
            diaDiv.appendChild(numeroDiv);
            
            // Verificar si es el día actual
            if (esMesActual && dia === hoy.getDate()) {
                diaDiv.classList.add('dia-actual');
            }
            
            // Verificar si hay eventos en este día
            const fechaStr = formatearFechaISO(fechaDia);
            const eventosDelDia = filtrarEventos().filter(evento => 
                evento.fechaInicio === fechaStr
            );
            
            // Añadir indicadores de eventos
            if (eventosDelDia.length > 0) {
                diaDiv.classList.add('dia-evento');
                
                // Crear indicadores por categoría
                const categorias = [...new Set(eventosDelDia.map(e => e.categoria.toLowerCase()))];
                categorias.forEach(cat => {
                    const indicador = document.createElement('div');
                    indicador.className = `indicador-evento ${cat}`;
                    diaDiv.appendChild(indicador);
                });
                
                // Mostrar el número de eventos
                if (eventosDelDia.length > 0) {
                    const numEventos = document.createElement('span');
                    numEventos.className = 'num-eventos';
                    numEventos.innerText = eventosDelDia.length > 1 ? `+${eventosDelDia.length}` : '';
                    diaDiv.appendChild(numEventos);
                }
                
                // Añadir tooltip con información
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-text';
                tooltip.innerHTML = `<strong>${eventosDelDia.length} evento${eventosDelDia.length > 1 ? 's' : ''}:</strong><br>` + 
                                    eventosDelDia.map(e => `- ${e.titulo} (${e.categoria})`).join('<br>');
                diaDiv.classList.add('tooltip');
                diaDiv.appendChild(tooltip);
                
                // Añadir evento click para filtrar eventos del día
                diaDiv.addEventListener('click', function() {
                    mostrarEventosDia(eventosDelDia, dia);
                });
                
                // Navegación por teclado - Enter activa el clic
                diaDiv.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        mostrarEventosDia(eventosDelDia, dia);
                    }
                });
            }
            
            calendarioMes.appendChild(diaDiv);
        }
    }
    
    // Generar vista semanal del calendario
    function generarVistaSemanal() {
        const calendarioMes = document.getElementById('calendario-mes');
        
        // Obtener la fecha de inicio de la semana (domingo)
        const inicioSemana = new Date(mesActual);
        const diaSemana = mesActual.getDay();
        inicioSemana.setDate(mesActual.getDate() - diaSemana);
        
        // Generar los 7 días de la semana
        for (let i = 0; i < 7; i++) {
            const fechaDia = new Date(inicioSemana);
            fechaDia.setDate(inicioSemana.getDate() + i);
            
            const diaDiv = document.createElement('div');
            diaDiv.className = 'dia dia-semana';
            diaDiv.setAttribute('tabindex', '0'); // Para navegación por teclado
            
            // Añadir nombre del día
            const nombreDia = fechaDia.toLocaleDateString('es-ES', { weekday: 'short' });
            const nombreDiaDiv = document.createElement('div');
            nombreDiaDiv.className = 'nombre-dia';
            nombreDiaDiv.textContent = nombreDia;
            diaDiv.appendChild(nombreDiaDiv);
            
            // Añadir número del día
            const numeroDiv = document.createElement('div');
            numeroDiv.className = 'dia-numero';
            numeroDiv.textContent = fechaDia.getDate();
            diaDiv.appendChild(numeroDiv);
            
            // Verificar si es el día actual
            if (fechaDia.toDateString() === new Date().toDateString()) {
                diaDiv.classList.add('dia-actual');
            }
            
            // Verificar si hay eventos en este día
            const fechaStr = formatearFechaISO(fechaDia);
            const eventosDelDia = filtrarEventos().filter(evento => 
                evento.fechaInicio === fechaStr
            );
            
            // Añadir eventos para este día
            if (eventosDelDia.length > 0) {
                diaDiv.classList.add('dia-evento');
                
                // Mostrar eventos resumidos
                eventosDelDia.forEach(evento => {
                    const eventoResumen = document.createElement('div');
                    eventoResumen.className = `evento-resumen ${evento.categoria.toLowerCase()}`;
                    eventoResumen.textContent = evento.titulo;
                    eventoResumen.setAttribute('data-id', evento.id);
                    eventoResumen.addEventListener('click', function(e) {
                        e.stopPropagation();
                        mostrarDetalleEvento(evento.id);
                    });
                    diaDiv.appendChild(eventoResumen);
                });
                
                // Añadir evento click para filtrar eventos del día
                diaDiv.addEventListener('click', function() {
                    mostrarEventosDia(eventosDelDia, fechaDia.getDate());
                });
                
                // Navegación por teclado
                diaDiv.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        mostrarEventosDia(eventosDelDia, fechaDia.getDate());
                    }
                });
            }
            
            calendarioMes.appendChild(diaDiv);
        }
    }
    
    // Actualizar próximos eventos (eventos para los siguientes 7 días)
    function actualizarProximosEventos() {
        const listaProximos = document.getElementById('lista-proximos');
        if (!listaProximos) return; // Salir si no existe el elemento
        
        listaProximos.innerHTML = '';
        
        // Obtener fecha actual y fecha límite (7 días después)
        const hoy = new Date();
        const limiteFecha = new Date(hoy);
        limiteFecha.setDate(hoy.getDate() + 7);
        
        // Filtrar eventos que ocurren en los próximos 7 días
        const eventosFiltrados = eventos.filter(evento => {
            const fechaEvento = parsearFecha(evento.fechaInicio);
            return fechaEvento >= hoy && fechaEvento <= limiteFecha;
        });
        
        // Ordenar por fecha
        eventosFiltrados.sort((a, b) => {
            return parsearFecha(a.fechaInicio) - parsearFecha(b.fechaInicio);
        });
        
        if (eventosFiltrados.length === 0) {
            listaProximos.innerHTML = '<p class="sin-eventos">No hay eventos programados para los próximos 7 días.</p>';
            return;
        }
        
        // Mostrar los próximos eventos
        eventosFiltrados.forEach(evento => {
            const eventoDiv = document.createElement('div');
            eventoDiv.className = 'evento-proximo ' + evento.categoria.toLowerCase();
            
            eventoDiv.innerHTML = `
                <h4 class="titulo">${evento.titulo}</h4>
                <p class="fecha">${formatearFechaLegible(evento.fechaInicio)} (${evento.horario})</p>
                <button class="ver-detalle" data-id="${evento.id}">Ver Detalle</button>
            `;
            
            listaProximos.appendChild(eventoDiv);
            
            // Añadir evento de clic para ver detalles
            eventoDiv.querySelector('.ver-detalle').addEventListener('click', function() {
                mostrarDetalleEvento(evento.id);
            });
        });
    }
    
    // Mostrar eventos de un día específico
    function mostrarEventosDia(eventosDelDia, dia) {
        const listaEventos = document.getElementById('lista-eventos');
        const contadorEventos = document.getElementById('contador-eventos');
        listaEventos.innerHTML = '';
        
        // Remover selección previa de filtros
        document.querySelectorAll('.filtro-btn').forEach(f => f.classList.remove('seleccionado'));
        document.querySelector('.filtro-btn[data-categoria="todos"]').classList.add('seleccionado');
        
        // Resaltar el día seleccionado
        document.querySelectorAll('.dia').forEach(d => d.classList.remove('dia-seleccionado'));
        
        // Buscar el día correspondiente y añadir la clase
        const diasCalendario = document.querySelectorAll('.dia:not(.vacio)');
        for (let i = 0; i < diasCalendario.length; i++) {
            const diaNumero = diasCalendario[i].querySelector('.dia-numero');
            if (diaNumero && parseInt(diaNumero.textContent) === dia) {
                diasCalendario[i].classList.add('dia-seleccionado');
                break;
            }
        }
        
        // Si no hay eventos, mostrar mensaje
        if (eventosDelDia.length === 0) {
            listaEventos.innerHTML = '<p class="sin-eventos">No hay eventos para este día.</p>';
            contadorEventos.innerText = 'Eventos mostrados: 0';
            return;
        }
        
        // Mostrar los eventos del día
        eventosDelDia.forEach(evento => {
            const eventoDiv = document.createElement('div');
            eventoDiv.className = 'evento ' + evento.categoria.toLowerCase();
            
            eventoDiv.innerHTML = `
                <h3 class="titulo">${evento.titulo}</h3>
                <p class="descripcion">${evento.descripcion}</p>
                <p class="fecha">${formatearFechaLegible(evento.fechaInicio)} (${evento.horario})</p>
                <div class="evento-acciones">
                    <button class="ver-detalle" data-id="${evento.id}">Ver Detalle</button>
                    <a href="${evento.urlRegistro}" target="_blank" class="registro">Registro</a>
                </div>
            `;
            
            listaEventos.appendChild(eventoDiv);
            
            // Añadir evento de clic para ver detalles
            eventoDiv.querySelector('.ver-detalle').addEventListener('click', function() {
                mostrarDetalleEvento(evento.id);
            });
        });
        
        // Actualizar el contador de eventos mostrados
        contadorEventos.innerText = `Eventos mostrados: ${eventosDelDia.length}`;
        
        // Animar entrada de eventos
        animarEntradaEventos();
        
        // Mostrar notificación
        mostrarNotificacion(`Mostrando ${eventosDelDia.length} evento(s) para el día ${dia}`);
    }
    
    // Mostrar detalles del evento en un modal
    function mostrarDetalleEvento(eventoId) {
        const evento = eventos.find(e => e.id == eventoId);
        if (evento) {
            // Llenar el modal con los datos del evento
            document.getElementById('titulo-evento').innerText = evento.titulo;
            document.getElementById('descripcion-evento').innerText = evento.descripcion;
            document.getElementById('fecha-evento').innerText = formatearFechaLegible(evento.fechaInicio);
            document.getElementById('horario-evento').innerText = evento.horario;
            document.getElementById('ubicacion-evento').innerText = evento.ubicación;
            document.getElementById('modalidad-evento').innerText = evento.modalidad;
            document.getElementById('facilidades-evento').innerText = evento.facilidades || 'No especificadas';
            document.getElementById('url-registro').href = evento.urlRegistro;
    
            // Configurar botones de exportación
            const googleCalendarBtn = document.getElementById('exportar-google');
            if (googleCalendarBtn) {
                googleCalendarBtn.href = crearEnlaceGoogleCalendar(evento);
            }
            
            const outlookBtn = document.getElementById('exportar-outlook');
            if (outlookBtn) {
                outlookBtn.href = crearEnlaceOutlook(evento);
            }
            
            // Mostrar el modal con animación
            const modal = document.getElementById('modal-evento');
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }
    
    // Cerrar el modal con animación
    function cerrarModal() {
        const modal = document.getElementById('modal-evento');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Crear enlace para Google Calendar
    function crearEnlaceGoogleCalendar(evento) {
        const fechaInicio = parsearFecha(evento.fechaInicio);
        const fechaFin = evento.fechaFin ? parsearFecha(evento.fechaFin) : parsearFecha(evento.fechaInicio);
        
        // Extraer horas del formato "3:30-5:30pm"
        const horarioMatch = evento.horario.match(/(\d+):(\d+)-(\d+):(\d+)(am|pm)/i);
        if (horarioMatch) {
            const [_, horaInicio, minInicio, horaFin, minFin, ampm] = horarioMatch;
            const esPM = ampm.toLowerCase() === 'pm';
            
            // Ajustar horas según AM/PM
            fechaInicio.setHours(
                esPM && horaInicio !== '12' ? parseInt(horaInicio) + 12 : parseInt(horaInicio),
                parseInt(minInicio)
            );
            
            fechaFin.setHours(
                esPM && horaFin !== '12' ? parseInt(horaFin) + 12 : parseInt(horaFin),
                parseInt(minFin)
            );
        }
        
        const url = new URL('https://calendar.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', evento.titulo);
        url.searchParams.append('details', evento.descripcion);
        url.searchParams.append('location', evento.ubicación);
        url.searchParams.append('dates', 
            fechaInicio.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '') + '/' +
            fechaFin.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '')
        );
        
        return url.toString();
    }
    
    // Crear enlace para Outlook
    function crearEnlaceOutlook(evento) {
        // Función similar a Google Calendar pero para Outlook
        // Esta es una implementación básica - ajustar según sea necesario
        const fechaInicio = parsearFecha(evento.fechaInicio);
        const fechaFin = evento.fechaFin ? parsearFecha(evento.fechaFin) : parsearFecha(evento.fechaInicio);
        
        // Extraer horas del formato "3:30-5:30pm"
        const horarioMatch = evento.horario.match(/(\d+):(\d+)-(\d+):(\d+)(am|pm)/i);
        if (horarioMatch) {
            const [_, horaInicio, minInicio, horaFin, minFin, ampm] = horarioMatch;
            const esPM = ampm.toLowerCase() === 'pm';
            
            // Ajustar horas según AM/PM
            fechaInicio.setHours(
                esPM && horaInicio !== '12' ? parseInt(horaInicio) + 12 : parseInt(horaInicio),
                parseInt(minInicio)
            );
            
            fechaFin.setHours(
                esPM && horaFin !== '12' ? parseInt(horaFin) + 12 : parseInt(horaFin),
                parseInt(minFin)
            );
        }
        
        const url = new URL('https://outlook.office.com/calendar/0/action/compose');
        url.searchParams.append('subject', evento.titulo);
        url.searchParams.append('body', evento.descripcion);
        url.searchParams.append('location', evento.ubicación);
        url.searchParams.append('startdt', fechaInicio.toISOString());
        url.searchParams.append('enddt', fechaFin.toISOString());
        
        return url.toString();
    }
    
    // Compartir evento por correo electrónico
    function compartirPorEmail() {
        const titulo = document.getElementById('titulo-evento').innerText;
        const fecha = document.getElementById('fecha-evento').innerText;
        const horario = document.getElementById('horario-evento').innerText;
        const ubicacion = document.getElementById('ubicacion-evento').innerText;
        const urlRegistro = document.getElementById('url-registro').href;
        
        const asunto = `Evento: ${titulo}`;
        const cuerpo = `
    Te invito a participar en el evento "${titulo}"
    
    Fecha: ${fecha}
    Horario: ${horario}
    Ubicación: ${ubicacion}
    
    Para registrarte, visita: ${urlRegistro}
        `;
        
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        window.open(mailtoUrl);
        
        mostrarNotificacion('Se ha abierto tu cliente de correo');
    }
    
    // Compartir evento en redes sociales
    function compartirEnRedes() {
        const titulo = document.getElementById('titulo-evento').innerText;
        const descripcion = document.getElementById('descripcion-evento').innerText;
        const urlRegistro = document.getElementById('url-registro').href;
        
        // Crear mensaje para compartir
        const mensaje = `${titulo} - ${descripcion.substring(0, 100)}... Más información y registro: ${urlRegistro}`;
        
        // URLs para compartir en diferentes plataformas
        const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(mensaje)}`;
        const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlRegistro)}&quote=${encodeURIComponent(mensaje)}`;
        const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlRegistro)}`;
        
        // Crear modal con opciones de compartir
        const opcionesHTML = `
            <div class="compartir-opciones">
                <h3>Compartir en redes sociales</h3>
                <div class="botones-compartir">
                    <a href="${twitter}" target="_blank" class="btn-compartir twitter">Twitter</a>
                    <a href="${facebook}" target="_blank" class="btn-compartir facebook">Facebook</a>
                    <a href="${linkedin}" target="_blank" class="btn-compartir linkedin">LinkedIn</a>
                </div>
            </div>
        `;
        
        // Crear y mostrar un modal temporal
        const div = document.createElement('div');
        div.className = 'mini-modal';
        div.innerHTML = opcionesHTML;
        document.body.appendChild(div);
        
        // Cerrar el mini-modal al hacer clic fuera de él
        document.addEventListener('click', function cerrarMiniModal(e) {
            if (!div.contains(e.target) && e.target.id !== 'compartir-redes') {
                document.body.removeChild(div);
                document.removeEventListener('click', cerrarMiniModal);
            }
        });
    }
    
    // Funciones de utilidad para fechas
    function formatearFechaISO(fecha) {
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${mes}/${dia}/${fecha.getFullYear()}`;
    }
    
    function formatearFechaLegible(fechaStr) {
        const partes = fechaStr.split('/');
        if (partes.length !== 3) return fechaStr;
        
        const fecha = new Date(partes[2], partes[0] - 1, partes[1]);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function parsearFecha(fechaStr) {
        const partes = fechaStr.split('/');
        if (partes.length !== 3) return new Date();
        
        return new Date(partes[2], partes[0] - 1, partes[1]);
    }
    
    // Funciones para estados de carga y notificaciones
    function mostrarCargando() {
        // Crear spinner de carga
        const listaEventos = document.getElementById('lista-eventos');
        if (listaEventos) {
            listaEventos.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando eventos...</p>
                </div>
            `;
        }
        
        // Skeleton loaders para el calendario si es necesario
        const calendarioMes = document.getElementById('calendario-mes');
        if (calendarioMes) {
            calendarioMes.innerHTML = '';
            for (let i = 0; i < 35; i++) {
                const skeletonDia = document.createElement('div');
                skeletonDia.className = 'dia skeleton-loader';
                calendarioMes.appendChild(skeletonDia);
            }
        }
    }
    
    function ocultarCargando() {
        // Se limpiará automáticamente cuando los datos se carguen y se actualice la interfaz
    }
    
    function mostrarErrorCarga(mensaje) {
        const listaEventos = document.getElementById('lista-eventos');
        if (listaEventos) {
            listaEventos.innerHTML = `
                <div class="error-container">
                    <p class="error-mensaje">${mensaje}</p>
                    <button id="reintentar" class="btn-reintentar">Reintentar</button>
                </div>
            `;
            
            document.getElementById('reintentar').addEventListener('click', cargarEventos);
        }
        
        // También actualizar el calendario con mensaje de error
        const calendarioMes = document.getElementById('calendario-mes');
        if (calendarioMes) {
            calendarioMes.innerHTML = `<div class="error-calendario">No se pudo cargar el calendario</div>`;
        }
    }
    
    function mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación tipo toast
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.innerText = mensaje;
        
        // Añadir a la interfaz
        document.body.appendChild(notificacion);
        
        // Mostrar con animación
        setTimeout(() => notificacion.classList.add('mostrar'), 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }
    
    // Cargar tema preferido (si está guardado)
    function cargarTemaPreferido() {
        const temaGuardado = localStorage.getItem('modo-tema');
        if (temaGuardado === 'oscuro') {
            document.body.classList.add('dark-mode');
            if (document.getElementById('toggle-theme')) {
                document.getElementById('toggle-theme').innerText = 'Modo Claro';
            }
        }
    }
    
    // Navegación por teclado para todo el sitio
    document.addEventListener('keydown', function(e) {
        // Navegación entre meses con flechas izquierda/derecha cuando el foco está en los botones de navegación
        if (document.activeElement.id === 'mes-anterior' || document.activeElement.id === 'mes-siguiente') {
            if (e.key === 'ArrowLeft') {
                document.getElementById('mes-anterior').click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('mes-siguiente').click();
            }
        }
        
        // Navegación entre días del calendario cuando el foco está en un día
        if (document.activeElement.classList.contains('dia')) {
            const dias = Array.from(document.querySelectorAll('.dia[tabindex="0"]'));
            const indiceActual = dias.indexOf(document.activeElement);
            
            if (indiceActual !== -1) {
                if (e.key === 'ArrowLeft' && indiceActual > 0) {
                    dias[indiceActual - 1].focus();
                } else if (e.key === 'ArrowRight' && indiceActual < dias.length - 1) {
                    dias[indiceActual + 1].focus();
                } else if (e.key === 'ArrowUp' && indiceActual >= 7) {
                    dias[indiceActual - 7].focus();
                } else if (e.key === 'ArrowDown' && indiceActual + 7 < dias.length) {
                    dias[indiceActual + 7].focus();
                }
            }
        }
});
