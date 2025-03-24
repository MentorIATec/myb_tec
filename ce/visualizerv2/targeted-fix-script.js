/**
 * complete-fix.js - Solución completa para eliminar TODAS las etiquetas flotantes
 * 
 * Este script elimina específicamente las etiquetas "Act", "Grupo", "Taller" y cualquier otra 
 * etiqueta flotante en la parte superior de la página, incluyendo la etiqueta naranja de Taller.
 */

(function() {
    'use strict';
    
    // Variables para control
    let fixAplicado = false;
    const etiquetasProblematicas = ['Act', 'Grupo', 'Taller', 'Activación', 'Activacion', 'Curso', 'Evento'];
    
    // Ejecutar inmediatamente y también cuando el DOM esté listo
    aplicarSolucionCompleta();
    document.addEventListener('DOMContentLoaded', aplicarSolucionCompleta);
    window.addEventListener('load', aplicarSolucionCompleta);
    
    // Función principal
    function aplicarSolucionCompleta() {
        if (fixAplicado) return;
        
        console.log('🔧 Aplicando solución completa para etiquetas flotantes...');
        
        // 1. CSS específico para ocultar etiquetas flotantes por color y posición
        const estiloEspecifico = document.createElement('style');
        estiloEspecifico.textContent = `
            /* Ocultar elementos posicionados a nivel de body */
            body > div[style*="position:"],
            body > div[style*="position: "],
            body > span[style*="position:"],
            body > span[style*="position: "] {
                opacity: 0 !important;
                visibility: hidden !important;
                display: none !important;
            }
            
            /* Ocultar específicamente por colores de las etiquetas */
            body > [style*="background-color: rgb(0, 150, 136)"], 
            body > [style*="background-color: rgb(156, 39, 176)"],
            body > [style*="background-color: rgb(255, 88, 0)"],
            body > [style*="background-color: #FF5800"],
            body > [style*="background-color: #009688"],
            body > [style*="background-color: #9C27B0"],
            body > [style*="background: rgb(0, 150, 136)"], 
            body > [style*="background: rgb(156, 39, 176)"],
            body > [style*="background: rgb(255, 88, 0)"],
            body > [style*="background: #FF5800"],
            body > [style*="background: #009688"],
            body > [style*="background: #9C27B0"] {
                opacity: 0 !important;
                visibility: hidden !important;
                display: none !important;
            }
            
            /* Crear overlay bloqueador en la esquina superior derecha */
            #corner-blocker {
                position: fixed;
                top: 0;
                right: 0;
                width: 150px;
                height: 50px;
                background-color: white;
                z-index: 9999;
                pointer-events: none;
            }
            
            /* Específicamente para el color naranja del Taller */
            [style*="background-color: rgb(242, 113, 33)"],
            [style*="background-color: rgb(255, 87, 34)"],
            [style*="background-color: rgb(255, 88, 0)"],
            [style*="background-color: #ff5800"],
            [style*="background-color: #FF5800"],
            [style*="background-color: #F44336"],
            [style*="background: rgb(242, 113, 33)"],
            [style*="background: rgb(255, 87, 34)"],
            [style*="background: rgb(255, 88, 0)"],
            [style*="background: #ff5800"],
            [style*="background: #FF5800"] {
                opacity: 0 !important;
                visibility: hidden !important;
                display: none !important;
            }
            
            /* Clase específica para etiquetas flotantes */
            .floating-label, .badge, .pill, .tag, .label {
                opacity: 0 !important;
                visibility: hidden !important;
                display: none !important;
            }
        `;
        document.head.appendChild(estiloEspecifico);
        
        // 2. Crear bloqueador visual para la esquina superior derecha
        const bloqueador = document.createElement('div');
        bloqueador.id = 'corner-blocker';
        document.body.appendChild(bloqueador);
        
        // 3. Función para eliminar etiquetas específicas
        function eliminarEtiquetasEspecificas() {
            // Buscar por texto
            document.querySelectorAll('div, span').forEach(element => {
                const text = element.textContent.trim();
                
                // Si contiene una de las etiquetas problemáticas
                if (etiquetasProblematicas.includes(text)) {
                    // Y está en la parte superior
                    const rect = element.getBoundingClientRect();
                    if (rect.top < 100) {
                        element.style.display = 'none';
                        element.style.visibility = 'hidden';
                        element.style.opacity = '0';
                        
                        // Ocultar también los elementos padre
                        let parent = element.parentElement;
                        for (let i = 0; i < 3 && parent; i++) {
                            parent.style.display = 'none';
                            parent.style.visibility = 'hidden';
                            parent.style.opacity = '0';
                            parent = parent.parentElement;
                        }
                    }
                }
            });
            
            // Buscar por colores específicos
            const coloresObjetivo = [
                'rgb(242, 113, 33)', // Naranja (Taller)
                'rgb(255, 88, 0)',   // Naranja (Taller)
                'rgb(0, 150, 136)',  // Verde (Act)
                'rgb(156, 39, 176)'  // Púrpura (Grupo)
            ];
            
            document.querySelectorAll('*').forEach(element => {
                // Solo para elementos en la parte superior
                const rect = element.getBoundingClientRect();
                if (rect.top < 100) {
                    const style = window.getComputedStyle(element);
                    const bgColor = style.backgroundColor;
                    
                    // Si tiene uno de los colores objetivo
                    if (coloresObjetivo.includes(bgColor)) {
                        // Y no es parte de la UI principal
                        if (!esElementoNecesario(element)) {
                            element.style.display = 'none';
                            element.style.visibility = 'hidden';
                            element.style.opacity = '0';
                        }
                    }
                    
                    // Específicamente para naranja (Taller)
                    if (bgColor.includes('255') && bgColor.includes('88') && bgColor.includes('0')) {
                        if (!esElementoNecesario(element)) {
                            element.style.display = 'none';
                            element.style.visibility = 'hidden';
                            element.style.opacity = '0';
                        }
                    }
                }
            });
            
            // Buscar específicamente el Taller naranja
            document.querySelectorAll('[style*="background-color: rgb(255, 88, 0)"], [style*="background: rgb(255, 88, 0)"]').forEach(element => {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
            });
        }
        
        // 4. Verificar si es elemento necesario para la UI
        function esElementoNecesario(element) {
            return element.closest('.eventos-container') || 
                   element.closest('.controles-container') || 
                   element.closest('.vista-selector') || 
                   element.closest('.categoria-tag') || 
                   element.closest('.leyenda-color') || 
                   element.closest('.dia-evento-cat') || 
                   element.closest('.dia-indicador');
        }
        
        // 5. Ejecutar eliminación inmediatamente
        eliminarEtiquetasEspecificas();
        
        // 6. Programar eliminación recurrente
        const intervalos = [100, 500, 1000, 2000];
        intervalos.forEach(intervalo => {
            setTimeout(eliminarEtiquetasEspecificas, intervalo);
        });
        
        // 7. Aplicar también limpieza cuando cambia la vista
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(eliminarEtiquetasEspecificas, 100);
                setTimeout(eliminarEtiquetasEspecificas, 500);
            });
        });
        
        // 8. Observar cambios en el DOM para detectar nuevas etiquetas
        const observer = new MutationObserver(() => {
            eliminarEtiquetasEspecificas();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Marcar como aplicado
        fixAplicado = true;
        console.log('✅ Solución completa aplicada correctamente');
    }
    
    // Implementación de paginación (parte que funciona correctamente)
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
