/**
 * SOLUCIÓN COMPLETA PARA EL VISUALIZADOR DE EVENTOS
 * Este script sobrescribe la funcionalidad problemática y corrige el visualizador
 */

// Esperar a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando solución para el visualizador de eventos...");
    
    // 1. PASO 1: CORREGIR LA URL DE CARGA DE EVENTOS
    async function cargarEventos() {
        try {
            // Mostrar spinner de carga
            mostrarCargando(true);
            
            // URL correcta (esta es la diferencia clave con el código original)
            const url = 'https://karenguzmn.github.io/myb_tec/ce/eventos.json';
            
            console.log("Intentando cargar eventos desde:", url);
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                cache: 'no-store'
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status} al cargar eventos`);
            }
            
            const data = await response.json();
            const eventos = data.eventos || data;
            
            if (!Array.isArray(eventos)) {
                throw new Error('El formato de datos recibido no es válido');
            }
            
            console.log(`${eventos.length} eventos cargados correctamente`);
            
            // Procesar y mostrar los eventos
            procesarEventos(eventos);
            return eventos;
        } catch (error) {
            console.error("Error al cargar eventos:", error);
            mostrarError("No se pudieron cargar los eventos. Por favor, intente más tarde.");
            return [];
        } finally {
            mostrarCargando(false);
        }
    }
    
    // 2. PASO 2: PROCESAR EVENTOS Y ACTUALIZAR UI
    function procesarEventos(eventos) {
        if (!eventos || eventos.length === 0) {
            mostrarError("No hay eventos disponibles");
            return;
        }
        
        // Normalizar eventos para asegurar que tengan el formato correcto
        const eventosNormalizados = eventos.map(normalizar);
        
        // Actualizar contador de eventos
        actualizarContador(eventosNormalizados.length);
        
        // Ocultar tarjetas de eventos (esto es lo que quiere el usuario)
        ocultarTarjetasEventos();
        
        // Actualizar calendario con los eventos
        actualizarCalendario(eventosNormalizados);
        
        // Mostrar mensaje de éxito
        mostrarNotificacion("Eventos cargados correctamente. Seleccione una fecha en el calendario para ver detalles.");
    }
    
    // 3. FUNCIONES AUXILIARES
    
    // Normalizar datos de un evento
    function normalizar(evento) {
        return {
            id: evento.id || evento.ID || `evento-${Math.random().toString(36).substring(2)}`,
            titulo: evento.titulo || evento.Título || 'Evento sin título',
            descripcion: evento.descripcion || evento.Descripción || 'Sin descripción',
            fechaInicio: evento.fechaInicio || evento["Fecha Inicio"] || new Date().toISOString().split('T')[0],
            fechaFin: evento.fechaFin || evento["Fecha Fin"] || evento.fechaInicio || evento["Fecha Inicio"] || new Date().toISOString().split('T')[0],
            horario: evento.horario || evento.Horario || 'Horario no especificado',
            ubicacion: evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada',
            modalidad: evento.modalidad || evento.Modalidad || 'Presencial',
            categoria: normalizarCategoria(evento.categoria || evento.Categoría || 'otro'),
            facilidades: evento.facilidades || evento.Facilidades || 'No especificadas',
            estado: evento.estado || evento.Estado || 'disponible'
        };
    }
    
    // Normalizar categoría
    function normalizarCategoria(categoria) {
        if (!categoria) return 'otro';
        
        const cat = categoria.toLowerCase();
        const categoriasValidas = {
            'taller': 'taller',
            'curso': 'curso',
            'grupo': 'grupo',
            'activacion': 'activacion',
            'activación': 'activacion',
            'evento': 'evento'
        };
        
        return categoriasValidas[cat] || 'otro';
    }
    
    // Actualizar contador de eventos
    function actualizarContador(cantidad) {
        const contadorEl = document.getElementById('contador-eventos');
        if (contadorEl) {
            contadorEl.textContent = `Eventos encontrados: ${cantidad}`;
            contadorEl.style.fontWeight = '500';
            contadorEl.style.color = '#0072CE';
        }
    }
    
    // Ocultar tarjetas de eventos
    function ocultarTarjetasEventos() {
        const listaEventos = document.getElementById('lista-eventos');
        if (listaEventos) {
            // Limpiar contenido actual
            listaEventos.innerHTML = '';
            
            // Crear mensaje informativo
            const mensaje = document.createElement('div');
            mensaje.className = 'mensaje-vacio';
            mensaje.style.textAlign = 'center';
            mensaje.style.padding = '30px';
            mensaje.innerHTML = `
                <i class="fa-solid fa-calendar-check fa-2x" style="color:#0072CE; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; margin-bottom: 10px;">Seleccione una fecha en el calendario para ver los eventos disponibles.</p>
                <p style="color: #666;">Use los filtros para buscar eventos específicos.</p>
            `;
            
            listaEventos.appendChild(mensaje);
            
            // Cambiar título de la sección
            const tituloEventos = document.getElementById('eventos-titulo');
            if (tituloEventos) {
                tituloEventos.textContent = 'Eventos disponibles en el calendario';
            }
        }
    }
    
    // Actualizar calendario con eventos
    function actualizarCalendario(eventos) {
        // Obtener referencias a elementos del calendario
        const calendarioMes = document.getElementById('calendario-mes');
        if (!calendarioMes) return;
        
        // Agregar eventos de click a los días que tengan eventos
        setTimeout(() => {
            const diasCalendario = calendarioMes.querySelectorAll('.dia:not(.vacio)');
            diasCalendario.forEach(diaEl => {
                const diaNum = parseInt(diaEl.textContent.trim());
                if (isNaN(diaNum)) return;
                
                // Extraer mes y año actual del calendario
                const mesActualEl = document.getElementById('mes-actual');
                let mesActual = new Date().getMonth();
                let anioActual = new Date().getFullYear();
                
                if (mesActualEl) {
                    const textoMes = mesActualEl.textContent;
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const partesMes = textoMes.split(' ');
                    
                    if (partesMes.length >= 2) {
                        mesActual = meses.indexOf(partesMes[0]);
                        anioActual = parseInt(partesMes[1]);
                    }
                }
                
                // Fecha para este día
                const fechaDia = new Date(anioActual, mesActual, diaNum);
                
                // Verificar si hay eventos para este día
                const eventosDia = eventos.filter(e => {
                    const fechaEvento = new Date(e.fechaInicio);
                    return fechaEvento.getDate() === diaNum && 
                           fechaEvento.getMonth() === mesActual && 
                           fechaEvento.getFullYear() === anioActual;
                });
                
                if (eventosDia.length > 0) {
                    // Marcar día con eventos
                    diaEl.classList.add('con-evento');
                    diaEl.setAttribute('data-eventos', eventosDia.length);
                    
                    // Agregar puntos de indicación
                    const puntosContainer = document.createElement('div');
                    puntosContainer.className = 'evento-puntos';
                    puntosContainer.style.display = 'flex';
                    puntosContainer.style.justifyContent = 'center';
                    puntosContainer.style.gap = '3px';
                    puntosContainer.style.marginTop = '3px';
                    
                    // Crear puntos para categorías (máximo 3)
                    const categorias = new Set(eventosDia.map(e => e.categoria));
                    const categoriasArray = Array.from(categorias).slice(0, 3);
                    
                    categoriasArray.forEach(cat => {
                        const punto = document.createElement('span');
                        punto.style.width = '6px';
                        punto.style.height = '6px';
                        punto.style.borderRadius = '50%';
                        
                        // Color según categoría
                        if (cat === 'curso') punto.style.backgroundColor = '#0072CE';
                        else if (cat === 'taller') punto.style.backgroundColor = '#FF5800';
                        else if (cat === 'grupo') punto.style.backgroundColor = '#9C27B0';
                        else if (cat === 'activacion') punto.style.backgroundColor = '#009688';
                        else punto.style.backgroundColor = '#666666';
                        
                        puntosContainer.appendChild(punto);
                    });
                    
                    diaEl.appendChild(puntosContainer);
                    
                    // Agregar evento click
                    diaEl.addEventListener('click', () => {
                        mostrarEventosDia(eventosDia, fechaDia);
                    });
                }
            });
        }, 500); // Pequeño retraso para asegurar que el calendario esté generado
    }
    
    // Mostrar eventos de un día específico
    function mostrarEventosDia(eventos, fecha) {
        if (!eventos || eventos.length === 0) return;
        
        // Formatear fecha para mostrar
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
        
        // Actualizar lista de eventos
        const listaEventos = document.getElementById('lista-eventos');
        if (!listaEventos) return;
        
        // Limpiar lista
        listaEventos.innerHTML = '';
        
        // Actualizar título
        const tituloEventos = document.getElementById('eventos-titulo');
        if (tituloEventos) {
            tituloEventos.textContent = `Eventos para ${fechaFormateada}`;
        }
        
        // Actualizar contador
        actualizarContador(eventos.length);
        
        // Crear tarjetas para cada evento
        eventos.forEach(evento => {
            const tarjeta = document.createElement('article');
            tarjeta.className = `evento ${evento.categoria}`;
            tarjeta.setAttribute('role', 'article');
            tarjeta.setAttribute('tabindex', '0');
            
            tarjeta.innerHTML = `
                <div class="evento-categoria" aria-hidden="true"></div>
                <h3 class="evento-titulo">${evento.titulo}</h3>
                <p class="evento-descripcion">${evento.descripcion}</p>
                <div class="evento-metadata">
                    <p class="evento-fecha">
                        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                        <span>${fechaFormateada}</span>
                    </p>
                    <p class="evento-horario">
                        <i class="fa-regular fa-clock" aria-hidden="true"></i>
                        <span>${evento.horario}</span>
                    </p>
                    <p class="evento-ubicacion">
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                        <span>${evento.ubicacion}</span>
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
            
            listaEventos.appendChild(tarjeta);
            
            // Agregar eventos a los botones
            const verDetallesBtn = tarjeta.querySelector('.ver-detalles');
            if (verDetallesBtn) {
                verDetallesBtn.addEventListener('click', () => {
                    mostrarModalEvento(evento);
                });
            }
        });
    }
    
    // Mostrar modal con detalles de un evento
    function mostrarModalEvento(evento) {
        const modal = document.getElementById('modal-evento');
        if (!modal) return;
        
        // Rellenar datos del modal
        const elementos = {
            titulo: document.getElementById('modal-titulo'),
            descripcion: document.getElementById('modal-descripcion'),
            fecha: document.getElementById('modal-fecha'),
            horario: document.getElementById('modal-horario'),
            ubicacion: document.getElementById('modal-ubicacion'),
            modalidad: document.getElementById('modal-modalidad'),
            facilidades: document.getElementById('modal-facilidades'),
            cupo: document.getElementById('modal-cupo')
        };
        
        // Asignar valores
        if (elementos.titulo) elementos.titulo.textContent = evento.titulo;
        if (elementos.descripcion) elementos.descripcion.textContent = evento.descripcion;
        if (elementos.fecha) elementos.fecha.textContent = formatearFecha(evento.fechaInicio);
        if (elementos.horario) elementos.horario.textContent = evento.horario;
        if (elementos.ubicacion) elementos.ubicacion.textContent = evento.ubicacion;
        if (elementos.modalidad) elementos.modalidad.textContent = evento.modalidad;
        if (elementos.facilidades) elementos.facilidades.textContent = evento.facilidades;
        if (elementos.cupo) elementos.cupo.textContent = evento.estado === 'disponible' ? 'Cupos disponibles' : 'Cupos limitados';
        
        // Mostrar modal
        modal.style.display = 'block';
        modal.classList.add('visible');
        
        // Configurar cierre
        const cerrar = modal.querySelector('.close');
        if (cerrar) {
            cerrar.onclick = () => {
                modal.classList.remove('visible');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            };
        }
    }
    
    // Formatear fecha
    function formatearFecha(fecha) {
        try {
            const fechaObj = new Date(fecha);
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return fechaObj.toLocaleDateString('es-ES', opciones);
        } catch (e) {
            return fecha || 'Fecha no disponible';
        }
    }
    
    // 4. FUNCIONES DE UI
    
    // Mostrar/ocultar cargando
    function mostrarCargando(mostrar) {
        const spinner = document.getElementById('spinner-container');
        if (spinner) {
            spinner.style.display = mostrar ? 'flex' : 'none';
        }
    }
    
    // Mostrar error
    function mostrarError(mensaje) {
        console.error(mensaje);
        
        // Mostrar toast si está disponible
        if (typeof UIService !== 'undefined' && UIService.mostrarToast) {
            UIService.mostrarToast(mensaje, 'error');
        } else {
            // Crear un toast básico
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.background = '#F44336';
            toast.style.color = 'white';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '4px';
            toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            toast.style.zIndex = '1000';
            toast.textContent = mensaje;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s';
                setTimeout(() => toast.remove(), 500);
            }, 4000);
        }
        
        // También mostrar en la interfaz
        const listaEventos = document.getElementById('lista-eventos');
        if (listaEventos) {
            listaEventos.innerHTML = `
                <div class="mensaje-vacio">
                    <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: #F44336;"></i>
                    <p>${mensaje}</p>
                </div>
            `;
        }
    }
    
    // Mostrar notificación
    function mostrarNotificacion(mensaje) {
        // Usar el servicio de UI si existe
        if (typeof UIService !== 'undefined' && UIService.mostrarToast) {
            UIService.mostrarToast(mensaje, 'success');
        } else {
            // Crear un toast básico
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.background = '#4CAF50';
            toast.style.color = 'white';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '4px';
            toast.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            toast.style.zIndex = '1000';
            toast.textContent = mensaje;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s';
                setTimeout(() => toast.remove(), 500);
            }, 4000);
        }
    }
    
    // 5. INICIAR LA CARGA DE EVENTOS
    cargarEventos();
});
