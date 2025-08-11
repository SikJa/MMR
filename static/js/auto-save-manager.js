// Auto-Save Manager para Fase 2
class AutoSaveManager {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.saveInterval = 30000; // 30 segundos
        this.lastSaveTime = null;
        this.saveInProgress = false;
        this.pendingChanges = false;
        this.intervalId = null;
        this.init();
    }
    
    init() {
        console.log('💾 Inicializando Auto-Save Manager');
        this.startAutoSave();
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Detectar cambios que requieren guardado
        document.addEventListener('imageProcessed', () => {
            this.markPendingChanges();
        });
        
        document.addEventListener('templateChanged', () => {
            this.markPendingChanges();
        });
        
        // Guardar antes de cerrar la página
        window.addEventListener('beforeunload', (e) => {
            if (this.pendingChanges && !this.saveInProgress) {
                this.saveNow();
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        // Guardar cuando la página pierde el foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.pendingChanges) {
                this.saveNow();
            }
        });
    }
    
    startAutoSave() {
        this.intervalId = setInterval(() => {
            if (this.pendingChanges && !this.saveInProgress) {
                this.saveNow();
            }
        }, this.saveInterval);
        
        console.log(`🔄 Auto-guardado iniciado cada ${this.saveInterval / 1000} segundos`);
    }
    
    stopAutoSave() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Auto-guardado detenido');
        }
    }
    
    markPendingChanges() {
        this.pendingChanges = true;
        this.updateSaveIndicator('pending');
    }
    
    async saveNow() {
        if (this.saveInProgress) {
            console.log('⚠️ Guardado ya en progreso, saltando...');
            return;
        }
        
        this.saveInProgress = true;
        this.updateSaveIndicator('saving');
        
        try {
            const sessionData = this.collectSessionData();
            
            const response = await fetch('/api/save-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    session_data: sessionData
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.lastSaveTime = new Date();
                this.pendingChanges = false;
                this.updateSaveIndicator('saved');
                
                // Mostrar notificación discreta
                if (window.notificationSystem) {
                    window.notificationSystem.info('Sesión guardada automáticamente', 2000);
                }
                
                console.log('✅ Sesión guardada automáticamente');
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error en auto-guardado:', error);
            this.updateSaveIndicator('error');
            
            if (window.notificationSystem) {
                window.notificationSystem.warning('Error en auto-guardado', 3000);
            }
        } finally {
            this.saveInProgress = false;
        }
    }
    
    collectSessionData() {
        const data = {
            timestamp: new Date().toISOString(),
            lastSave: this.lastSaveTime,
            autoSave: true
        };
        
        // Recopilar datos de la aplicación principal si existe
        if (window.fase2App) {
            data.stats = window.fase2App.stats;
            data.selectedTemplate = window.fase2App.selectedTemplate;
            data.currentProduct = window.fase2App.currentProduct;
        }
        
        // Recopilar datos de la galería si existe
        if (window.galleryManager) {
            data.galleryStats = window.galleryManager.getStats();
        }
        
        return data;
    }
    
    updateSaveIndicator(status) {
        let indicator = document.getElementById('saveIndicator');
        
        if (!indicator) {
            indicator = this.createSaveIndicator();
        }
        
        const statusConfig = {
            pending: {
                icon: 'fas fa-circle',
                color: '#FFA000',
                text: 'Cambios pendientes',
                pulse: false
            },
            saving: {
                icon: 'fas fa-spinner fa-spin',
                color: '#2196F3',
                text: 'Guardando...',
                pulse: true
            },
            saved: {
                icon: 'fas fa-check-circle',
                color: '#4CAF50',
                text: 'Guardado',
                pulse: false
            },
            error: {
                icon: 'fas fa-exclamation-triangle',
                color: '#F44336',
                text: 'Error al guardar',
                pulse: false
            }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        
        indicator.innerHTML = `
            <i class="${config.icon}" style="color: ${config.color}"></i>
            <span>${config.text}</span>
            ${this.lastSaveTime ? `<small>Último: ${this.formatTime(this.lastSaveTime)}</small>` : ''}
        `;
        
        indicator.className = `save-indicator ${status} ${config.pulse ? 'pulse' : ''}`;
        
        // Auto-ocultar después de unos segundos si está guardado
        if (status === 'saved') {
            setTimeout(() => {
                if (indicator.classList.contains('saved')) {
                    indicator.style.opacity = '0.6';
                }
            }, 3000);
        } else {
            indicator.style.opacity = '1';
        }
    }
    
    createSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.className = 'save-indicator';
        
        // Buscar un lugar apropiado para colocarlo
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(indicator);
        } else {
            document.body.appendChild(indicator);
        }
        
        return indicator;
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Método público para forzar guardado
    forceSave() {
        this.markPendingChanges();
        return this.saveNow();
    }
    
    // Método para obtener estadísticas
    getStats() {
        return {
            sessionId: this.sessionId,
            lastSaveTime: this.lastSaveTime,
            pendingChanges: this.pendingChanges,
            saveInProgress: this.saveInProgress,
            autoSaveInterval: this.saveInterval
        };
    }
    
    // Destructor
    destroy() {
        this.stopAutoSave();
        
        // Remover event listeners
        document.removeEventListener('imageProcessed', this.markPendingChanges);
        document.removeEventListener('templateChanged', this.markPendingChanges);
        
        // Remover indicador
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.remove();
        }
        
        console.log('🗑️ Auto-Save Manager destruido');
    }
}

// Estilos CSS para el indicador de guardado
const autoSaveStyles = `
.save-indicator {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(26, 26, 26, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #fff;
    z-index: 2000;
    transition: all 0.3s ease;
    max-width: 200px;
}

.save-indicator span {
    font-weight: 500;
}

.save-indicator small {
    color: rgba(255, 255, 255, 0.6);
    font-size: 10px;
    margin-left: 4px;
}

.save-indicator.pulse {
    animation: pulse-save 1.5s infinite;
}

.save-indicator.saving {
    border-color: rgba(33, 150, 243, 0.3);
    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.2);
}

.save-indicator.saved {
    border-color: rgba(76, 175, 80, 0.3);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
}

.save-indicator.error {
    border-color: rgba(244, 67, 54, 0.3);
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.2);
}

.save-indicator.pending {
    border-color: rgba(255, 160, 0, 0.3);
    box-shadow: 0 4px 15px rgba(255, 160, 0, 0.2);
}

@keyframes pulse-save {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

/* Responsive */
@media (max-width: 768px) {
    .save-indicator {
        bottom: 10px;
        left: 10px;
        right: 10px;
        max-width: none;
        justify-content: center;
    }
}
`;

// Agregar estilos al documento
const autoSaveStyleSheet = document.createElement('style');
autoSaveStyleSheet.textContent = autoSaveStyles;
document.head.appendChild(autoSaveStyleSheet);

// Exportar para uso global
window.AutoSaveManager = AutoSaveManager;