// ===== SISTEMA DE NOTIFICACIONES MODULAR =====

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaultDuration = 3000;
        this.maxNotifications = 5;
        this.init();
    }

    // Inicializar sistema
    init() {
        this.createContainer();
        this.loadStyles();
        console.log('✅ Sistema de notificaciones inicializado');
    }

    // Crear contenedor de notificaciones
    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        this.container.id = 'notificationsContainer';
        document.body.appendChild(this.container);
    }

    // Cargar estilos CSS
    loadStyles() {
        if (document.getElementById('notification-styles')) return;

        const link = document.createElement('link');
        link.id = 'notification-styles';
        link.rel = 'stylesheet';
        link.href = '/static/css/notifications.css';
        document.head.appendChild(link);
    }

    // Mostrar notificación
    show(message, type = 'info', options = {}) {
        const config = {
            duration: options.duration || this.defaultDuration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            closable: options.closable !== false,
            ...options
        };

        const notification = this.createNotification(message, type, config);
        this.addNotification(notification, config);

        return notification.id;
    }

    // Crear elemento de notificación
    createNotification(message, type, config) {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.id = id;

        // Icono según tipo
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            loading: 'fas fa-spinner fa-spin'
        };

        const icon = iconMap[type] || iconMap.info;

        // Contenido básico
        let content = `
            <div class="notification-content">
                <i class="notification-icon ${icon}"></i>
                <span class="notification-message">${message}</span>
                ${config.closable ? '<button class="notification-close" onclick="notificationSystem.close(\'' + id + '\')"><i class="fas fa-times"></i></button>' : ''}
            </div>
        `;

        // Agregar acciones si existen
        if (config.actions && config.actions.length > 0) {
            content += '<div class="notification-actions">';
            config.actions.forEach(action => {
                const actionClass = action.primary ? 'notification-action primary' : 'notification-action';
                content += `<button class="${actionClass}" onclick="${action.onclick}">${action.text}</button>`;
            });
            content += '</div>';
        }

        // Barra de progreso para notificaciones temporales
        if (!config.persistent && config.duration > 0) {
            content += '<div class="notification-progress"></div>';
        }

        notification.innerHTML = content;

        // Agregar clases especiales
        if (config.persistent) {
            notification.classList.add('persistent');
        }

        if (config.animation) {
            notification.classList.add(config.animation);
        }

        return { element: notification, id, config };
    }

    // Agregar notificación al contenedor
    addNotification(notification, config) {
        // Limitar número de notificaciones
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.close(oldestId);
        }

        // Agregar al DOM
        this.container.appendChild(notification.element);
        this.notifications.set(notification.id, notification);

        // Mostrar con animación
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 100);

        // Configurar auto-cierre
        if (!config.persistent && config.duration > 0) {
            this.setupAutoClose(notification.id, config.duration);
        }

        // Configurar barra de progreso
        if (!config.persistent && config.duration > 0) {
            this.setupProgressBar(notification.id, config.duration);
        }
    }

    // Configurar auto-cierre
    setupAutoClose(id, duration) {
        setTimeout(() => {
            this.close(id);
        }, duration);
    }

    // Configurar barra de progreso
    setupProgressBar(id, duration) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const progressBar = notification.element.querySelector('.notification-progress');
        if (!progressBar) return;

        let width = 100;
        const interval = 50; // Actualizar cada 50ms
        const decrement = (100 * interval) / duration;

        const timer = setInterval(() => {
            width -= decrement;
            if (width <= 0) {
                clearInterval(timer);
                return;
            }
            progressBar.style.width = `${width}%`;
        }, interval);

        // Guardar timer para limpieza
        notification.progressTimer = timer;
    }

    // Cerrar notificación
    close(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        // Limpiar timer si existe
        if (notification.progressTimer) {
            clearInterval(notification.progressTimer);
        }

        // Animar salida
        notification.element.classList.remove('show');

        // Remover del DOM después de la animación
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }

    // Cerrar todas las notificaciones
    closeAll() {
        const ids = Array.from(this.notifications.keys());
        ids.forEach(id => this.close(id));
    }

    // Cerrar notificaciones por tipo
    closeByType(type) {
        const notifications = Array.from(this.notifications.values());
        notifications
            .filter(n => n.element.classList.contains(`notification-${type}`))
            .forEach(n => this.close(n.id));
    }

    // Métodos de conveniencia
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { 
            duration: 5000, 
            ...options 
        });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    loading(message, options = {}) {
        return this.show(message, 'loading', { 
            persistent: true, 
            closable: false,
            ...options 
        });
    }

    // Notificación con confirmación
    confirm(message, onConfirm, onCancel = null) {
        const actions = [
            {
                text: 'Confirmar',
                primary: true,
                onclick: `notificationSystem.handleConfirm('${Date.now()}', true)`
            },
            {
                text: 'Cancelar',
                onclick: `notificationSystem.handleConfirm('${Date.now()}', false)`
            }
        ];

        // Guardar callbacks temporalmente
        const confirmId = Date.now().toString();
        this.confirmCallbacks = this.confirmCallbacks || {};
        this.confirmCallbacks[confirmId] = { onConfirm, onCancel };

        return this.show(message, 'warning', {
            persistent: true,
            actions: actions.map(action => ({
                ...action,
                onclick: action.onclick.replace(Date.now(), confirmId)
            }))
        });
    }

    // Manejar respuesta de confirmación
    handleConfirm(confirmId, confirmed) {
        const callbacks = this.confirmCallbacks && this.confirmCallbacks[confirmId];
        if (!callbacks) return;

        if (confirmed && callbacks.onConfirm) {
            callbacks.onConfirm();
        } else if (!confirmed && callbacks.onCancel) {
            callbacks.onCancel();
        }

        // Limpiar callbacks
        delete this.confirmCallbacks[confirmId];

        // Cerrar notificación
        this.closeByType('warning');
    }

    // Obtener estadísticas
    getStats() {
        return {
            active: this.notifications.size,
            maxNotifications: this.maxNotifications,
            defaultDuration: this.defaultDuration
        };
    }

    // Configurar opciones globales
    configure(options = {}) {
        if (options.maxNotifications) {
            this.maxNotifications = options.maxNotifications;
        }
        if (options.defaultDuration) {
            this.defaultDuration = options.defaultDuration;
        }
    }
}

// Instancia global
window.notificationSystem = new NotificationSystem();

// Alias para compatibilidad
window.showNotification = (message, type, options) => {
    return window.notificationSystem.show(message, type, options);
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}