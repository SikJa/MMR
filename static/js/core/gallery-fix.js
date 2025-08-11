// 🚨 GALERÍA HORIZONTAL SIMPLE - SOLUCIÓN RADICAL
console.log('🚀 Cargando galería horizontal SIMPLE...');

// 🔧 FUNCIÓN PRINCIPAL - SÚPER SIMPLE
function renderSimpleGallery() {
    console.log('🎨 Renderizando galería SIMPLE...');

    const galleryContainer = document.getElementById('processedGalleryContainer');
    if (!galleryContainer) {
        console.error('❌ No se encontró processedGalleryContainer');
        return;
    }

    const offersCreator = window.offersCreator;
    if (!offersCreator || !offersCreator.processedImages) {
        console.log('⚠️ No hay offersCreator o processedImages');
        return;
    }

    const totalImages = offersCreator.processedImages.length;
    console.log('📊 Total imágenes:', totalImages);

    if (totalImages === 0) {
        galleryContainer.innerHTML = `
            <div class="no-images">
                <i class="fas fa-images"></i>
                <p>No hay imágenes procesadas</p>
            </div>
        `;
        return;
    }

    // 🎨 HTML SÚPER SIMPLE - SOLO IMÁGENES
    let html = `
        <div class="simple-gallery-title">
            <h3>🖼️ Galería de Ofertas (${totalImages})</h3>
        </div>
        <div class="simple-images-row">
    `;

    offersCreator.processedImages.forEach((img, index) => {
        const productName = img.name || img.product?.name || `Producto ${index + 1}`;
        const productPrice = img.price || img.product?.price || 0;
        const imageUrl = img.url || img.imageData?.url;

        console.log(`🖼️ Agregando imagen ${index + 1}:`, productName);

        const priceFormatted = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(productPrice);

        html += `
            <div class="image-box" data-index="${index}">
                <img src="${imageUrl}" alt="${productName}" 
                     ondblclick="expandImage(this, '${productName}')"
                     title="${productName} - ${priceFormatted}">
                <div class="image-label">${productName}</div>
                <div class="image-price">${priceFormatted}</div>
            </div>
        `;
    });

    html += `
        </div>
    `;

    // REEMPLAZAR COMPLETAMENTE EL CONTENIDO
    galleryContainer.innerHTML = html;

    // Agregar estilos simples
    addSimpleStyles();

    // Habilitar botones
    enableProcessedButtons();
    updateImageCounter();

    console.log('✅ Galería SIMPLE renderizada con', totalImages, 'imágenes');
}

// 🎨 ESTILOS SÚPER SIMPLES
function addSimpleStyles() {
    const styleId = 'simple-gallery-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* RESET TOTAL */
        #processedGalleryContainer {
            overflow: visible !important;
            width: 100% !important;
            height: auto !important;
            padding: 20px !important;
            background: transparent !important;
        }

        /* TÍTULO SIMPLE */
        .simple-gallery-title {
            margin-bottom: 20px;
            text-align: center;
        }

        .simple-gallery-title h3 {
            color: var(--mmr-yellow, #FFD700);
            font-size: 24px;
            font-weight: 700;
            margin: 0;
        }

        /* FILA DE IMÁGENES - HORIZONTAL */
        .simple-images-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 20px !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            padding: 20px 0 !important;
            width: 100% !important;
            min-height: 300px !important;
            align-items: flex-start !important;
        }

        /* SCROLLBAR PERSONALIZADA */
        .simple-images-row::-webkit-scrollbar {
            height: 8px;
        }

        .simple-images-row::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        .simple-images-row::-webkit-scrollbar-thumb {
            background: #FFD700;
            border-radius: 4px;
        }

        /* CADA IMAGEN - INDIVIDUAL */
        .image-box {
            flex-shrink: 0 !important;
            width: 250px !important;
            height: 280px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 12px !important;
            padding: 15px !important;
            text-align: center !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
            backdrop-filter: blur(10px) !important;
            position: relative !important;
        }

        .image-box:hover {
            transform: translateY(-5px) !important;
            border-color: #FFD700 !important;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3) !important;
        }

        /* IMAGEN DENTRO DE LA CAJA */
        .image-box img {
            width: 100% !important;
            height: 200px !important;
            object-fit: contain !important;
            border-radius: 8px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            transition: transform 0.3s ease !important;
        }

        .image-box:hover img {
            transform: scale(1.05) !important;
        }

        /* ETIQUETAS */
        .image-label {
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #fafafa !important;
            margin: 10px 0 5px 0 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }

        .image-price {
            font-size: 16px !important;
            font-weight: 700 !important;
            color: #FFD700 !important;
            margin: 0 !important;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            .image-box {
                width: 200px !important;
                height: 240px !important;
            }
            
            .image-box img {
                height: 160px !important;
            }
        }

        /* MODAL PARA EXPANDIR */
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .image-modal.active {
            opacity: 1;
            visibility: visible;
        }

        .modal-content {
            max-width: 90vw;
            max-height: 90vh;
            position: relative;
        }

        .modal-content img {
            width: 100%;
            height: auto;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 10px;
        }

        .modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: #FFD700;
            color: #000;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

// 🔍 EXPANDIR IMAGEN
function expandImage(imgElement, productName) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal(this)">×</button>
            <img src="${imgElement.src}" alt="${productName}">
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeImageModal(closeBtn) {
    const modal = closeBtn.closest('.image-modal');
    modal.classList.remove('active');
    setTimeout(() => document.body.removeChild(modal), 300);
}

