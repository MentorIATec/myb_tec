/**
 * ultra-aggressive-fix.js - Script extremadamente agresivo para eliminar etiquetas flotantes
 * 
 * Este script se enfoca específicamente en eliminar las etiquetas "Act" y "Grupo"
 * que aparecen en la esquina superior derecha de la pantalla.
 */

(function() {
    'use strict';
    
    // Ejecutar inmediatamente
    eliminaEtiquetasFlotantesUltra();
    
    // Función principal ultra agresiva para eliminar etiquetas
    function eliminaEtiquetasFlotantesUltra() {
        console.log('🔥 Aplicando eliminación ULTRA agresiva de etiquetas flotantes...');
        
        // 1. Inyectar CSS ultra-agresivo
        const estiloUltra = document.createElement('style');
        estiloUltra.id = 'ultra-aggressive-fix-style';
        estiloUltra.innerHTML = `
            /* REGLAS ULTRA AGRESIVAS PARA ELIMINAR ETIQUETAS FLOTANTES */
            
            /* Cualquier elemento que esté fuera del contenedor principal */
            html > body > *:not(.eventos-container):not(script):not(style):not(link):not(meta) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                z-index: -9999 !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                clip: rect(0,0,0,0) !important;
            }
            
            /* Específicamente para los colores exactos */
            [style*="background-color: rgb(0, 150, 136)"],
            [style*="background-color: rgb(156, 39, 176)"],
            [style*="background: rgb(0, 150, 136)"],
            [style*="background: rgb(156, 39, 176)"],
            [style*="background-color:#009688"],
            [style*="background-color:#9c27b0"],
            [style*="background:#009688"],
            [style*="background:#9c27b0"] {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* Elementos que contengan exactamente esos textos */
            div:contains("Act"),
            div:contains("Grupo"),
            span:contains("Act"),
            span:contains("Grupo") {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* Para elementos posicionados absolutamente */
            [style*="position: fixed"],
            [style*="position: absolute"] {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* Combinaciones comunes para estas etiquetas */
            .pill, .badge, .chip, .tag, .label {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* Barrera de protección en la parte superior */
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 100px;
                background: transparent;
                z-index: 100000;
                pointer-events: none;
            }
        `;
        document.head.appendChild(estiloUltra);
        
        // 2. Ejecutar limpieza inmediata
        ejecutarLimpiezaUltraAgresiva();
        
        // 3. Programar limpiezas repetidas
        const intervalos = [10, 50, 100, 200, 500, 1000, 2000, 5000];
        intervalos.forEach(intervalo => {
            setInterval(ejecutarLimpiezaUltraAgresiva, intervalo);
        });
        
        // 4. Observar mutaciones del DOM
        const observador = new MutationObserver((mutations) => {
            ejecutarLimpiezaUltraAgresiva();
        });
        
        observador.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // 5. Control de eventos para reaccionar a cambios de vista
        document.addEventListener('click', function() {
            setTimeout(ejecutarLimpiezaUltraAgresiva, 50);
            setTimeout(ejecutarLimpiezaUltraAgresiva, 200);
        }, true);
        
        window.addEventListener('resize', ejecutarLimpiezaUltraAgresiva);
        window.addEventListener('scroll', ejecutarLimpiezaUltraAgresiva);
        
        // 6. Específicamente para cualquier botón de vista
        document.querySelectorAll('.vista-btn, button, a').forEach(elemento => {
            elemento.addEventListener('click', () => {
                setTimeout(ejecutarLimpiezaUltraAgresiva, 50);
                setTimeout(ejecutarLimpiezaUltraAgresiva, 200);
                setTimeout(ejecutarLimpiezaUltraAgresiva, 500);
            });
        });
        
        console.log('✅ Protección ultra agresiva aplicada');
    }
    
    // Función para ejecutar limpieza ultra agresiva
    function ejecutarLimpiezaUltraAgresiva() {
        // 1. Eliminar todos los elementos a nivel de body que no sean parte de la estructura principal
        const elementosNoDeseados = document.querySelectorAll('body > *:not(.eventos-container):not(script):not(style):not(link):not(meta)');
        elementosNoDeseados.forEach(elemento => {
            if (!elemento.id || !elemento.id.includes('toast-container')) {
                elemento.style.display = 'none';
                elemento.style.visibility = 'hidden';
                elemento.style.opacity = '0';
            }
        });
        
        // 2. Buscar específicamente elementos con "Act" o "Grupo" en su texto
        document.querySelectorAll('*').forEach(elemento => {
            if (elemento.textContent === 'Act' || 
                elemento.textContent === 'Grupo' || 
                elemento.textContent === 'Act Grupo' ||
                elemento.textContent === 'Activación' ||
                elemento.textContent === 'Activacion') {
                
                // Verificar posición (esquina superior)
                const rect = elemento.getBoundingClientRect();
                if (rect.top < 150 && window.innerWidth - rect.right < 150) {
                    // Eliminar completamente
                    elemento.style.display = 'none';
                    elemento.style.visibility = 'hidden';
                    elemento.style.opacity = '0';
                    
                    // También ocultar elementos padre
                    let padre = elemento.parentElement;
                    for (let i = 0; i < 3 && padre; i++) {
                        padre.style.display = 'none';
                        padre.style.visibility = 'hidden';
                        padre.style.opacity = '0';
                        padre = padre.parentElement;
                    }
                }
            }
        });
        
        // 3. Buscar elementos por color específico
        document.querySelectorAll('*').forEach(elemento => {
            const estilo = window.getComputedStyle(elemento);
            const bgColor = estilo.backgroundColor;
            
            // Colores exactos de Act/Grupo
            if (bgColor === 'rgb(0, 150, 136)' || bgColor === 'rgb(156, 39, 176)') {
                // Verificar si no es parte de los elementos de filtro/lista
                if (!elemento.closest('.categoria-tag') && 
                    !elemento.closest('.leyenda-color') && 
                    !elemento.closest('.dia-evento-cat') && 
                    !elemento.closest('.dia-indicador') &&
                    !elemento.closest('.eventos-container')) {
                    
                    // Eliminar completamente
                    elemento.style.display = 'none';
                    elemento.style.visibility = 'hidden';
                    elemento.style.opacity = '0';
                    
                    // También ocultar elementos padre
                    let padre = elemento.parentElement;
                    for (let i = 0; i < 3 && padre; i++) {
                        padre.style.display = 'none';
                        padre.style.visibility = 'hidden';
                        padre = padre.parentElement;
                    }
                }
            }
        });
        
        // 4. Buscar específicamente por forma y posición (pill en esquina superior)
        document.querySelectorAll('*').forEach(elemento => {
            const rect = elemento.getBoundingClientRect();
            
            // Si está en la esquina superior
            if (rect.top < 80 && rect.right > window.innerWidth - 150) {
                // Verificar forma pill (ancho/alto ratio aproximado 2.5-3.5)
                const ratio = rect.width / rect.height;
                
                if (ratio > 1.5 && ratio < 5 && rect.height < 40) {
                    // Probable pill badge
                    elemento.style.display = 'none';
                    elemento.style.visibility = 'hidden';
                    elemento.style.opacity = '0';
                    
                    // También ocultar elementos padre
                    let padre = elemento.parentElement;
                    for (let i = 0; i < 3 && padre; i++) {
                        padre.style.display = 'none';
                        padre.style.visibility = 'hidden';
                        padre = padre.parentElement;
                    }
                }
            }
        });
        
        // 5. Específicamente para los elementos pills con colores
        const coloresTargets = [
            'rgb(0, 150, 136)', // teal (Act)
            'rgb(156, 39, 176)', // purple (Grupo)
            '#009688', // teal hex
            '#9c27b0' // purple hex
        ];
        
        document.querySelectorAll('div, span').forEach(elemento => {
            const estilo = window.getComputedStyle(elemento);
            const bgColor = estilo.backgroundColor;
            const borderRadius = parseInt(estilo.borderRadius);
            
            // Si tiene border radius redondeado y color objetivo
            if (borderRadius > 10 && coloresTargets.includes(bgColor)) {
                elemento.style.display = 'none';
                elemento.style.visibility = 'hidden';
                elemento.style.opacity = '0';
                
                // Ocultar también contenedores padres
                let padre = elemento.parentElement;
                for (let i = 0; i < 3 && padre; i++) {
                    padre.style.display = 'none';
                    padre.style.visibility = 'hidden';
                    padre = padre.parentElement;
                }
            }
        });
        
        // 6. Bloqueo absoluto para la esquina superior derecha
        const bloqueador = document.getElementById('esquina-bloqueador');
        if (!bloqueador) {
            const bloqueo = document.createElement('div');
            bloqueo.id = 'esquina-bloqueador';
            bloqueo.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                width: 200px;
                height: 80px;
                background-color: white;
                z-index: 99999;
                pointer-events: none;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            document.body.appendChild(bloqueo);
        }
    }

    // Ejecutar cuando el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', eliminaEtiquetasFlotantesUltra);
    } else {
        eliminaEtiquetasFlotantesUltra();
    }
    
    // Ejecutar también cuando la página esté completamente cargada
    window.addEventListener('load', eliminaEtiquetasFlotantesUltra);
})();
