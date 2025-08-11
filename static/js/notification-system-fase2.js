// Sistema de Notificaciones para Fase 2
class NotificationSystemFase2 {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.init();
    }
    
    init() {
        console.log('🔔 Inicializando Sistema de Notificaciones Fase 2');
        this.createContainer();
    }
    
    createContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container-fase2';
            document.body.appendChild(container);
        }
    }
    
    show(message, type = 'info', duration = 4000, options = {}) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration,
            options
        };
        
        this.notifications.push(notification);
        
        // Limitar número de notificaciones
        if (this.notifications.length > this.maxNotifications) {
            const oldestNotification = this.notifications.shift();
            this.remove(oldestNotification.id);
        }
        
        this.render(notification);
        
        // Auto-remove después del duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }
        
        return notification.id;
    }
    
    render(notification) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast-fase2 ${notification.type}`;
        toast.setAttribute('data-id', notification.id);
        
        const icon = this.getIcon(notification.type);
        const progressBar = notification.duration > 0 ? this.createProgressBar(notification.duration) : '';
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="toast-message">
                    <div class="toast-title">${this.getTitle(notification.type)}</div>
                    <div class="toast-text">${notification.message}</div>
                </div>
                <button class="toast-close" onclick="notificationSystem.remove(${notification.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${progressBar}
        `;
        
        // Agregar efectos especiales según el tipo
        this.addSpecialEffects(toast, notification.type);
        
        container.appendChild(toast);
        
        // Animación de entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Iniciar progress bar si existe
        if (notification.duration > 0) {
            this.startProgressBar(toast, notification.duration);
        }
    }
    
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            processing: 'fas fa-spinner fa-spin',
            download: 'fas fa-download',
            upload: 'fas fa-upload',
            share: 'fas fa-share-alt'
        };
        return icons[type] || icons.info;
    }
    
    getTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información',
            processing: 'Procesando',
            download: 'Descarga',
            upload: 'Subida',
            share: 'Compartir'
        };
        return titles[type] || titles.info;
    }
    
    createProgressBar(duration) {
        return `
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;
    }
    
    startProgressBar(toast, duration) {
        const progressBar = toast.querySelector('.toast-progress-bar');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 10);
        }
    }
    
    addSpecialEffects(toast, type) {
        switch (type) {
            case 'success':
                // Efecto de partículas doradas para éxito
                this.createSuccessParticles(toast);
                break;
            case 'error':
                // Efecto de shake para errores
                toast.classList.add('shake-effect');
                break;
            case 'processing':
                // Efecto de pulso para procesamiento
                toast.classList.add('pulse-effect');
                break;
        }
    }
    
    createSuccessParticles(toast) {
        const rect = toast.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particle';
            particle.style.position = 'fixed';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '4000';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 50 + Math.random() * 30;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.animation = `particle-burst 1s ease-out forwards`;
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    remove(id) {
        const toast = document.querySelector(`[data-id="${id}"]`);
        if (toast) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
    
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
        this.notifications = [];
    }
    
    // Métodos de conveniencia
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
    
    processing(message, duration = 0) {
        return this.show(message, 'processing', duration);
    }
    
    download(message, duration = 3000) {
        return this.show(message, 'download', duration);
    }
    
    upload(message, duration = 3000) {
        return this.show(message, 'upload', duration);
    }
    
    share(message, duration = 3000) {
        return this.show(message, 'share', duration);
    }
}

// Estilos CSS para las notificaciones
const notificationStyles = `
.toast-container-fase2 {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 3500;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.toast-fase2 {
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
}

.toast-fase2.show {
    transform: translateX(0);
    opacity: 1;
}

.toast-fase2.hide {
    transform: translateX(100%);
    opacity: 0;
}

.toast-fase2.success {
    border-left: 4px solid #4CAF50;
}

.toast-fase2.error {
    border-left: 4px solid #F44336;
}

.toast-fase2.warning {
    border-left: 4px solid #FFA000;
}

.toast-fase2.info {
    border-left: 4px solid #2196F3;
}

.toast-fase2.processing {
    border-left: 4px solid #FFD700;
}

.toast-fase2.download,
.toast-fase2.upload,
.toast-fase2.share {
    border-left: 4px solid #9C27B0;
}

.toast-content {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
}

.toast-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.toast-fase2.success .toast-icon {
    color: #4CAF50;
}

.toast-fase2.error .toast-icon {
    color: #F44336;
}

.toast-fase2.warning .toast-icon {
    color: #FFA000;
}

.toast-fase2.info .toast-icon {
    color: #2196F3;
}

.toast-fase2.processing .toast-icon {
    color: #FFD700;
}

.toast-fase2.download .toast-icon,
.toast-fase2.upload .toast-icon,
.toast-fase2.share .toast-icon {
    color: #9C27B0;
}

.toast-message {
    flex: 1;
    min-width: 0;
}

.toast-title {
    font-weight: 600;
    font-size: 14px;
    color: #fff;
    margin-bottom: 4px;
}

.toast-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
    word-wrap: break-word;
}

.toast-close {
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.toast-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
}

.toast-progress-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA000);
    transition: width 0ms linear;
}

/* Efectos especiales */
.shake-effect {
    animation: shake 0.5s ease-in-out;
}

.pulse-effect {
    animation: pulse 2s infinite;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

@keyframes particle-burst {
    0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(var(--vx), var(--vy)) scale(0);
        opacity: 0;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .toast-container-fase2 {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
    
    .toast-content {
        padding: 12px;
    }
    
    .toast-title {
        font-size: 13px;
    }
    
    .toast-text {
        font-size: 12px;
    }
}
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Inicializar el sistema de notificaciones globalmente
window.notificationSystem = new NotificationSystemFase2();