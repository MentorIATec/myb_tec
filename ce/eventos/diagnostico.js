/**
 * SCRIPT DE DIAGNÓSTICO PARA VISUALIZADOR DE EVENTOS
 * Este script ayuda a identificar problemas con la carga de eventos
 */

// Función autoejecutada para evitar conflictos
(function() {
    console.log("🔍 DIAGNÓSTICO: Iniciando análisis del visualizador de eventos");
    
    // 1. Verificar que el documento está cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarDiagnostico);
    } else {
        iniciarDiagnostico();
    }
    
    // Función principal de diagnóstico
    function iniciarDiagnostico() {
        console.log("🔍 DIAGNÓSTICO: Documento cargado, iniciando verificaciones");
        
        // Agregar interfaz de diagnóstico
        agregarInterfazDiagnostico();
        
        // Verificar estructura HTML
        verificarEstructuraHTML();
        
        // Intentar cargar eventos
        cargarEventosJSON();
    }
    
    // Agregar interfaz de diagnóstico
    function agregarInterfazDiagnostico() {
        const diagContainer = document.createElement('div');
        diagContainer.id = 'diagnostico-container';
        diagContainer.style.position = 'fixed';
        diagContainer.style.top = '10px';
        diagContainer.style.right = '10px';
        diagContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        diagContainer.style.color = 'white';
        diagContainer.style.padding = '15px';
        diagContainer.style.borderRadius = '5px';
        diagContainer.style.zIndex = '10000';
        diagContainer.style.maxWidth = '400px';
        diagContainer.style.maxHeight = '80vh';
        diagContainer.style.overflow = 'auto';
        diagContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        diagContainer.style.fontSize = '14px';
        diagContainer.style.fontFamily = 'monospace';
        
        diagContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 16px;">🔍 Diagnóstico - Cargador de Eventos</h3>
                <button id="cerrar-diagnostico" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
            </div>
            <div id="diagnostico-resultados">
                <p>Iniciando diagnóstico...</p>
            </div>
            <div style="margin-top: 10px;">
                <button id="cargar-eventos-manual" style="background: #0072CE; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Cargar eventos manualmente</button>
                <button id="mostrar-eventos-json" style="background: #333; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-left: 5px;">Ver JSON</button>
            </div>
        `;
        
        document.body.appendChild(diagContainer);
        
        // Configurar eventos
        document.getElementById('cerrar-diagnostico').addEventListener('click', function() {
            document.getElementById('diagnostico-container').style.display = 'none';
        });
        
        document.getElementById('cargar-eventos-manual').addEventListener('click', function() {
            cargarEventosJSON(true);
        });
        
        document.getElementById('mostrar-eventos-json').addEventListener('click', function() {
            mostrarEventosJSON();
        });
    }
    
    // Agregar mensaje al diagnóstico
    function agregarMensaje(mensaje, tipo = 'info') {
        const resultados = document.getElementById('diagnostico-resultados');
        if (!resultados) return;
        
        const tipoClase = tipo === 'error' ? 'color: #ff5252' : 
                         tipo === 'success' ? 'color: #4caf50' : 
                         tipo === 'warning' ? 'color: #ffc107' : 'color: #8bc34a';
        
        const icono = tipo === 'error' ? '❌' : 
                    tipo === 'success' ? '✅' : 
                    tipo === 'warning' ? '⚠️' : 'ℹ️';
        
        resultados.innerHTML += `<p style="${tipoClase}">${icono} ${mensaje}</p>`;
        resultados.scrollTop = resultados.scrollHeight;
        
        console.log(`DIAGNÓSTICO [${tipo}]: ${mensaje}`);
    }
    
    // Verificar estructura HTML
    function verificarEstructuraHTML() {
        agregarMensaje("Verificando estructura HTML...");
        
        // Verificar elementos críticos
        const elementos = [
            { id: 'calendario-mes', nombre: 'Contenedor del calendario' },
            { id: 'lista-eventos', nombre: 'Lista de eventos' },
            { id: 'contador-eventos', nombre: 'Contador de eventos' },
            { id: 'eventos-titulo', nombre: 'Título de eventos' }
        ];
        
        let todosPresentes = true;
        
        elementos.forEach(elemento => {
            const el = document.getElementById(elemento.id);
            if (el) {
                agregarMensaje(`Elemento "${elemento.nombre}" (${elemento.id}) encontrado correctamente`);
            } else {
                agregarMensaje(`Elemento "${elemento.nombre}" (${elemento.id}) NO ENCONTRADO`, 'error');
                todosPresentes = false;
            }
        });
        
        if (todosPresentes) {
            agregarMensaje("Estructura HTML completa y correcta", 'success');
        } else {
            agregarMensaje("Estructura HTML incompleta o incorrecta", 'warning');
        }
    }
    
    // Cargar eventos desde JSON
    async function cargarEventosJSON(mostrarAlerta = false) {
        agregarMensaje("Intentando cargar eventos desde JSON...");
        
        if (mostrarAlerta) {
            agregarMensaje("Carga iniciada manualmente", 'info');
        }
        
        try {
            // Intentar con la URL correcta
            const urls = [
                'https://karenguzmn.github.io/myb_tec/ce/eventos.json',
                'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json'
            ];
            
            let respuestaExitosa = null;
            let eventosCargados = [];
            
            for (const url of urls) {
                try {
                    agregarMensaje(`Intentando URL: ${url}`, 'info');
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        cache: 'no-store'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        agregarMensaje(`✅ Carga exitosa desde: ${url}`, 'success');
                        agregarMensaje(`Tipo de respuesta: ${typeof data}`, 'info');
                        
                        // Verificar estructura
                        if (data && typeof data === 'object') {
                            if (Array.isArray(data)) {
                                agregarMensaje(`La respuesta es un array con ${data.length} elementos`, 'info');
                                eventosCargados = data;
                            } else if (data.eventos && Array.isArray(data.eventos)) {
                                agregarMensaje(`La respuesta contiene un array "eventos" con ${data.eventos.length} elementos`, 'success');
                                eventosCargados = data.eventos;
                            } else {
                                agregarMensaje("La respuesta no contiene un array de eventos", 'warning');
                                console.log("Estructura de datos recibida:", data);
                            }
                        } else {
                            agregarMensaje("La respuesta no es un objeto JSON válido", 'error');
                        }
                        
                        respuestaExitosa = data;
                        break;
                    } else {
                        agregarMensaje(`Error HTTP ${response.status} al cargar desde ${url}`, 'error');
                    }
                } catch (error) {
                    agregarMensaje(`Error al procesar ${url}: ${error.message}`, 'error');
                }
            }
            
            if (respuestaExitosa) {
                // Si se cargaron eventos, intentar mostrarlos en el calendario
                agregarMensaje(`Total de eventos cargados: ${eventosCargados.length}`, 'success');
                
                // Guardar eventos para acceso posterior
                window.eventosDiagnostico = eventosCargados;
                
                if (eventosCargados.length > 0) {
                    agregarMensaje("Primer evento:", 'info');
                    console.log("Primer evento:", eventosCargados[0]);
                    
                    // Mostrar información del primer evento
                    const primerEvento = eventosCargados[0];
                    const infoEvento = `
                        Título: ${primerEvento.titulo || primerEvento.Título || 'N/A'}
                        Fecha: ${primerEvento.fechaInicio || primerEvento['Fecha Inicio'] || 'N/A'}
                        Categoría: ${primerEvento.categoria || primerEvento.Categoría || 'N/A'}
                    `;
                    agregarMensaje(infoEvento, 'info');
                    
                    // Actualizar contador de eventos
                    actualizarContador(eventosCargados.length);
                    
                    // Intentar actualizar calendario
                    agregarMensaje("Intentando actualizar el calendario y eventos...", 'info');
                    
                    try {
                        visualizarEventos(eventosCargados);
                        agregarMensaje("Visualización de eventos completada", 'success');
                    } catch (error) {
                        agregarMensaje(`Error al visualizar eventos: ${error.message}`, 'error');
                        console.error("Error al visualizar eventos:", error);
                    }
                }
            } else {
                agregarMensaje("No se pudo cargar el JSON de eventos desde ninguna URL", 'error');
                
                // Intentar cargar algunos eventos de muestra para diagnóstico
                agregarMensaje("Cargando eventos de muestra para diagnóstico...", 'warning');
                const eventosMuestra = cargarEventosMuestra();
                visualizarEventos(eventosMuestra);
            }
        } catch (error) {
            agregarMensaje(`Error general al cargar eventos: ${error.message}`, 'error');
            console.error("Error completo:", error);
        }
    }
    
    // Cargar eventos de muestra
    function cargarEventosMuestra() {
        const hoy = new Date();
        const manana = new Date();
        manana.setDate(hoy.getDate() + 1);
        
        const formatoFecha = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };
        
        const eventos = [
            {
                id: 1,
                titulo: "Evento de Muestra 1",
                descripcion: "Este es un evento de muestra para diagnóstico",
                fechaInicio: formatoFecha(hoy),
                fechaFin: formatoFecha(hoy),
                horario: "10:00 - 12:00",
                ubicacion: "Sala virtual",
                categoria: "curso"
            },
            {
                id: 2,
                titulo: "Evento de Muestra 2",
                descripcion: "Otro evento de muestra para diagnóstico",
                fechaInicio: formatoFecha(manana),
                fechaFin: formatoFecha(manana),
                horario: "15:00 - 16:30",
                ubicacion: "Edificio principal",
                categoria: "taller"
            }
        ];
        
        agregarMensaje(`Creados ${eventos.length} eventos de muestra`, 'success');
        return eventos;
    }
    
    // Actualizar contador de eventos
    function actualizarContador(cantidad) {
        const contadorEl = document.getElementById('contador-eventos');
        if (contadorEl) {
            contadorEl.textContent = `Eventos encontrados: ${cantidad}`;
            contadorEl.style.fontWeight = 'bold';
            contadorEl.style.color = '#0072CE';
            agregarMensaje(`Contador actualizado: ${cantidad} eventos`, 'info');
        } else {
            agregarMensaje("No se pudo actualizar el contador de eventos", 'error');
        }
    }
    
    // Visualizar eventos en el calendario y lista
    function visualizarEventos(eventos) {
        agregarMensaje("Iniciando visualización de eventos...");
        
        // 1. Actualizar título de eventos
        const tituloEventos = document.getElementById('eventos-titulo');
        if (tituloEventos) {
            tituloEventos.textContent = "Eventos disponibles en el calendario";
            agregarMensaje("Título de eventos actualizado", 'info');
        }
        
        // 2. Limpiar lista de eventos y mostrar instrucción
        const listaEventos = document.getElementById('lista-eventos');
        if (listaEventos) {
            // Crear un estilo para las tarjetas
            const estilo = document.createElement('style');
            estilo.textContent = `
                .diag-evento {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-left: 4px solid #0072CE;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .diag-evento h3 {
                    margin-top: 0;
                    color: #0072CE;
                }
                .diag-evento p {
                    margin: 5px 0;
                }
                .diag-evento .meta {
                    display: flex;
                    gap: 15px;
                    margin-top: 10px;
                    font-size: 0.9em;
                    color: #666;
                }
                .diag-taller { border-left-color: #FF5800; }
                .diag-taller h3 { color: #FF5800; }
                .diag-grupo { border-left-color: #9C27B0; }
                .diag-grupo h3 { color: #9C27B0; }
                .diag-activacion { border-left-color: #009688; }
                .diag-activacion h3 { color: #009688; }
            `;
            document.head.appendChild(estilo);
            
            // Limpiar lista
            listaEventos.innerHTML = '';
            
            // Mostrar eventos (solo para diagnóstico)
            eventos.slice(0, 3).forEach(evento => {
                const eventoEl = document.createElement('div');
                eventoEl.className = `diag-evento diag-${evento.categoria || 'otro'}`;
                
                eventoEl.innerHTML = `
                    <h3>${evento.titulo || evento.Título || 'Sin título'}</h3>
                    <p>${evento.descripcion || evento.Descripción || 'Sin descripción'}</p>
                    <div class="meta">
                        <span>📅 ${evento.fechaInicio || evento['Fecha Inicio'] || 'Fecha no especificada'}</span>
                        <span>⏰ ${evento.horario || evento.Horario || 'Horario no especificado'}</span>
                    </div>
                `;
                
                listaEventos.appendChild(eventoEl);
            });
            
            if (eventos.length > 3) {
                const masEventos = document.createElement('p');
                masEventos.style.textAlign = 'center';
                masEventos.style.padding = '10px';
                masEventos.style.backgroundColor = '#f0f0f0';
                masEventos.style.borderRadius = '4px';
                masEventos.textContent = `... y ${eventos.length - 3} eventos más`;
                listaEventos.appendChild(masEventos);
            }
            
            agregarMensaje("Lista de eventos actualizada con visualización de diagnóstico", 'success');
        } else {
            agregarMensaje("No se encontró el contenedor de lista de eventos", 'error');
        }
        
        // 3. Intentar marcar días en el calendario
        const diasCalendario = document.querySelectorAll('#calendario-mes .dia:not(.vacio)');
        if (diasCalendario.length > 0) {
            agregarMensaje(`Encontrados ${diasCalendario.length} días en el calendario`, 'info');
            
            // Obtener mes y año actuales
            let mesActual = new Date().getMonth();
            let anioActual = new Date().getFullYear();
            
            const mesActualEl = document.getElementById('mes-actual');
            if (mesActualEl) {
                const textoMes = mesActualEl.textContent;
                agregarMensaje(`Texto del mes actual: "${textoMes}"`, 'info');
                
                // Intentar extraer mes y año
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const partesMes = textoMes.split(' ');
                
                if (partesMes.length >= 2) {
                    const mesTexto = partesMes[0];
                    const anioTexto = partesMes[1];
                    
                    mesActual = meses.indexOf(mesTexto);
                    anioActual = parseInt(anioTexto);
                    
                    agregarMensaje(`Mes extraído: ${mesTexto} (${mesActual}), Año: ${anioActual}`, 'info');
                }
            }
            
            // Marcar días con eventos
            let diasMarcados = 0;
            
            diasCalendario.forEach(diaEl => {
                const contenido = diaEl.textContent.trim();
                const numeroDia = parseInt(contenido);
                
                if (!isNaN(numeroDia)) {
                    // Verificar si hay eventos para este día
                    const eventosDelDia = eventos.filter(evento => {
                        const fechaEvento = new Date(evento.fechaInicio || evento['Fecha Inicio']);
                        return fechaEvento.getDate() === numeroDia && 
                               fechaEvento.getMonth() === mesActual && 
                               fechaEvento.getFullYear() === anioActual;
                    });
                    
                    if (eventosDelDia.length > 0) {
                        diaEl.style.backgroundColor = 'rgba(0, 114, 206, 0.1)';
                        diaEl.style.border = '2px solid #0072CE';
                        diaEl.style.fontWeight = 'bold';
                        diaEl.title = `${eventosDelDia.length} eventos`;
                        
                        // Agregar marcador de eventos
                        const marcador = document.createElement('div');
                        marcador.style.width = '100%';
                        marcador.style.display = 'flex';
                        marcador.style.justifyContent = 'center';
                        marcador.style.gap = '3px';
                        marcador.style.marginTop = '3px';
                        
                        for (let i = 0; i < Math.min(eventosDelDia.length, 3); i++) {
                            const punto = document.createElement('span');
                            punto.style.width = '6px';
                            punto.style.height = '6px';
                            punto.style.borderRadius = '50%';
                            punto.style.backgroundColor = '#0072CE';
                            marcador.appendChild(punto);
                        }
                        
                        diaEl.appendChild(marcador);
                        
                        // Hacer clic en el día para ver eventos
                        diaEl.addEventListener('click', function() {
                            mostrarEventosDia(eventosDelDia, numeroDia, mesActual, anioActual);
                        });
                        
                        diasMarcados++;
                    }
                }
            });
            
            agregarMensaje(`Se marcaron ${diasMarcados} días con eventos en el calendario`, 'success');
        } else {
            agregarMensaje("No se encontraron días en el calendario", 'error');
        }
    }
    
    // Mostrar eventos de un día específico
    function mostrarEventosDia(eventosDelDia, dia, mes, anio) {
        agregarMensaje(`Mostrando ${eventosDelDia.length} eventos para el día ${dia}/${mes+1}/${anio}`, 'info');
        
        const fecha = new Date(anio, mes, dia);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Actualizar título
        const tituloEventos = document.getElementById('eventos-titulo');
        if (tituloEventos) {
            tituloEventos.textContent = `Eventos para ${fechaFormateada}`;
        }
        
        // Mostrar eventos del día
        const listaEventos = document.getElementById('lista-eventos');
        if (listaEventos) {
            listaEventos.innerHTML = '';
            
            eventosDelDia.forEach(evento => {
                const eventoEl = document.createElement('article');
                eventoEl.className = `evento ${evento.categoria || 'otro'}`;
                
                const titulo = evento.titulo || evento.Título || 'Sin título';
                const descripcion = evento.descripcion || evento.Descripción || 'Sin descripción';
                const horario = evento.horario || evento.Horario || 'Horario no especificado';
                const ubicacion = evento.ubicacion || evento.ubicación || evento.Ubicación || 'Ubicación no especificada';
                
                eventoEl.innerHTML = `
                    <div class="evento-categoria" aria-hidden="true"></div>
                    <h3 class="evento-titulo">${titulo}</h3>
                    <p class="evento-descripcion">${descripcion}</p>
                    <div class="evento-metadata">
                        <p class="evento-fecha">
                            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
                            <span>${fechaFormateada}</span>
                        </p>
                        <p class="evento-horario">
                            <i class="fa-regular fa-clock" aria-hidden="true"></i>
                            <span>${horario}</span>
                        </p>
                        <p class="evento-ubicacion">
                            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                            <span>${ubicacion}</span>
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
                
                listaEventos.appendChild(eventoEl);
            });
            
            agregarMensaje("Eventos del día mostrados correctamente", 'success');
        } else {
            agregarMensaje("No se encontró el contenedor de lista de eventos", 'error');
        }
    }
    
    // Mostrar JSON de eventos
    function mostrarEventosJSON() {
        const eventos = window.eventosDiagnostico;
        
        if (!eventos || eventos.length === 0) {
            agregarMensaje("No hay eventos cargados para mostrar", 'warning');
            return;
        }
        
        // Crear un modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '10001';
        
        // Contenido del modal
        modal.innerHTML = `
            <div style="background-color: #222; color: #f8f8f8; padding: 20px; border-radius: 5px; width: 80%; max-width: 800px; max-height: 80vh; overflow: auto;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <h3 style="margin: 0;">JSON de Eventos (${eventos.length})</h3>
                    <button id="cerrar-json" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">✕</button>
                </div>
                <pre style="white-space: pre-wrap; overflow: auto; padding: 10px; background-color: #333; border-radius: 3px;">${JSON.stringify(eventos, null, 2)}</pre>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal
        document.getElementById('cerrar-json').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
})();
