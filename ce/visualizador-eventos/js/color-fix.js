// Solución radical para corregir colores en el visualizador de eventos
(function() {
    console.log("🎨 Iniciando corrección de colores...");
    
    // Mapeo directo de colores por categoría
    const coloresCategorias = {
        'curso': '#0072CE',
        'taller': '#FF5800',
        'grupo': '#9C27B0', 
        'activacion': '#009688',
        'otro': '#3174ad'
    };
    
    // Banderas para evitar procesamiento innecesario
    let procesandoColores = false;
    let leyendaActualizada = false;
    
    // Función para aplicar colores directamente
    function aplicarColoresATodo() {
        if (procesandoColores) return; // Evitar procesamiento simultáneo
        procesandoColores = true;
        
        console.log("Aplicando colores a todos los elementos...");
        
        // 1. Corregir mini-eventos en calendario
        document.querySelectorAll('[class*="evento-mini"]').forEach(el => {
            // Determinar la categoría
            let categoria = 'otro';
            for (let cat in coloresCategorias) {
                if (el.className.toLowerCase().includes(cat)) {
                    categoria = cat;
                    break;
                }
            }
            
            // Aplicar estilo
            el.style.setProperty('background-color', coloresCategorias[categoria], 'important');
            el.style.setProperty('color', 'white', 'important');
            el.style.setProperty('text-shadow', '0 1px 1px rgba(0,0,0,0.5)', 'important');
            el.style.setProperty('box-shadow', '0 1px 3px rgba(0,0,0,0.2)', 'important');
            
            // Añadir/asegurar clase correcta
            if (!el.className.includes(`evento-${categoria}`)) {
                el.className = `evento-mini evento-${categoria} ${el.className}`;
            }
        });
        
        // 2. Corregir tarjetas de eventos
        document.querySelectorAll('[class*="evento-item"]').forEach(el => {
            // Determinar la categoría
            let categoria = 'otro';
            for (let cat in coloresCategorias) {
                if (el.className.toLowerCase().includes(cat)) {
                    categoria = cat;
                    break;
                }
            }
            
            // Aplicar estilo para borde
            el.style.setProperty('border-left-color', coloresCategorias[categoria], 'important');
            
            // Aplicar color al título
            const titulo = el.querySelector('h3');
            if (titulo) {
                titulo.style.setProperty('color', coloresCategorias[categoria], 'important');
            }
            
            // Añadir/asegurar clase correcta
            if (!el.className.includes(categoria)) {
                el.className = `evento-item ${categoria} ${el.className}`;
            }
        });
        
        // 3. Corregir etiquetas/badges de categoría
        document.querySelectorAll('span[class*="badge"], [class*="tag"]').forEach(el => {
            // Determinar la categoría
            let categoria = 'otro';
            for (let cat in coloresCategorias) {
                if (el.textContent.toLowerCase().includes(cat) || 
                    el.className.toLowerCase().includes(cat)) {
                    categoria = cat;
                    break;
                }
            }
            
            // Aplicar estilo
            el.style.setProperty('background-color', coloresCategorias[categoria], 'important');
            el.style.setProperty('color', 'white', 'important');
        });
        
        // 4. Corregir eventos en la visualización de calendario
        document.querySelectorAll('.calendario-grid [class*="evento"]').forEach(el => {
            let categoria = 'otro';
            for (let cat in coloresCategorias) {
                if (el.textContent.toLowerCase().includes(cat) || 
                    el.className.toLowerCase().includes(cat)) {
                    categoria = cat;
                    break;
                }
            }
            
            el.style.setProperty('background-color', coloresCategorias[categoria], 'important');
            el.style.setProperty('color', 'white', 'important');
        });
        
        // 5. Corregir eventos en columnas específicas
        const contenedores = document.querySelectorAll('.dia-celda');
        contenedores.forEach(celda => {
            const eventosEnCelda = celda.querySelectorAll('[class*="evento"]');
            eventosEnCelda.forEach(evento => {
                // Detectar la categoría basado en texto o clase
                let categoriaDetectada = 'otro';
                
                for (const cat in coloresCategorias) {
                    if (evento.textContent.toLowerCase().includes(cat) || 
                        evento.className.toLowerCase().includes(cat)) {
                        categoriaDetectada = cat;
                        break;
                    }
                }
                
                // Aplicar el color correspondiente
                evento.style.setProperty('background-color', coloresCategorias[categoriaDetectada], 'important');
                evento.style.setProperty('color', 'white', 'important');
            });
        });
        
        // Actualizar la leyenda solo si no se ha actualizado ya
        if (!leyendaActualizada) {
            mejorarLeyenda();
        }
        
        console.log("✅ Colores aplicados correctamente");
        procesandoColores = false;
    }
    
    // INTEGRACIÓN: Función para mejorar la leyenda con emojis
    function mejorarLeyenda() {
        // Verificar si la leyenda existe antes de intentar modificarla
        const leyendaItems = document.querySelectorAll('.leyenda-item');
        if (leyendaItems.length === 0) return;
        
        console.log("🏷️ Mejorando leyenda con emojis...");
        
        const emojis = {
            'Curso': '📚',
            'Taller': '🛠️',
            'Grupo': '👥',
            'Activación': '🎯',
            'Otro': '📌'
        };
        
        // Hacemos un seguimiento de los elementos ya procesados
        const procesados = new Set();
        
        leyendaItems.forEach(item => {
            // Evitar procesar el mismo elemento varias veces
            if (procesados.has(item)) return;
            procesados.add(item);
            
            const texto = item.textContent.trim();
            
            // Verificar si ya tiene un emoji
            if (/[\u{1F300}-\u{1F6FF}]/u.test(texto)) return;
            
            for (const [categoria, emoji] of Object.entries(emojis)) {
                if (texto.toLowerCase().includes(categoria.toLowerCase())) {
                    // También aplicar el color correcto al elemento de leyenda
                    const categoriaLower = categoria.toLowerCase();
                    if (coloresCategorias[categoriaLower]) {
                        const leyendaColor = item.querySelector('.leyenda-color');
                        if (leyendaColor) {
                            leyendaColor.style.backgroundColor = coloresCategorias[categoriaLower];
                        }
                    }
                    
                    item.innerHTML = `<div class="leyenda-color"></div>${emoji} ${texto}`;
                    break;
                }
            }
        });
        
        leyendaActualizada = true;
        console.log("✅ Leyenda mejorada correctamente");
    }
    
    // Función debounced para reducir llamadas excesivas
    let timeoutId;
    function aplicarCambiosDebouncedS() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            aplicarColoresATodo();
        }, 300);
    }
    
    // Ejecutar al cargar la página
    window.addEventListener('DOMContentLoaded', function() {
        // Ejecutar una vez al inicio con un retraso para asegurar que el DOM esté listo
        setTimeout(aplicarColoresATodo, 500);
        
        // Observador de mutaciones optimizado
        const observer = new MutationObserver(function(mutations) {
            // Verificar si las mutaciones afectan a elementos relevantes
            const relevante = mutations.some(mutation => {
                // Si se agregaron nodos, verificar si son relevantes
                if (mutation.addedNodes.length) {
                    return Array.from(mutation.addedNodes).some(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            return node.querySelector && (
                                node.querySelector('[class*="evento"]') ||
                                node.querySelector('.leyenda-item') ||
                                node.className.includes('evento') ||
                                node.className.includes('leyenda')
                            );
                        }
                        return false;
                    });
                }
                return false;
            });
            
            if (relevante) {
                aplicarCambiosDebouncedS();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Manejo de eventos de clic optimizado
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-nav') || e.target.closest('.dia-celda')) {
                // Resetear la bandera para permitir actualizar la leyenda
                leyendaActualizada = false;
                setTimeout(aplicarCambiosDebouncedS, 100);
            }
        });
        
        // Intervalo menos frecuente para verificación periódica
        setInterval(() => {
            // Comprobar si hay nuevos elementos o cambios en la leyenda
            const elementosNuevos = document.querySelectorAll('[class*="evento"]:not([style*="background-color"])');
            const leyendaSinEmojis = document.querySelectorAll('.leyenda-item:not(:has(img)):not(:contains(emoji))');
            
            if (elementosNuevos.length > 0 || leyendaSinEmojis.length > 0) {
                leyendaActualizada = false;
                aplicarCambiosDebouncedS();
            }
        }, 5000); // Reducir la frecuencia a cada 5 segundos
    });
    
    // Agregar estilos
    const estiloExtra = document.createElement('style');
    estiloExtra.textContent = `
        .evento-mini {
            padding: 4px 6px !important;
            margin-top: 3px !important;
            border-radius: 4px !important;
            font-size: 0.75rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
        
        .dia-celda .evento-mini + .evento-mini {
            margin-top: 3px !important;
        }
        
        /* Estilo para los elementos de la leyenda con emojis */
        .leyenda-item {
            display: flex !important;
            align-items: center !important;
            margin-bottom: 5px !important;
        }
        
        .leyenda-color {
            width: 15px !important;
            height: 15px !important;
            border-radius: 3px !important;
            margin-right: 5px !important;
        }
    `;
    document.head.appendChild(estiloExtra);
})();
