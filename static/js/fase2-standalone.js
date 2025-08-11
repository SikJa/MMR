// 🎨 FASE 2 - STANDALONE (SIN CONFLICTOS CON GALLERY-FIX)
console.log('🚀 Cargando Fase 2 STANDALONE - Mockup C');

// Prevenir que gallery-fix interfiera
window.FASE2_STANDALONE = true;

// Deshabilitar gallery-fix si se carga
if (window.renderSimpleGallery) {
    window.renderSimpleGallery = function() {
        console.log('🚫 Gallery-fix deshabilitado por Fase 2 Standalone');
    };
}

// JavaScript para Fase 2 - Procesamiento Individual (Propuesta C)
class Fase2ProcesamientoStandalone {
    constructor() {
        this.currentProduct = null;
        this.selectedTemplate = null;
        this.processedImages = [];
        this.sessionId = this.getSessionIdFromUrl();
        this.autoSaveManager = null;
        this.stats = {
            processed: 0,
            pending: 0,
            total: 0,
            speed: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando Fase 2 STANDALONE - Procesamiento Individual (Propuesta C)');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        this.initEventListeners();
        this.initDragAndDrop();
        this.initParticles();
        this.initAutoSave();
        this.loadTemplatesFromBackend();
        this.loadSessionStats();
        this.loadProcessedImages();
        
        // Inicializar contadores animados
        setTimeout(() => this.animateCounters(), 500);
        
        console.log('✅ Fase 2 STANDALONE inicializada correctamente');
    }
    
    getSessionIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }
    
