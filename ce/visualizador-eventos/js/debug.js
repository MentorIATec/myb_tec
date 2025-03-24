/**
 * Script de diagnóstico para encontrar problemas en el visualizador de eventos
 * Agregar este script al final del HTML para detectar problemas específicos
 */

console.log('🔍 Iniciando diagnóstico del visualizador de eventos...');

// Verificar carga de CSS
function verificarCSS() {
    console.log('Verificando hojas de estilo cargadas:');
    const hojasEstilo = document.styleSheets;
    let estilosEncontrados = false;
    
    for (let i = 0; i < hojasEstilo.length; i++) {
        try {
            const hoja = hojasEstilo[i];
            const href = hoja.href || 'Estilo en línea';
            console.log(`   ✓ Cargada: ${href}`);
            estilosEncontrados = true;
            
            // Intentar acceder a las reglas para verificar si hay errores de CORS
            try {
                const reglas = hoja.cssRules || hoja.rules;
                console.log(`      ✓ Reglas accesibles: ${reglas.length} reglas`);
            } catch (e) {
                console.log(`      ✗ Error CORS - No se pueden leer reglas: ${e.message}`);
            }
        } catch (e) {
            console.error(`Error al verificar hoja de estilo ${i}: ${e.message}`);
        }
    }
    
    if (!estilosEncontrados) {
        console.warn('❌ No se encontraron hojas de estilo cargadas!');
    }
    
    // Verificar específicamente los archivos CSS principales
    verificarArchivo('css/styles.css', 'Estilos principales');
    verificarArchivo('css/themes.css', 'Temas');
    verificarArchivo('css/responsive.css', 'Estilos responsivos');
}

// Verificar carga de JS
function verificarJS() {
    console.log('Verificando scripts cargados:');
    const scripts = document.scripts;
    let scriptsEncontrados = false;
    
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src || 'Script en línea';
        console.log(`   ✓ Cargado: ${src}`);
        scriptsEncontrados = true;
    }
    
    if (!scriptsEncontrados) {
        console.warn('❌ No se encontraron scripts cargados!');
    }
    
    // Verificar específicamente los archivos JS principales
    verificarArchivo('js/utils.js', 'Utilidades');
    verificarArchivo('js/events.js', 'Gestor de eventos');
    verificarArchivo('js/calendar.js', 'Calendario');
    verificarArchivo('js/ui.js', 'Interfaz de usuario');
    verificarArchivo('js/ui-fixed.js', 'Interfaz de usuario (arreglada)');
    verificarArchivo('js/main.js', 'Script principal');
}

