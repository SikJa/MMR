// MMR Group Dashboard - JavaScript Controller CLEAN VERSION
console.log('🚀 [CLEAN] Dashboard clean script loading...');

class DashboardController {
    constructor() {
        console.log('🚀 [CLEAN] DashboardController constructor called');
        this.currentTab = 'dashboard';
        this.processedProducts = [];
        this.currentProductIndex = 0;
        this.totalProducts = 0;
        this.activityChart = null;
        this.selectedTemplate = 'plantilla.png';
        this.currentImageFile = null;
        this.availableTemplates = [];
        this.init();
    }

    init() {
        console.log('🚀 [CLEAN] Inicializando DashboardController...');
        try {
            this.initEventListeners();
            this.initCharts();
            this.initTheme();
            this.initSidebar();
            console.log('✅ [CLEAN] DashboardController inicializado correctamente');
        } catch (error) {
            console.error('❌ [CLEAN] Error al inicializar DashboardController:', error);
        }
    }

    initEventListeners() {
        console.log('🔧 [CLEAN] Inicializando event listeners...');
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        const sidebarToggleMain = document.querySelector('.sidebar-toggle-main');
        if (sidebarToggleMain) {
            sidebarToggleMain.addEventListener('click', () => this.toggleSidebar());
        }

        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    initCharts() {
        console.log('📊 [CLEAN] Inicializando charts...');
        // Chart initialization code will go here
    }

    initTheme() {
        console.log('🎨 [CLEAN] Inicializando theme...');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    initSidebar() {
        console.log('📱 [CLEAN] Inicializando sidebar...');
        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        if (savedSidebarState === 'true') {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            if (sidebar) sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    switchTab(tab) {
        console.log('🔄 [CLEAN] Cambiando a tab:', tab);
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`[data-tab="${tab}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');

        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        const activeContent = document.getElementById(tab);
        if (activeContent) activeContent.classList.add('active');

        this.currentTab = tab;
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

console.log('🚀 [CLEAN] DashboardController class defined');

// Initialize dashboard with simple approach
function initializeDashboard() {
    console.log('🚀 [CLEAN] Inicializando Dashboard Controller...');
    try {
        if (window.appController) {
            console.log('⚠️ [CLEAN] Dashboard Controller already exists');
            return true;
        }
        
        window.appController = new DashboardController();
        console.log('✅ [CLEAN] Dashboard Controller inicializado exitosamente');
        return true;
    } catch (error) {
        console.error('❌ [CLEAN] Error al inicializar Dashboard Controller:', error);
        return false;
    }
}

// Simple initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📋 [CLEAN] DOMContentLoaded - inicializando...');
        setTimeout(initializeDashboard, 100);
    });
} else {
    console.log('📋 [CLEAN] DOM ya cargado - inicializando...');
    setTimeout(initializeDashboard, 100);
}

console.log('🚀 [CLEAN] Dashboard clean script loaded completely');