    initEventListeners() {
        // Verificar que los elementos existen antes de agregar listeners
        const btnBack = document.getElementById('btnBack');
        if (btnBack) btnBack.addEventListener('click', () => this.goBack());
        
        const btnCopyProduct = document.getElementById('btnCopyProduct');
        if (btnCopyProduct) btnCopyProduct.addEventListener('click', () => this.copyProductName());
        
        const btnSelectFile = document.getElementById('btnSelectFile');
        if (btnSelectFile) btnSelectFile.addEventListener('click', () => this.selectFile());
        
        const btnChangeImage = document.getElementById('btnChangeImage');
        if (btnChangeImage) btnChangeImage.addEventListener('click', () => this.selectFile());
        
        const btnProcess = document.getElementById('btnProcess');
        if (btnProcess) btnProcess.addEventListener('click', () => this.processImage());
        
        const btnDownload = document.getElementById('btnDownload');
        if (btnDownload) btnDownload.addEventListener('click', () => this.downloadImage());
        
        const btnShare = document.getElementById('btnShare');
        if (btnShare) btnShare.addEventListener('click', () => this.shareImage());
        
        const btnWhatsApp = document.getElementById('btnWhatsApp');
        if (btnWhatsApp) btnWhatsApp.addEventListener('click', () => this.shareToWhatsApp());
        
        const btnSaveSession = document.getElementById('btnSaveSession');
        if (btnSaveSession) btnSaveSession.addEventListener('click', () => this.saveSession());
        
        const btnNext = document.getElementById('btnNext');
        if (btnNext) btnNext.addEventListener('click', () => this.nextProduct());
        
        const btnCopyAll = document.getElementById('btnCopyAll');
        if (btnCopyAll) btnCopyAll.addEventListener('click', () => this.copyAllProducts());
        
        // Input de archivo
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Modal de zoom
        const zoomClose = document.getElementById('zoomClose');
        if (zoomClose) zoomClose.addEventListener('click', () => this.closeImageZoom());
        
        const imageZoomModal = document.getElementById('imageZoomModal');
        if (imageZoomModal) {
            imageZoomModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) this.closeImageZoom();
            });
        }
        
        // Tecla Escape para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeImageZoom();
        });
    }
    
    initDragAndDrop() {
        const dragZone = document.getElementById('dragZone');
        if (!dragZone) return;
        
        dragZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragZone.classList.add('dragover');
        });
        
        dragZone.addEventListener('dragleave', () => {
            dragZone.classList.remove('dragover');
        });
        
        dragZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dragZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
    }
    
    initParticles() {
        const particlesContainer = document.getElementById('particlesContainer');
        if (!particlesContainer) return;
        
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 25000);
        };
        
        // Crear partículas cada 4 segundos
        setInterval(createParticle, 4000);
        
        // Crear algunas partículas iniciales
        for (let i = 0; i < 5; i++) {
            setTimeout(createParticle, i * 1000);
        }
    }
    
    initAutoSave() {
        if (window.AutoSaveManager) {
            this.autoSaveManager = new window.AutoSaveManager(this.sessionId);
            console.log('💾 Auto-Save Manager inicializado');
        }
    }
    
    async loadTemplatesFromBackend() {
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            
            if (data.success) {
                this.renderTemplates(data.templates);
            } else {
                console.error('Error cargando templates:', data.error);
                this.showToast('Error cargando templates', 'error');
            }
        } catch (error) {
            console.error('Error en la petición de templates:', error);
            this.showToast('Error de conexión', 'error');
        }
    }
    
    renderTemplates(templates) {
        const templatesGrid = document.getElementById('templatesGrid');
        if (!templatesGrid) return;
        
        templatesGrid.innerHTML = '';
        
        templates.forEach((template, index) => {
            const templateElement = document.createElement('div');
            templateElement.className = `template-item template-morph ${index === 0 ? 'active' : ''}`;
            templateElement.innerHTML = `
                <div class="template-icon">
                    <i class="${template.icon}"></i>
                </div>
                <div>${template.name}</div>
            `;
            
            templateElement.addEventListener('click', () => this.selectTemplate(template, templateElement));
            templatesGrid.appendChild(templateElement);
        });
        
        // Seleccionar el primer template por defecto
        if (templates.length > 0) {
            this.selectedTemplate = templates[0];
            this.updateTemplateDescription();
        }
    }
    
    selectTemplate(template, element) {
        // Remover clase active de todos los templates
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Agregar clase active al seleccionado
        element.classList.add('active');
        
        this.selectedTemplate = template;
        this.updateTemplateDescription();
        
        // Notificar cambio de template para auto-guardado
        document.dispatchEvent(new CustomEvent('templateChanged', {
            detail: { template, sessionId: this.sessionId }
        }));
        
        this.showToast(`Template ${template.name} seleccionado`, 'success');
    }
    
    updateTemplateDescription() {
        const description = document.getElementById('templateDescription');
        if (description && this.selectedTemplate) {
            description.textContent = `Template seleccionado: "${this.selectedTemplate.description}" - ${this.selectedTemplate.name}`;
        }
    }
    
    async loadSessionStats() {
        try {
            const response = await fetch(`/api/session-stats/${this.sessionId}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsFromBackend(data.stats);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }
    
    updateStatsFromBackend(stats) {
        this.stats = {
            processed: stats.processed_count,
            pending: stats.pending_count,
            total: stats.total_count,
            speed: Math.round(stats.processed_count / Math.max(1, stats.total_count) * 2.3)
        };
        
        this.updateStats();
        this.updateProgress();
    }
    
    async loadProcessedImages() {
        try {
            if (window.galleryManager) {
                window.galleryManager.loadFromSession(this.sessionId);
            }
        } catch (error) {
            console.error('Error cargando imágenes procesadas:', error);
        }
    }
    
    selectFile() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.click();
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayOriginalImage(e.target.result);
            this.updateImageQuality(85); // Simular calidad de imagen
            this.enableProcessButton();
        };
        reader.readAsDataURL(file);
        
        this.showToast(`Imagen cargada: ${file.name}`, 'upload');
    }
    
    displayOriginalImage(imageSrc) {
        const originalImage = document.getElementById('originalImage');
        if (originalImage) {
            originalImage.innerHTML = `<img src="${imageSrc}" alt="Imagen original" onclick="fase2App.openImageZoom('${imageSrc}')">`;
        }
        
        // Actualizar precio
        const productPrice = document.getElementById('productPrice');
        if (productPrice) {
            productPrice.textContent = '$8,900';
        }
    }
    
    updateImageQuality(quality) {
        const qualityFill = document.getElementById('qualityFill');
        const qualityText = document.getElementById('qualityText');
        
        if (qualityFill) qualityFill.style.width = quality + '%';
        
        let qualityLabel = 'Baja';
        if (quality >= 80) qualityLabel = 'Excelente';
        else if (quality >= 60) qualityLabel = 'Buena';
        else if (quality >= 40) qualityLabel = 'Regular';
        
        if (qualityText) {
            qualityText.textContent = `${qualityLabel} (${quality}%)`;
            qualityText.style.color = quality >= 60 ? '#4CAF50' : quality >= 40 ? '#FFA000' : '#F44336';
        }
    }
    
    enableProcessButton() {
        const btnProcess = document.getElementById('btnProcess');
        if (btnProcess) btnProcess.disabled = false;
    }
    
    // Sistema de notificaciones
    showToast(message, type = 'info') {
        if (window.notificationSystem) {
            switch (type) {
                case 'success':
                    return window.notificationSystem.success(message);
                case 'error':
                    return window.notificationSystem.error(message);
                case 'warning':
                    return window.notificationSystem.warning(message);
                case 'processing':
                    return window.notificationSystem.processing(message);
                case 'download':
                    return window.notificationSystem.download(message);
                case 'upload':
                    return window.notificationSystem.upload(message);
                case 'share':
                    return window.notificationSystem.share(message);
                default:
                    return window.notificationSystem.info(message);
            }
        } else {
            console.log(`Toast: ${message} (${type})`);
        }
    }
    
    // Funciones básicas
    goBack() {
        if (confirm('¿Estás seguro de que quieres volver al dashboard? Se perderá el progreso actual.')) {
            window.location.href = '/';
        }
    }
    
    copyProductName() {
        const productName = document.getElementById('productName');
        if (productName) {
            navigator.clipboard.writeText(productName.textContent).then(() => {
                this.showToast(`Copiado: "${productName.textContent}"`, 'success');
            }).catch(() => {
                this.showToast('Error al copiar al portapapeles', 'error');
            });
        }
    }
    
    updateStats() {
        const processedCount = document.getElementById('processedCount');
        const pendingCount = document.getElementById('pendingCount');
        const totalValue = document.getElementById('totalValue');
        const speedValue = document.getElementById('speedValue');
        
        if (processedCount) processedCount.textContent = this.stats.processed;
        if (pendingCount) pendingCount.textContent = this.stats.pending;
        if (totalValue) totalValue.textContent = `$${(this.stats.processed * 8900).toLocaleString()}`;
        if (speedValue) speedValue.textContent = `${this.stats.speed}/min`;
    }
    
    updateProgress() {
        const total = this.stats.processed + this.stats.pending;
        const percentage = total > 0 ? (this.stats.processed / total) * 100 : 0;
        const progressFill = document.getElementById('progressFill');
        if (progressFill) progressFill.style.width = percentage + '%';
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('.animated-counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const increment = target / 50;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 40);
        });
    }
    
    // Zoom de imágenes
    openImageZoom(imageSrc) {
        const modal = document.getElementById('imageZoomModal');
        const zoomImage = document.getElementById('zoomImage');
        
        if (modal && zoomImage) {
            zoomImage.src = imageSrc;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeImageZoom() {
        const modal = document.getElementById('imageZoomModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Funciones placeholder
    processImage() {
        this.showToast('Función de procesamiento en desarrollo', 'info');
    }
    
    downloadImage() {
        this.showToast('Función de descarga en desarrollo', 'info');
    }
    
    shareImage() {
        this.showToast('Función de compartir en desarrollo', 'info');
    }
    
    shareToWhatsApp() {
        this.showToast('Función de WhatsApp en desarrollo', 'info');
    }
    
    saveSession() {
        this.showToast('Función de guardar sesión en desarrollo', 'info');
    }
    
    nextProduct() {
        this.showToast('Función de siguiente producto en desarrollo', 'info');
    }
    
    copyAllProducts() {
        this.showToast('Función de copiar todos en desarrollo', 'info');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si estamos en Fase 2
    if (window.location.pathname.includes('/fase2')) {
        window.fase2App = new Fase2ProcesamientoStandalone();
        console.log('✅ Fase 2 Standalone inicializada');
    }
});

console.log('✅ Fase 2 Standalone cargado completamente');