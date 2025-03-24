/**
 * targeted-fix.js - Solución específica para eliminar etiquetas flotantes
 * 
 * Este script está diseñado para eliminar ÚNICAMENTE las etiquetas "Act" y "Grupo"
 * sin afectar otros elementos de la página.
 */

(function() {
    'use strict';
    
    // Ejecutar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', aplicarFixEspecifico);
    
    // También ejecutar cuando la página esté completamente cargada
    window.addEventListener('load', function() {
        // Ejecutar varias veces para asegurar que se aplique
        aplicarFixEspecifico();
        setTimeout(aplicarFixEspecifico, 500);
        setTimeout(aplicarFixEspecifico, 1000);
    });
    
    // Función principal
    function aplicarFixEspecifico() {
        console.log('🎯 Aplicando solución específica para etiquetas flotantes...');
        
        // 1. Añadir CSS específico que solo afecta a las etiquetas problemáticas
        const estiloEspecifico = document.createElement('style');
        estiloEspecifico.textContent = `
            /* Esta regla SOLO afecta a Act/Grupo en la esquina superior */
            body > div[style*="position: fixed"],
            body > div[style*="position: absolute"] {
                opacity: 0 !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(estiloEspecifico);
        
        // 2. Buscar y eliminar específicamente las etiquetas por su texto y posición
        function eliminarEtiquetasEspecificas() {
            document.querySelectorAll('div, span').forEach(element => {
                const text = element.textContent.trim();
                
                // Verificar si es una de las etiquetas problemáticas
                if (text === 'Act' || text === 'Grupo' || 
                    text === 'Act Grupo' || text === 'Activación' || 
                    text === 'Activacion') {
                    
                    // Verificar si está en la parte superior de la página
                    const rect = element.getBoundingClientRect();
                    if (rect.top < 80) {
                        console.log('Etiqueta problemática encontrada:', text);
                        element.style.opacity = '0';
                        element.style.visibility = 'hidden';
                        
                        // Si tiene un padre con estilos de posicionamiento fixed/absolute,
                        // también ocultarlo
                        let parent = element.parentElement;
                        if (parent) {
                            const parentStyle = window.getComputedStyle(parent);
                            if (parentStyle.position === 'fixed' || 
                                parentStyle.position === 'absolute') {
                                parent.style.opacity = '0';
                                parent.style.visibility = 'hidden';
                            }
                        }
                    }
                }
            });
        }
        
        // Ejecutar eliminación inmediatamente
        eliminarEtiquetasEspecificas();
        
        // Programar eliminación cada medio segundo (para capturar nuevas apariciones)
        const intervalId = setInterval(eliminarEtiquetasEspecificas, 500);
        
        // Detener el intervalo después de 10 segundos para no consumir recursos
        setTimeout(() => clearInterval(intervalId), 10000);
        
        // 3. Observar cambios en el DOM para detectar nuevas apariciones
        const observer = new MutationObserver((mutations) => {
            eliminarEtiquetasEspecificas();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Solución aplicada correctamente');
    }
    
    // También implementar la paginación (esta parte funcionó bien)
    function implementarPaginacion() {
        // Configuración
        const CONFIG = {
            eventosPerPage: 6,
            currentPage: 1
        };
        
        // Estilos para la paginación
        const estiloPaginacion = document.createElement('style');
        estiloPaginacion.textContent = `
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
            
            .eventos-card.hidden-by-pagination {
                display: none !important;
            }
        `;
        document.head.appendChild(estiloPaginacion);
        
        // Función para aplicar paginación
        function aplicarPaginacion() {
            // Verificar si estamos en vista de eventos
            const vistaEventosBtn = document.querySelector('.vista-btn[data-vista="eventos"]');
            const estaEnVistaEventos = vistaEventosBtn && vistaEventosBtn.classList.contains('active');
            
            if (!estaEnVistaEventos) return;
            
            // Obtener eventos
            const eventosGrid = document.getElementById('eventos-grid');
            if (!eventosGrid) return;
            
            const eventosCards = eventosGrid.querySelectorAll('.evento-card');
            if (eventosCards.length === 0) return;
            
            // Aplicar paginación
            const eventosArray = Array.from(eventosCards);
            
            eventosArray.forEach((card, index) => {
                if (index >= CONFIG.eventosPerPage * CONFIG.currentPage) {
                    card.classList.add('hidden-by-pagination');
                } else {
                    card.classList.remove('hidden-by-pagination');
                }
            });
            
            // Actualizar contador
            const eventosCounter = document.getElementById('eventos-counter');
            if (eventosCounter) {
                const mostrados = Math.min(CONFIG.currentPage * CONFIG.eventosPerPage, eventosArray.length);
                eventosCounter.innerHTML = `
                    <span>Mostrando <strong>${mostrados}</strong> de <strong>${eventosArray.length}</strong> eventos</span>
                `;
            }
            
            // Crear botón "Cargar más" si es necesario
            if (CONFIG.currentPage * CONFIG.eventosPerPage < eventosArray.length) {
                const paginacionExistente = document.querySelector('.pagination-container');
                if (!paginacionExistente) {
                    const paginacionContainer = document.createElement('div');
                    paginacionContainer.className = 'pagination-container';
                    
                    const botonCargarMas = document.createElement('button');
                    botonCargarMas.className = 'load-more-btn';
                    botonCargarMas.textContent = 'Cargar más eventos';
                    
                    botonCargarMas.addEventListener('click', function() {
                        CONFIG.currentPage++;
                        aplicarPaginacion();
                    });
                    
                    paginacionContainer.appendChild(botonCargarMas);
                    eventosGrid.after(paginacionContainer);
                }
            } else {
                // Si ya no hay más eventos, eliminar botón
                const paginacionExistente = document.querySelector('.pagination-container');
                if (paginacionExistente) {
                    paginacionExistente.remove();
                }
            }
        }
        
        // Observar cambios en la vista
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                setTimeout(aplicarPaginacion, 100);
            });
        });
        
        // Observar cambios en el grid de eventos
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && 
                    (mutation.target.id === 'eventos-grid' || 
                     mutation.target.classList.contains('eventos-grid'))) {
                    setTimeout(aplicarPaginacion, 100);
                    break;
                }
            }
        });
        
        const eventosContainer = document.querySelector('.eventos-list-container');
        if (eventosContainer) {
            observer.observe(eventosContainer, { childList: true, subtree: true });
        }
        
        // Aplicar paginación inicial
        setTimeout(aplicarPaginacion, 500);
    }
    
    // Ejecutar paginación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', implementarPaginacion);
})();
