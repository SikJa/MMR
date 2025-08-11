// Gallery Manager para Fase 2 - Manejo de imágenes procesadas
class GalleryManager {
    constructor() {
        this.images = [];
        this.currentZoomedImage = null;
        this.init();
    }
    
    init() {
        console.log('🖼️ Inicializando Gallery Manager');
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Event listener para cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentZoomedImage) {
                this.closeZoom();
            }
        });
        
        // Event listener para cerrar modal haciendo clic fuera
        const modal = document.getElementById('imageZoomModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeZoom();
                }
            });
        }
    }
    
    addImage(imageData) {
        this.images.push({
            id: Date.now(),
            url: imageData.url,
            productName: imageData.product_name,
            productPrice: imageData.product_price,
            template: imageData.template_used,
            processingTime: imageData.processing_time,
            qualityScore: imageData.quality_score,
            timestamp: new Date()
        });
        
        this.updateGallery();
    }
    
    updateGallery() {
        const gallery = document.getElementById('processedGrid');
        if (!gallery) return;
        
        if (this.images.length === 0) {
            gallery.innerHTML = `
                <div class="no-processed">
                    <i class="fas fa-inbox"></i>
                    <p>No hay imágenes procesadas</p>
                    <span>Las imágenes aparecerán aquí después del procesamiento</span>
                </div>
            `;
            return;
        }
        
        gallery.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const imageElement = this.createImageElement(image, index);
            gallery.appendChild(imageElement);
        });
    }
    
    createImageElement(image, index) {
        const element = document.createElement('div');
        element.className = 'processed-item';
        element.innerHTML = `
            <div class="processed-image-container">
                <img src="${image.url}" alt="${image.productName}" loading="lazy">
                <div class="processed-overlay">
                    <div class="processed-info">
                        <h4>${image.productName}</h4>
                        <p>$${image.productPrice}</p>
                        <span class="template-info">Template: ${image.template}</span>
                    </div>
                    <div class="processed-actions">
                        <button class="action-btn zoom-btn" onclick="galleryManager.openZoom('${image.url}', '${image.productName}')">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="action-btn download-btn" onclick="galleryManager.downloadImage('${image.url}', '${image.productName}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn share-btn" onclick="galleryManager.shareImage('${image.url}', '${image.productName}', '${image.productPrice}')">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="processed-stats">
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span>${image.processingTime}s</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-star"></i>
                        <span>${image.qualityScore}%</span>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar efecto de entrada
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
        
        return element;
    }
    
    openZoom(imageUrl, productName) {
        const modal = document.getElementById('imageZoomModal');
        const zoomImage = document.getElementById('zoomImage');
        
        if (!modal || !zoomImage) return;
        
        zoomImage.src = imageUrl;
        zoomImage.alt = productName;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.currentZoomedImage = imageUrl;
        
        // Agregar información del producto al modal
        this.updateZoomInfo(productName);
    }
    
    updateZoomInfo(productName) {
        // Buscar si ya existe info, si no crearla
        let infoElement = document.querySelector('.zoom-info');
        if (!infoElement) {
            infoElement = document.createElement('div');
            infoElement.className = 'zoom-info';
            document.querySelector('.zoom-content').appendChild(infoElement);
        }
        
        infoElement.innerHTML = `
            <h3>${productName}</h3>
            <div class="zoom-actions">
                <button class="zoom-action-btn" onclick="galleryManager.downloadCurrentZoom()">
                    <i class="fas fa-download"></i>
                    Descargar
                </button>
                <button class="zoom-action-btn" onclick="galleryManager.shareCurrentZoom()">
                    <i class="fas fa-share-alt"></i>
                    Compartir
                </button>
            </div>
        `;
    }
    
    closeZoom() {
        const modal = document.getElementById('imageZoomModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentZoomedImage = null;
        
        // Remover info del zoom
        const infoElement = document.querySelector('.zoom-info');
        if (infoElement) {
            infoElement.remove();
        }
    }
    
    downloadImage(imageUrl, productName) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_processed.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Descargando imagen...', 'success');
    }
    
    downloadCurrentZoom() {
        if (this.currentZoomedImage) {
            const image = this.images.find(img => img.url === this.currentZoomedImage);
            if (image) {
                this.downloadImage(image.url, image.productName);
            }
        }
    }
    
    shareImage(imageUrl, productName, productPrice) {
        const shareData = {
            title: `${productName} - $${productPrice}`,
            text: `¡Mira este producto procesado! ${productName} por $${productPrice}`,
            url: imageUrl
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }
    
    shareCurrentZoom() {
        if (this.currentZoomedImage) {
            const image = this.images.find(img => img.url === this.currentZoomedImage);
            if (image) {
                this.shareImage(image.url, image.productName, image.productPrice);
            }
        }
    }
    
    fallbackShare(shareData) {
        // Copiar URL al portapapeles como fallback
        navigator.clipboard.writeText(shareData.url).then(() => {
            this.showToast('URL copiada al portapapeles', 'success');
        }).catch(() => {
            this.showToast('No se pudo compartir la imagen', 'error');
        });
    }
    
    loadFromSession(sessionId) {
        fetch(`/api/processed-images/${sessionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.images = data.images.map(img => ({
                        id: img.id,
                        url: img.url,
                        productName: img.product_name,
                        productPrice: img.product_price,
                        template: img.template_used,
                        processingTime: img.processing_time,
                        qualityScore: img.quality_score,
                        timestamp: new Date(img.created_at)
                    }));
                    this.updateGallery();
                }
            })
            .catch(error => {
                console.error('Error loading gallery:', error);
                this.showToast('Error cargando galería', 'error');
            });
    }
    
    showToast(message, type = 'info') {
        // Usar el sistema de toast existente si está disponible
        if (window.fase2App && window.fase2App.showToast) {
            window.fase2App.showToast(message, type);
        } else {
            console.log(`Toast: ${message} (${type})`);
        }
    }
    
    clear() {
        this.images = [];
        this.updateGallery();
    }
    
    getStats() {
        return {
            total: this.images.length,
            avgProcessingTime: this.images.reduce((sum, img) => sum + img.processingTime, 0) / this.images.length || 0,
            avgQuality: this.images.reduce((sum, img) => sum + img.qualityScore, 0) / this.images.length || 0,
            totalValue: this.images.reduce((sum, img) => sum + parseFloat(img.productPrice), 0)
        };
    }
}

// Inicializar el gallery manager globalmente
window.galleryManager = new GalleryManager();