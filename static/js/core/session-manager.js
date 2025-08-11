// ===== GESTOR DE SESIONES MODULAR =====

class SessionManager {
    constructor() {
        this.sessions = [];
        this.currentSession = null;
        this.maxSessions = 10;
        this.storage = window.sessionStorage || new StorageManager('mmr_sessions_');
        this.templateEngine = window.templateEngine;
        this.init();
    }

    // Inicializar gestor
    init() {
        this.loadSessions();
        this.preloadTemplates();
        console.log('✅ Gestor de sesiones inicializado');
    }

    // Precargar templates
    async preloadTemplates() {
        if (!this.templateEngine) return;

        const templates = [
            '/static/templates/session-card.html',
            '/static/templates/no-sessions.html'
        ];

        try {
       