/**
 * minimal-fix.js - Solución mínima y segura para eliminar etiquetas flotantes
 * 
 * Este script SOLO elimina elementos específicos sin afectar a las tarjetas de eventos
 */
(function() {
    'use strict';
    
    // Ejecutar cuando la página esté lista
    window.addEventListener('load', function() {
        console.log('🔍 Aplicando solución mínima para etiquetas flotantes...');
        
        // 1. Enfoque extremadamente específico - solo etiquetas en esquina superior derecha
        const estiloEspecifico = document.createElement('style');
        estiloEspecifico.textContent = `
            /* Bloqueador visual preciso para la esquina superior derecha */
            .corner-blocker {
                position: fixed;
                top: 0;
                right: 0;
                width: 100px;
                height: 40px;
                background-color: white;
                z-index: 9999;
            }
        `;
        document.head.appendChild(estiloEspecifico);
        
        // Crear el bloqueador visual
        const bloqueador = document.createElement('div');
        bloqueador.className = 'corner-blocker';
        document.body.appendChild(bloqueador);
        
        // 2. Verificar periódicamente para remover etiquetas específicas
        function eliminarSoloEtiquetasFlotantes() {
            // Buscar elementos fuera del contenedor principal con textos específicos
            document.querySelectorAll('body > *').forEach(elemento => {
                // Verificar si es parte del contenedor principal
                if (elemento.classList && elemento.classList.contains('eventos-container')) {
                    return; // No tocar el contenedor principal
                }
                
                // Ignorar elementos de script, style, meta
                if (elemento.tagName === 'SCRIPT' || 
                    elemento.tagName === 'STYLE' || 
                    elemento.tagName === 'META' || 
                    elemento.tagName === 'LINK' ||
                    elemento.tagName === 'NOSCRIPT') {
                    return;
                }
                
                // Si tiene texto específico, ocultarlo
                const texto = elemento.textContent.trim();
                if (texto === 'Taller' || texto === 'Act' || texto === 'Grupo' || 
                    texto === 'Act Grupo' || texto === 'Activación') {
                    
                    // Solo si está en la parte superior
                    const rect = elemento.getBoundingClientRect();
                    if (rect.top < 100) {
                        console.log('Ocultando etiqueta flotante:', texto);
                        elemento.style.display = 'none';
                    }
                }
            });
        }
        
        // Ejecutar limpieza varias veces para asegurar efectividad
        eliminarSoloEtiquetasFlotantes();
        setTimeout(eliminarSoloEtiquetasFlotantes, 500);
        setTimeout(eliminarSoloEtiquetasFlotantes, 1000);
    });
    
    // Función para manejar paginación (esta funciona correctamente)
    function manejarPaginacion() {
        // Configuración
        const CONFIG = {
            eventosPerPage: 6,
            currentPage: 1
        };
        
        // Función para aplicar paginación
        function aplicarPaginacion() {
            // Solo si estamos en vista de eventos
            const vistaEventos = document.querySelector('.vista-btn[data-vista="eventos"].active');
            if (!vistaEventos) return;
            
            // Obtener eventos
            const eventosGrid = document.getElementById('eventos-grid');
            if (!eventosGrid) return;
            
            const eventosCards = eventosGrid.querySelectorAll('.evento-card');
            if (eventosCards.length === 0) return;
            
            console.log(`Paginando ${eventosCards.length} eventos...`);
            
            // Aplicar paginación
            Array.from(eventosCards).forEach((card, index) => {
                if (index >= CONFIG.eventosPerPage * CONFIG.currentPage) {
                    card.style.display = 'none';
                } else {
                    card.style.display = '';
                }
            });
            
            // Actualizar contador
            const eventosCounter = document.getElementById('eventos-counter');
            if (eventosCounter) {
                const mostrados = Math.min(CONFIG.currentPage * CONFIG.eventosPerPage, eventosCards.length);
                eventosCounter.innerHTML = `
                    <span>Mostrando <strong>${mostrados}</strong> de <strong>${eventosCards.length}</strong> eventos</span>
                `;
            }
            
            // Crear botón "Cargar más" si es necesario
            if (CONFIG.currentPage * CONFIG.eventosPerPage < eventosCards.length) {
                const paginacionExistente = document.querySelector('.pagination-container');
                
                if (!paginacionExistente) {
                    // Crear el contenedor de paginación
                    const paginacionContainer = document.createElement('div');
                    paginacionContainer.className = 'pagination-container';
                    paginacionContainer.style.cssText = `
                        width: 100%; 
                        display: flex; 
                        justify-content: center; 
                        margin-top: 20px; 
                        margin-bottom: 30px;
                    `;
                    
                    // Crear el botón
                    const botonCargarMas = document.createElement('button');
                    botonCargarMas.textContent = 'Cargar más eventos';
                    botonCargarMas.style.cssText = `
                        padding: 12px 25px;
                        background-color: #0072CE;
                        color: white;
                        border: none;
                        border-radius: 25px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    `;
                    
                    // Manejar clic para cargar más
                    botonCargarMas.addEventListener('click', function() {
                        CONFIG.currentPage++;
                        aplicarPaginacion();
                    });
                    
                    // Agregar al DOM
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
        
        // Ejecutar paginación inicial después de cargar la página
        setTimeout(aplicarPaginacion, 1000);
        
        // Observar cambios en las vistas
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('Cambio de vista detectado');
                setTimeout(aplicarPaginacion, 500);
            });
        });
        
        // Observar cuando se carguen nuevos eventos
        const observer = new MutationObserver((mutations) => {
            let eventosActualizados = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && 
                   (mutation.target.id === 'eventos-grid' || 
                    mutation.target.classList.contains('eventos-grid'))) {
                    eventosActualizados = true;
                }
            });
            
            if (eventosActualizados) {
                console.log('Eventos actualizados, aplicando paginación...');
                setTimeout(aplicarPaginacion, 500);
            }
        });
        
        // Iniciar observación
        const eventosContainer = document.querySelector('.eventos-list-container');
        if (eventosContainer) {
            observer.observe(eventosContainer, { childList: true, subtree: true });
        }
    }
    
    // Iniciar paginación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', manejarPaginacion);
})();
