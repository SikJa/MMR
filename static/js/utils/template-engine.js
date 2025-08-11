// ===== MOTOR DE TEMPLATES SIMPLE =====

class TemplateEngine {
    constructor() {
        this.templateCache = new Map();
        this.helpers = new Map();
        
        // Registrar helpers básicos
        this.registerHelper('eq', (a, b) => a === b);
        this.registerHelper('ne', (a, b) => a !== b);
        this.registerHelper('gt', (a, b) => a > b);
        this.registerHelper('lt', (a, b) => a < b);
        this.registerHelper('if', (condition) => condition);
        this.registerHelper('unless', (condition) => !condition);
    }

    // Registrar helper personalizado
    registerHelper(name, fn) {
        this.helpers.set(name, fn);
    }

    // Cargar template desde archivo
    async loadTemplate(templatePath) {
        if (this.templateCache.has(templatePath)) {
            return this.templateCache.get(templatePath);
        }

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Template not found: ${templatePath}`);
            }
            
            const template = await response.text();
            this.templateCache.set(templatePath, template);
            return template;
        } catch (error) {
            console.error('Error loading template:', error);
            return '';
        }
    }

    // Renderizar template con datos
    render(template, data = {}) {
        let result = template;

        // Reemplazar variables simples {{variable}}
        result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            
            // Manejar helpers condicionales
            if (trimmedKey.startsWith('#if ')) {
                const condition = trimmedKey.substring(4);
                return this.evaluateCondition(condition, data) ? '' : '<!--IF_FALSE-->';
            }
            
            if (trimmedKey.startsWith('/if')) {
                return '';
            }
            
            if (trimmedKey.startsWith('#unless ')) {
                const condition = trimmedKey.substring(8);
                return !this.evaluateCondition(condition, data) ? '' : '<!--UNLESS_FALSE-->';
            }
            
            if (trimmedKey.startsWith('/unless')) {
                return '';
            }

            // Variables normales
            return this.getValue(data, trimmedKey) || '';
        });

        // Limpiar bloques condicionales falsos
        result = result.replace(/<!--IF_FALSE-->[\s\S]*?(?=\{\{\/if\}\}|\{\{#|$)/g, '');
        result = result.replace(/<!--UNLESS_FALSE-->[\s\S]*?(?=\{\{\/unless\}\}|\{\{#|$)/g, '');

        return result;
    }

    // Obtener valor anidado del objeto
    getValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : '';
        }, obj);
    }

    // Evaluar condición
    evaluateCondition(condition, data) {
        // Condiciones simples como "variable" o "!variable"
        if (condition.startsWith('!')) {
            const variable = condition.substring(1).trim();
            return !this.getValue(data, variable);
        }

        // Condiciones con helpers como "(eq status 'ready')"
        if (condition.startsWith('(') && condition.endsWith(')')) {
            const helperCall = condition.substring(1, condition.length - 1);
            const parts = helperCall.split(' ');
            const helperName = parts[0];
            const args = parts.slice(1).map(arg => {
                // Remover comillas de strings
                if ((arg.startsWith("'") && arg.endsWith("'")) || 
                    (arg.startsWith('"') && arg.endsWith('"'))) {
                    return arg.substring(1, arg.length - 1);
                }
                // Obtener valor de variable
                return this.getValue(data, arg);
            });

            const helper = this.helpers.get(helperName);
            return helper ? helper(...args) : false;
        }

        // Condición simple
        return !!this.getValue(data, condition);
    }

    // Renderizar template desde archivo
    async renderTemplate(templatePath, data = {}) {
        const template = await this.loadTemplate(templatePath);
        return this.render(template, data);
    }

    // Limpiar cache
    clearCache() {
        this.templateCache.clear();
    }

    // Precargar templates comunes
    async preloadTemplates(templatePaths) {
        const promises = templatePaths.map(path => this.loadTemplate(path));
        await Promise.all(promises);
        console.log(`✅ ${templatePaths.length} templates precargados`);
    }
}

// Instancia global
window.templateEngine = new TemplateEngine();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateEngine;
}