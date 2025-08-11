// JavaScript para Fase 2 - Procesamiento Individual (Propuesta C)
class Fase2Procesamiento {
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
        console.log('🚀 Inicializando Fase 2 - Procesamiento Individual (Propuesta C)');
        
        this.initEventListeners();
        this.initDragAndDrop();
        this.initParticles();
        this.initAutoSave();
        this.loadTemplatesFromBackend();
        this.loadSessionStats();
        this.loadProcessedImages();
        
        // Inicializar contadores animados
        setTimeout(() => this.animateCounters(), 500);
        
        console.log('✅ Fase 2 inicializada correctamente');
    }
    
    getSessionIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }
    
    initEventListeners() {
        // Botones principales
        document.getElementById('btnBack').addEventListener('click', () => this.goBack());
        document.getElementById('btnCopyProduct').addEventListener('click', () => this.copyProductName());
        document.getElementById('btnSelectFile').addEventListener('click', () => this.selectFile());
        document.getElementById('btnChangeImage').addEventListener('click', () => this.selectFile());
        document.getElementById('btnProcess').addEventListener('click', () => this.processImage());
        document.getElementById('btnDownload').addEventListener('click', () => this.downloadImage());
        document.getElementById('btnShare').addEventListener('click', () => this.shareImage());
        document.getElementById('btnWhatsApp').addEventListener('click', () => this.shareToWhatsApp());
        document.getElementById('btnSaveSession').addEventListener('click', () => this.saveSession());
        document.getElementById('btnNext').addEventListener('click', () => this.nextProduct());
        document.getElementById('btnCopyAll').addEventListener('click', () => this.copyAllProducts());
        
        // Input de archivo
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Modal de zoom
        document.getElementById('zoomClose').addEventListener('click', () => this.closeImageZoom());
        document.getElementById('imageZoomModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeImageZoom();
        });
        
        // Tecla Escape para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeImageZoom();
        });
    }
    
    initDragAndDrop() {
        const dragZone = document.getElementById('dragZone');
        
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
        if (this.selectedTemplate) {
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
            } else {
                // Fallback al método original
                const response = await fetch(`/api/processed-images/${this.sessionId}`);
                const data = await response.json();
                
                if (data.success) {
                    this.processedImages = data.images;
                    this.updateProcessedGrid();
                }
            }
        } catch (error) {
            console.error('Error cargando imágenes procesadas:', error);
        }
    }
    
    selectFile() {
        document.getElementById('fileInput').click();
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
        originalImage.innerHTML = `<img src="${imageSrc}" alt="Imagen original" onclick="openImageZoom('${imageSrc}')">`;
        
        // Actualizar precio (esto vendría del backend)
        const productName = document.getElementById('productName').textContent;
        document.getElementById('productPrice').textContent = '$8,900';
    }
    
    updateImageQuality(quality) {
        const qualityFill = document.getElementById('qualityFill');
        const qualityText = document.getElementById('qualityText');
        
        qualityFill.style.width = quality + '%';
        
        let qualityLabel = 'Baja';
        if (quality >= 80) qualityLabel = 'Excelente';
        else if (quality >= 60) qualityLabel = 'Buena';
        else if (quality >= 40) qualityLabel = 'Regular';
        
        qualityText.textContent = `${qualityLabel} (${quality}%)`;
        qualityText.style.color = quality >= 60 ? '#4CAF50' : quality >= 40 ? '#FFA000' : '#F44336';
    }
    
    enableProcessButton() {
        const btnProcess = document.getElementById('btnProcess');
        btnProcess.disabled = false;
    }
    
    async processImage() {
        if (!this.selectedTemplate) {
            this.showToast('Por favor selecciona un template', 'error');
            return;
        }
        
        // Mostrar spinner
        document.getElementById('processingSpinner').style.display = 'block';
        document.getElementById('arrowIcon').style.display = 'none';
        
        // Actualizar estado
        const status = document.getElementById('processStatus');
        status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        status.style.color = '#FFA000';
        
        // Deshabilitar botón de procesar
        document.getElementById('btnProcess').disabled = true;
        
        try {
            // Crear FormData para enviar la imagen
            const formData = new FormData();
            const fileInput = document.getElementById('fileInput');
            
            if (fileInput.files.length > 0) {
                formData.append('image', fileInput.files[0]);
                formData.append('session_id', this.sessionId);
                formData.append('product_index', '0'); // Por ahora hardcodeado
                formData.append('template', this.selectedTemplate.filename);
                
                const response = await fetch('/api/process-image-fase2', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.completeProcessing(data);
                } else {
                    throw new Error(data.error || 'Error en el procesamiento');
                }
            } else {
                throw new Error('No hay imagen seleccionada');
            }
        } catch (error) {
            console.error('Error procesando imagen:', error);
            this.showToast(`Error: ${error.message}`, 'error');
            this.resetProcessingState();
        }
    }
    
    completeProcessing(data) {
        // Ocultar spinner
        document.getElementById('processingSpinner').style.display = 'none';
        document.getElementById('arrowIcon').style.display = 'block';
        
        // Mostrar imagen procesada
        const processedImage = document.getElementById('processedImage');
        processedImage.innerHTML = `<img src="${data.processed_image_url}" alt="Imagen procesada" onclick="galleryManager.openZoom('${data.processed_image_url}', '${data.product_name}')">`;
        
        // Actualizar estado
        const status = document.getElementById('processStatus');
        status.innerHTML = '<i class="fas fa-check-circle"></i> Completado';
        status.style.color = '#4CAF50';
        
        // Habilitar botones
        document.getElementById('btnDownload').disabled = false;
        document.getElementById('btnShare').disabled = false;
        document.getElementById('btnWhatsApp').disabled = false;
        document.getElementById('btnNext').disabled = false;
        
        // Agregar a galería usando el gallery manager
        if (window.galleryManager) {
            window.galleryManager.addImage({
                url: data.processed_image_url,
                product_name: data.product_name,
                product_price: data.product_price,
                template_used: data.template_used,
                processing_time: data.processing_time,
                quality_score: data.quality_score
            });
        }
        
        // Actualizar estadísticas
        this.stats.processed++;
        this.updateStats();
        this.updateProgress();
        
        // Notificar cambios para auto-guardado
        document.dispatchEvent(new CustomEvent('imageProcessed', {
            detail: { data, sessionId: this.sessionId }
        }));
        
        this.showToast('¡Imagen procesada exitosamente!', 'success');
        
        // Efecto de confetti
        this.createConfetti();
    }
    
    resetProcessingState() {
        document.getElementById('processingSpinner').style.display = 'none';
        document.getElementById('arrowIcon').style.display = 'block';
        
        const status = document.getElementById('processStatus');
        status.innerHTML = '<i class="fas fa-clock"></i> Esperando';
        status.style.color = '#4CAF50';
        
        document.getElementById('btnProcess').disabled = false;
    }
    
    addToProcessedImages(imageSrc, data) {
        this.processedImages.push({
            src: imageSrc,
            timestamp: new Date(),
            template: this.selectedTemplate,
            data: data
        });
        
        this.updateProcessedGrid();
    }
    
    updateProcessedGrid() {
        const processedGrid = document.getElementById('processedGrid');
        
        if (this.processedImages.length === 0) {
            processedGrid.innerHTML = `
                <div class="no-processed">
                    <i class="fas fa-inbox"></i>
                    <p>No hay imágenes procesadas</p>
                    <span>Las imágenes aparecerán aquí después del procesamiento</span>
                </div>
            `;
            return;
        }
        
        processedGrid.innerHTML = '';
        
        this.processedImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'processed-item';
            item.innerHTML = `
                <img src="${image.src}" alt="Procesada ${index + 1}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            `;
            item.addEventListener('click', () => this.openImageZoom(image.src));
            processedGrid.appendChild(item);
        });
    }
    
    updateStats() {
        document.getElementById('processedCount').textContent = this.stats.processed;
        document.getElementById('pendingCount').textContent = this.stats.pending;
        document.getElementById('totalValue').textContent = `$${(this.stats.processed * 8900).toLocaleString()}`;
        document.getElementById('speedValue').textContent = `${this.stats.speed}/min`;
    }
    
    updateProgress() {
        const total = this.stats.processed + this.stats.pending;
        const percentage = total > 0 ? (this.stats.processed / total) * 100 : 0;
        document.getElementById('progressFill').style.width = percentage + '%';
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
    
    // Funciones de acción
    goBack() {
        if (confirm('¿Estás seguro de que quieres volver al dashboard? Se perderá el progreso actual.')) {
            window.location.href = '/';
        }
    }
    
    copyProductName() {
        const productName = document.getElementById('productName').textContent;
        navigator.clipboard.writeText(productName).then(() => {
            this.showToast(`Copiado: "${productName}"`, 'success');
        }).catch(() => {
            this.showToast('Error al copiar al portapapeles', 'error');
        });
    }
    
    downloadImage() {
        const processedImage = document.querySelector('#processedImage img');
        if (processedImage) {
            const productName = document.getElementById('productName').textContent;
            if (window.galleryManager) {
                window.galleryManager.downloadImage(processedImage.src, productName);
            } else {
                // Fallback
                const link = document.createElement('a');
                link.href = processedImage.src;
                link.download = `${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_processed.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.showToast('Descargando imagen...', 'download');
            }
        } else {
            this.showToast('No hay imagen para descargar', 'error');
        }
    }
    
    shareImage() {
        // Aquí iría la lógica para compartir la imagen
        this.showToast('Compartiendo imagen...', 'share');
    }
    
    shareToWhatsApp() {
        const productName = document.getElementById('productName').textContent;
        const price = document.getElementById('productPrice').textContent;
        const message = `🛍️ ${productName}\n💰 Precio: ${price}\n\n¡Disponible ahora!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        this.showToast('Abriendo WhatsApp...', 'share');
    }
    
    async saveSession() {
        try {
            if (this.autoSaveManager) {
                await this.autoSaveManager.forceSave();
                this.showToast('Sesión guardada correctamente', 'success');
            } else {
                // Fallback al método original
                const sessionData = {
                    timestamp: new Date(),
                    processedImages: this.processedImages,
                    stats: this.stats
                };
                
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
                    this.showToast('Sesión guardada correctamente', 'success');
                } else {
                    throw new Error(data.error);
                }
            }
        } catch (error) {
            console.error('Error guardando sesión:', error);
            this.showToast('Error guardando sesión', 'error');
        }
    }
    
    async nextProduct() {
        if (confirm('¿Continuar con el siguiente producto? Se guardará el progreso actual.')) {
            await this.saveSession();
            
            try {
                const response = await fetch(`/api/next-product/${this.sessionId}/0`);
                const data = await response.json();
                
                if (data.success) {
                    // Redirigir al siguiente producto
                    window.location.href = `/fase2/${this.sessionId}/${data.next_index}`;
                } else if (data.completed) {
                    this.showToast('¡Todos los productos han sido procesados!', 'success');
                }
            } catch (error) {
                console.error('Error obteniendo siguiente producto:', error);
                this.showToast('Error cargando siguiente producto', 'error');
            }
        }
    }
    
    copyAllProducts() {
        if (window.galleryManager && window.galleryManager.images.length > 0) {
            const productsList = window.galleryManager.images.map(img => 
                `${img.productName} - $${img.productPrice}`
            ).join('\n');
            
            navigator.clipboard.writeText(productsList).then(() => {
                this.showToast(`${window.galleryManager.images.length} productos copiados al portapapeles`, 'success');
            }).catch(() => {
                this.showToast('Error al copiar productos', 'error');
            });
        } else {
            this.showToast('No hay productos procesados para copiar', 'warning');
        }
    }
    
    // Sistema de zoom de imágenes
    openImageZoom(imageSrc) {
        const modal = document.getElementById('imageZoomModal');
        const zoomImage = document.getElementById('zoomImage');
        
        zoomImage.src = imageSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeImageZoom() {
        const modal = document.getElementById('imageZoomModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
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
            // Fallback al sistema original
            console.log(`Toast: ${message} (${type})`);
        }
    }
    
    // Efecto de confetti
    createConfetti() {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = ['#FFD700', '#FFA000', '#FF6B6B', '#4CAF50'][Math.floor(Math.random() * 4)];
            confetti.style.zIndex = '2500';
            confetti.style.animation = `confetti-fall 3s linear forwards`;
            confetti.style.animationDelay = Math.random() * 3 + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 6000);
        }
    }
}

// Estilos para confetti
const confettiStyles = `
@keyframes confetti-fall {
    0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = confettiStyles;
document.head.appendChild(styleSheet);

// Función global para zoom (para compatibilidad con onclick en HTML)
window.openImageZoom = function(imageSrc) {
    if (window.fase2App) {
        window.fase2App.openImageZoom(imageSrc);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.fase2App = new Fase2Procesamiento();
});