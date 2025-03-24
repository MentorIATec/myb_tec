/**
 * fixed-script.js - Solución optimizada para eliminar etiquetas flotantes
 * 
 * Este script elimina las etiquetas flotantes ("Act", "Grupo", "Taller", "Curso", "Evento")
 * sin afectar a las tarjetas de eventos y manteniendo la paginación.
 */

(function() {
    'use strict';
    
    // Variables para control
    let fixAplicado = false;
    const etiquetasProblematicas = ['Act', 'Grupo', 'Taller', 'Activación', 'Activacion', 'Curso', 'Evento'];
    
    // Ejecutar inmediatamente y cuando la página esté lista
    window.addEventListener('load', aplicarSolucionEspecifica);
    document.addEventListener('DOMContentLoaded', aplicarSolucionEspecifica);
    
    // Para asegurar que se aplique rápidamente
    setTimeout(aplicarSolucionEspecifica, 0);
    setTimeout(aplicarSolucionEspecifica, 100);
    
    // Función principal
    function aplicarSolucionEspecifica() {
        if (fixAplicado) return;
        
        console.log('🔧 Aplicando solución específica para etiquetas flotantes...');
        
        // 1. Crear únicamente un bloqueador visual
        const bloqueador = document.createElement('div');
        bloqueador.id = 'corner-blocker';
        bloqueador.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 150px;
            height: 50px;
            background-color: white;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(bloqueador);
        
        // 2. Función para eliminar solo etiquetas específicas
        function eliminarEtiquetasFlotantes() {
            // Buscar SOLO a nivel de body, no descendientes
            const elementosANivelDeBody = document.querySelectorAll('body > *');
            
            elementosANivelDeBody.forEach(elemento => {
                // Si es script, style o parte de la estructura principal, ignorar
                if (elemento.tagName === 'SCRIPT' || 
                    elemento.tagName === 'STYLE' || 
                    elemento.tagName === 'LINK' || 
                    elemento.id === 'corner-blocker' ||
                    (elemento.classList && elemento.classList.contains('eventos-container'))) {
                    return;
                }
                
                // Verificar contenido de texto
                const texto = elemento.textContent.trim();
                if (etiquetasProblematicas.includes(texto)) {
                    // Verificar posición (solo parte superior)
                    const rect = elemento.getBoundingClientRect();
                    if (rect.top < 100) {
                        console.log('Ocultando etiqueta flotante:', texto);
                        elemento.style.display = 'none';
                    }
                }
                
                // Verificar si es un elemento con estilo fixed o absolute
                const estilo = window.getComputedStyle(elemento);
                if (estilo.position === 'fixed' || estilo.position === 'absolute') {
                    // Verificar posición (solo parte superior y esquina)
                    const rect = elemento.getBoundingClientRect();
                    if (rect.top < 100 && window.innerWidth - rect.right < 150) {
                        console.log('Ocultando elemento posicionado en esquina superior');
                        elemento.style.display = 'none';
                    }
                }
            });
        }
        
        // 3. Ejecutar limpieza periódicamente (solo al inicio)
        eliminarEtiquetasFlotantes();
        
        const intervalos = [100, 500, 1000, 2000, 3000];
        intervalos.forEach(intervalo => {
            setTimeout(eliminarEtiquetasFlotantes, intervalo);
        });
        
        // Marcar como aplicado
        fixAplicado = true;
        console.log('✅ Solución específica aplicada correctamente');
    }
    
    // Implementar paginación (manteniendo la funcionalidad que ya funciona)
    function implementarPaginacion() {
        console.log('Iniciando configuración de paginación...');
        
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
            
            .evento-card.hidden-by-pagination {
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
            
            console.log(`Aplicando paginación a ${eventosCards.length} eventos...`);
            
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
        setTimeout(aplicarPaginacion, 1000);
    }
    
    // Ejecutar paginación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', implementarPaginacion);
})();
