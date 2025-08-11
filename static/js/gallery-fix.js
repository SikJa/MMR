// Gallery Fix - Sistema de galería de imágenes procesadas
// Este archivo es requerido por offers-creator.js

console.log('🎨 Gallery Fix cargado');

// Función global para renderizar galería simple
window.renderSimpleGallery = function() {
    console.log('🖼️ Renderizando galería simple...');
    
    const galleryContainer = document.querySelector('.processed-images-gallery');
    if (!galleryContainer) {
        console.log('❌ No se encontró contenedor de galería');
        return;
    }
    
    // Limpiar galería
    galleryContainer.innerHTML = '';
    
    // Obtener imágenes procesadas del contexto global
    const processedImages = window.processedImages || [];
    
    if (processedImages.length === 0) {
        galleryContainer.innerHTML = `
            <div class="no-images-message">
                <i class="fas fa-images"></i>
                <p>No hay imágenes procesadas</p>
                <span>Las imágenes aparecerán aquí después del procesamiento</span>
            </div>
        `;
        return;
    }
    
    // Renderizar cada imagen
    processedImages.forEach((image, index) => {
        const imageElement = document.createElement('div');
        imageElement.className = 'gallery-image-item';
        imageElement.innerHTML = `
            <div class="image-container">
                <img src="${image.url}" alt="${image.name}" onclick="expandImage('${image.url}', '${image.name}')">
                <div class="image-overlay">
                    <div class="image-info">
                        <h4>${image.name}</h4>
                        <p class="price">$${image.price}</p>
                        <p class="provider">${image.provider}</p>
                    </div>
                </div>
            </div>
        `;
        galleryContainer.appendChild(imageElement);
    });
    
    console.log(`✅ Galería renderizada con ${processedImages.length} imágenes`);
};

// Función para expandir imagen
window.expandImage = function(imageUrl, imageName) {
    console.log('🔍 Expandiendo imagen:', imageName);
    
    // Crear modal de expansión
    const modal = document.createElement('div');
    modal.className = 'image-expand-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${imageName}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <img src="${imageUrl}" alt="${imageName}">
            </div>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#image-expand-styles')) {
        const styles = document.createElement('style');
        styles.id = 'image-expand-styles';
        styles.textContent = `
            .image-expand-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-content {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                max-width: 90%;
                max-height: 90%;
                overflow: hidden;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
            }
            
            .modal-header h3 {
                color: #FFD700;
                margin: 0;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: #FFD700;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-body img {
                max-width: 100%;
                max-height: 70vh;
                border-radius: 8px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
    
    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Cerrar con click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    });
};

// Función para configurar galería automática
window.setupAutoGallery = function() {
    console.log('⚙️ Configurando galería automática...');
    
    // Observar cambios en las imágenes procesadas
    if (window.offersCreator && window.offersCreator.processedImages) {
        const originalImages = window.offersCreator.processedImages;
        
        // Crear proxy para detectar cambios
        window.offersCreator.processedImages = new Proxy(originalImages, {
            set: function(target, property, value) {
                target[property] = value;
                
                // Si se agregó una nueva imagen, actualizar galería
                if (property !== 'length' && typeof property === 'number') {
                    setTimeout(() => {
                        if (window.renderSimpleGallery) {
                            window.renderSimpleGallery();
                        }
                    }, 100);
                }
                
                return true;
            }
        });
    }
    
    console.log('✅ Galería automática configurada');
};

// Función para agregar imagen a la galería procesada
window.addToProcessedGallery = function(image) {
    console.log('➕ Agregando imagen a galería:', image.name);
    
    // Agregar a la lista global de imágenes procesadas
    if (!window.processedImages) {
        window.processedImages = [];
    }
    
    window.processedImages.push(image);
    
    // Actualizar galería si existe
    if (window.renderSimpleGallery) {
        setTimeout(() => {
            window.renderSimpleGallery();
        }, 100);
    }
    
    console.log(`✅ Imagen agregada. Total: ${window.processedImages.length}`);
};

// Función para limpiar galería
window.clearProcessedGallery = function() {
    console.log('🗑️ Limpiando galería...');
    
    if (window.processedImages) {
        window.processedImages = [];
    }
    
    if (window.renderSimpleGallery) {
        window.renderSimpleGallery();
    }
    
    console.log('✅ Galería limpiada');
};

// Función para obtener estadísticas de la galería
window.getGalleryStats = function() {
    const images = window.processedImages || [];
    return {
        total: images.length,
        ready: images.filter(img => img.status === 'ready').length,
        processing: images.filter(img => img.status === 'processing').length,
        error: images.filter(img => img.status === 'error').length
    };
};

// Auto-inicialización cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Gallery Fix inicializado');
    
    // Configurar galería automática si offersCreator existe
    if (window.offersCreator) {
        setTimeout(() => {
            if (window.setupAutoGallery) {
                window.setupAutoGallery();
            }
        }, 500);
    }
});

console.log('✅ Gallery Fix completamente cargado');
