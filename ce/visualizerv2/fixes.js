/**
 * fixes.js - Script corrector y optimizador para el Visualizador de Eventos
 * 
 * Este script aplica correcciones y mejoras al visualizador de eventos sin modificar
 * los archivos originales. Está diseñado para ser incluido después del script principal.
 * 
 * Mejoras implementadas:
 * 1. Eliminación de etiquetas flotantes (Act Grupo)
 * 2. Optimización de espacios para móviles
 * 3. Mejoras en el calendario (navegación, usabilidad)
 * 4. Tooltips interactivos para previsualización rápida
 * 5. Paginación de eventos en la vista "Solo Eventos"
 */

// Función autoejecutable para evitar contaminación del scope global
(function() {
    'use strict';
    
    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', iniciarFixes);
    
    // Función principal que inicia todas las mejoras
    function iniciarFixes() {
        console.log('🛠️ Aplicando correcciones y mejoras al visualizador de eventos...');
        
        // Ejecutar todas las mejoras
        eliminarEtiquetasFlotantes();
        optimizarEspaciosMobile();
        mejorarCalendario();
        implementarTooltipsInteractivos();
        implementarPaginacionEventos();
        
        console.log('✅ Correcciones aplicadas correctamente');
    }
    
    /**
     * FIX 1: Elimina las etiquetas flotantes "Act" y "Grupo" 
     * en la esquina superior derecha de la pantalla
     */
    function eliminarEtiquetasFlotantes() {
        // Primera ejecución inmediata
        ejecutarLimpiezaEtiquetas();
        
        // Luego programar ejecuciones periódicas para asegurar que las etiquetas se eliminen
        // incluso después de cambios de vista
        setInterval(ejecutarLimpiezaEtiquetas, 500);
        
        // Además, observar cambios en el DOM
        const observadorCuerpo = new MutationObserver(function(mutations) {
            ejecutarLimpiezaEtiquetas();
        });
        
        // Iniciar observación del cuerpo
        observadorCuerpo.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Escuchar cambios de vista 
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Ejecutar la limpieza varias veces después de cambiar vista
                ejecutarLimpiezaEtiquetas();
                setTimeout(ejecutarLimpiezaEtiquetas, 100);
                setTimeout(ejecutarLimpiezaEtiquetas, 300);
                setTimeout(ejecutarLimpiezaEtiquetas, 500);
            });
        });
        
        // Función principal de limpieza de etiquetas
        function ejecutarLimpiezaEtiquetas() {
            // 1. Buscar específicamente las etiquetas "Act" y "Grupo" en la esquina superior
            const elementosSuperiores = document.body.querySelectorAll('*');
            
            elementosSuperiores.forEach(elemento => {
                // Verificar el texto del elemento
                const texto = elemento.textContent.trim();
                
                if ((texto === 'Act' || texto === 'Grupo' || 
                     texto === 'Activación' || texto === 'Activacion' ||
                     texto === 'Act Grupo' || texto === 'Activación Grupo') && 
                    elemento.getBoundingClientRect().top < 150) {
                    
                    // Verificar si es un elemento de estilo "pill" o botón en la esquina
                    // (esto abarca las etiquetas flotantes)
                    const rect = elemento.getBoundingClientRect();
                    const estaEnEsquinaSuperior = rect.top < 150 && window.innerWidth - rect.right < 150;
                    
                    // Si es un elemento en la esquina superior
                    if (estaEnEsquinaSuperior) {
                        console.log('Elemento "Act/Grupo" encontrado y eliminado', elemento);
                        elemento.style.display = 'none';
                        
                        // También ocultar el padre si es posible
                        if (elemento.parentElement && elemento.parentElement !== document.body) {
                            elemento.parentElement.style.display = 'none';
                        }
                    }
                }
                
                // También verificar elementos por clase, color o estilo
                if (elemento.classList) {
                    // Verificar si es un elemento con clases relacionadas con Act/Grupo
                    if (
                        elemento.classList.contains('activacion') || 
                        elemento.classList.contains('grupo') ||
                        elemento.classList.contains('act') ||
                        elemento.classList.contains('badge') ||
                        elemento.classList.contains('pill') ||
                        (elemento.className && elemento.className.includes && 
                         (elemento.className.includes('activacion') || 
                          elemento.className.includes('grupo') || 
                          elemento.className.includes('act')))
                    ) {
                        // Solo si está en la parte superior
                        const rect = elemento.getBoundingClientRect();
                        if (rect.top < 150) {
                            // Si no es parte de la navegación o filtros
                            if (!esElementoNecesario(elemento)) {
                                console.log('Elemento por clase encontrado y eliminado', elemento);
                                elemento.style.display = 'none';
                            }
                        }
                    }
                }
                
                // Verificar por color (verde tipo Act o morado tipo Grupo)
                const estilo = window.getComputedStyle(elemento);
                const bgColor = estilo.backgroundColor;
                const rect = elemento.getBoundingClientRect();
                
                // Si es elemento coloreado en la parte superior
                if (rect.top < 150 && 
                    (esTealVerde(bgColor) || esPurpuraVioleta(bgColor)) &&
                    !esElementoNecesario(elemento)) {
                    
                    // Y está en la esquina superior derecha
                    if (window.innerWidth - rect.right < 150) {
                        console.log('Elemento por color encontrado y eliminado', elemento);
                        elemento.style.display = 'none';
                    }
                }
            });
            
            // 2. Implementación más agresiva: buscar directamente "Act Grupo" en div/span
            document.querySelectorAll('div, span').forEach(el => {
                const contenido = el.textContent.trim();
                if ((contenido === 'Act' || contenido === 'Grupo' || 
                     contenido === 'Act Grupo' || contenido === 'Activación') &&
                    el.getBoundingClientRect().top < 150) {
                    
                    // Verificar si es un elemento de navegación o filtros (no eliminar esos)
                    if (!esElementoNecesario(el)) {
                        console.log('Div/span con texto Act/Grupo eliminado', el);
                        el.style.display = 'none';
                    }
                }
            });
            
            // 3. Método CSS - añadir reglas más específicas
            if (!document.getElementById('fix-etiquetas-flotantes-style')) {
                const estilo = document.createElement('style');
                estilo.id = 'fix-etiquetas-flotantes-style';
                estilo.textContent = `
                    /* Ocultar "Act Grupo" y etiquetas similares */
                    body > div:not(.eventos-container):not(.controles-container):not(.mes-selector) {
                        display: none !important;
                    }
                    
                    /* Ocultar específicamente etiquetas con estos textos */
                    div:not(.categorias-container *):not(.filtros-container *):not(.eventos-container > *):not(.controles-container *):not(.mes-selector *) {
                        opacity: 0 !important; 
                        pointer-events: none !important;
                    }
                    
                    /* Ocultar etiquetas flotantes flotantes en esquina superior */
                    [style*="position: fixed"],
                    [style*="position: absolute"]:not(.dia-modal *):not(.evento-modal *):not(.tooltip *):not(.toast *) {
                        display: none !important;
                    }
                    
                    /* Ocultar específicamente Act Grupo */
                    [style*="background-color: rgb(0, 150, 136)"],
                    [style*="background-color: rgb(156, 39, 176)"]:not(.categoria-tag):not(.evento-badge):not(.dia-indicador):not(.leyenda-color) {
                        display: none !important;
                    }
                `;
                document.head.appendChild(estilo);
            }
        }
        
        // Funciones auxiliares
        function esElementoNecesario(elemento) {
            // Verificar si es parte de la estructura necesaria (no eliminarlo)
            return elemento.closest('.vista-selector') || 
                   elemento.closest('.categorias-container') || 
                   elemento.closest('.filtros-container') ||
                   elemento.closest('.mes-selector') ||
                   elemento.closest('.controles-container') ||
                   elemento.closest('.dia-container') ||
                   elemento.closest('.evento-card') ||
                   (elemento.className && 
                    elemento.className.includes && 
                    (elemento.className.includes('categoria-tag') || 
                     elemento.className.includes('vista-btn')));
        }
        
        function esTealVerde(color) {
            // Detecta colores verde/teal típicos de "Act"
            return color.includes('rgb(0, 150, 136)') || // teal
                   color.includes('rgb(0, 200, 150)') || // verde similar
                   color.includes('rgb(79, 195, 178)') || // verde turquesa
                   color.includes('rgb(0, 128, 128)'); // otro teal
        }
        
        function esPurpuraVioleta(color) {
            // Detecta colores purpura/violeta típicos de "Grupo"
            return color.includes('rgb(156, 39, 176)') || // purpura
                   color.includes('rgb(103, 58, 183)') || // violeta
                   color.includes('rgb(123, 31, 162)') || // purpura oscuro
                   color.includes('rgb(170, 0, 255)'); // violeta intenso
        }
    }
    
    /**
     * FIX 2: Optimización de espacios para dispositivos móviles
     * Reduce el scroll necesario adaptando elementos a pantallas pequeñas
     */
    function optimizarEspaciosMobile() {
        // Agregar estilos CSS para optimización móvil
        const estilo = document.createElement('style');
        estilo.textContent = `
            @media (max-width: 768px) {
                /* Reducción general de espaciado */
                .eventos-container {
                    padding: 10px;
                    margin: 10px auto;
                }
                
                /* Encabezado más compacto */
                .eventos-header {
                    margin-bottom: 15px;
                }
                
                .eventos-title {
                    font-size: 24px;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                }
                
                .eventos-description {
                    font-size: 14px;
                    line-height: 1.4;
                    margin-bottom: 10px;
                }
                
                /* Controles más compactos */
                .vista-selector {
                    gap: 5px;
                    margin-bottom: 15px;
                }
                
                .vista-btn {
                    padding: 6px 12px;
                    font-size: 13px;
                }
                
                /* Ajuste de filtros */
                .filtros-container {
                    padding: 10px;
                    margin-bottom: 15px;
                }
                
                .filtros-title {
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                
                .categorias-container {
                    gap: 5px;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    scrollbar-width: thin;
                }
                
                .categoria-tag {
                    padding: 6px 10px;
                    font-size: 12px;
                    white-space: nowrap;
                }
                
                /* Calendario más compacto */
                .calendario-container {
                    margin-bottom: 15px;
                }
                
                .dia-container {
                    min-height: 60px; /* Reducción de la altura mínima */
                    padding: 3px;
                }
                
                /* Tarjetas de eventos más pequeñas */
                .eventos-grid {
                    gap: 10px;
                }
                
                .evento-card {
                    margin-bottom: 0;
                }
                
                .evento-header {
                    padding: 12px;
                }
                
                .evento-content {
                    padding: 0 12px 12px;
                }
                
                .evento-footer {
                    padding: 10px 12px;
                }
                
                .evento-title {
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                
                .evento-description {
                    font-size: 13px;
                    line-height: 1.4;
                }
            }
            
            /* Modo super compacto para pantallas muy pequeñas */
            @media (max-width: 480px) {
                .dia-container {
                    min-height: 50px;
                    padding: 2px;
                }
                
                .dia-numero {
                    font-size: 12px;
                }
                
                .eventos-grid {
                    grid-template-columns: 1fr;
                }
                
                /* Ocultar indicadores en días para ahorrar espacio */
                .dia-indicadores {
                    display: flex;
                    gap: 1px;
                }
                
                .dia-indicador {
                    width: 4px;
                    height: 4px;
                }
            }
        `;
        document.head.appendChild(estilo);
        
        // Configurar desplazamiento horizontal para filtros en móvil
        const categoriasContainer = document.getElementById('categorias-container');
        if (categoriasContainer) {
            // Variables para seguimiento del deslizamiento
            let isDown = false;
            let startX;
            let scrollLeft;
            
            // Eventos touch/mouse para deslizamiento
            categoriasContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                categoriasContainer.classList.add('active');
                startX = e.pageX - categoriasContainer.offsetLeft;
                scrollLeft = categoriasContainer.scrollLeft;
            });
            
            categoriasContainer.addEventListener('mouseleave', () => {
                isDown = false;
                categoriasContainer.classList.remove('active');
            });
            
            categoriasContainer.addEventListener('mouseup', () => {
                isDown = false;
                categoriasContainer.classList.remove('active');
            });
            
            categoriasContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - categoriasContainer.offsetLeft;
                const walk = (x - startX) * 2; // Velocidad de scroll
                categoriasContainer.scrollLeft = scrollLeft - walk;
            });
            
            // Soporte para eventos táctiles
            categoriasContainer.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - categoriasContainer.offsetLeft;
                scrollLeft = categoriasContainer.scrollLeft;
            }, { passive: true });
            
            categoriasContainer.addEventListener('touchend', () => {
                isDown = false;
            }, { passive: true });
            
            categoriasContainer.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                const x = e.touches[0].pageX - categoriasContainer.offsetLeft;
                const walk = (x - startX) * 2;
                categoriasContainer.scrollLeft = scrollLeft - walk;
            }, { passive: true });
        }
        
        // Activar modo compacto si es necesario
        function activarModoCompacto() {
            // Detectar si es móvil (ancho < 768px)
            const esMobil = window.innerWidth < 768;
            
            // Ajustar elementos según dispositivo
            if (esMobil) {
                // Cambiar a vista solo eventos en móvil por defecto si no hay vista activa
                const vistaBtns = document.querySelectorAll('.vista-btn');
                const hayVistaActiva = Array.from(vistaBtns).some(btn => btn.classList.contains('active'));
                
                if (!hayVistaActiva && typeof cambiarVista === 'function') {
                    cambiarVista('eventos');
                }
                
                // Reducir contenido visible en tarjetas de eventos
                const descripciones = document.querySelectorAll('.evento-description');
                descripciones.forEach(desc => {
                    // Limitar descripción a menos caracteres en móvil
                    if (desc.dataset.originalText) {
                        desc.textContent = truncarTexto(desc.dataset.originalText, 60);
                    } else {
                        desc.dataset.originalText = desc.textContent;
                        desc.textContent = truncarTexto(desc.textContent, 60);
                    }
                });
                
                // Reducir detalles visibles
                document.querySelectorAll('.evento-details').forEach(details => {
                    // Limitar a máximo 2 detalles visibles
                    const detalles = details.querySelectorAll('.evento-detail');
                    if (detalles.length > 2) {
                        for (let i = 2; i < detalles.length; i++) {
                            detalles[i].style.display = 'none';
                        }
                    }
                });
            } else {
                // Restaurar contenido en escritorio
                const descripciones = document.querySelectorAll('.evento-description');
                descripciones.forEach(desc => {
                    if (desc.dataset.originalText) {
                        desc.textContent = truncarTexto(desc.dataset.originalText, 120);
                    }
                });
                
                // Mostrar todos los detalles
                document.querySelectorAll('.evento-detail').forEach(detail => {
                    detail.style.display = '';
                });
            }
        }
        
        // Utilidad para truncar texto
        function truncarTexto(texto, maxLongitud) {
            if (!texto) return 'Sin descripción disponible';
            if (texto.length <= maxLongitud) return texto;
            return texto.substring(0, maxLongitud) + '...';
        }
        
        // Activar modo compacto inicial
        activarModoCompacto();
        
        // Re-evaluar al cambiar tamaño de ventana
        window.addEventListener('resize', activarModoCompacto);
    }
    
    /**
     * FIX 3: Mejoras en el calendario
     * Añade botón "Hoy", navegación mejorada e indicadores visuales
     */
    function mejorarCalendario() {
        // 1. Estilos mejorados para el calendario
        const estiloCalendario = document.createElement('style');
        estiloCalendario.textContent = `
            /* Botón Hoy */
            .hoy-btn {
                background: var(--accent, #FF5800);
                color: white;
                border: none;
                border-radius: 20px;
                padding: 6px 15px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                margin-left: 15px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .hoy-btn:hover, .hoy-btn:focus {
                background: #e05000;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            /* Indicador más prominente para día actual */
            .dia-container.hoy {
                box-shadow: inset 0 0 0 2px var(--accent, #FF5800);
                animation: pulseHighlight 2s infinite ease-in-out;
            }
            
            @keyframes pulseHighlight {
                0% { box-shadow: inset 0 0 0 2px var(--accent, #FF5800); }
                50% { box-shadow: inset 0 0 0 3px var(--accent, #FF5800); }
                100% { box-shadow: inset 0 0 0 2px var(--accent, #FF5800); }
            }
            
            /* Indicadores de eventos más claros */
            .dia-container.has-eventos {
                background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.7));
            }
            
            /* Posición y tamaño optimizados de indicadores */
            .dia-indicadores {
                position: absolute;
                bottom: 3px;
                left: 0;
                right: 0;
                justify-content: center;
            }
            
            /* Transiciones y animaciones */
            .calendario-grid {
                transition: opacity 0.3s ease;
            }
            
            .mes-nav:active {
                transform: scale(0.95);
            }
            
            .dia-container {
                transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
            }
            
            .dia-container:active {
                transform: scale(0.95);
            }
            
            /* Mejoras visuales para móvil */
            @media (max-width: 768px) {
                .calendario-header {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                .dia-container.seleccionado {
                    position: relative;
                    z-index: 1;
                    transform: scale(1.05);
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }
                
                /* Botón Hoy para móvil */
                .hoy-btn {
                    padding: 5px 12px;
                    font-size: 13px;
                    margin-left: 10px;
                }
            }
            
            /* Estado visualmente oculto para fines de semana en móvil */
            .fin-de-semana {
                opacity: 0.5;
            }
        `;
        document.head.appendChild(estiloCalendario);
        
        // 2. Agregar botón "Hoy"
        const mesSelector = document.querySelector('.mes-selector');
        if (mesSelector) {
            const hoyButton = document.createElement('button');
            hoyButton.className = 'hoy-btn';
            hoyButton.innerHTML = 'Hoy';
            hoyButton.setAttribute('aria-label', 'Ir al día de hoy');
            
            // Insertar botón entre navegadores de mes
            mesSelector.appendChild(hoyButton);
            
            // Evento para botón Hoy
            hoyButton.addEventListener('click', () => {
                // Intentar acceder a las funciones globales del visualizador
                // Si no están disponibles, implementar una versión básica
                try {
                    // Fecha actual
                    const fechaHoy = new Date();
                    
                    // Si la función mesActual existe globalmente (desde script-enhanced.js)
                    if (typeof window.mesActual !== 'undefined') {
                        window.mesActual = fechaHoy.getMonth();
                        window.anioActual = fechaHoy.getFullYear();
                        
                        if (typeof window.actualizarMesActual === 'function') {
                            window.actualizarMesActual();
                        } else {
                            // Actualizar manualmente el texto del mes
                            const mesActualEl = document.getElementById('mes-actual');
                            if (mesActualEl) {
                                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                mesActualEl.textContent = `${meses[fechaHoy.getMonth()]} ${fechaHoy.getFullYear()}`;
                            }
                        }
                        
                        if (typeof window.generarCalendario === 'function') {
                            window.generarCalendario();
                        }
                    }
                    
                    // Seleccionar día de hoy
                    const diaHoy = document.querySelector('.dia-container.hoy');
                    if (diaHoy) {
                        diaHoy.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        diaHoy.classList.add('seleccionado');
                        
                        // Si existe la función de seleccionar día
                        if (typeof window.seleccionarDia === 'function') {
                            window.seleccionarDia(fechaHoy);
                        }
                    }
                    
                    // Mostrar mensaje de confirmación
                    mostrarToast('Calendario actualizado al día de hoy');
                } catch (error) {
                    console.log('Error al intentar ir al día de hoy:', error);
                }
            });
        }
        
        // 3. Implementar gestos de deslizamiento para cambiar meses
        const calendarioContainer = document.querySelector('.calendario-container');
        if (calendarioContainer) {
            let touchStartX = 0;
            let touchEndX = 0;
            
            // Eventos táctiles
            calendarioContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            calendarioContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
            
            // Interpretar el gesto
            function handleSwipe() {
                const minSwipeDistance = 50; // Mínima distancia para considerar un swipe
                
                if (touchEndX < touchStartX - minSwipeDistance) {
                    // Swipe izquierda (mes siguiente)
                    document.getElementById('mes-siguiente').click();
                }
                
                if (touchEndX > touchStartX + minSwipeDistance) {
                    // Swipe derecha (mes anterior)
                    document.getElementById('mes-anterior').click();
                }
            }
        }
        
        // 4. Implementar atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Solo si no estamos en un input, textarea, etc.
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    // Mes anterior
                    if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                        document.getElementById('mes-anterior').click();
                    }
                    break;
                case 'ArrowRight':
                    // Mes siguiente
                    if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
                        document.getElementById('mes-siguiente').click();
                    }
                    break;
                case 'Home':
                    // Ir a hoy
                    const hoyBtn = document.querySelector('.hoy-btn');
                    if (hoyBtn) hoyBtn.click();
                    break;
            }
        });
    }
    
    /**
     * FIX 4: Implementación de tooltips interactivos
     * Permite previsualizar eventos sin abrir el modal completo
     */
    function implementarTooltipsInteractivos() {
        // Estilo para los tooltips
        const estiloTooltips = document.createElement('style');
        estiloTooltips.textContent = `
            /* Estilos para tooltips de eventos */
            .evento-tooltip {
                position: absolute;
                z-index: 1000;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                width: 280px;
                padding: 0;
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s, transform 0.3s;
                overflow: hidden;
            }
            
            .evento-tooltip.active {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }
            
            .tooltip-header {
                padding: 12px;
                border-bottom: 1px solid #eee;
            }
            
            .tooltip-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 5px 0;
                color: var(--primary-dark, #004b7f);
            }
            
            .tooltip-meta {
                display: flex;
                gap: 8px;
                align-items: center;
                font-size: 12px;
                color: #666;
            }
            
            .tooltip-body {
                padding: 12px;
                max-height: 120px;
                overflow-y: auto;
            }
            
            .tooltip-description {
                font-size: 13px;
                margin: 0 0 10px 0;
                color: #444;
                line-height: 1.4;
            }
            
            .tooltip-footer {
                padding: 10px 12px;
                background-color: #f7f9fc;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .tooltip-action {
                font-size: 12px;
                background-color: var(--primary, #0072CE);
                color: white;
                border: none;
                border-radius: 15px;
                padding: 5px 10px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .tooltip-action:hover {
                background-color: var(--primary-dark, #004b7f);
            }
            
            /* Indicador de evento hover en días */
            .dia-container:hover .dia-indicador {
                transform: scale(1.2);
                transition: transform 0.2s ease;
            }
            
            /* Versión para tema oscuro */
            body.dark-mode .evento-tooltip {
                background-color: #252525;
                border: 1px solid #333;
            }
            
            body.dark-mode .tooltip-header {
                border-bottom-color: #333;
            }
            
            body.dark-mode .tooltip-title {
                color: #e0f0ff;
            }
            
            body.dark-mode .tooltip-meta,
            body.dark-mode .tooltip-description {
                color: #aaa;
            }
            
            body.dark-mode .tooltip-footer {
                background-color: #1e1e1e;
                border-top-color: #333;
            }
            
            /* Tooltip en móvil */
            @media (max-width: 768px) {
                .evento-tooltip {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    max-width: 100%;
                    border-radius: 15px 15px 0 0;
                    transform: translateY(100%);
                    box-shadow: 0 -5px 25px rgba(0,0,0,0.2);
                }
                
                .evento-tooltip.active {
                    transform: translateY(0);
                }
                
                .tooltip-body {
                    max-height: 150px;
                }
            }
        `;
        
        document.head.appendChild(estiloTooltips);
        
        // Crear contenedor de tooltip si no existe
        if (!document.getElementById('evento-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.className = 'evento-tooltip';
            tooltip.id = 'evento-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <h4 class="tooltip-title">Título del evento</h4>
                    <div class="tooltip-meta">
                        <span class="tooltip-category"></span>
                        <span class="tooltip-date"></span>
                    </div>
                </div>
                <div class="tooltip-body">
                    <p class="tooltip-description">Descripción del evento</p>
                </div>
                <div class="tooltip-footer">
                    <span class="tooltip-location"></span>
                    <button class="tooltip-action">Ver detalles</button>
                </div>
            `;
            
            document.body.appendChild(tooltip);
        }
        
        // Configurar tooltips para el calendario
        function configurarTooltipsCalendario() {
            const diasConEventos = document.querySelectorAll('.dia-container.has-eventos');
            
            diasConEventos.forEach(dia => {
                // Establecer interacción para dispositivos táctiles y mouse
                dia.addEventListener('mouseover', mostrarTooltipDia);
                dia.addEventListener('mouseleave', ocultarTooltip);
                dia.addEventListener('touchstart', toggleTooltipDia);
            });
            
            // Configurar tarjetas de eventos
            const tarjetasEventos = document.querySelectorAll('.evento-card');
            tarjetasEventos.forEach(tarjeta => {
                tarjeta.addEventListener('mouseover', mostrarTooltipTarjeta);
                tarjeta.addEventListener('mouseleave', ocultarTooltip);
                
                // En móvil, un toque largo muestra el tooltip
                let timeoutId;
                tarjeta.addEventListener('touchstart', () => {
                    timeoutId = setTimeout(() => {
                        mostrarTooltipTarjeta.call(tarjeta);
                    }, 500); // 500ms para considerar un toque largo
                });
                
                tarjeta.addEventListener('touchend', () => {
                    clearTimeout(timeoutId);
                });
                
                tarjeta.addEventListener('touchmove', () => {
                    clearTimeout(timeoutId);
                });
            });
        }
        
        // Función para mostrar tooltip en día del calendario
        function mostrarTooltipDia(e) {
            // Obtener eventos del día
            const fechaStr = this.getAttribute('data-fecha');
            if (!fechaStr) return;
            
            const [anio, mes, dia] = fechaStr.split('-').map(Number);
            const fecha = new Date(anio, mes-1, dia);
            
            // Intentar usar la función original o implementar una básica
            let eventos = [];
            if (typeof window.obtenerEventosPorFecha === 'function') {
                eventos = window.obtenerEventosPorFecha(fecha);
            } else {
                // Si no existe la función, verificar si podemos obtener eventos de otra manera
                eventos = buscarEventosPorFecha(fecha);
            }
            
            if (eventos.length === 0) return;
            
            // Si hay múltiples eventos, mostrar el primero con indicación
            const evento = eventos[0];
            
            // Actualizar tooltip
            const tooltipEl = document.getElementById('evento-tooltip');
            tooltipEl.querySelector('.tooltip-title').textContent = evento.titulo;
            tooltipEl.querySelector('.tooltip-category').textContent = capitalizarPrimera(evento.categoria);
            tooltipEl.querySelector('.tooltip-date').textContent = formatoFecha(fecha);
            tooltipEl.querySelector('.tooltip-description').textContent = 
                truncarTexto(evento.descripcion || evento.descripción || '', 120);
            tooltipEl.querySelector('.tooltip-location').textContent = 
                evento.ubicacion || evento.ubicación || 'Ubicación por definir';
            
            // Si hay más de un evento, mostrar indicador
            const footerEl = tooltipEl.querySelector('.tooltip-footer');
            const moreIndicator = footerEl.querySelector('.tooltip-more');
            if (eventos.length > 1) {
                if (moreIndicator) {
                    moreIndicator.textContent = `+${eventos.length - 1} más`;
                } else {
                    const moreEl = document.createElement('span');
                    moreEl.className = 'tooltip-more';
                    moreEl.textContent = `+${eventos.length - 1} más`;
                    footerEl.appendChild(moreEl);
                }
            } else if (moreIndicator) {
                moreIndicator.remove();
            }
            
            // Configurar el botón de acción
            const actionBtn = tooltipEl.querySelector('.tooltip-action');
            actionBtn.onclick = () => {
                ocultarTooltip();
                if (typeof window.mostrarDetallesEvento === 'function') {
                    window.mostrarDetallesEvento(evento.id);
                } else {
                    // Alternativa si la función no existe
                    console.log('Mostrar detalles de evento no disponible');
                }
            };
            
            // Posicionar tooltip
            const rect = this.getBoundingClientRect();
            const esMobil = window.innerWidth <= 768;
            
            if (!esMobil) {
                // En escritorio, posicionar junto al día
                tooltipEl.style.top = rect.bottom + 10 + 'px';
                tooltipEl.style.left = rect.left + 'px';
                
                // Ajustar si está fuera de la pantalla
                const tooltipRect = tooltipEl.getBoundingClientRect();
                if (tooltipRect.right > window.innerWidth) {
                    tooltipEl.style.left = (window.innerWidth - tooltipRect.width - 10) + 'px';
                }
            }
            
            // Mostrar tooltip
            tooltipEl.classList.add('active');
            
            // Detener la propagación
            e.stopPropagation();
        }
        
        // Toggle para dispositivos táctiles
        function toggleTooltipDia(e) {
            const tooltipEl = document.getElementById('evento-tooltip');
            if (tooltipEl.classList.contains('active')) {
                ocultarTooltip();
            } else {
                mostrarTooltipDia.call(this, e);
            }
        }
        
        // Función para mostrar tooltip en tarjeta de evento
        function mostrarTooltipTarjeta() {
            const eventoId = this.getAttribute('data-id');
            if (!eventoId) return;
            
            let evento;
            if (typeof window.obtenerEventoPorId === 'function') {
                evento = window.obtenerEventoPorId(eventoId);
            } else {
                evento = buscarEventoPorId(eventoId);
            }
            
            if (!evento) return;
            
            // Misma lógica que el tooltip de día pero con datos del evento
            const tooltipEl = document.getElementById('evento-tooltip');
            tooltipEl.querySelector('.tooltip-title').textContent = evento.titulo;
            tooltipEl.querySelector('.tooltip-category').textContent = capitalizarPrimera(evento.categoria);
            
            // Fecha formateada
            let fechaTexto = 'Fecha no disponible';
            if (evento.fechaInicioObj) {
                fechaTexto = formatoFecha(evento.fechaInicioObj);
            } else if (evento.fechaInicio) {
                const fecha = parsearFecha(evento.fechaInicio);
                if (fecha) {
                    fechaTexto = formatoFecha(fecha);
                }
            }
            tooltipEl.querySelector('.tooltip-date').textContent = fechaTexto;
            
            tooltipEl.querySelector('.tooltip-description').textContent = 
                evento.descripcion || evento.descripción || '';
            tooltipEl.querySelector('.tooltip-location').textContent = 
                evento.ubicacion || evento.ubicación || 'Ubicación por definir';
            
            // Limpiar indicador de "más"
            const moreIndicator = tooltipEl.querySelector('.tooltip-more');
            if (moreIndicator) {
                moreIndicator.remove();
            }
            
            // Configurar el botón de acción
            const actionBtn = tooltipEl.querySelector('.tooltip-action');
            actionBtn.onclick = () => {
                ocultarTooltip();
                if (typeof window.mostrarDetallesEvento === 'function') {
                    window.mostrarDetallesEvento(evento.id);
                }
            };
            
            // Posicionar tooltip
            const rect = this.getBoundingClientRect();
            const esMobil = window.innerWidth <= 768;
            
            if (!esMobil) {
                // En escritorio, posicionar al lado de la tarjeta
                tooltipEl.style.top = rect.top + 'px';
                tooltipEl.style.left = (rect.right + 10) + 'px';
                
                // Ajustar si está fuera de la pantalla
                const tooltipRect = tooltipEl.getBoundingClientRect();
                if (tooltipRect.right > window.innerWidth) {
                    tooltipEl.style.left = (rect.left - tooltipRect.width - 10) + 'px';
                }
                
                if (tooltipRect.bottom > window.innerHeight) {
                    tooltipEl.style.top = (window.innerHeight - tooltipRect.height - 10) + 'px';
                }
            }
            
            // Mostrar tooltip
            tooltipEl.classList.add('active');
        }
        
        // Ocultar tooltip
        function ocultarTooltip() {
            const tooltipEl = document.getElementById('evento-tooltip');
            tooltipEl.classList.remove('active');
        }
        
        // Cerrar tooltip al hacer clic fuera
        document.addEventListener('click', function(e) {
            const tooltipEl = document.getElementById('evento-tooltip');
            if (tooltipEl && !tooltipEl.contains(e.target)) {
                ocultarTooltip();
            }
        });
        
        // Función utilitaria para truncar texto
        function truncarTexto(texto, maxLongitud) {
            if (!texto) return 'Sin descripción disponible';
            if (texto.length <= maxLongitud) return texto;
            return texto.substring(0, maxLongitud) + '...';
        }
        
        // Función utilitaria para capitalizar primera letra
        function capitalizarPrimera(texto) {
            if (!texto) return '';
            return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
        }
        
        // Función utilitaria para formatear fecha
        function formatoFecha(fecha, incluirSemana = true) {
            if (!fecha) return 'Fecha por definir';
            
            const opciones = incluirSemana ? 
                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } : 
                { year: 'numeric', month: 'long', day: 'numeric' };
            
            return fecha.toLocaleDateString('es-ES', opciones);
        }
        
        // Función utilitaria para parsear fecha
        function parsearFecha(fechaStr) {
            if (!fechaStr) return null;
            
            // Intentar detectar formato
            const partes = fechaStr.split('/');
            if (partes.length !== 3) return null;
            
            // Valores numéricos
            const parte1 = parseInt(partes[0]);
            const parte2 = parseInt(partes[1]);
            const parte3 = parseInt(partes[2]);
            
            // Asumimos MM/DD/YYYY por defecto
            let mes = parte1 - 1; // Restar 1 porque en JS los meses van de 0-11
            let dia = parte2;
            let anio = parte3;
            
            // Si el primer valor parece día (>12) y el segundo valor parece mes (≤12)
            if (parte1 > 12 && parte2 <= 12) {
                // Es DD/MM/YYYY
                dia = parte1;
                mes = parte2 - 1;
            }
            
            // Crear la fecha
            const fecha = new Date(anio, mes, dia);
            
            // Verificar validez
            if (isNaN(fecha.getTime())) {
                return null;
            }
            
            return fecha;
        }
        
        // Función de búsqueda básica de eventos por fecha (fallback)
        function buscarEventosPorFecha(fecha) {
            if (!fecha) return [];
            
            // Si window.allEventos existe, usar esa fuente de datos
            if (window.allEventos && Array.isArray(window.allEventos)) {
                return window.allEventos.filter(evento => {
                    const fechaEvento = evento.fechaInicioObj || parsearFecha(evento.fechaInicio);
                    if (!fechaEvento) return false;
                    
                    return fechaEvento.getDate() === fecha.getDate() &&
                           fechaEvento.getMonth() === fecha.getMonth() &&
                           fechaEvento.getFullYear() === fecha.getFullYear();
                });
            }
            
            // Si no hay fuente de datos clara, devolver array vacío
            return [];
        }
        
        // Función de búsqueda básica de evento por ID (fallback)
        function buscarEventoPorId(id) {
            if (!id) return null;
            
            // Si window.allEventos existe, usar esa fuente de datos
            if (window.allEventos && Array.isArray(window.allEventos)) {
                return window.allEventos.find(evento => evento.id == id) || null;
            }
            
            return null;
        }
        
        // Ejecutar configuración inicial
        configurarTooltipsCalendario();
        
        // Observar cambios en el DOM para reconfiguraciones
        const observer = new MutationObserver((mutations) => {
            let actualizarTooltips = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && 
                    (mutation.target.id === 'calendario-grid' || 
                     mutation.target.id === 'eventos-grid' ||
                     mutation.target.classList.contains('dia-container') ||
                     mutation.target.classList.contains('evento-card'))) {
                    actualizarTooltips = true;
                }
            });
            
            if (actualizarTooltips) {
                setTimeout(configurarTooltipsCalendario, 100);
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    /**
     * FIX 5: Paginación para eventos en la vista "Solo Eventos"
     * Limita el número de eventos mostrados inicialmente y agrega un botón "Cargar más"
     */
    function implementarPaginacionEventos() {
        // Variables de paginación
        const eventosConfig = {
            eventosPerPage: 10, // Número de eventos por página
            currentPage: 1,     // Página actual
            orden: 'fecha',     // Ordenación por defecto (fecha, categoría, alfabético)
            direccion: 'asc'    // Dirección de ordenación (asc, desc)
        };
        
        // Estilos para la paginación y controles de ordenación
        const estiloPaginacion = document.createElement('style');
        estiloPaginacion.textContent = `
            /* Controles de paginación y ordenación */
            .eventos-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .eventos-sort {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .sort-label {
                font-size: 14px;
                color: #666;
            }
            
            .sort-select {
                padding: 6px 12px;
                border: 1px solid #ddd;
                border-radius: 20px;
                background-color: white;
                font-size: 14px;
                color: var(--primary-dark, #004b7f);
                cursor: pointer;
            }
            
            .sort-direction {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 1px solid #ddd;
                background-color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .sort-direction:hover {
                background-color: #f0f0f0;
            }
            
            .sort-direction.desc .sort-icon {
                transform: rotate(180deg);
            }
            
            /* Paginación */
            .pagination-container {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 20px;
                margin-bottom: 20px;
            }
            
            .load-more-btn {
                padding: 10px 25px;
                background-color: var(--primary, #0072CE);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            
            .load-more-btn:hover {
                background-color: var(--primary-dark, #004b7f);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .load-more-btn:disabled {
                background-color: #ccc;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .load-more-btn .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
                display: none;
            }
            
            .load-more-btn.loading .spinner {
                display: inline-block;
            }
            
            .load-more-btn.loading .btn-text {
                display: none;
            }
            
            /* Contador de eventos */
            .eventos-counter {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
                color: #666;
            }
            
            .eventos-counter strong {
                color: var(--primary, #0072CE);
            }
        `;
        document.head.appendChild(estiloPaginacion);
        
        // Función para inyectar los controles de ordenación y paginación
        function inyectarControlesPaginacion() {
            const eventosContainer = document.querySelector('.eventos-list-container');
            const eventosHeader = document.querySelector('.eventos-list-header');
            
            if (!eventosContainer || !eventosHeader) return;
            
            // Crear controles solo si no existen
            if (!document.querySelector('.eventos-controls')) {
                const controlesContainer = document.createElement('div');
                controlesContainer.className = 'eventos-controls';
                controlesContainer.innerHTML = `
                    <div class="eventos-sort">
                        <span class="sort-label">Ordenar por:</span>
                        <select class="sort-select" id="eventos-sort-select">
                            <option value="fecha">Fecha</option>
                            <option value="categoria">Categoría</option>
                            <option value="alfabetico">Alfabético</option>
                        </select>
                        <button class="sort-direction" id="sort-direction-btn">
                            <span class="sort-icon">↑</span>
                        </button>
                    </div>
                `;
                
                // Insertar después del header
                eventosHeader.after(controlesContainer);
                
                // Configurar eventos de los controles
                const sortSelect = document.getElementById('eventos-sort-select');
                const sortDirectionBtn = document.getElementById('sort-direction-btn');
                
                if (sortSelect) {
                    sortSelect.addEventListener('change', function() {
                        eventosConfig.orden = this.value;
                        eventosConfig.currentPage = 1; // Reiniciar paginación
                        interceptarMostrarEventos();
                    });
                }
                
                if (sortDirectionBtn) {
                    sortDirectionBtn.addEventListener('click', function() {
                        eventosConfig.direccion = eventosConfig.direccion === 'asc' ? 'desc' : 'asc';
                        this.classList.toggle('desc', eventosConfig.direccion === 'desc');
                        eventosConfig.currentPage = 1; // Reiniciar paginación
                        interceptarMostrarEventos();
                    });
                }
            }
        }
        
        // Función para interceptar la función mostrarEventos original
        function interceptarMostrarEventos() {
            // Si ya hemos interceptado la función, no volver a hacerlo
            if (window._eventosMostrarOriginal) {
                return;
            }
            
            // Guardar referencia a la función original si existe
            if (typeof window.mostrarEventos === 'function') {
                window._eventosMostrarOriginal = window.mostrarEventos;
                
                // Reemplazar con nuestra versión
                window.mostrarEventos = function(...args) {
                    // Primero llamar a la función original para obtener los eventos filtrados
                    window._eventosMostrarOriginal.apply(this, args);
                    
                    // Luego aplicar nuestra paginación
                    aplicarPaginacionEventos();
                };
            }
            
            // Si no podemos interceptar, al menos podemos aplicar nuestra paginación directamente
            aplicarPaginacionEventos();
        }
        
        // Función principal para aplicar paginación a los eventos mostrados
        function aplicarPaginacionEventos() {
            // Solo aplicar en la vista "Solo Eventos"
            const vistaEventosBtn = document.querySelector('.vista-btn[data-vista="eventos"]');
            const estaEnVistaEventos = vistaEventosBtn && vistaEventosBtn.classList.contains('active');
            
            if (!estaEnVistaEventos) {
                // Si no estamos en la vista correcta, no hacer nada
                return;
            }
            
            // Referencias a elementos necesarios
            const eventosGrid = document.getElementById('eventos-grid');
            const eventosCounter = document.getElementById('eventos-counter');
            
            if (!eventosGrid) return;
            
            // Obtener todos los eventos actualmente mostrados
            const eventosCards = eventosGrid.querySelectorAll('.evento-card');
            if (eventosCards.length === 0) return; // No hay eventos para paginar
            
            // Convertir a array para poder ordenar
            const eventosArray = Array.from(eventosCards);
            
            // Ordenar según configuración
            ordenarEventos(eventosArray);
            
            // Ocultar todos los eventos primero
            eventosArray.forEach(card => {
                card.style.display = 'none';
            });
            
            // Mostrar solo la cantidad correspondiente a la página actual
            const inicio = 0;
            const fin = eventosConfig.currentPage * eventosConfig.eventosPerPage;
            
            eventosArray.slice(inicio, fin).forEach(card => {
                card.style.display = '';
            });
            
            // Actualizar contador
            if (eventosCounter) {
                const mostrados = Math.min(fin, eventosArray.length);
                eventosCounter.innerHTML = `
                    <span>Mostrando <strong>${mostrados}</strong> de <strong>${eventosArray.length}</strong> eventos</span>
                `;
            }
            
            // Agregar o actualizar botón "Cargar más"
            crearOActualizarBotonCargarMas(eventosGrid, eventosArray.length, fin);
        }
        
        // Función para ordenar los eventos según la configuración
        function ordenarEventos(eventosArray) {
            switch (eventosConfig.orden) {
                case 'fecha':
                    eventosArray.sort((a, b) => {
                        // Intentar extraer la fecha de los elementos
                        const fechaA = extraerFecha(a);
                        const fechaB = extraerFecha(b);
                        
                        if (!fechaA || !fechaB) return 0;
                        
                        return eventosConfig.direccion === 'asc' ? 
                            fechaA - fechaB : fechaB - fechaA;
                    });
                    break;
                    
                case 'categoria':
                    eventosArray.sort((a, b) => {
                        const categoriaA = extraerCategoria(a);
                        const categoriaB = extraerCategoria(b);
                        
                        const comparacion = categoriaA.localeCompare(categoriaB);
                        return eventosConfig.direccion === 'asc' ? 
                            comparacion : -comparacion;
                    });
                    break;
                    
                case 'alfabetico':
                    eventosArray.sort((a, b) => {
                        const tituloA = extraerTitulo(a);
                        const tituloB = extraerTitulo(b);
                        
                        const comparacion = tituloA.localeCompare(tituloB);
                        return eventosConfig.direccion === 'asc' ? 
                            comparacion : -comparacion;
                    });
                    break;
            }
        }
        
        // Funciones auxiliares para extraer información de eventos
        function extraerFecha(eventoCard) {
            // Intentar extraer la fecha de la metadata del evento
            const fechaText = eventoCard.querySelector('.evento-meta-item:first-child span:last-child')?.textContent;
            if (!fechaText) return null;
            
            // Intentar parsear fecha
            try {
                // Formato típico en español: 10 de marzo de 2025
                const match = fechaText.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/i);
                
                if (match) {
                    const dia = parseInt(match[1]);
                    let mes = -1;
                    const anio = parseInt(match[3]);
                    
                    // Convertir nombre de mes a número
                    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                    
                    mes = meses.findIndex(m => m === match[2].toLowerCase());
                    
                    if (mes !== -1 && !isNaN(dia) && !isNaN(anio)) {
                        return new Date(anio, mes, dia).getTime();
                    }
                }
                
                // Si no se pudo parsear, intentar como fecha genérica
                return new Date(fechaText).getTime();
            } catch (e) {
                return 0; // Si hay error en el parseo, colocar al principio
            }
        }
        
        function extraerCategoria(eventoCard) {
            // Verificar clase del evento
            const clases = eventoCard.className.split(' ');
            for (const clase of clases) {
                if (['curso', 'taller', 'grupo', 'activacion', 'evento'].includes(clase)) {
                    return clase;
                }
            }
            
            // Alternativa: buscar texto de categoría
            const badgeText = eventoCard.querySelector('.evento-badge')?.textContent || '';
            return badgeText.toLowerCase();
        }
        
        function extraerTitulo(eventoCard) {
            return eventoCard.querySelector('h3')?.textContent || '';
        }
        
        // Función para crear o actualizar el botón "Cargar más"
        function crearOActualizarBotonCargarMas(eventosGrid, totalEventos, eventosVisible) {
            // Eliminar botón existente si hay
            const paginacionExistente = document.querySelector('.pagination-container');
            if (paginacionExistente) {
                paginacionExistente.remove();
            }
            
            // Si ya se muestran todos los eventos, no crear botón
            if (eventosVisible >= totalEventos) {
                return;
            }
            
            // Crear contenedor de paginación
            const paginacionContainer = document.createElement('div');
            paginacionContainer.className = 'pagination-container';
            
            // Crear botón "Cargar más"
            const botonCargarMas = document.createElement('button');
            botonCargarMas.className = 'load-more-btn';
            botonCargarMas.innerHTML = `
                <span class="spinner"></span>
                <span class="btn-text">Cargar más eventos</span>
            `;
            
            // Evento click para cargar más
            botonCargarMas.addEventListener('click', function() {
                // Mostrar spinner
                this.classList.add('loading');
                
                // Simular carga (para efecto visual)
                setTimeout(() => {
                    // Incrementar página
                    eventosConfig.currentPage++;
                    
                    // Aplicar paginación con nueva página
                    aplicarPaginacionEventos();
                    
                    // Quitar spinner
                    this.classList.remove('loading');
                    
                    // Scroll suave al nuevo contenido
                    const nuevoContenido = eventosGrid.querySelectorAll('.evento-card')[eventosVisible];
                    if (nuevoContenido) {
                        nuevoContenido.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 400);
            });
            
            // Agregar botón al contenedor
            paginacionContainer.appendChild(botonCargarMas);
            
            // Agregar contenedor después de la grid de eventos
            eventosGrid.after(paginacionContainer);
        }
        
        // Monitorear cambios de vista para aplicar paginación
        const vistaBtns = document.querySelectorAll('.vista-btn');
        vistaBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Si es la vista de eventos, aplicar paginación
                if (this.getAttribute('data-vista') === 'eventos') {
                    // Inyectar controles
                    inyectarControlesPaginacion();
                    
                    // Dar tiempo a que se carguen los eventos
                    setTimeout(() => {
                        // Reiniciar a página 1
                        eventosConfig.currentPage = 1;
                        // Aplicar paginación
                        interceptarMostrarEventos();
                    }, 100);
                }
            });
        });
        
        // Observar cambios en el DOM para detectar cuando se muestran eventos
        const observador = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && 
                    mutation.target.id === 'eventos-grid' &&
                    mutation.addedNodes.length > 0) {
                    
                    // Inyectar controles de paginación
                    inyectarControlesPaginacion();
                    
                    // Interceptar función mostrarEventos
                    interceptarMostrarEventos();
                    
                    break;
                }
            }
        });
        
        // Iniciar observación
        const eventosContainer = document.querySelector('.eventos-list-container');
        if (eventosContainer) {
            observador.observe(eventosContainer, { childList: true, subtree: true });
        }
        
        // Aplicar inyección inicial de controles y paginación
        setTimeout(() => {
            inyectarControlesPaginacion();
            interceptarMostrarEventos();
        }, 500);
    }
    
    // Función para mostrar mensajes tipo toast
    function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
        // Buscar o crear contenedor de toasts
        let toastContainer = document.getElementById('toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        // Crear el toast
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        
        // Estilos para el toast
        toast.style.padding = '12px 20px';
        toast.style.marginBottom = '10px';
        toast.style.backgroundColor = 
            tipo === 'success' ? '#4CAF50' : 
            tipo === 'error' ? '#F44336' : 
            tipo === 'warning' ? '#FFC107' : 
            '#2196F3'; // info
        toast.style.color = tipo === 'warning' ? '#333' : 'white';
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.animation = 'slideIn 0.3s, fadeOut 0.5s 2.5s forwards';
        toast.style.maxWidth = '300px';
        
        // Agregar al contenedor
        toastContainer.appendChild(toast);
        
        // Eliminar después de la duración
        setTimeout(() => {
            toast.remove();
        }, duracion);
    }
    
    // Agregar los keyframes para la animación de toasts si no existen
    if (!document.getElementById('toast-animations')) {
        const toastStyle = document.createElement('style');
        toastStyle.id = 'toast-animations';
        toastStyle.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(toastStyle);
    }
})();