// Verificar disponibilidad de un archivo
function verificarArchivo(ruta, nombre) {
    fetch(ruta)
        .then(response => {
            if (response.ok) {
                console.log(`✓ El archivo ${nombre} (${ruta}) está accesible`);
            } else {
                console.error(`❌ Error al cargar ${nombre} (${ruta}): ${response.status} ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error(`❌ Error al verificar ${nombre} (${ruta}): ${error.message}`);
        });
}

// Verificar objetos globales
function verificarGlobales() {
    console.log('Verificando objetos globales:');
    
    const globales = [
        { nombre: 'Utils', descripcion: 'Utilidades' },
        { nombre: 'EventosManager', descripcion: 'Gestor de eventos' },
        { nombre: 'CalendarioManager', descripcion: 'Gestor del calendario' },
        { nombre: 'UIController', descripcion: 'Controlador de UI' }
    ];
    
    globales.forEach(g => {
        if (window[g.nombre]) {
            console.log(`✓ ${g.descripcion} (${g.nombre}) está definido`);
            
            // Verificar métodos críticos
            if (g.nombre === 'EventosManager') {
                if (typeof EventosManager.cargarEventos === 'function') {
                    console.log(`   ✓ EventosManager.cargarEventos existe`);
                } else {
                    console.warn(`   ❌ EventosManager.cargarEventos no existe o no es una función`);
                }
                
                if (EventosManager.eventos) {
                    console.log(`   ✓ EventosManager.eventos existe con ${EventosManager.eventos.length} eventos`);
                } else {
                    console.warn(`   ❌ EventosManager.eventos no existe o está vacío`);
                }
            }
            
            if (g.nombre === 'UIController') {
                if (typeof UIController.mostrarEventosDia === 'function') {
                    console.log(`   ✓ UIController.mostrarEventosDia existe`);
                } else {
                    console.warn(`   ❌ UIController.mostrarEventosDia no existe o no es una función`);
                }
                
                if (UIController.elementos) {
                    console.log(`   ✓ UIController.elementos está definido`);
                } else {
                    console.warn(`   ❌ UIController.elementos no existe o es null`);
                }
            }
        } else {
            console.error(`❌ ${g.descripcion} (${g.nombre}) no está definido`);
        }
    });
}

// Verificar carga de eventos JSON
function verificarCargaJSON() {
    console.log('Verificando acceso a JSON de eventos:');
    
    const urls = [
        'https://karenguzmn.github.io/myb_tec/ce/eventos.json',
        'https://karenguzmn.github.io/myb_tec/ce/eventos/eventos.json'
    ];
    
    urls.forEach(url => {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    console.log(`✓ URL de eventos accesible: ${url}`);
                    return response.json();
                } else {
                    console.error(`❌ Error al acceder a URL de eventos ${url}: ${response.status} ${response.statusText}`);
                    throw new Error(`HTTP error ${response.status}`);
                }
            })
            .then(data => {
                if (data && data.eventos && Array.isArray(data.eventos)) {
                    console.log(`   ✓ JSON válido con ${data.eventos.length} eventos`);
                    // Mostrar ejemplo del primer evento
                    if (data.eventos.length > 0) {
                        console.log(`   ✓ Primer evento: ${JSON.stringify(data.eventos[0], null, 2)}`);
                    }
                } else {
                    console.error(`   ❌ Estructura JSON inválida o sin eventos`);
                }
            })
            .catch(error => {
                console.error(`   ❌ Error al procesar JSON desde ${url}: ${error.message}`);
            });
    });
}

// Verificar elementos DOM críticos
function verificarDOM() {
    console.log('Verificando elementos DOM críticos:');
    
    const elementos = [
        { id: 'calendario-grid', descripcion: 'Contenedor del calendario' },
        { id: 'lista-eventos', descripcion: 'Lista de eventos' },
        { id: 'eventos-titulo', descripcion: 'Título de eventos' },
        { id: 'contador-eventos', descripcion: 'Contador de eventos' },
        { id: 'mes-anio', descripcion: 'Título del mes y año' }
    ];
    
    elementos.forEach(el => {
        const elemento = document.getElementById(el.id);
        if (elemento) {
            console.log(`✓ ${el.descripcion} (${el.id}) encontrado`);
        } else {
            console.error(`❌ ${el.descripcion} (${el.id}) no encontrado`);
        }
    });
}

// Función que repara problemas comunes
function reparar() {
    console.log('🔧 Intentando arreglar problemas comunes...');
    
    // 1. Verificar si el script de eventos está cargado y si no, cargar eventos
    if (typeof EventosManager !== 'undefined' && EventosManager.eventos.length === 0) {
        console.log('Intentando cargar eventos manualmente...');
        
        fetch('https://karenguzmn.github.io/myb_tec/ce/eventos.json')
            .then(response => response.json())
            .then(data => {
                if (data.eventos && Array.isArray(data.eventos)) {
                    console.log(`✓ Cargados ${data.eventos.length} eventos manualmente`);
                    
                    // Normalizar y almacenar eventos
                    EventosManager.eventos = EventosManager.normalizarEventos(data.eventos);
                    
                    // Actualizar UI
                    CalendarioManager.actualizarEventos();
                    
                    // Mostrar eventos del día actual si hay
                    const hoy = new Date();
                    const eventosHoy = EventosManager.obtenerEventosPorFecha(hoy);
                    if (eventosHoy.length > 0) {
                        UIController.mostrarEventosDia(hoy);
                    } else {
                        // Mostrar próximos eventos
                        const proximosEventos = EventosManager.obtenerProximosEventos();
                        if (proximosEventos.length > 0) {
                            console.log(`✓ Mostrando ${proximosEventos.length} eventos próximos`);
                            
                            if (UIController.elementos.eventosTitulo) {
                                UIController.elementos.eventosTitulo.textContent = 'Eventos próximos';
                            }
                            
                            if (UIController.elementos.contadorEventos) {
                                UIController.elementos.contadorEventos.textContent = `${proximosEventos.length} eventos`;
                            }
                            
                            if (UIController.elementos.listaEventos) {
                                UIController.elementos.listaEventos.innerHTML = '';
                                proximosEventos.forEach(evento => {
                                    UIController.crearTarjetaEvento(evento);
                                });
                            }
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error al reparar carga de eventos:', error);
            });
    }
    
    // 2. Verificar si hay problemas con UI inicialización
    if (typeof UIController !== 'undefined' && !UIController.elementos) {
        console.log('Inicializando referencias de UI manualmente...');
        
        try {
            // Inicializar elementos manualmente
            UIController.elementos = {
                listaEventos: document.getElementById('lista-eventos'),
                eventosTitulo: document.getElementById('eventos-titulo'),
                contadorEventos: document.getElementById('contador-eventos'),
                modal: document.getElementById('modal-evento'),
                modalTitulo: document.getElementById('modal-titulo'),
                modalSubtitulo: document.getElementById('modal-subtitulo'),
                modalInfo: document.getElementById('modal-info'),
                modalDescripcion: document.getElementById('modal-descripcion'),
                modalCerrar: document.getElementById('modal-cerrar'),
                modalAgregar: document.getElementById('modal-agregar'),
                modalCompartir: document.getElementById('modal-compartir'),
                btnHoy: document.getElementById('btn-hoy'),
                mesAnteriorBtn: document.getElementById('mes-anterior'),
                mesSiguienteBtn: document.getElementById('mes-siguiente')
            };
            
            console.log('✓ Referencias de UI inicializadas manualmente');
        } catch (e) {
            console.error('Error al inicializar referencias de UI:', e);
        }
    }
    
    // 3. Ajustar CSS crítico si hay problemas
    const estiloEmergencia = `
        .dia-celda { min-height: 80px; position: relative; }
        .numero-dia { position: absolute; top: 5px; right: 8px; }
        .con-eventos { background-color: rgba(49, 116, 173, 0.05); cursor: pointer; }
        .evento-mini { font-size: 0.7rem; margin-top: 20px; color: white; padding: 2px; border-radius: 2px; margin-bottom: 2px; }
        .evento-curso { background-color: #0072CE; }
        .evento-taller { background-color: #FF5800; }
        .evento-grupo { background-color: #9C27B0; }
        .evento-activacion { background-color: #009688; }
        .evento-item { margin-bottom: 10px; padding: 10px; border-radius: 5px; }
    `;
    
    // Insertar CSS de emergencia
    const estiloTag = document.createElement('style');
    estiloTag.textContent = estiloEmergencia;
    document.head.appendChild(estiloTag);
    console.log('✓ Estilos críticos de emergencia añadidos');
}

// Ejecutar diagnóstico
setTimeout(() => {
    verificarCSS();
    verificarJS();
    verificarGlobales();
    verificarCargaJSON();
    verificarDOM();
    
    // Esperar un momento y luego intentar reparar
    setTimeout(reparar, 1000);
}, 500);