// 🔧 FUNCIONES PARA BOTONES
function downloadAllImages() {
    console.log('📥 Descarga desde galería simple');
    downloadAllAsZip();
}

function enableProcessedButtons() {
    const btnDownloadAll = document.getElementById('btnDownloadAll');
    const btnWhatsApp = document.getElementById('btnWhatsApp');
    const btnSaveSession = document.getElementById('btnSaveSession');
    
    if (btnDownloadAll) btnDownloadAll.disabled = false;
    if (btnWhatsApp) btnWhatsApp.disabled = false;
    if (btnSaveSession) btnSaveSession.disabled = false;
}

function updateImageCounter() {
    const counter = document.getElementById('processedImageCounter');
    const offersCreator = window.offersCreator;
    
    if (counter && offersCreator && offersCreator.processedImages) {
        counter.textContent = offersCreator.processedImages.length;
    }
}

// 🔧 FUNCIONES DE SESIONES
function saveCurrentSession() {
    const offersCreator = window.offersCreator;
    if (offersCreator && offersCreator.processedImages) {
        try {
            const session = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                processedImages: offersCreator.processedImages,
                totalImages: offersCreator.processedImages.length
            };

            const sessions = JSON.parse(localStorage.getItem('mmr_offers_sessions') || '[]');
            sessions.unshift(session);
            if (sessions.length > 10) sessions.splice(10);
            localStorage.setItem('mmr_offers_sessions', JSON.stringify(sessions));
            
            alert(`✅ Sesión guardada con ${offersCreator.processedImages.length} imágenes`);
        } catch (error) {
            alert('❌ Error al guardar la sesión');
        }
    }
}

function sendToWhatsApp() {
    const offersCreator = window.offersCreator;
    if (offersCreator && offersCreator.processedImages) {
        const totalProducts = offersCreator.processedImages.length;
        const totalValue = offersCreator.processedImages.reduce((sum, img) => {
            return sum + (img.price || img.product?.price || 0);
        }, 0);

        const totalFormatted = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(totalValue);

        const message = `🛒 *Nuevas Ofertas MMR Group*\n\n` +
            `📦 ${totalProducts} productos disponibles\n` +
            `💰 Valor total: ${totalFormatted}\n\n` +
            `¡Consulta disponibilidad y precios actualizados!\n\n` +
            `#MMRGroup #Ofertas #Autopartes`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// 🚀 DESCARGA ZIP
async function downloadAllAsZip() {
    try {
        if (typeof JSZip === 'undefined') {
            alert('Error: JSZip no está cargado');
            return;
        }

        const offersCreator = window.offersCreator;
        if (!offersCreator?.processedImages?.length) {
            alert('No hay imágenes para descargar');
            return;
        }

        const zip = new JSZip();
        const folder = zip.folder("MMR_Ofertas_" + new Date().toISOString().split('T')[0]);

        for (let i = 0; i < offersCreator.processedImages.length; i++) {
            const img = offersCreator.processedImages[i];
            const imageUrl = img.url || img.imageData?.url;
            const productName = img.name || img.product?.name || `producto_${i}`;

            if (imageUrl) {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const cleanName = productName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
                folder.file(`${cleanName}.png`, blob);
            }
        }

        const zipBlob = await zip.generateAsync({type: "blob"});
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MMR_Ofertas_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert(`✅ ZIP descargado con ${offersCreator.processedImages.length} imágenes`);
    } catch (error) {
        alert('Error al crear el archivo ZIP');
    }
}

// 🚨 OVERRIDE AUTOMÁTICO
function setupAutoGallery() {
    if (window.offersCreator) {
        if (!window.offersCreator.processedImages) {
            window.offersCreator.processedImages = [];
        }

        window.offersCreator.addToProcessedGallery = function (processedImage) {
            console.log('🚨 AUTO: Nueva imagen agregada:', processedImage.name || processedImage.product?.name);

            if (!this.processedImages) this.processedImages = [];

            const exists = this.processedImages.find(img =>
                (img.name || img.product?.name) === (processedImage.name || processedImage.product?.name)
            );

            if (!exists) {
                this.processedImages.push(processedImage);
                console.log('✅ Imagen agregada. Total:', this.processedImages.length);
            }

            setTimeout(() => renderSimpleGallery(), 100);
        };

        console.log('✅ Sistema simple configurado');
    } else {
        setTimeout(setupAutoGallery, 1000);
    }
}

// 🚀 INICIALIZAR
document.addEventListener('DOMContentLoaded', setupAutoGallery);
if (document.readyState !== 'loading') setupAutoGallery();

// EXPORTAR FUNCIONES
window.renderSimpleGallery = renderSimpleGallery;
window.setupAutoGallery = setupAutoGallery;
window.downloadAllAsZip = downloadAllAsZip;
window.saveCurrentSession = saveCurrentSession;
window.sendToWhatsApp = sendToWhatsApp;
window.downloadAllImages = downloadAllImages;
window.enableProcessedButtons = enableProcessedButtons;
window.updateImageCounter = updateImageCounter;
window.expandImage = expandImage;
window.closeImageModal = closeImageModal;

console.log('✅ Galería SIMPLE cargada completamente');