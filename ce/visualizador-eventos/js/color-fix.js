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
    
    // Función para aplicar colores directamente
    function aplicarColoresATodo() {
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
        
        console.log("✅ Colores aplicados correctamente");
    }
    
    // INTEGRACIÓN: Función para mejorar la leyenda con emojis
    function mejorarLeyenda() {
        console.log("🏷️ Mejorando leyenda con emojis...");
        
        const leyendaItems = document.querySelectorAll('.leyenda-item');
        const emojis = {
            'Curso': '📚',
            'Taller': '🛠️',
            'Grupo': '👥',
            'Activación': '🎯',
            'Otro': '📌'  // Añadido para categoría 'otro'
        };
        
        leyendaItems.forEach(item => {
            const texto = item.textContent.trim();
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
        
        console.log("✅ Leyenda mejorada correctamente");
    }
    
    // Ejecutar al cargar la página
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            aplicarColoresATodo();
            mejorarLeyenda(); // Añadida llamada a la nueva función
        }, 500);
        
        // Ejecutar cada vez que haya cambios en el DOM (nuevo contenido)
        const observer = new MutationObserver(function(mutations) {
            aplicarColoresATodo();
            mejorarLeyenda(); // Añadida llamada a la nueva función
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Ejecutar también al cambiar de mes o hacer clic en cualquier día
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-nav') || e.target.closest('.dia-celda')) {
                setTimeout(() => {
                    aplicarColoresATodo();
                    mejorarLeyenda(); // Añadida llamada a la nueva función
                }, 100);
            }
        });
        
        // Para asegurar que funcione con la carga asíncrona
        setInterval(() => {
            aplicarColoresATodo();
            mejorarLeyenda(); // Añadida llamada a la nueva función
        }, 2000);
    });
    
    // También podemos mejorar el aspecto general de los eventos
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
