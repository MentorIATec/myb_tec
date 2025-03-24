// fix-events.js - Script de emergencia para solucionar problemas de carga de eventos
(function() {
    console.log("🔧 Iniciando diagnóstico y reparación de eventos");
    
    // Limpiar completamente localStorage al iniciar
    try {
        localStorage.clear();
        console.log("✅ Caché local limpiado correctamente");
    } catch (e) {
        console.error("❌ Error al limpiar caché:", e);
    }
    
    // Modificar cómo se cargan los eventos
    window.addEventListener('DOMContentLoaded', function() {
        // Esperar a que se carguen los scripts
        setTimeout(function() {
            if (typeof EventosManager === 'undefined') {
                console.error("❌ EventosManager no está disponible");
                mostrarErrorEmergencia();
                return;
            }
            
            // Sobrescribir la función cargarEventos con una versión más simple y directa
            EventosManager.cargarEventos = async function() {
                try {
                    console.log("🔄 Iniciando carga directa de eventos");
                    
                    // Siempre mostrar indicador de carga
                    if (typeof UIController !== 'undefined' && UIController.mostrarCargando) {
                        UIController.mostrarCargando();
                    }
                    
                    // Intentar cargar desde múltiples fuentes en orden
                    const urls = [
                        'ce/eventos.json',
                        'eventos.json',
                        'https://karenguzmn.github.io/myb_tec/ce/eventos.json',
                        'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json'
                    ];
                    
                    for (const url of urls) {
                        try {
                            console.log(`🔍 Intentando cargar desde: ${url}`);
                            const response = await fetch(url);
                            
                            if (!response.ok) {
                                console.warn(`⚠️ Error HTTP ${response.status} en ${url}`);
                                continue;
                            }
                            
                            const text = await response.text();
                            let data;
                            
                            try {
                                data = JSON.parse(text);
                            } catch (jsonError) {
                                console.error(`❌ Error al parsear JSON desde ${url}:`, jsonError);
                                console.log("Texto recibido:", text.substring(0, 100) + "...");
                                continue;
                            }
                            
                            if (data && data.eventos && Array.isArray(data.eventos)) {
                                this.eventos = this.normalizarEventos(data.eventos);
                                console.log(`✅ Cargados ${this.eventos.length} eventos desde ${url}`);
                                return this.eventos;
                            } else {
                                console.warn(`⚠️ Formato de datos incorrecto en ${url}`);
                            }
                        } catch (error) {
                            console.error(`❌ Error al cargar desde ${url}:`, error);
                        }
                    }
                    
                    // Si llegamos aquí, todos los intentos fallaron
                    throw new Error("No se pudieron cargar los eventos desde ninguna fuente");
                    
                } catch (error) {
                    console.error("🚨 Error fatal al cargar eventos:", error);
                    mostrarErrorEmergencia();
                    return [];
                }
            };
            
            // Recargar la aplicación con la nueva implementación
            console.log("🔄 Recargando aplicación con implementación de emergencia");
            if (typeof CalendarioManager !== 'undefined') {
                // Limpiar eventos cargados
                EventosManager.eventos = [];
                
                // Recargar eventos y actualizar UI
                EventosManager.cargarEventos().then(function() {
                    if (CalendarioManager.actualizarEventos) {
                        CalendarioManager.actualizarEventos();
                    }
                    if (CalendarioManager.irAHoy) {
                        CalendarioManager.irAHoy();
                    }
                });
            }
        }, 500); // Esperar 500ms para asegurar que los scripts se han cargado
    });
    
    // Función para mostrar error de emergencia
    function mostrarErrorEmergencia() {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '10px';
        errorDiv.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.maxWidth = '80%';
        errorDiv.style.textAlign = 'center';
        
        errorDiv.innerHTML = `
            <h3 style="margin-top:0;color:#f44336;">Error de carga</h3>
            <p>No se pudieron cargar los eventos correctamente.</p>
            <button style="background:#3174ad;color:white;border:none;padding:10px 15px;border-radius:5px;cursor:pointer;">
                Reintentar
            </button>
        `;
        
        document.body.appendChild(errorDiv);
        
        const button = errorDiv.querySelector('button');
        button.addEventListener('click', function() {
            location.reload();
        });
    }
    
    // Añadir un manejador de errores global
    window.addEventListener('error', function(event) {
        console.error("🚨 Error detectado:", event.error);
        
        // Solo intervenir para errores graves relacionados con los eventos
        if (event.error && (
            event.error.message.includes('eventos') || 
            event.error.message.includes('calendar') ||
            event.error.message.includes('undefined')
        )) {
            event.preventDefault(); // Prevenir comportamiento por defecto
            mostrarErrorEmergencia();
        }
    });
    
    // Añadir un botón de emergencia para refrescar siempre visible
    window.addEventListener('load', function() {
        const refreshButton = document.createElement('button');
        refreshButton.innerHTML = '🔄';
        refreshButton.title = 'Recargar eventos';
        refreshButton.style.position = 'fixed';
        refreshButton.style.bottom = '20px';
        refreshButton.style.right = '20px';
        refreshButton.style.width = '50px';
        refreshButton.style.height = '50px';
        refreshButton.style.borderRadius = '50%';
        refreshButton.style.backgroundColor = '#3174ad';
        refreshButton.style.color = 'white';
        refreshButton.style.border = 'none';
        refreshButton.style.fontSize = '20px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        refreshButton.style.zIndex = '999';
        
        refreshButton.addEventListener('click', function() {
            localStorage.clear();
            location.reload();
        });
        
        document.body.appendChild(refreshButton);
    });
})();
