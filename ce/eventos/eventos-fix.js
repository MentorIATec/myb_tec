/**
 * Script de corrección para la carga de eventos de Consejería Emocional
 * Versión mejorada con manejo robusto de fechas y detección de funciones existentes
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Iniciando script de corrección para eventos");
    
    // Guardar la función original si existe
    if (typeof window.cargarEventos === 'function') {
        window.cargarEventosOriginal = window.cargarEventos;
    }
    
    // Reemplazar la función de carga de eventos
    window.cargarEventos = async function() {
        try {
            // Mostrar spinner si existe
            const spinner = document.getElementById('spinner-container');
            if (spinner) spinner.style.display = 'flex';
            
            console.log("Cargando eventos desde la URL correcta...");
            
            // URL verificada 
            const jsonUrl = 'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json';
            
            const response = await fetch(jsonUrl, {
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Datos JSON recibidos:", data);
            
            // Acceder a los eventos dentro de la propiedad "eventos"
            if (data.eventos && Array.isArray(data.eventos)) {
                // Crear una variable global eventos si no existe
                if (typeof window.eventos === 'undefined') {
                    window.eventos = [];
                }
                
                // Procesar los eventos y asignarlos a la variable global
                window.eventos = data.eventos.map(evento => {
                    // Guardar formato original para referencia
                    evento.fechaInicio_original = evento.fechaInicio;
                    evento.fechaFin_original = evento.fechaFin;
                    
                    // Convertir DD/MM/YYYY a YYYY-MM-DD para JavaScript
                    // Manejar tanto el formato con barras invertidas como normales
                    let fechaInicio = evento.fechaInicio.replace(/\\/g, '/');
                    let fechaFin = evento.fechaFin.replace(/\\/g, '/');
                    
                    if (fechaInicio && fechaInicio.includes('/')) {
                        const partes = fechaInicio.split('/');
                        if (partes.length === 3) {
                            // Asumimos formato DD/MM/YYYY
                            const [dia, mes, anio] = partes;
                            evento.fechaInicio = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                        }
                    }
                    
                    if (fechaFin && fechaFin.includes('/')) {
                        const partes = fechaFin.split('/');
                        if (partes.length === 3) {
                            // Asumimos formato DD/MM/YYYY
                            const [dia, mes, anio] = partes;
                            evento.fechaFin = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                        }
                    }
                    
                    // Normalizar categoría a minúsculas para consistencia en filtrado
                    if (evento.categoria) {
                        evento.categoria_original = evento.categoria;
                        evento.categoria = evento.categoria.toLowerCase();
                    }
                    
                    return evento;
                });
                
                console.log(`${window.eventos.length} eventos procesados correctamente.`);
                
                // Actualizar la UI usando las funciones que existan en el script principal
                if (typeof window.generarCalendario === 'function') {
                    const hoy = new Date();
                    window.generarCalendario(hoy.getMonth(), hoy.getFullYear());
                    console.log("Calendario regenerado.");
                } else {
                    console.warn("Función generarCalendario no encontrada.");
                }
                
                if (typeof window.mostrarEventosFiltrados === 'function') {
                    window.mostrarEventosFiltrados();
                    console.log("Eventos filtrados mostrados.");
                } else if (typeof window.mostrarEventos === 'function') {
                    window.mostrarEventos();
                    console.log("Eventos mostrados (usando mostrarEventos).");
                } else {
                    console.warn("Función para mostrar eventos no encontrada.");
                }
                
                return window.eventos;
            } else {
                console.error("Formato inesperado de JSON:", data);
                throw new Error("El formato del JSON no es el esperado. No se encontró la propiedad 'eventos' con un array de eventos.");
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            alert('Error al cargar eventos: ' + error.message);
            return [];
        } finally {
            const spinner = document.getElementById('spinner-container');
            if (spinner) spinner.style.display = 'none';
        }
    };
    
    // Asegurarnos de que las funciones básicas existan
    if (typeof window.mostrarSpinner !== 'function') {
        window.mostrarSpinner = function() {
            const spinner = document.getElementById('spinner-container');
            if (spinner) spinner.style.display = 'flex';
        };
    }
    
    if (typeof window.ocultarSpinner !== 'function') {
        window.ocultarSpinner = function() {
            const spinner = document.getElementById('spinner-container');
            if (spinner) spinner.style.display = 'none';
        };
    }
    
    // Función mejorada para depuración
    window.depurarEventos = function() {
        console.log("=== INFORMACIÓN DE DEPURACIÓN ===");
        console.log("Número de eventos cargados:", window.eventos ? window.eventos.length : 0);
        
        if (window.eventos && window.eventos.length > 0) {
            console.log("Primer evento:", window.eventos[0]);
            console.log("Formato de fecha del primer evento:", window.eventos[0].fechaInicio);
            
            // Verificar si hay eventos que deberían aparecer en el mes actual
            const hoy = new Date();
            let eventosDelMes = [];
            try {
                eventosDelMes = window.eventos.filter(evento => {
                    try {
                        const fechaEvento = new Date(evento.fechaInicio);
                        return !isNaN(fechaEvento) && 
                               fechaEvento.getMonth() === hoy.getMonth() &&
                               fechaEvento.getFullYear() === hoy.getFullYear();
                    } catch (e) {
                        console.warn("Error al procesar fecha:", e, evento);
                        return false;
                    }
                });
            } catch (e) {
                console.error("Error al filtrar eventos del mes:", e);
            }
            
            console.log(`Eventos para el mes actual (${hoy.getMonth() + 1}/${hoy.getFullYear()}):`, 
                        eventosDelMes.length);
            console.log("Eventos del mes actual:", eventosDelMes);
        }
        
        // Verificar funciones críticas
        console.log("Funciones críticas:");
        console.log("- cargarEventos:", typeof window.cargarEventos === 'function');
        console.log("- generarCalendario:", typeof window.generarCalendario === 'function');
        console.log("- mostrarEventosFiltrados:", typeof window.mostrarEventosFiltrados === 'function');
        console.log("- mostrarEventos:", typeof window.mostrarEventos === 'function');
    };
    
    // Ejecutar la carga de eventos después de un pequeño retraso
    // para asegurar que todos los otros scripts se han cargado
    setTimeout(() => {
        try {
            window.cargarEventos();
            console.log("Carga inicial de eventos ejecutada.");
        } catch (e) {
            console.error("Error en la carga inicial de eventos:", e);
        }
    }, 800);  // Ampliamos el retraso a 800ms para asegurar que los otros scripts estén listos
});

// Agregar un botón de diagnóstico para ayudar a resolver problemas
setTimeout(() => {
    try {
        // Comprobar si el botón ya existe para evitar duplicados
        if (!document.getElementById('diagnostico-btn')) {
            const diagnosticoBtn = document.createElement('button');
            diagnosticoBtn.id = 'diagnostico-btn';
            diagnosticoBtn.textContent = 'Diagnosticar Problemas';
            diagnosticoBtn.style.position = 'fixed';
            diagnosticoBtn.style.bottom = '10px';
            diagnosticoBtn.style.right = '10px';
            diagnosticoBtn.style.zIndex = '9999';
            diagnosticoBtn.style.padding = '10px';
            diagnosticoBtn.style.backgroundColor = '#ff5722';
            diagnosticoBtn.style.color = 'white';
            diagnosticoBtn.style.border = 'none';
            diagnosticoBtn.style.borderRadius = '4px';
            diagnosticoBtn.style.cursor = 'pointer';
            
            diagnosticoBtn.addEventListener('click', function() {
                console.clear();
                console.log("=== DIAGNÓSTICO DE EVENTOS ===");
                console.log("1. Verificando estado de eventos...");
                
                if (!window.eventos || window.eventos.length === 0) {
                    console.error("No hay eventos cargados en la variable global 'eventos'");
                    try {
                        window.cargarEventos(); // Intentar cargar de nuevo
                    } catch (e) {
                        console.error("Error al intentar recargar eventos:", e);
                    }
                } else {
                    console.log(`Hay ${window.eventos.length} eventos cargados.`);
                    console.log("Primer evento:", window.eventos[0]);
                    
                    // Verificar si las fechas se procesaron correctamente
                    try {
                        const primerEvento = window.eventos[0];
                        const fechaInicio = new Date(primerEvento.fechaInicio);
                        console.log("Fecha de inicio procesada:", fechaInicio);
                        console.log("¿Es una fecha válida?", !isNaN(fechaInicio));
                        console.log("Componentes de fecha:", {
                            año: fechaInicio.getFullYear(),
                            mes: fechaInicio.getMonth() + 1,
                            día: fechaInicio.getDate()
                        });
                    } catch (e) {
                        console.error("Error al procesar fecha del primer evento:", e);
                    }
                }
                
                console.log("2. Verificando funciones críticas...");
                console.log("- cargarEventos existe:", typeof window.cargarEventos === 'function');
                console.log("- generarCalendario existe:", typeof window.generarCalendario === 'function');
                console.log("- mostrarEventosFiltrados existe:", typeof window.mostrarEventosFiltrados === 'function');
                console.log("- mostrarEventos existe:", typeof window.mostrarEventos === 'function');
                
                console.log("3. Estado actual del DOM:");
                console.log("- Calendario:", document.getElementById('calendario-mes'));
                console.log("- Lista de eventos:", document.getElementById('lista-eventos'));
                
                // Intentar recargar la UI
                console.log("4. Intentando recargar la interfaz...");
                try {
                    if (typeof window.generarCalendario === 'function') {
                        const hoy = new Date();
                        window.generarCalendario(hoy.getMonth(), hoy.getFullYear());
                        console.log("Calendario regenerado.");
                    }
                    
                    if (typeof window.mostrarEventosFiltrados === 'function') {
                        window.mostrarEventosFiltrados();
                        console.log("Eventos filtrados mostrados.");
                    } else if (typeof window.mostrarEventos === 'function') {
                        window.mostrarEventos();
                        console.log("Eventos mostrados (usando mostrarEventos).");
                    }
                    
                    console.log("Recarga UI completa.");
                } catch (e) {
                    console.error("Error al recargar la interfaz:", e);
                }
                
                // Verificar si hay elementos en el calendario y en la lista de eventos
                const calendario = document.getElementById('calendario-mes');
                const listaEventos = document.getElementById('lista-eventos');
                
                if (calendario) {
                    console.log("Contenido del calendario:", calendario.innerHTML.substring(0, 200) + "...");
                }
                
                if (listaEventos) {
                    console.log("Contenido de la lista de eventos:", listaEventos.innerHTML.substring(0, 200) + "...");
                }
            });
            
            document.body.appendChild(diagnosticoBtn);
            console.log("Botón de diagnóstico agregado al DOM.");
        }
    } catch (e) {
        console.error("Error al crear botón de diagnóstico:", e);
    }
}, 2500);  // Esperar más tiempo para asegurarnos de que el DOM está completamente cargado
