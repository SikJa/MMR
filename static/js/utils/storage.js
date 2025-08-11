// ===== UTILIDADES DE ALMACENAMIENTO =====

class StorageManager {
    constructor(prefix = 'mmr_offers_') {
        this.prefix = prefix;
        this.isAvailable = this.checkAvailability();
    }

    // Verificar disponibilidad de localStorage
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage no está disponible:', e);
            return false;
        }
    }

    // Generar clave con prefijo
    getKey(key) {
        return `${this.prefix}${key}`;
    }

    // Guardar datos
    set(key, value) {
        if (!this.isAvailable) {
            console.warn('Storage no disponible');
            return false;
        }

        try {
            const serialized = JSON.stringify({
                data: value,
                timestamp: Date.now(),
                version: '1.0'
            });
            
            localStorage.setItem(this.getKey(key), serialized);
            return true;
        } catch (error) {
            console.error('Error guardando en storage:', error);
            return false;
        }
    }

    // Obtener datos
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(this.getKey(key));
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            return parsed.data !== undefined ? parsed.data : defaultValue;
        } catch (error) {
            console.error('Error leyendo storage:', error);
            return defaultValue;
        }
    }

    // Eliminar datos
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('Error eliminando de storage:', error);
            return false;
        }
    }

    // Limpiar todos los datos del prefijo
    clear() {
        if (!this.isAvailable) return false;

        try {
            const keys = Object.keys(localStorage);
            const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
            
            prefixedKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            return true;
        } catch (error) {
            console.error('Error limpiando storage:', error);
            return false;
        }
    }

    // Obtener todas las claves con el prefijo
    getKeys() {
        if (!this.isAvailable) return [];

        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.substring(this.prefix.length));
        } catch (error) {
            console.error('Error obteniendo claves:', error);
            return [];
        }
    }

    // Obtener tamaño usado en bytes
    getSize() {
        if (!this.isAvailable) return 0;

        try {
            let total = 0;
            const keys = Object.keys(localStorage);
            const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
            
            prefixedKeys.forEach(key => {
                const value = localStorage.getItem(key);
                total += key.length + (value ? value.length : 0);
            });
            
            return total;
        } catch (error) {
            console.error('Error calculando tamaño:', error);
            return 0;
        }
    }

    // Verificar si existe una clave
    exists(key) {
        if (!this.isAvailable) return false;
        return localStorage.getItem(this.getKey(key)) !== null;
    }

    // Obtener metadatos de un item
    getMetadata(key) {
        if (!this.isAvailable) return null;

        try {
            const item = localStorage.getItem(this.getKey(key));
            if (!item) return null;

            const parsed = JSON.parse(item);
            return {
                timestamp: parsed.timestamp,
                version: parsed.version,
                size: item.length
            };
        } catch (error) {
            console.error('Error obteniendo metadatos:', error);
            return null;
        }
    }

    // Limpiar items antiguos
    cleanOldItems(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 días por defecto
        if (!this.isAvailable) return 0;

        let cleaned = 0;
        const now = Date.now();
        const keys = this.getKeys();

        keys.forEach(key => {
            const metadata = this.getMetadata(key);
            if (metadata && (now - metadata.timestamp) > maxAge) {
                this.remove(key);
                cleaned++;
            }
        });

        return cleaned;
    }

    // Exportar todos los datos
    export() {
        if (!this.isAvailable) return null;

        try {
            const data = {};
            const keys = this.getKeys();
            
            keys.forEach(key => {
                data[key] = this.get(key);
            });
            
            return {
                data,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('Error exportando datos:', error);
            return null;
        }
    }

    // Importar datos
    import(exportData) {
        if (!this.isAvailable || !exportData || !exportData.data) {
            return false;
        }

        try {
            Object.entries(exportData.data).forEach(([key, value]) => {
                this.set(key, value);
            });
            
            return true;
        } catch (error) {
            console.error('Error importando datos:', error);
            return false;
        }
    }

    // Crear backup
    backup() {
        const exportData = this.export();
        if (!exportData) return null;

        const backupKey = `backup_${Date.now()}`;
        this.set(backupKey, exportData);
        
        return backupKey;
    }

    // Restaurar desde backup
    restore(backupKey) {
        const backupData = this.get(backupKey);
        if (!backupData) return false;

        return this.import(backupData);
    }

    // Obtener estadísticas
    getStats() {
        return {
            available: this.isAvailable,
            keys: this.getKeys().length,
            size: this.getSize(),
            sizeFormatted: window.Formatters ? 
                window.Formatters.formatFileSize(this.getSize()) : 
                `${this.getSize()} bytes`
        };
    }
}

// Instancias específicas para diferentes tipos de datos
window.sessionStorage = new StorageManager('mmr_sessions_');
window.settingsStorage = new StorageManager('mmr_settings_');
window.cacheStorage = new StorageManager('mmr_cache_');

// Instancia general
window.storage = new StorageManager();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}