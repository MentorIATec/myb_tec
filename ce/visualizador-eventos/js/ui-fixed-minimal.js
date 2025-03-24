/**
 * Controlador de UI minimalista y robusto para el visualizador
 * Versión extremadamente simplificada para garantizar funcionamiento
 */

const UIController = {
    elementos: null,
    
    inicializar: function() {
        console.log('Inicializando UI Controller...');
        
        // Inicializar referencias a elementos
        this.elementos = {
            listaEventos: document.getElementById('lista-eventos'),
            eventosTitulo: document.getElementById('eventos-titulo'),
            contadorEventos: document.getElementById('contador-eventos'),
            modal: document.getElementById('modal-evento'),
            modalTitulo: document.getElementById('modal-titulo'),
            modalSubtitulo: document.getElementById('modal-subtitulo'),
            modalInfo: document.getElementById('modal-info'),
            modalDescripcion: document.getElementById('modal-descripcion'),
            modalCerrar: document.getElementById('modal-cerrar'),
            modalAgregar: document.getElementById('modal-agregar'),
            modalCompartir: document.getElementById('modal-compartir'),
            btnHoy: document.getElementById('btn-hoy'),
            mesAnteriorBtn: document.getElementById('mes-anterior'),
            mesSiguienteBtn: document.getElementById('mes-siguiente')
        };
        
        // Configurar eventos básicos
        if (this.elementos.modalCerrar) {
            this.elementos.modalCerrar.addEventListener('click', () => {
                if (this.elementos.modal) {
                    this.elementos.modal.style.display = 'none';
                }
            });
        }
        
        console.log('UI Controller inicializado');
    },
    
    mostrarEventosDia: function(fecha) {
        console.log('Mostrando eventos para:', fecha);
        
        if (!fecha || !this.elementos.listaEventos) {
            console.error('Fecha o lista de eventos no disponible');
            return;
        }
        
        // Formatear fecha
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        
        // Obtener eventos para esta fecha
        const eventosDelDia = typeof EventosManager !== 'undefined' && EventosManager.obtenerEventosPorFecha ? 
            EventosManager.obtenerEventosPorFecha(fecha) : [];
        
        console.log(`Encontrados ${eventosDelDia.length} eventos para ${fechaFormateada}`);
        
        // Actualizar título y contador
        if (this.elementos.eventosTitulo) {
            this.elementos.eventosTitulo.textContent = `Eventos para ${fechaFormateada}`;
        }
        
        if (this.elementos.contadorEventos) {
            this.elementos.contadorEventos.textContent = `${eventosDelDia.length} eventos`;
        }
        
        // Limpiar lista
        this.elementos.listaEventos.innerHTML = '';
        
        // Verificar si hay eventos
        if (eventosDelDia.length === 0) {
            this.elementos.listaEventos.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <p>No hay eventos para esta fecha</p>
                </div>
            `;
            return;
        }
        
        // Crear elementos para cada evento
        eventosDelDia.forEach(evento => {
            const eventoEl = document.createElement('div');
            eventoEl.className = `evento-item ${evento.categoria}`;
            eventoEl.style.borderLeft = `4px solid var(--color-${evento.categoria}, #0072CE)`;
            eventoEl.style.backgroundColor = '#f8f9fa';
            eventoEl.style.padding = '15px';
            eventoEl.style.marginBottom = '15px';
            eventoEl.style.borderRadius = '4px';
            
            eventoEl.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">${evento.titulo}</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.9rem; color: #666; margin-bottom: 10px;">
                    <span>${evento.horario}</span>
                    <span>${evento.ubicacion}</span>
                </div>
                <p>${evento.descripcion}</p>
                <div style="margin-top: 10px;">
                    <button style="padding: 6px 12px; background-color: var(--color-primario, #3174ad); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Ver detalles
                    </button>
                </div>
            `;
            
            this.elementos.listaEventos.appendChild(eventoEl);
        });
    },
    
    mostrarCargando: function() {
        if (!this.elementos.listaEventos) return;
        
        this.elementos.listaEventos.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="width: 40px; height: 40px; border: 4px solid rgba(49, 116, 173, 0.2); border-radius: 50%; border-top-color: #3174ad; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p>Cargando eventos...</p>
            </div>
        `;
    }
};

// Añadir keyframes para animación de spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
