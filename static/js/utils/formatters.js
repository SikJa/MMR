// ===== UTILIDADES DE FORMATEO =====

class Formatters {
    // Formatear precio en pesos colombianos
    static formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) {
            return '$0';
        }
        
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    // Formatear número simple
    static formatNumber(number) {
        if (typeof number !== 'number' || isNaN(number)) {
            return '0';
        }
        
        return new Intl.NumberFormat('es-CO').format(number);
    }

    // Formatear fecha
    static formatDate(date, options = {}) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        return dateObj.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
    }

    // Formatear hora
    static formatTime(date, options = {}) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };

        return dateObj.toLocaleTimeString('es-ES', { ...defaultOptions, ...options });
    }

    // Formatear fecha y hora completa
    static formatDateTime(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        return dateObj.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Formatear tiempo relativo (hace X tiempo)
    static formatRelativeTime(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const now = new Date();
        const diffMs = now - dateObj;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Hace un momento';
        } else if (diffMinutes < 60) {
            return `Hace ${diffMinutes}m`;
        } else if (diffHours < 24) {
            const remainingMinutes = diffMinutes % 60;
            return remainingMinutes > 0 ? `Hace ${diffHours}h ${remainingMinutes}m` : `Hace ${diffHours}h`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else {
            return this.formatDate(dateObj);
        }
    }

    // Truncar texto
    static truncateText(text, maxLength = 50, suffix = '...') {
        if (!text || typeof text !== 'string') return '';
        
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    // Capitalizar primera letra
    static capitalize(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    // Formatear nombre de archivo
    static formatFileName(text, maxLength = 30) {
        if (!text || typeof text !== 'string') return '';
        
        // Remover caracteres especiales
        let cleaned = text.replace(/[^a-zA-Z0-9\s]/g, '');
        
        // Reemplazar espacios con guiones bajos
        cleaned = cleaned.replace(/\s+/g, '_');
        
        // Truncar si es muy largo
        if (cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength);
        }
        
        return cleaned.toLowerCase();
    }

    // Formatear porcentaje
    static formatPercentage(value, decimals = 1) {
        if (typeof value !== 'number' || isNaN(value)) {
            return '0%';
        }
        
        return `${value.toFixed(decimals)}%`;
    }

    // Formatear tamaño de archivo
    static formatFileSize(bytes) {
        if (typeof bytes !== 'number' || isNaN(bytes) || bytes === 0) {
            return '0 B';
        }
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    // Formatear duración en segundos
    static formatDuration(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
            return '0s';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    // Formatear lista de elementos
    static formatList(items, separator = ', ', lastSeparator = ' y ') {
        if (!Array.isArray(items) || items.length === 0) {
            return '';
        }
        
        if (items.length === 1) {
            return items[0];
        }
        
        if (items.length === 2) {
            return items.join(lastSeparator);
        }
        
        const allButLast = items.slice(0, -1);
        const last = items[items.length - 1];
        
        return allButLast.join(separator) + lastSeparator + last;
    }

    // Formatear estado de sesión
    static formatSessionStatus(status) {
        const statusMap = {
            'completed': 'Completada',
            'processing': 'Procesando',
            'paused': 'Pausada',
            'error': 'Error',
            'draft': 'Borrador'
        };
        
        return statusMap[status] || status;
    }

    // Formatear proveedor
    static formatProvider(provider) {
        if (!provider || typeof provider !== 'string') return '';
        
        // Capitalizar cada palabra
        return provider.split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }
}

// Registrar formatters en el motor de templates
if (window.templateEngine) {
    window.templateEngine.registerHelper('formatPrice', Formatters.formatPrice);
    window.templateEngine.registerHelper('formatDate', Formatters.formatDate);
    window.templateEngine.registerHelper('formatTime', Formatters.formatTime);
    window.templateEngine.registerHelper('formatRelativeTime', Formatters.formatRelativeTime);
    window.templateEngine.registerHelper('truncate', Formatters.truncateText);
    window.templateEngine.registerHelper('capitalize', Formatters.capitalize);
    window.templateEngine.registerHelper('formatList', Formatters.formatList);
}

// Exportar
window.Formatters = Formatters;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}