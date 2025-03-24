 * fixes.js - Script corrector y optimizador para el Visualizador de Eventos
 * 
 * Este script aplica correcciones y mejoras al visualizador de eventos sin modificar
 * los archivos originales. Está diseñado para ser incluido después del script principal.
 * 
 * Mejoras implementadas:
 * 1. Eliminación de etiquetas de categoría flotantes
 * 2. Optimización de espacios para móviles
 * 3. Mejoras en el calendario (navegación, usabilidad)
 * 4. Tooltips interactivos para previsualización rápida
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
        eliminarEtiquetaCategoriaFlotante();
        optimizarEspaciosMobile();
        mejorarCalendario();
        implementarTooltipsInteractivos();
        
        console.log('✅ Correcciones aplicadas correctamente');
    }
    
    /**
     * FIX 1: Elimina las etiquetas de categoría que aparecen en la parte superior
     * (como la etiqueta "Activación" que se muestra en la esquina superior derecha)
     */
    function eliminarEtiquetaCategoriaFlotante() {
        // Crear observador para detectar adiciones dinámicas al DOM
        const observadorCuerpo = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(nodo) {
                        if (nodo.nodeType === 1) {
                            verificarYEliminarEtiqueta(nodo);
                            
                            if (nodo.querySelectorAll) {
                                nodo.querySelectorAll('*').forEach(verificarYEliminarEtiqueta);
                            }
                        }
                    });
                }
            });
        });
        
        // Iniciar observación del cuerpo
        observadorCuerpo.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Función para verificar si un elemento es la etiqueta flotante
        function verificarYEliminarEtiqueta(elemento) {
            if (!elemento || elemento.nodeType !== 1) return;
            
            // Condiciones que identifican nuestra etiqueta flotante
            const esEtiquetaFlotante = (
                // 1. Está relativamente sola (no dentro de un contenedor de categorías)
                (elemento.parentElement === document.body || elemento.parentElement.classList.contains('eventos-container')) &&
                
                // 2. Tiene clase o estilo relacionado con categorías
                (
                    elemento.classList.contains('activacion') || 
                    elemento.classList.contains('categoria-tag') ||
                    elemento.classList.contains('categoria-badge') ||
                    elemento.classList.contains('badge') ||
                    (elemento.style && elemento.style.backgroundColor && 
                     (elemento.style.backgroundColor.includes('rgb(0, 150, 136)') || 
                      elemento.style.backgroundColor.includes('#009688')))
                ) &&
                
                // 3. Contiene texto de alguna categoría
                (
                    elemento.textContent === 'Activación' ||
                    elemento.textContent === 'Activacion' ||
                    elemento.textContent === 'Curso' ||
                    elemento.textContent === 'Cursos' ||
                    elemento.textContent === 'Taller' ||
                    elemento.textContent === 'Talleres' ||
                    elemento.textContent === 'Grupo' ||
                    elemento.textContent === 'Grupos' ||
                    elemento.textContent === 'Evento' ||
                    elemento.textContent === 'Eventos'
                ) &&
                
                // 4. Está posicionada cerca de la parte superior
                (
                    elemento.style.position === 'fixed' ||
                    elemento.style.position === 'absolute' ||
                    elemento.getBoundingClientRect().top < 100
                )
            );
            
            // Si es nuestra etiqueta flotante, eliminarla
            if (esEtiquetaFlotante) {
                console.log('Etiqueta flotante de categoría encontrada y eliminada:', elemento.textContent);
                elemento.remove();
            }
        }
        
        // CSS para ocultar etiquetas que podrían aparecer
        const estilo = document.createElement('style');
        estilo.textContent = `
            /* Ocultar etiquetas flotantes de categoría */
            body > .categoria-tag,
            body > .categoria-badge, 
            body > .activacion,
            body > [class*="categoria-"],
            body > [class*="badge-"],
            [style*="position: fixed"][class*="categoria"],
            [style*="position: absolute"][class*="categoria"]:not(.categorias-container *),
            [style*="position: fixed"][class*="badge"],
            [style*="position: absolute"][class*="badge"]:not(.categorias-container *) {
                display: none !important;
            }
        `;
        document.head.appendChild(estilo);
        
        // Verificar elementos existentes inmediatamente
        document.querySelectorAll('body > *').forEach(verificarYEliminarEtiqueta);
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
