// MMR Group - Offers Creator - Archivo Principal
// Versión: 2.0.0
// Fecha: 2025-01-08

console.log('🚀 Iniciando MMR Offers Creator v2.0.0');

// Configuración global
window.MMR_CONFIG = {
    version: '2.0.0',
    debug: true,
    paths: {
        core: '/static/js/core/',
        components: '/static/js/components/',
        utils: '/static/js/utils/',
        templates: '/static/templates/',
        css: '/static/css/'
    },
    storage: {
        prefix: 'mmr_offers_',
        maxSessions: 10
    }
};

// Cargador de módulos
class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
    }

    async loadScript(src) {
        if (this.loadedModules.has(src)) {
            return Promise.resolve();
        }

        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedModules.add(src);
                console.log(`✅ Módulo cargado: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`❌ Error cargando módulo: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        });

        this.loadingPromises.set(src, promise);
        return promise;
    }

    async loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                console.log(`✅ CSS cargado: ${href}`);
                resolve();
            };
            link.onerror = () => {
                console.error(`❌ Error cargando CSS: ${href}`);
                reject(new Error(`Failed to load CSS: ${href}`));
            };
            document.head.appendChild(link);
        });
    }
}

// Inicializador principal
class MMRApp {
    constructor() {
        this.moduleLoader = new ModuleLoader();
        this.offersCreator = null;
        this.init();
    }

    async init() {
        try {
            console.log('🏗️ Inicializando aplicación MMR...');
            
            // Cargar CSS principal
            await this.loadStyles();
            
            // Cargar módulos principales
            await this.loadCoreModules();
            
            // Inicializar aplicación
            await this.initializeApp();
            
            console.log('✅ Aplicación MMR inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.showErrorMessage('Error al cargar la aplicación. Por favor, recarga la página.');
        }
    }

    async loadStyles() {
        const styles = [
            '/static/css/main.css',
            '/static/css/components.css'
        ];

        for (const style of styles) {
            try {
                await this.moduleLoader.loadCSS(style);
            } catch (error) {
                console.warn(`⚠️ CSS opcional no encontrado: ${style}`);
            }
        }
    }

    async loadCoreModules() {
        const coreModules = [
            '/static/js/core/offers-creator.js',
            '/static/js/components/gallery-fix.js'
        ];

        for (const module of coreModules) {
            await this.moduleLoader.loadScript(module);
        }
    }

    async initializeApp() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Inicializar OffersCreator
        if (window.OffersCreator) {
            this.offersCreator = new window.OffersCreator();
            window.offersCreator = this.offersCreator;
        } else {
            throw new Error('OffersCreator class not found');
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Inicializar aplicación cuando se cargue la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mmrApp = new MMRApp();
    });
} else {
    window.mmrApp = new MMRApp();
}

// Exportar para uso global
window.MMRApp = MMRApp;
window.ModuleLoader = ModuleLoader;

// ===== INICIALIZACIÓN DE GRÁFICOS DEL DASHBOARD =====
function initDashboardCharts() {
    console.log('📊 Inicializando gráficos del dashboard...');
    
    // Gráfico de dona (Donut Chart)
    const donutCtx = document.getElementById('dashboardDonut');
    if (donutCtx) {
        new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Mayoristas', 'Minoristas', 'Otros'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: [
                        'rgba(255, 215, 0, 0.8)',
                        'rgba(255, 193, 7, 0.6)',
                        'rgba(255, 235, 59, 0.4)'
                    ],
                    borderColor: [
                        'rgba(255, 215, 0, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(255, 235, 59, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de barras (Bar Chart)
    const barCtx = document.getElementById('dashboardBar');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ventas',
                    data: [12000, 19000, 15000, 25000, 22000, 30000],
                    backgroundColor: 'rgba(255, 215, 0, 0.6)',
                    borderColor: 'rgba(255, 215, 0, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    console.log('✅ Gráficos del dashboard inicializados');
}

// Inicializar gráficos cuando se cambie al tab dashboard
function switchToDashboard() {
    // Cambiar tab activo
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('[data-tab="dashboard"]').classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('dashboard').classList.add('active');
    
    // Actualizar título
    document.getElementById('headerTitle').textContent = 'Dashboard';
    
    // Ocultar botón de volver
    const backBtn = document.getElementById('btnBackToDashboard');
    if (backBtn) backBtn.style.display = 'none';
    
    // Inicializar gráficos después de un pequeño delay
    setTimeout(() => {
        initDashboardCharts();
    }, 100);
}

// Agregar event listener para el tab dashboard
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.querySelector('[data-tab="dashboard"]');
    if (dashboardTab) {
        dashboardTab.addEventListener('click', switchToDashboard);
    }
    
    // Inicializar gráficos si ya estamos en dashboard
    if (document.getElementById('dashboard').classList.contains('active')) {
        setTimeout(() => {
            initDashboardCharts();
        }, 500);
    }
});
/
/ ===== SISTEMA DE PARTÍCULAS LIQUID GLASS =====
function createLiquidParticles() {
    const container = document.getElementById('liquidParticles');
    if (!container) return;
    
    const particleCount = Math.random() * 3 + 7; // 7-10 partículas
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'liquid-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            // Variaciones aleatorias
            const size = Math.random() * 3 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Intensidad aleatoria
            const intensity = Math.random() * 0.4 + 0.4;
            particle.style.opacity = intensity;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 25000);
        }, i * 800);
    }
}

// Inicializar partículas liquid glass
document.addEventListener('DOMContentLoaded', function() {
    // Crear partículas iniciales
    setTimeout(() => {
        createLiquidParticles();
    }, 1000);
    
    // Crear partículas periódicamente
    setInterval(createLiquidParticles, 8000);
});