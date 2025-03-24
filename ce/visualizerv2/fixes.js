/**
 * enhanced-fixes.js - Script optimizado para el Visualizador de Eventos
 * 
 * Soluciona:
 * 1. Elimina completamente las etiquetas flotantes "Act Grupo" en la esquina superior
 * 2. Implementa paginación en la vista "Solo Eventos" (6 eventos por página)
 */

// Función autoejecutable para evitar contaminación del scope global
(function() {
    'use strict';
    
    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', iniciarFixes);
    
    // Variables globales
    const CONFIG = {
        eventosPerPage: 6,            // Número de eventos por página (reducido para mejor UX)
        currentPage: 1,               // Página actual
        orden: 'fecha',               // Ordenación por defecto
        direccion: 'asc',             // Dirección de ordenación
        fixesAplicados: false,        // Control para evitar aplicar fixes múltiples veces
        intervalIds: []               // Almacenar IDs de intervalos para limpieza
    };
    
    // Función principal que inicia todas las mejoras
    function iniciarFixes() {
        if (CONFIG.fixesAplicados) return;
        
        console.log('🛠️ Aplicando fixes optimizados al visualizador de eventos...');
        
        // Ejecutar todas las mejoras
        eliminarEtiquetasFlotantesAgresivo();
        implementarPaginacionEventos();
        
        // Marcar como aplicados
        CONFIG.fixesAplicados = true;
        
        console.log('✅ Fixes aplicados correctamente - Versión mejorada');
    }
    
    /**
     * FIX 1: Eliminación agresiva de etiquetas flotantes 
     * Enfoque más completo para eliminar "Act Grupo" en la esquina superior
     */
    function eliminarEtiquetasFlotantesAgresivo() {
        // Estilos más agresivos - aplicar inmediatamente
        const estiloAgresivo = document.createElement('style');
        estiloAgresivo.id = 'fix-etiquetas-flotantes-style-agresivo';
        estiloAgresivo.textContent = `
            /* 1. Ocultar absolutamente todo elemento en la esquina superior derecha fuera del contenedor principal */
            body > *:not(.eventos-container):not(.dia-modal):not(.evento-modal):not(#toast-container):not(noscript):not(script):not(style) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                z-index: -9999 !important;
                position: absolute !important;
                transform: scale(0) !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
            }
            
            /* 2. Target específico a los colores típicos de Act/Grupo */
            [style*="rgb(0, 150, 136)"]:not(.categoria-tag):not(.leyenda-color):not(.dia-evento-cat):not(.dia-indicador),
            [style*="rgb(156, 39, 176)"]:not(.categoria-tag):not(.leyenda-color):not(.dia-evento-cat):not(.dia-indicador),
            [style*="background-color: rgb(0, 150, 136)"]:not(.categoria-tag):not(.leyenda-color):not(.dia-evento-cat):not(.dia-indicador),
            [style*="background-color: rgb(156, 39, 176)"]:not(.categoria-tag):not(.leyenda-color):not(.dia-evento-cat):not(.dia-indicador) {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* 3. Prevenir que elementos posicionados aparezcan en la esquina */
            body > [style*="position: fixed"]:not(.dia-modal):not(.evento-modal):not(#toast-container),
            body > [style*="position: absolute"]:not(.dia-modal):not(.evento-modal):not(#toast-container) {
                display: none !important;
                visibility: hidden !important;
            }
            
            /* 4. Específicamente target al texto Act/Grupo */
            body > div:contains("Act"),
            body > div:contains("Grupo"),
            body > div:contains("Activacion"),
            body > div:contains("Activación"),
            body > span:contains("Act"),
            body > span:contains("Grupo") {
                display: none !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(estiloAgresivo);
        
        // Ejecutar limpieza inmediata y programar limpiezas periódicas
        limpiarEtiquetasInmediatamente();
        
        // Programar limpiezas recurrentes (muy frecuentes al inicio, luego más espaciadas)
        const intervalos = [50, 100, 200, 500, 1000, 2000];
        intervalos.forEach(intervalo => {
            const id = setInterval(limpiarEtiquetasInmediatamente, intervalo);
            CONFIG.intervalIds.push(id);
            
            // Autolimpieza después de 10 segundos para los intervalos cortos
            if (intervalo < 1000) {
                setTimeout(() => {
                    clearInterval(id);
                    const index = CONFIG.intervalIds.indexOf(id);
                    if (index > -1) {
                        CONFIG.intervalIds.splice(index, 1);
                    }
                }, 10000);
            }
        });
        
        // Observador de mutaciones para detectar nuevos elementos
        const observador = new MutationObserver((mutations) => {
            let elementosAgregados = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    elementosAgregados = true;
                }
            });
            
            if (elementosAgregados) {
                limpiarEtiquetasInmediatamente();
            }
        });
        
        // Configurar observación del body y document
        observador.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Limpiar al cambiar de vista
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Limpiar varias veces en intervalos después de cambiar vista
                setTimeout(limpiarEtiquetasInmediatamente, 50);
                setTimeout(limpiarEtiquetasInmediatamente, 200);
                setTimeout(limpiarEtiquetasInmediatamente, 500);
            });
        });
        
        // Métodos especiales para navegadores modernos (para texto Act/Grupo)
        if (!document.getElementsByTagName('style')[0].textContent.includes(':contains')) {
            document.querySelectorAll('body > *').forEach(elemento => {
                const texto = elemento.textContent.trim().toLowerCase();
                if (texto === 'act' || texto === 'grupo' || texto === 'act grupo' || 
                    texto === 'activacion' || texto === 'activación') {
                    elemento.style.display = 'none';
                    console.log('Elemento eliminado por contenido de texto:', elemento);
                }
            });
        }
    }
    
    // Función para limpiar etiquetas agresivamente
    function limpiarEtiquetasInmediatamente() {
        // 1. Buscar todos los elementos a nivel de body que no sean parte de la estructura principal
        const elementosNoDeseados = document.querySelectorAll('body > div:not(.eventos-container):not(.dia-modal):not(.evento-modal):not(#toast-container)');
        
        elementosNoDeseados.forEach(elemento => {
            // Comprobar si es un elemento espurio (no parte del visualizador)
            const rect = elemento.getBoundingClientRect();
            const estaEnElLimite = rect.top < 150 && rect.right > window.innerWidth - 150;
            
            // Verificar contenido de texto
            const texto = elemento.textContent.trim().toLowerCase();
            const contieneTextoSospechoso = texto.includes('act') || texto.includes('grupo') || 
                                          texto.includes('activacion') || texto.includes('activación');
            
            // Verificar estilo o clase
            const estilo = window.getComputedStyle(elemento);
            const color = estilo.backgroundColor;
            const esTealOPurpura = color.includes('rgb(0, 150, 136)') || color.includes('rgb(156, 39, 176)');
            
            if (estaEnElLimite || contieneTextoSospechoso || esTealOPurpura) {
                // Ocultar utilizando múltiples técnicas
                elemento.style.cssText = `
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
                `;
                
                // También ocultar hijos
                Array.from(elemento.children).forEach(hijo => {
                    hijo.style.cssText = elemento.style.cssText;
                });
                
                console.log('Elemento flotante eliminado:', elemento);
            }
        });
        
        // 2. Buscar específicamente elementos con los colores de Act/Grupo
        document.querySelectorAll('*').forEach(elemento => {
            const estilo = window.getComputedStyle(elemento);
            const color = estilo.backgroundColor;
            
            if ((color.includes('rgb(0, 150, 136)') || color.includes('rgb(156, 39, 176)')) && 
                !esElementoNecesario(elemento)) {
                
                elemento.style.cssText = `
                    display: none !important;
                    visibility: hidden !important;
                `;
                
                console.log('Elemento con color Act/Grupo eliminado:', elemento);
            }
        });
        
        // 3. Forzar remoción inmediata para elementos posicionados
        removePositionedElements();
    }
    
    // Función para eliminar elementos posicionados
    function removePositionedElements() {
        // Lista blanca de elementos que deberían mantenerse
        const whitelistSelectors = [
            '.eventos-container', '.dia-modal', '.evento-modal', '#toast-container',
            '.categoria-tag', '.leyenda-color', '.dia-evento-cat', '.dia-indicador'
        ];
        
        const whitelistElements = [];
        whitelistSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                whitelistElements.push(el);
            });
        });
        
        // Buscar elementos posicionados que no estén en la lista blanca
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if ((style.position === 'fixed' || style.position === 'absolute') && 
                !whitelistElements.includes(el) && 
                !whitelistElements.some(whiteEl => whiteEl.contains(el))) {
                
                // Verificar si está en la parte superior
                const rect = el.getBoundingClientRect();
                if (rect.top < 150) {
                    el.style.cssText = `
                        display: none !important;
                        visibility: hidden !important;
                    `;
                    console.log('Elemento posicionado eliminado:', el);
                }
            }
        });
    }
    
    // Verificar si un elemento es parte necesaria de la UI
    function esElementoNecesario(elemento) {
        return elemento.closest('.vista-selector') || 
               elemento.closest('.categorias-container') || 
               elemento.closest('.filtros-container') ||
               elemento.closest('.mes-selector') ||
               elemento.closest('.controles-container') ||
               elemento.closest('.dia-container') ||
               elemento.closest('.evento-card') ||
               elemento.closest('.leyenda-container') ||
               (elemento.className && 
                elemento.className.includes && 
                (elemento.className.includes('categoria-tag') || 
                 elemento.className.includes('vista-btn')));
    }
    
    /**
     * FIX 2: Paginación mejorada para eventos
     */
    function implementarPaginacionEventos() {
        // Estilos para la paginación
        const estiloPaginacion = document.createElement('style');
        estiloPaginacion.id = 'fix-paginacion-style';
        estiloPaginacion.textContent = `
            /* Controles de paginación y ordenación */
            .eventos-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
                gap: 10px;
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
                padding: 8px 15px;
                border: 1px solid #ddd;
                border-radius: 20px;
                background-color: white;
                font-size: 14px;
                color: var(--primary-dark, #004b7f);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .sort-direction {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 1px solid #ddd;
                background-color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
                margin-bottom: 30px;
            }
            
            .load-more-btn {
                padding: 12px 25px;
                background-color: var(--primary, #0072CE);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 10px rgba(0, 114, 206, 0.25);
            }
            
            .load-more-btn:hover {
                background-color: var(--primary-dark, #004b7f);
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(0, 114, 206, 0.35);
            }
            
            .load-more-btn:disabled {
                background-color: #ccc;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .load-more-btn .spinner {
                width: 18px;
                height: 18px;
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
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Contador de eventos */
            .eventos-counter {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                background: #f7f9fc;
                padding: 8px 15px;
                border-radius: 20px;
            }
            
            .eventos-counter strong {
                color: var(--primary, #0072CE);
            }
            
            /* Evento oculto */
            .evento-card.hidden-by-pagination {
                display: none !important;
            }
            
            /* Estilos responsivos */
            @media (max-width: 768px) {
                .eventos-controls {
                    flex-direction: column;
                    align-items: flex-start;
                    padding: 12px;
                }
                
                .eventos-sort {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .load-more-btn {
                    width: 100%;
                    justify-content: center;
                    padding: 10px;
                }
            }
        `;
        document.head.appendChild(estiloPaginacion);
        
        // Detectar e interceptar automáticamente mostrarEventos
        interceptarMostrarEventos();
        
        // Configurar triggers para reajustar la paginación
        configurarTriggersDePaginacion();
    }
    
    // Función para interceptar automáticamente mostrarEventos
    function interceptarMostrarEventos() {
        // Verificar si existe la función global mostrarEventos
        if (typeof window.mostrarEventos === 'function' && !window._eventosMostrarOriginal) {
            console.log('Interceptando función mostrarEventos...');
            
            // Guardar referencia a la función original
            window._eventosMostrarOriginal = window.mostrarEventos;
            
            // Reemplazar con nuestra versión
            window.mostrarEventos = function(...args) {
                // Primero llamar a la función original para obtener los eventos filtrados
                window._eventosMostrarOriginal.apply(this, args);
                
                // Luego aplicar nuestra paginación
                setTimeout(aplicarPaginacionEventos, 0);
            };
            
            console.log('Intercepción completada.');
        } else {
            // Si no está disponible aún, establecer un observador para detectarla
            establecerObservadorDeFuncion();
        }
        
        // Aplicar paginación inmediatamente
        setTimeout(aplicarPaginacionEventos, 100);
        setTimeout(aplicarPaginacionEventos, 500);
        setTimeout(aplicarPaginacionEventos, 1000);
    }
    
    // Establece un observador para detectar cuando se define la función mostrarEventos
    function establecerObservadorDeFuncion() {
        console.log('Configurando observador para detectar mostrarEventos...');
        
        // Verificar periódicamente
        const intervaloId = setInterval(() => {
            if (typeof window.mostrarEventos === 'function' && !window._eventosMostrarOriginal) {
                clearInterval(intervaloId);
                interceptarMostrarEventos();
            }
        }, 100);
        
        // Limpieza automática después de 10 segundos
        setTimeout(() => {
            clearInterval(intervaloId);
        }, 10000);
        
        CONFIG.intervalIds.push(intervaloId);
    }
    
    // Configura triggers para reajustar la paginación
    function configurarTriggersDePaginacion() {
        // 1. Escuchar cambios de vista
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.getAttribute('data-vista') === 'eventos') {
                    console.log('Vista de eventos detectada, aplicando paginación...');
                    CONFIG.currentPage = 1; // Reiniciar paginación
                    setTimeout(inyectarControlesPaginacion, 100);
                    setTimeout(aplicarPaginacionEventos, 200);
                }
            });
        });
        
        // 2. Escuchar cambios en filtros de categoría
        const categoriasContainer = document.getElementById('categorias-container');
        if (categoriasContainer) {
            categoriasContainer.addEventListener('click', function(e) {
                const categoriaEl = e.target.closest('.categoria-tag');
                if (!categoriaEl) return;
                
                setTimeout(() => {
                    CONFIG.currentPage = 1; // Reiniciar paginación
                    aplicarPaginacionEventos();
                }, 100);
            });
        }
        
        // 3. Escuchar cambios en la búsqueda
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            ['input', 'change', 'keyup', 'search'].forEach(evento => {
                searchInput.addEventListener(evento, function() {
                    setTimeout(() => {
                        CONFIG.currentPage = 1; // Reiniciar paginación
                        aplicarPaginacionEventos();
                    }, 100);
                });
            });
        }
        
        // 4. Observar el DOM para detectar cuando se agregan eventos
        const observador = new MutationObserver((mutations) => {
            let eventosCambiados = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && 
                    (mutation.target.id === 'eventos-grid' || 
                     mutation.target.classList.contains('eventos-grid'))) {
                    eventosCambiados = true;
                }
            });
            
            if (eventosCambiados) {
                setTimeout(inyectarControlesPaginacion, 50);
                setTimeout(aplicarPaginacionEventos, 100);
            }
        });
        
        // Iniciar observación
        const eventosContainer = document.querySelector('.eventos-list-container');
        if (eventosContainer) {
            observador.observe(eventosContainer, { childList: true, subtree: true });
        }
    }
    
    // Inyecta los controles de ordenación y paginación
    function inyectarControlesPaginacion() {
        const eventosListHeader = document.querySelector('.eventos-list-header');
        
        if (!eventosListHeader) return;
        
        // Verificar si ya existen los controles
        if (document.querySelector('.eventos-controls')) return;
        
        console.log('Inyectando controles de paginación...');
        
        // Crear controles
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
        eventosListHeader.after(controlesContainer);
        
        // Configurar eventos de los controles
        const sortSelect = document.getElementById('eventos-sort-select');
        const sortDirectionBtn = document.getElementById('sort-direction-btn');
        
        if (sortSelect) {
            sortSelect.value = CONFIG.orden; // Establecer valor inicial
            
            sortSelect.addEventListener('change', function() {
                CONFIG.orden = this.value;
                CONFIG.currentPage = 1; // Reiniciar paginación
                aplicarPaginacionEventos();
            });
        }
        
        if (sortDirectionBtn) {
            // Establecer estado inicial
            if (CONFIG.direccion === 'desc') {
                sortDirectionBtn.classList.add('desc');
            }
            
            sortDirectionBtn.addEventListener('click', function() {
                CONFIG.direccion = CONFIG.direccion === 'asc' ? 'desc' : 'asc';
                this.classList.toggle('desc', CONFIG.direccion === 'desc');
                CONFIG.currentPage = 1; // Reiniciar paginación
                aplicarPaginacionEventos();
            });
        }
    }
    
    // Función principal para aplicar paginación a los eventos
    function aplicarPaginacionEventos() {
        console.log('Aplicando paginación a eventos...');
        
        // Referencias a elementos necesarios
        const eventosGrid = document.getElementById('eventos-grid');
        const eventosCounter = document.getElementById('eventos-counter');
        
        if (!eventosGrid) {
            console.log('No se encontró la grid de eventos.');
            return;
        }
        
        // Verificar si estamos en la vista "Solo Eventos"
        const vistaEventosBtn = document.querySelector('.vista-btn[data-vista="eventos"]');
        const estaEnVistaEventos = vistaEventosBtn && vistaEventosBtn.classList.contains('active');
        
        // Obtener todos los eventos actualmente mostrados
        const eventosCards = eventosGrid.querySelectorAll('.evento-card');
        if (eventosCards.length === 0) {
            console.log('No hay eventos para paginar.');
            return;
        }
        
        // Asegurar que los controles estén inyectados
        inyectarControlesPaginacion();
        
        // Convertir a array para poder ordenar
        const eventosArray = Array.from(eventosCards);
        
        // Ordenar según configuración
        ordenarEventos(eventosArray);
        
        // Aplicar paginación
        const eventosPerPage = CONFIG.eventosPerPage;
        const currentPage = CONFIG.currentPage;
        
        // Restaurar visibilidad y luego ocultar según paginación
        eventosArray.forEach((card, index) => {
            card.classList.remove('hidden-by-pagination');
            
            // Aplicar paginación solo en la vista "Solo Eventos"
            if (estaEnVistaEventos && index >= currentPage * eventosPerPage) {
                card.classList.add('hidden-by-pagination');
            }
        });
        
        // Calcular eventos visibles
        const totalEventos = eventosArray.length;
        const eventosVisible = Math.min(currentPage * eventosPerPage, totalEventos);
        
        // Actualizar contador
        if (eventosCounter) {
            eventosCounter.innerHTML = `
                <span>Mostrando <strong>${eventosVisible}</strong> de <strong>${totalEventos}</strong> eventos</span>
            `;
        }
        
        // Agregar o actualizar botón "Cargar más"
        crearOActualizarBotonCargarMas(eventosGrid, totalEventos, eventosVisible, estaEnVistaEventos);
        
        console.log(`Paginación aplicada: ${eventosVisible}/${totalEventos} eventos visibles.`);
    }
    
    // Función para ordenar los eventos según la configuración
    function ordenarEventos(eventosArray) {
        switch (CONFIG.orden) {
            case 'fecha':
                eventosArray.sort((a, b) => {
                    const fechaA = extraerFecha(a);
                    const fechaB = extraerFecha(b);
                    
                    const comparacion = fechaA - fechaB;
                    return CONFIG.direccion === 'asc' ? comparacion : -comparacion;
                });
                break;
                
            case 'categoria':
                eventosArray.sort((a, b) => {
                    const categoriaA = extraerCategoria(a);
                    const categoriaB = extraerCategoria(b);
                    
                    const comparacion = categoriaA.localeCompare(categoriaB);
                    return CONFIG.direccion === 'asc' ? comparacion : -comparacion;
                });
                break;
                
            case 'alfabetico':
                eventosArray.sort((a, b) => {
                    const tituloA = extraerTitulo(a);
                    const tituloB = extraerTitulo(b);
                    
                    const comparacion = tituloA.localeCompare(tituloB);
                    return CONFIG.direccion === 'asc' ? comparacion : -comparacion;
                });
                break;
        }
    }
    
    // Funciones auxiliares para extraer información de eventos
    function extraerFecha(eventoCard) {
        // Intentar extraer fecha del dataset si existe
        if (eventoCard.dataset.fecha) {
            return new Date(eventoCard.dataset.fecha).getTime();
        }
        
        // Intentar extraer la fecha del texto
        const fechaText = eventoCard.querySelector('.evento-meta-item:first-child span:last-child')?.textContent;
        if (!fechaText) return 0;
        
        // Intentar parsear fecha
        try {
            // Formato español: "10 de marzo de 2025"
            const match = fechaText.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/i);
            
            if (match) {
                const dia = parseInt(match[1]);
                let mes = -1;
                const anio = parseInt(match[3]);
                
                const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                             'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                
                mes = meses.findIndex(m => m === match[2].toLowerCase());
                
                if (mes !== -1 && !isNaN(dia) && !isNaN(anio)) {
                    return new Date(anio, mes, dia).getTime();
                }
            }
            
            // Fallback: usar Date directamente
            return new Date(fechaText).getTime();
        } catch (e) {
            return 0;
        }
    }
    
    function extraerCategoria(eventoCard) {
        // Primero buscar por clase
        const clases = eventoCard.className.split(' ');
        for (const clase of clases) {
            if (['curso', 'taller', 'grupo', 'activacion', 'evento'].includes(clase)) {
                return clase;
            }
        }
        
        // Si no, buscar por badge
        const badge = eventoCard.querySelector('.evento-badge');
        return badge ? badge.textContent.toLowerCase() : '';
    }
    
    function extraerTitulo(eventoCard) {
        const titulo = eventoCard.querySelector('.evento-title, h3');
        return titulo ? titulo.textContent : '';
    }
    
    // Función para crear o actualizar el botón "Cargar más"
    function crearOActualizarBotonCargarMas(eventosGrid, totalEventos, eventosVisible, estaEnVistaEventos) {
        // Eliminar botón existente si hay
        const paginacionExistente = document.querySelector('.pagination-container');
        if (paginacionExistente) {
            paginacionExistente.remove();
        }
        
        // Si no estamos en vista de eventos o ya se muestran todos, no mostrar paginación
        if (!estaEnVistaEventos || eventosVisible >= totalEventos) {
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
            <span class="btn-text">Cargar más eventos (${eventosVisible} de ${totalEventos})</span>
        `;
        
        // Configurar click para cargar más eventos
        botonCargarMas.addEventListener('click', function() {
            // Mostrar indicador de carga
            this.classList.add('loading');
            
            // Simular carga (UI feedback)
            setTimeout(() => {
                // Incrementar página
                CONFIG.currentPage++;
                
                // Aplicar nueva paginación
                aplicarPaginacionEventos();
                
                // Quitar indicador de carga
                this.classList.remove('loading');
                
                // Scroll suave al nuevo contenido
                const primerNuevoEvento = document.querySelector('.evento-card:nth-child(' + (eventosVisible + 1) + ')');
                if (primerNuevoEvento) {
                    primerNuevoEvento.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 400);
        });
        
        // Agregar botón al contenedor y al DOM
        paginacionContainer.appendChild(botonCargarMas);
        eventosGrid.after(paginacionContainer);
    }
    
    // Iniciar los fixes
    iniciarFixes();
    
    // Disponibilizar configuración para depuración
    window._fixConfig = CONFIG;
})();
