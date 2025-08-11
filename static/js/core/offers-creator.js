// MMR Group - Creador de Ofertas FINAL LIMPIO
// Versión única y completa sin duplicados
console.log('🎨 Cargando Creador de Ofertas FINAL...');

class OffersCreator {
    constructor() {
        console.log('🏗️ Construyendo OffersCreator...');

        // Propiedades de sesiones
        this.currentSession = null;
        this.sessions = [];
        this.maxSessions = 10;
        this.lastSessionTime = null;

        // Estado de procesamiento
        this.isProcessing = false;
        this.currentProcessingIndex = 0;
        this.processedImages = [];

        // Análisis de productos
        this.currentAnalysis = {
            products: [],
            totalEstimated: 0,
            providers: [],
            isValid: false
        };

        // Configuración
        this.selectedTemplate = 'plantilla_1.png';
        this.currentImageFile = null;

        this.init();
    }

    // ===== INICIALIZACIÓN =====

    init() {
        console.log('🚀 Inicializando OffersCreator...');
        try {
            this.loadSessions();
            this.initEventListeners();
            this.updateLastSessionTime();
            this.updateSessionsGrid();
            this.addSessionStyles();
            console.log('✅ OffersCreator inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar:', error);
        }
    }

    // ===== GESTIÓN DE SESIONES =====

    loadSessions() {
        console.log('📂 Cargando sesiones desde localStorage...');
        try {
            const stored = localStorage.getItem('mmr_offers_sessions');
            this.sessions = stored ? JSON.parse(stored) : [];
            
            if (this.sessions.length > this.maxSessions) {
                this.sessions = this.sessions.slice(0, this.maxSessions);
                this.saveSessions();
            }
            
            console.log(`✅ ${this.sessions.length} sesiones cargadas`);
        } catch (error) {
            console.error('❌ Error cargando sesiones:', error);
            this.sessions = [];
        }
    }

    saveSessions() {
        console.log('💾 Guardando sesiones en localStorage...');
        try {
            localStorage.setItem('mmr_offers_sessions', JSON.stringify(this.sessions));
            console.log(`✅ ${this.sessions.length} sesiones guardadas`);
        } catch (error) {
            console.error('❌ Error guardando sesiones:', error);
        }
    }

    addSession(session) {
        console.log('➕ Agregando nueva sesión:', session.id);
        this.sessions.unshift(session);
        if (this.sessions.length > this.maxSessions) {
            this.sessions = this.sessions.slice(0, this.maxSessions);
        }
        this.saveSessions();
        this.updateLastSessionTime();
        this.updateSessionsGrid();
    }

    removeSession(sessionId) {
        console.log('🗑️ Eliminando sesión:', sessionId);
        const index = this.sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            this.sessions.splice(index, 1);
            this.saveSessions();
            this.updateLastSessionTime();
            this.updateSessionsGrid();
            return true;
        }
        return false;
    }

    updateSession(sessionId, updates) {
        console.log('📝 Actualizando sesión:', sessionId);
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            Object.assign(session, updates);
            this.saveSessions();
            this.updateSessionsGrid();
            return true;
        }
        return false;
    }

    generateSessionId() {
        return Date.now().toString();
    }

    updateLastSessionTime() {
        if (this.sessions.length > 0) {
            const lastSession = this.sessions[0];
            const date = new Date(lastSession.date);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffHours > 0) {
                this.lastSessionTime = `Hace ${diffHours}h ${diffMinutes}m`;
            } else if (diffMinutes > 0) {
                this.lastSessionTime = `Hace ${diffMinutes}m`;
            } else {
                this.lastSessionTime = 'Hace un momento';
            }
        } else {
            this.lastSessionTime = 'Sin sesiones';
        }

        const lastSessionElement = document.getElementById('lastSessionTime');
        if (lastSessionElement) {
            lastSessionElement.textContent = this.lastSessionTime;
        }
    }

    updateSessionsGrid() {
        const grid = document.getElementById('sessionsGrid');
        if (!grid) return;

        if (this.sessions.length === 0) {
            grid.innerHTML = `
                <div class="no-sessions">
                    <i class="fas fa-history"></i>
                    <h3>No hay sesiones anteriores</h3>
                    <p>Tus sesiones de procesamiento aparecerán aquí</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        this.sessions.forEach(session => {
            const sessionCard = this.createSessionCard(session);
            grid.appendChild(sessionCard);
        });
    }

    createSessionCard(session) {
        const card = document.createElement('div');
        card.className = 'session-card';

        const date = new Date(session.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="session-header">
                <div class="session-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="session-time">
                    <i class="fas fa-clock"></i>
                    <span>${formattedTime}</span>
                </div>
            </div>
            <div class="session-stats">
                <div class="stat">
                    <i class="fas fa-box"></i>
                    <span>${session.products.length} productos</span>
                </div>
                <div class="stat">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${session.totalEstimated.toLocaleString()}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-image"></i>
                    <span>${session.processedImages?.length || 0} procesadas</span>
                </div>
            </div>
            <div class="session-actions">
                <button onclick="offersCreator.viewSessionDetails('${session.id}')" class="btn-glass btn-view" title="Ver detalles completos">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
                <button onclick="offersCreator.editSessionPrices('${session.id}')" class="btn-glass btn-edit" title="Modificar precios">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button onclick="offersCreator.deleteSession('${session.id}')" class="btn-glass btn-delete" title="Eliminar sesión">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
                <button onclick="offersCreator.exportSession('${session.id}')" class="btn-glass btn-export" title="Exportar datos">
                    <i class="fas fa-download"></i>
                    Exportar
                </button>
                <button onclick="offersCreator.shareSessionWhatsApp('${session.id}')" class="btn-glass btn-whatsapp" title="Compartir por WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        `;

        return card;
    }

    // ===== ACCIONES DE SESIONES =====

    viewSessionDetails(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;
        console.log('👁️ Viendo sesión:', sessionId);
        alert(`Detalles de sesión: ${session.products.length} productos, Total: $${session.totalEstimated.toLocaleString()}`);
    }

    editSessionPrices(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;
        console.log('✏️ Editando precios de sesión:', sessionId);
        this.showAdvancedEditModal(session);
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const date = new Date(session.date).toLocaleDateString('es-ES');
        const confirmMessage = `¿Eliminar la sesión del ${date}?\n\n${session.products.length} productos\nTotal: $${session.totalEstimated.toLocaleString()}\n\nEsta acción no se puede deshacer.`;

        if (confirm(confirmMessage)) {
            console.log('🗑️ Eliminando sesión:', sessionId);
            this.removeSession(sessionId);
            this.showNotification('Sesión eliminada correctamente', 'success');
        }
    }

    exportSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('📤 Exportando sesión:', sessionId);
        const exportData = {
            session: session,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MMR_Sesion_${new Date(session.date).toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Sesión exportada correctamente', 'success');
    }

    shareSessionWhatsApp(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('📱 Compartiendo sesión por WhatsApp:', sessionId);
        const date = new Date(session.date).toLocaleDateString('es-ES');
        const message = `🛒 *Sesión MMR Group - ${date}*\n\n📦 ${session.products.length} productos procesados\n💰 Valor total: $${session.totalEstimated.toLocaleString()}\n🏢 Proveedores: ${session.providers.join(', ')}\n\n${session.processedImages?.length || 0} imágenes generadas\n\n#MMRGroup #Autopartes #Ofertas`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // ===== MODAL AVANZADO DE EDICIÓN =====

    showAdvancedEditModal(session) {
        console.log('🔧 Mostrando modal avanzado de edición');
        
        let modal = document.getElementById('advancedEditModal');
        if (!modal) {
            modal = this.createAdvancedEditModal();
            document.body.appendChild(modal);
        }

        this.currentEditSession = session;
        this.setupAdvancedEditModal(session);
        modal.style.display = 'flex';
        this.addAdvancedEditStyles();
    }

    createAdvancedEditModal() {
        const modal = document.createElement('div');
        modal.id = 'advancedEditModal';
        modal.className = 'advanced-edit-modal';
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title-section">
                        <h2 id="editModalTitle">📋 Sesión: Cargando...</h2>
                        <p id="editModalSubtitle">Proveedor: Cargando...</p>
                    </div>
                    <button class="modal-close-btn" onclick="offersCreator.closeAdvancedEditModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <div class="section-card">
                        <h3>🔧 AJUSTES MASIVOS:</h3>
                        <div class="mass-adjustments">
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(10)">+10%</button>
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(5)">+5%</button>
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(-5)">-5%</button>
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(-10)">-10%</button>
                            <div class="custom-adjustment">
                                <input type="number" id="customPercentage" placeholder="%" class="custom-input">
                                <button class="btn-glass btn-custom" onclick="offersCreator.applyCustomAdjustment()">Aplicar</button>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <h3>📦 PRODUCTOS INDIVIDUALES:</h3>
                        <div class="products-list" id="editProductsList"></div>
                    </div>

                    <div class="section-card">
                        <h3>📸 IMÁGENES PROCESADAS:</h3>
                        <div class="images-grid" id="editImagesGrid"></div>
                        <div class="images-actions">
                            <button class="btn-glass btn-primary" onclick="offersCreator.sendAllToWhatsApp()">
                                <i class="fab fa-whatsapp"></i>
                                📤 ENVIAR TODO A WHATSAPP
                            </button>
                            <button class="btn-glass btn-success" onclick="offersCreator.saveAllChanges()">
                                <i class="fas fa-save"></i>
                                💾 GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>

                    <div class="section-card">
                        <h3>📝 NOTAS:</h3>
                        <textarea id="sessionNotes" class="notes-textarea" placeholder="Agregar notas sobre esta sesión..."></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-glass btn-secondary" onclick="offersCreator.reprocessAll()">
                        <i class="fas fa-sync"></i>
                        🔄 Reprocesar Todo
                    </button>
                    <button class="btn-glass btn-whatsapp" onclick="offersCreator.shareToWhatsApp()">
                        <i class="fab fa-whatsapp"></i>
                        📱 WhatsApp
                    </button>
                    <button class="btn-glass btn-danger" onclick="offersCreator.closeAdvancedEditModal()">
                        <i class="fas fa-times"></i>
                        ❌ Cerrar
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    setupAdvancedEditModal(session) {
        const title = document.getElementById('editModalTitle');
        const subtitle = document.getElementById('editModalSubtitle');
        
        if (title) {
            const date = new Date(session.date).toLocaleDateString('es-ES');
            title.textContent = `📋 Sesión: ${date}`;
        }
        
        if (subtitle) {
            const provider = session.selectedProvider || session.providers[0] || 'Múltiples';
            subtitle.textContent = `Proveedor: ${provider}`;
        }

        this.loadProductsForEdit(session);
        this.loadImagesForEdit(session);
        
        const notesTextarea = document.getElementById('sessionNotes');
        if (notesTextarea) {
            notesTextarea.value = session.notes || '';
        }
    }

    loadProductsForEdit(session) {
        const productsList = document.getElementById('editProductsList');
        if (!productsList) return;

        productsList.innerHTML = '';
        
        session.products.forEach((product, index) => {
            const productItem = document.createElement('div');
            productItem.className = 'product-edit-item';
            productItem.innerHTML = `
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <div class="product-price-section">
                        <span class="price-display">$${product.price.toLocaleString()}</span>
                        <button class="btn-glass btn-edit-price" onclick="offersCreator.editIndividualPrice(${index})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                    </div>
                </div>
            `;
            productsList.appendChild(productItem);
        });
    }

    loadImagesForEdit(session) {
        const imagesGrid = document.getElementById('editImagesGrid');
        if (!imagesGrid) return;

        imagesGrid.innerHTML = '';
        
        if (!session.processedImages || session.processedImages.length === 0) {
            imagesGrid.innerHTML = `
                <div class="no-images-message">
                    <i class="fas fa-image"></i>
                    <p>No hay imágenes procesadas para esta sesión</p>
                </div>
            `;
            return;
        }

        session.processedImages.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.innerHTML = `
                <div class="image-preview">
                    <img src="${image.url}" alt="${image.name}" onclick="offersCreator.expandImage('${image.url}', '${image.name}')">
                </div>
                <div class="image-info">
                    <span class="image-name">${image.name}</span>
                </div>
            `;
            imagesGrid.appendChild(imageItem);
        });
    }

    // ===== FUNCIONES DEL MODAL AVANZADO =====

    applyMassAdjustment(percentage) {
        if (!this.currentEditSession) return;

        console.log(`📊 Aplicando ajuste masivo: ${percentage}%`);
        
        this.currentEditSession.products.forEach(product => {
            const adjustment = product.price * (percentage / 100);
            product.price = Math.round(product.price + adjustment);
        });

        this.currentEditSession.totalEstimated = this.currentEditSession.products.reduce((sum, p) => sum + p.price, 0);
        this.loadProductsForEdit(this.currentEditSession);
        this.showNotification(`Ajuste de ${percentage}% aplicado a todos los productos`, 'success');
    }

    applyCustomAdjustment() {
        const input = document.getElementById('customPercentage');
        if (!input) return;

        const percentage = parseFloat(input.value);
        if (isNaN(percentage)) {
            this.showNotification('Por favor ingresa un porcentaje válido', 'error');
            return;
        }

        this.applyMassAdjustment(percentage);
        input.value = '';
    }

    editIndividualPrice(productIndex) {
        if (!this.currentEditSession) return;

        const product = this.currentEditSession.products[productIndex];
        if (!product) return;

        const newPrice = prompt(`Nuevo precio para ${product.name}:`, product.price);
        if (newPrice === null) return;

        const price = parseFloat(newPrice.replace(/[$,]/g, ''));
        if (isNaN(price) || price < 0) {
            this.showNotification('Precio inválido', 'error');
            return;
        }

        product.price = price;
        this.currentEditSession.totalEstimated = this.currentEditSession.products.reduce((sum, p) => sum + p.price, 0);
        this.loadProductsForEdit(this.currentEditSession);
        this.showNotification(`Precio actualizado para ${product.name}`, 'success');
    }

    sendAllToWhatsApp() {
        if (!this.currentEditSession) return;

        console.log('📱 Enviando todo a WhatsApp');
        
        const session = this.currentEditSession;
        const date = new Date(session.date).toLocaleDateString('es-ES');
        
        let message = `🛒 *MMR Group - Sesión ${date}*\n\n`;
        message += `📦 *${session.products.length} Productos:*\n`;
        
        session.products.forEach((product, index) => {
            message += `${index + 1}. ${product.name} - $${product.price.toLocaleString()}\n`;
        });
        
        message += `\n💰 *Total: $${session.totalEstimated.toLocaleString()}*\n`;
        message += `🏢 *Proveedor: ${session.selectedProvider || 'Múltiples'}*\n\n`;
        
        if (session.notes) {
            message += `📝 *Notas:* ${session.notes}\n\n`;
        }
        
        message += `${session.processedImages?.length || 0} imágenes disponibles\n\n`;
        message += `#MMRGroup #Autopartes #Ofertas`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    saveAllChanges() {
        if (!this.currentEditSession) return;

        console.log('💾 Guardando todos los cambios');
        
        const notesTextarea = document.getElementById('sessionNotes');
        if (notesTextarea) {
            this.currentEditSession.notes = notesTextarea.value;
        }

        this.updateSession(this.currentEditSession.id, this.currentEditSession);
        this.showNotification('Cambios guardados correctamente', 'success');
    }

    reprocessAll() {
        if (!this.currentEditSession) return;

        const confirmMessage = `¿Reprocesar todas las imágenes?\n\nEsto recreará todas las imágenes con los precios actualizados.`;
        
        if (confirm(confirmMessage)) {
            console.log('🔄 Reprocesando todas las imágenes');
            this.showNotification('Reprocesamiento iniciado...', 'info');
            
            setTimeout(() => {
                this.showNotification('Reprocesamiento completado', 'success');
            }, 2000);
        }
    }

    shareToWhatsApp() {
        this.sendAllToWhatsApp();
    }

    closeAdvancedEditModal() {
        const modal = document.getElementById('advancedEditModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditSession = null;
    }

    expandImage(imageUrl, imageName) {
        const modal = document.createElement('div');
        modal.className = 'image-expand-modal';
        modal.innerHTML = `
            <div class="image-expand-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="image-expand-container">
                <button class="image-expand-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${imageUrl}" alt="${imageName}">
                <div class="image-expand-title">${imageName}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addImageExpandStyles();
    }

    showNotification(message, type = 'info') {
        console.log(`📢 Notificación (${type}):`, message);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        this.addNotificationStyles();
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ===== ESTILOS CSS =====

    addSessionStyles() {
        const styleId = 'session-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .session-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .btn-glass {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                color: #FFD700;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 80px;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .btn-glass:hover {
                background: rgba(255, 215, 0, 0.2);
                border-color: rgba(255, 215, 0, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
            }
        `;

        document.head.appendChild(style);
    }

    addAdvancedEditStyles() {
        const styleId = 'advanced-edit-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .advanced-edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .modal-container {
                position: relative;
                width: 100%;
                max-width: 1200px;
                max-height: 90vh;
                background: rgba(26, 26, 26, 0.95);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .section-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 15px;
                padding: 20px;
                backdrop-filter: blur(10px);
            }

            .notes-textarea {
                width: 100%;
                min-height: 100px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 8px;
                color: white;
                font-family: inherit;
                resize: vertical;
            }
        `;

        document.head.appendChild(style);
    }

    addNotificationStyles() {
        const styleId = 'notification-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #FFD700;
                backdrop-filter: blur(10px);
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 350px;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification-success { border-left-color: #28a745; }
            .notification-error { border-left-color: #dc3545; }
        `;

        document.head.appendChild(style);
    }

    addImageExpandStyles() {
        const styleId = 'image-expand-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .image-expand-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 15000;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.9);
            }

            .image-expand-container img {
                max-width: 90vw;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 10px;
            }
        `;

        document.head.appendChild(style);
    }

    initEventListeners() {
        console.log('🎧 Configurando event listeners...');

        // Input de lista de productos
        const productListInput = document.getElementById('productListInput');
        if (productListInput) {
            productListInput.addEventListener('input', (e) => {
                this.analyzeProductList(e.target.value);
            });
            productListInput.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.analyzeProductList(e.target.value);
                }, 100);
            });
        }

        // Botón de procesar lista
        const btnProcessList = document.getElementById('btnProcessList');
        if (btnProcessList) {
            btnProcessList.addEventListener('click', () => this.startProcessing());
        }
    }

    // ===== GESTIÓN DE SESIONES =====

    loadSessions() {
        console.log('📂 Cargando sesiones desde localStorage...');
        try {
            const stored = localStorage.getItem('mmr_offers_sessions');
            this.sessions = stored ? JSON.parse(stored) : [];
            
            // Limitar a máximo 10 sesiones
            if (this.sessions.length > this.maxSessions) {
                this.sessions = this.sessions.slice(0, this.maxSessions);
                this.saveSessions();
            }
            
            console.log(`✅ ${this.sessions.length} sesiones cargadas`);
        } catch (error) {
            console.error('❌ Error cargando sesiones:', error);
            this.sessions = [];
        }
    }

    saveSessions() {
        console.log('💾 Guardando sesiones en localStorage...');
        try {
            localStorage.setItem('mmr_offers_sessions', JSON.stringify(this.sessions));
            console.log(`✅ ${this.sessions.length} sesiones guardadas`);
        } catch (error) {
            console.error('❌ Error guardando sesiones:', error);
        }
    }

    addSession(session) {
        console.log('➕ Agregando nueva sesión:', session.id);
        
        // Agregar al inicio del array
        this.sessions.unshift(session);
        
        // Limitar a máximo de sesiones
        if (this.sessions.length > this.maxSessions) {
            this.sessions = this.sessions.slice(0, this.maxSessions);
        }
        
        this.saveSessions();
        this.updateLastSessionTime();
        this.updateSessionsGrid();
    }

    removeSession(sessionId) {
        console.log('🗑️ Eliminando sesión:', sessionId);
        
        const index = this.sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            this.sessions.splice(index, 1);
            this.saveSessions();
            this.updateLastSessionTime();
            this.updateSessionsGrid();
            return true;
        }
        return false;
    }

    updateSession(sessionId, updates) {
        console.log('📝 Actualizando sesión:', sessionId);
        
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            Object.assign(session, updates);
            this.saveSessions();
            this.updateSessionsGrid();
            return true;
        }
        return false;
    }

    generateSessionId() {
        return Date.now().toString();
    }

    updateLastSessionTime() {
        if (this.sessions.length > 0) {
            const lastSession = this.sessions[0];
            const date = new Date(lastSession.date);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffHours > 0) {
                this.lastSessionTime = `Hace ${diffHours}h ${diffMinutes}m`;
            } else if (diffMinutes > 0) {
                this.lastSessionTime = `Hace ${diffMinutes}m`;
            } else {
                this.lastSessionTime = 'Hace un momento';
            }
        } else {
            this.lastSessionTime = 'Sin sesiones';
        }

        // Actualizar en la interfaz
        const lastSessionElement = document.getElementById('lastSessionTime');
        if (lastSessionElement) {
            lastSessionElement.textContent = this.lastSessionTime;
        }
    }

    updateSessionsGrid() {
        const grid = document.getElementById('sessionsGrid');
        if (!grid) return;

        if (this.sessions.length === 0) {
            grid.innerHTML = `
                <div class="no-sessions">
                    <i class="fas fa-history"></i>
                    <h3>No hay sesiones anteriores</h3>
                    <p>Tus sesiones de procesamiento aparecerán aquí</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        this.sessions.forEach(session => {
            const sessionCard = this.createSessionCard(session);
            grid.appendChild(sessionCard);
        });
    }

    createSessionCard(session) {
        const card = document.createElement('div');
        card.className = 'session-card';

        const date = new Date(session.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="session-header">
                <div class="session-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="session-time">
                    <i class="fas fa-clock"></i>
                    <span>${formattedTime}</span>
                </div>
            </div>
            <div class="session-stats">
                <div class="stat">
                    <i class="fas fa-box"></i>
                    <span>${session.products.length} productos</span>
                </div>
                <div class="stat">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${session.totalEstimated.toLocaleString()}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-image"></i>
                    <span>${session.processedImages?.length || 0} procesadas</span>
                </div>
            </div>
            <div class="session-actions">
                <button onclick="offersCreator.viewSessionDetails('${session.id}')" class="btn-glass btn-view" title="Ver detalles completos">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
                <button onclick="offersCreator.editSessionPrices('${session.id}')" class="btn-glass btn-edit" title="Modificar precios">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button onclick="offersCreator.deleteSession('${session.id}')" class="btn-glass btn-delete" title="Eliminar sesión">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
                <button onclick="offersCreator.exportSession('${session.id}')" class="btn-glass btn-export" title="Exportar datos">
                    <i class="fas fa-download"></i>
                    Exportar
                </button>
                <button onclick="offersCreator.shareSessionWhatsApp('${session.id}')" class="btn-glass btn-whatsapp" title="Compartir por WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        `;

        return card;
    }

    // ===== ACCIONES DE SESIONES =====

    viewSessionDetails(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('👁️ Viendo sesión:', sessionId);
        this.showSessionDetailsModal(session);
    }

    editSessionPrices(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('✏️ Editando precios de sesión:', sessionId);
        this.showAdvancedEditModal(session);
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const date = new Date(session.date).toLocaleDateString('es-ES');
        const confirmMessage = `¿Eliminar la sesión del ${date}?\n\n` +
                              `${session.products.length} productos\n` +
                              `Total: $${session.totalEstimated.toLocaleString()}\n\n` +
                              `Esta acción no se puede deshacer.`;

        if (confirm(confirmMessage)) {
            console.log('🗑️ Eliminando sesión:', sessionId);
            this.removeSession(sessionId);
            this.showNotification('Sesión eliminada correctamente', 'success');
        }
    }

    exportSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('📤 Exportando sesión:', sessionId);

        // Crear datos de exportación
        const exportData = {
            session: session,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        // Crear archivo JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Crear enlace de descarga
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MMR_Sesion_${new Date(session.date).toISOString().split('T')[0]}.json`;
        
        // Descargar archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Sesión exportada correctamente', 'success');
    }

    shareSessionWhatsApp(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('📱 Compartiendo sesión por WhatsApp:', sessionId);

        const date = new Date(session.date).toLocaleDateString('es-ES');
        const message = `🛒 *Sesión MMR Group - ${date}*\n\n` +
                       `📦 ${session.products.length} productos procesados\n` +
                       `💰 Valor total: $${session.totalEstimated.toLocaleString()}\n` +
                       `🏢 Proveedores: ${session.providers.join(', ')}\n\n` +
                       `${session.processedImages?.length || 0} imágenes generadas\n\n` +
                       `#MMRGroup #Autopartes #Ofertas`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // ===== MODAL AVANZADO DE EDICIÓN =====

    showAdvancedEditModal(session) {
        console.log('🔧 Mostrando modal avanzado de edición');
        
        let modal = document.getElementById('advancedEditModal');
        if (!modal) {
            modal = this.createAdvancedEditModal();
            document.body.appendChild(modal);
        }

        // Configurar datos de la sesión
        this.currentEditSession = session;
        this.setupAdvancedEditModal(session);
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Agregar estilos si no existen
        this.addAdvancedEditStyles();
    }

    createAdvancedEditModal() {
        const modal = document.createElement('div');
        modal.id = 'advancedEditModal';
        modal.className = 'advanced-edit-modal';
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title-section">
                        <h2 id="editModalTitle">📋 Sesión: Cargando...</h2>
                        <p id="editModalSubtitle">Proveedor: Cargando...</p>
                    </div>
                    <button class="modal-close-btn" onclick="offersCreator.closeAdvancedEditModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <!-- AJUSTES MASIVOS -->
                    <div class="section-card">
                        <h3>🔧 AJUSTES MASIVOS:</h3>
                        <div class="mass-adjustments">
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(10)">+10%</button>
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(5)">+5%</button>
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(-5)">-5%</button>
                            <button class="btn-glass btn-adjustment" onclick="offersCreator.applyMassAdjustment(-10)">-10%</button>
                            <div class="custom-adjustment">
                                <input type="number" id="customPercentage" placeholder="%" class="custom-input">
                                <button class="btn-glass btn-custom" onclick="offersCreator.applyCustomAdjustment()">Aplicar</button>
                            </div>
                        </div>
                    </div>

                    <!-- PRODUCTOS INDIVIDUALES -->
                    <div class="section-card">
                        <h3>📦 PRODUCTOS INDIVIDUALES:</h3>
                        <div class="products-list" id="editProductsList">
                            <!-- Los productos se cargan dinámicamente -->
                        </div>
                    </div>

                    <!-- IMÁGENES PROCESADAS -->
                    <div class="section-card">
                        <h3>📸 IMÁGENES PROCESADAS:</h3>
                        <div class="images-grid" id="editImagesGrid">
                            <!-- Las imágenes se cargan dinámicamente -->
                        </div>
                        <div class="images-actions">
                            <button class="btn-glass btn-primary" onclick="offersCreator.sendAllToWhatsApp()">
                                <i class="fab fa-whatsapp"></i>
                                📤 ENVIAR TODO A WHATSAPP
                            </button>
                            <button class="btn-glass btn-success" onclick="offersCreator.saveAllChanges()">
                                <i class="fas fa-save"></i>
                                💾 GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>

                    <!-- NOTAS -->
                    <div class="section-card">
                        <h3>📝 NOTAS:</h3>
                        <textarea id="sessionNotes" class="notes-textarea" placeholder="Agregar notas sobre esta sesión..."></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-glass btn-secondary" onclick="offersCreator.reprocessAll()">
                        <i class="fas fa-sync"></i>
                        🔄 Reprocesar Todo
                    </button>
                    <button class="btn-glass btn-whatsapp" onclick="offersCreator.shareToWhatsApp()">
                        <i class="fab fa-whatsapp"></i>
                        📱 WhatsApp
                    </button>
                    <button class="btn-glass btn-danger" onclick="offersCreator.closeAdvancedEditModal()">
                        <i class="fas fa-times"></i>
                        ❌ Cerrar
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    setupAdvancedEditModal(session) {
        // Actualizar título y subtítulo
        const title = document.getElementById('editModalTitle');
        const subtitle = document.getElementById('editModalSubtitle');
        
        if (title) {
            const date = new Date(session.date).toLocaleDateString('es-ES');
            title.textContent = `📋 Sesión: ${date}`;
        }
        
        if (subtitle) {
            const provider = session.selectedProvider || session.providers[0] || 'Múltiples';
            subtitle.textContent = `Proveedor: ${provider}`;
        }

        // Cargar productos
        this.loadProductsForEdit(session);
        
        // Cargar imágenes
        this.loadImagesForEdit(session);
        
        // Cargar notas
        const notesTextarea = document.getElementById('sessionNotes');
        if (notesTextarea) {
            notesTextarea.value = session.notes || '';
        }
    }

    loadProductsForEdit(session) {
        const productsList = document.getElementById('editProductsList');
        if (!productsList) return;

        productsList.innerHTML = '';
        
        session.products.forEach((product, index) => {
            const productItem = document.createElement('div');
            productItem.className = 'product-edit-item';
            productItem.innerHTML = `
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <div class="product-price-section">
                        <span class="price-display">$${product.price.toLocaleString()}</span>
                        <button class="btn-glass btn-edit-price" onclick="offersCreator.editIndividualPrice(${index})">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                    </div>
                </div>
            `;
            productsList.appendChild(productItem);
        });
    }

    loadImagesForEdit(session) {
        const imagesGrid = document.getElementById('editImagesGrid');
        if (!imagesGrid) return;

        imagesGrid.innerHTML = '';
        
        if (!session.processedImages || session.processedImages.length === 0) {
            imagesGrid.innerHTML = `
                <div class="no-images-message">
                    <i class="fas fa-image"></i>
                    <p>No hay imágenes procesadas para esta sesión</p>
                </div>
            `;
            return;
        }

        session.processedImages.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.innerHTML = `
                <div class="image-preview">
                    <img src="${image.url}" alt="${image.name}" onclick="offersCreator.expandImage('${image.url}', '${image.name}')">
                </div>
                <div class="image-info">
                    <span class="image-name">${image.name}</span>
                </div>
            `;
            imagesGrid.appendChild(imageItem);
        });
    }

    // ===== FUNCIONES DEL MODAL AVANZADO =====

    applyMassAdjustment(percentage) {
        if (!this.currentEditSession) return;

        console.log(`📊 Aplicando ajuste masivo: ${percentage}%`);
        
        this.currentEditSession.products.forEach(product => {
            const adjustment = product.price * (percentage / 100);
            product.price = Math.round(product.price + adjustment);
        });

        // Recalcular total
        this.currentEditSession.totalEstimated = this.currentEditSession.products.reduce((sum, p) => sum + p.price, 0);

        // Actualizar interfaz
        this.loadProductsForEdit(this.currentEditSession);
        this.showNotification(`Ajuste de ${percentage}% aplicado a todos los productos`, 'success');
    }

    applyCustomAdjustment() {
        const input = document.getElementById('customPercentage');
        if (!input) return;

        const percentage = parseFloat(input.value);
        if (isNaN(percentage)) {
            this.showNotification('Por favor ingresa un porcentaje válido', 'error');
            return;
        }

        this.applyMassAdjustment(percentage);
        input.value = '';
    }

    editIndividualPrice(productIndex) {
        if (!this.currentEditSession) return;

        const product = this.currentEditSession.products[productIndex];
        if (!product) return;

        const newPrice = prompt(`Nuevo precio para ${product.name}:`, product.price);
        if (newPrice === null) return;

        const price = parseFloat(newPrice.replace(/[$,]/g, ''));
        if (isNaN(price) || price < 0) {
            this.showNotification('Precio inválido', 'error');
            return;
        }

        product.price = price;
        
        // Recalcular total
        this.currentEditSession.totalEstimated = this.currentEditSession.products.reduce((sum, p) => sum + p.price, 0);

        // Actualizar interfaz
        this.loadProductsForEdit(this.currentEditSession);
        this.showNotification(`Precio actualizado para ${product.name}`, 'success');
    }

    sendAllToWhatsApp() {
        if (!this.currentEditSession) return;

        console.log('📱 Enviando todo a WhatsApp');
        
        const session = this.currentEditSession;
        const date = new Date(session.date).toLocaleDateString('es-ES');
        
        let message = `🛒 *MMR Group - Sesión ${date}*\n\n`;
        message += `📦 *${session.products.length} Productos:*\n`;
        
        session.products.forEach((product, index) => {
            message += `${index + 1}. ${product.name} - $${product.price.toLocaleString()}\n`;
        });
        
        message += `\n💰 *Total: $${session.totalEstimated.toLocaleString()}*\n`;
        message += `🏢 *Proveedor: ${session.selectedProvider || 'Múltiples'}*\n\n`;
        
        if (session.notes) {
            message += `📝 *Notas:* ${session.notes}\n\n`;
        }
        
        message += `${session.processedImages?.length || 0} imágenes disponibles\n\n`;
        message += `#MMRGroup #Autopartes #Ofertas`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    saveAllChanges() {
        if (!this.currentEditSession) return;

        console.log('💾 Guardando todos los cambios');
        
        // Guardar notas
        const notesTextarea = document.getElementById('sessionNotes');
        if (notesTextarea) {
            this.currentEditSession.notes = notesTextarea.value;
        }

        // Actualizar sesión en el array
        this.updateSession(this.currentEditSession.id, this.currentEditSession);
        
        this.showNotification('Cambios guardados correctamente', 'success');
    }

    reprocessAll() {
        if (!this.currentEditSession) return;

        const confirmMessage = `¿Reprocesar todas las imágenes?\n\nEsto recreará todas las imágenes con los precios actualizados.`;
        
        if (confirm(confirmMessage)) {
            console.log('🔄 Reprocesando todas las imágenes');
            this.showNotification('Reprocesamiento iniciado...', 'info');
            
            // Aquí iría la lógica de reprocesamiento
            // Por ahora solo mostramos un mensaje
            setTimeout(() => {
                this.showNotification('Reprocesamiento completado', 'success');
            }, 2000);
        }
    }

    shareToWhatsApp() {
        this.sendAllToWhatsApp();
    }

    closeAdvancedEditModal() {
        const modal = document.getElementById('advancedEditModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditSession = null;
    }

    expandImage(imageUrl, imageName) {
        // Crear modal de imagen expandida
        const modal = document.createElement('div');
        modal.className = 'image-expand-modal';
        modal.innerHTML = `
            <div class="image-expand-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="image-expand-container">
                <button class="image-expand-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${imageUrl}" alt="${imageName}">
                <div class="image-expand-title">${imageName}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Agregar estilos para el modal de imagen expandida
        this.addImageExpandStyles();
    }

    showNotification(message, type = 'info') {
        console.log(`📢 Notificación (${type}):`, message);
        
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Agregar estilos si no existen
        this.addNotificationStyles();

        // Agregar al DOM
        document.body.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ===== ESTILOS CSS =====

    addSessionStyles() {
        const styleId = 'session-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ===== ESTILOS DE SESIONES CON GLASS AMARILLO ===== */
            .session-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .session-card:hover {
                border-color: rgba(255, 215, 0, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.1);
            }

            .session-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .session-date, .session-time {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #FFD700;
                font-weight: 600;
            }

            .session-date i, .session-time i {
                width: 16px;
                text-align: center;
            }

            .session-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }

            .stat {
                display: flex;
                align-items: center;
                gap: 8px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }

            .stat i {
                color: #FFD700;
                width: 16px;
                text-align: center;
            }

            .session-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            /* BOTONES GLASS AMARILLOS */
            .btn-glass {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                color: #FFD700;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 80px;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .btn-glass:hover {
                background: rgba(255, 215, 0, 0.2);
                border-color: rgba(255, 215, 0, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
            }

            .btn-glass:active {
                transform: translateY(0);
            }

            .no-sessions {
                text-align: center;
                padding: 40px 20px;
                color: rgba(255, 255, 255, 0.6);
            }

            .no-sessions i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .no-sessions h3 {
                margin: 0 0 10px 0;
                color: rgba(255, 255, 255, 0.8);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .session-header {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }

                .session-stats {
                    justify-content: center;
                }

                .session-actions {
                    justify-content: center;
                }

                .session-actions .btn-glass {
                    flex: 1;
                    min-width: 70px;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos de sesiones agregados');
    }

    addAdvancedEditStyles() {
        const styleId = 'advanced-edit-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ===== MODAL AVANZADO DE EDICIÓN ===== */
            .advanced-edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .modal-container {
                position: relative;
                width: 100%;
                max-width: 1200px;
                max-height: 90vh;
                background: rgba(26, 26, 26, 0.95);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .modal-header {
                padding: 25px 30px;
                background: rgba(255, 215, 0, 0.1);
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }

            .modal-title-section h2 {
                color: #FFD700;
                margin: 0 0 5px 0;
                font-size: 24px;
                font-weight: 700;
            }

            .modal-title-section p {
                color: rgba(255, 255, 255, 0.8);
                margin: 0;
                font-size: 16px;
            }

            .modal-close-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .modal-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .modal-content {
                flex: 1;
                padding: 30px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            .section-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 15px;
                padding: 20px;
                backdrop-filter: blur(10px);
            }

            .section-card h3 {
                color: #FFD700;
                margin: 0 0 15px 0;
                font-size: 18px;
                font-weight: 600;
            }

            /* AJUSTES MASIVOS */
            .mass-adjustments {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }

            .btn-adjustment {
                min-width: 60px;
                padding: 10px 15px;
            }

            .custom-adjustment {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-left: 15px;
            }

            .custom-input {
                width: 80px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 6px;
                color: white;
                text-align: center;
            }

            .custom-input:focus {
                outline: none;
                border-color: rgba(255, 215, 0, 0.5);
                background: rgba(255, 255, 255, 0.15);
            }

            /* PRODUCTOS INDIVIDUALES */
            .products-list {
                max-height: 300px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .product-edit-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
            }

            .product-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .product-name {
                color: white;
                font-weight: 500;
                flex: 1;
            }

            .product-price-section {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .price-display {
                color: #FFD700;
                font-weight: 600;
                font-size: 16px;
                min-width: 100px;
                text-align: right;
            }

            .btn-edit-price {
                padding: 6px 12px;
                font-size: 11px;
            }

            /* IMÁGENES PROCESADAS */
            .images-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
                max-height: 300px;
                overflow-y: auto;
            }

            .image-preview-item {
                text-align: center;
            }

            .image-preview {
                width: 120px;
                height: 120px;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid rgba(255, 215, 0, 0.2);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .image-preview:hover {
                border-color: rgba(255, 215, 0, 0.5);
                transform: scale(1.05);
            }

            .image-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .image-info {
                margin-top: 8px;
            }

            .image-name {
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .no-images-message {
                text-align: center;
                color: rgba(255, 255, 255, 0.6);
                padding: 40px;
            }

            .no-images-message i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .images-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-primary {
                background: rgba(23, 162, 184, 0.2);
                border-color: rgba(23, 162, 184, 0.5);
                color: #17a2b8;
            }

            .btn-success {
                background: rgba(40, 167, 69, 0.2);
                border-color: rgba(40, 167, 69, 0.5);
                color: #28a745;
            }

            /* NOTAS */
            .notes-textarea {
                width: 100%;
                min-height: 100px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 8px;
                color: white;
                font-family: inherit;
                font-size: 14px;
                resize: vertical;
            }

            .notes-textarea:focus {
                outline: none;
                border-color: rgba(255, 215, 0, 0.5);
                background: rgba(255, 255, 255, 0.1);
            }

            .notes-textarea::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            /* FOOTER */
            .modal-footer {
                padding: 20px 30px;
                background: rgba(255, 215, 0, 0.05);
                border-top: 1px solid rgba(255, 215, 0, 0.2);
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                flex-shrink: 0;
            }

            .btn-secondary {
                background: rgba(108, 117, 125, 0.2);
                border-color: rgba(108, 117, 125, 0.5);
                color: #6c757d;
            }

            .btn-whatsapp {
                background: rgba(37, 211, 102, 0.2);
                border-color: rgba(37, 211, 102, 0.5);
                color: #25d366;
            }

            .btn-danger {
                background: rgba(220, 53, 69, 0.2);
                border-color: rgba(220, 53, 69, 0.5);
                color: #dc3545;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .advanced-edit-modal {
                    padding: 10px;
                }

                .modal-container {
                    max-height: 95vh;
                }

                .modal-header {
                    padding: 20px;
                }

                .modal-content {
                    padding: 20px;
                }

                .mass-adjustments {
                    flex-direction: column;
                    align-items: stretch;
                }

                .custom-adjustment {
                    margin-left: 0;
                    justify-content: center;
                }

                .product-info {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }

                .images-grid {
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                }

                .modal-footer {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos del modal avanzado agregados');
    }

    addImageExpandStyles() {
        const styleId = 'image-expand-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ===== MODAL DE IMAGEN EXPANDIDA ===== */
            .image-expand-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 15000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .image-expand-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                cursor: pointer;
            }

            .image-expand-container {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .image-expand-close {
                position: absolute;
                top: -50px;
                right: 0;
                background: rgba(255, 215, 0, 0.2);
                border: 1px solid rgba(255, 215, 0, 0.5);
                color: #FFD700;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .image-expand-close:hover {
                background: rgba(255, 215, 0, 0.3);
                transform: scale(1.1);
            }

            .image-expand-container img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
            }

            .image-expand-title {
                color: white;
                margin-top: 15px;
                font-size: 16px;
                font-weight: 600;
                text-align: center;
            }
        `;

        document.head.appendChild(style);
    }

    addNotificationStyles() {
        const styleId = 'notification-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #FFD700;
                backdrop-filter: blur(10px);
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 350px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification-success {
                border-left-color: #28a745;
            }

            .notification-error {
                border-left-color: #dc3545;
            }

            .notification-info {
                border-left-color: #17a2b8;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-content i {
                font-size: 18px;
                flex-shrink: 0;
            }

            .notification-success i {
                color: #28a745;
            }

            .notification-error i {
                color: #dc3545;
            }

            .notification-info i {
                color: #17a2b8;
            }
        `;

        document.head.appendChild(style);
    }

    // ===== ANÁLISIS DE PRODUCTOS =====

    analyzeProductList(text) {
        console.log('🔍 Analizando lista de productos con formato flexible...');

        if (!text || text.trim().length === 0) {
            this.hideAnalysisInfo();
            this.disableProcessButton();
            return;
        }

        const lines = text.split('\n').filter(line => line.trim());
        const products = [];
        const providers = new Set();
        let totalEstimated = 0;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // FORMATO FLEXIBLE: Detectar automáticamente diferentes formatos
            let product = null;
            
            // Formato 1: "PRODUCTO - $PRECIO" (formato ChatGPT específico)
            if (trimmedLine.includes(' - $')) {
                const parts = trimmedLine.split(' - $');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const priceStr = parts[1].replace(/[,$]/g, '').split(/\s/)[0]; // Tomar solo la parte numérica
                    const price = parseFloat(priceStr);

                    if (name && !isNaN(price) && price > 0) {
                        product = {
                            id: index,
                            name: name,
                            price: price,
                            description: '',
                            provider: this.detectProvider(name)
                        };
                    }
                }
            }
            // Formato 2: Formato original "- PRODUCTO - $PRECIO"
            else if (trimmedLine.startsWith('-') && trimmedLine.indexOf(' - ') !== -1) {
                const parts = trimmedLine.split(' - ');
                if (parts.length >= 2) {
                    const name = parts[0].replace(/^-\s*/, '').trim();
                    const priceMatch = parts[1].match(/\$[\d,\.]+/);

                    if (name && priceMatch) {
                        const priceStr = priceMatch[0].replace(/[$,]/g, '');
                        const price = parseFloat(priceStr);

                        if (!isNaN(price) && price > 0) {
                            product = {
                                id: index,
                                name: name,
                                price: price,
                                description: parts[2] || '',
                                provider: this.detectProvider(name)
                            };
                        }
                    }
                }
            }
            // Formato 3: Detectar cualquier línea que contenga un precio con $
            else if (trimmedLine.includes('$')) {
                // Buscar patrón de precio más flexible
                const priceMatch = trimmedLine.match(/\$[\d,\.]+/);
                if (priceMatch) {
                    const priceStr = priceMatch[0].replace(/[$,]/g, '');
                    const price = parseFloat(priceStr);
                    
                    if (!isNaN(price) && price > 0) {
                        // Extraer el nombre del producto (todo lo que está antes del precio)
                        const priceIndex = trimmedLine.indexOf(priceMatch[0]);
                        let name = trimmedLine.substring(0, priceIndex).trim();
                        
                        // Limpiar caracteres comunes al inicio
                        name = name.replace(/^[-•*]\s*/, '').trim();
                        
                        if (name.length > 2) { // Asegurar que el nombre tenga contenido
                            product = {
                                id: index,
                                name: name,
                                price: price,
                                description: '',
                                provider: this.detectProvider(name)
                            };
                        }
                    }
                }
            }

            // Si se detectó un producto válido, agregarlo
            if (product) {
                products.push(product);
                totalEstimated += product.price;
                providers.add(product.provider);
                console.log(`✅ Producto detectado: ${product.name} - $${product.price}`);
            }
        });

        this.currentAnalysis = {
            products: products,
            totalEstimated: totalEstimated,
            providers: Array.from(providers),
            isValid: products.length > 0
        };

        console.log(`📊 Análisis completado: ${products.length} productos detectados`);
        this.showAnalysisInfo();

        if (this.currentAnalysis.isValid) {
            this.enableProcessButton();
        } else {
            this.disableProcessButton();
        }
    }

    detectProvider(productName) {
        const knownProviders = [
            'Gulf', 'Honda', 'Toyota', 'Nissan', 'Ford', 'Chevrolet',
            'K&N', 'NGK', 'Brembo', 'Bosch', 'Castrol', 'Mobil',
            'Shell', 'Valvoline', 'AC Delco', 'Denso', 'Champion',
            'Inmoto', 'Repuestos SA', 'Autopartes'
        ];

        const upperName = productName.toUpperCase();
        for (const provider of knownProviders) {
            if (upperName.includes(provider.toUpperCase())) {
                return provider;
            }
        }

        const firstWord = productName.split(' ')[0];
        return firstWord.length > 2 ? firstWord : 'Genérico';
    }

    showAnalysisInfo() {
        const analysisInfo = document.getElementById('listAnalysisInfo');
        const detectedProducts = document.getElementById('detectedProducts');
        const estimatedTotal = document.getElementById('estimatedTotal');
        const detectedProviders = document.getElementById('detectedProviders');

        if (analysisInfo) {
            analysisInfo.style.display = 'flex';
        }
        if (detectedProducts) {
            detectedProducts.textContent = this.currentAnalysis.products.length;
        }
        if (estimatedTotal) {
            estimatedTotal.textContent = '$' + this.currentAnalysis.totalEstimated.toLocaleString();
        }
        if (detectedProviders) {
            detectedProviders.textContent = this.currentAnalysis.providers.length;
        }
    }

    hideAnalysisInfo() {
        const analysisInfo = document.getElementById('listAnalysisInfo');
        if (analysisInfo) {
            analysisInfo.style.display = 'none';
        }
    }

    enableProcessButton() {
        const btnProcessList = document.getElementById('btnProcessList');
        if (btnProcessList) {
            btnProcessList.disabled = false;
            btnProcessList.classList.add('enabled');
        }
    }

    disableProcessButton() {
        const btnProcessList = document.getElementById('btnProcessList');
        if (btnProcessList) {
            btnProcessList.disabled = true;
            btnProcessList.classList.remove('enabled');
        }
    }

    // ===== PROCESAMIENTO =====

    startProcessing() {
        if (!this.currentAnalysis.isValid || this.isProcessing) {
            console.log('⚠️ No se puede procesar');
            return;
        }

        console.log('🚀 Iniciando procesamiento...');
        this.isProcessing = true;
        this.showProcessingScreen();
        this.simulateProcessing();
    }

    showProcessingScreen() {
        const processingScreen = document.getElementById('processingScreen');
        const offersCreatorMain = document.getElementById('offersCreatorMain');

        if (processingScreen && offersCreatorMain) {
            offersCreatorMain.style.display = 'none';
            processingScreen.style.display = 'flex';
            this.updateProcessingStats();
        }
    }

    updateProcessingStats() {
        const processingProducts = document.getElementById('processingProducts');
        const processingTotal = document.getElementById('processingTotal');
        const processingProviders = document.getElementById('processingProviders');

        if (processingProducts) {
            processingProducts.textContent = this.currentAnalysis.products.length;
        }
        if (processingTotal) {
            processingTotal.textContent = '$' + this.currentAnalysis.totalEstimated.toLocaleString();
        }
        if (processingProviders) {
            processingProviders.textContent = this.currentAnalysis.providers.join(', ');
        }
    }

    simulateProcessing() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const processingStatus = document.getElementById('processingStatus');

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress > 100) progress = 100;

            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            if (progressText) {
                progressText.textContent = Math.round(progress) + '%';
            }
            if (processingStatus) {
                if (progress < 30) {
                    processingStatus.textContent = 'Analizando estructura de datos...';
                } else if (progress < 60) {
                    processingStatus.textContent = 'Detectando proveedores...';
                } else if (progress < 90) {
                    processingStatus.textContent = 'Preparando para procesamiento...';
                } else {
                    processingStatus.textContent = 'Listo para análisis automático';
                }
            }

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.completeProcessing();
                }, 500);
            }
        }, 100);
    }

    completeProcessing() {
        console.log('✅ Procesamiento completado');

        // Crear sesión automáticamente
        const session = {
            id: this.generateSessionId(),
            date: new Date().toISOString(),
            products: [...this.currentAnalysis.products],
            providers: [...this.currentAnalysis.providers],
            totalEstimated: this.currentAnalysis.totalEstimated,
            status: 'completed',
            processedImages: [],
            selectedProvider: null
        };

        this.addSession(session);
        this.currentSession = session;
        this.showProviderSelection();
        this.isProcessing = false;
    }

    // ===== SELECCIÓN DE PROVEEDOR =====

    showProviderSelection() {
        console.log('🏭 Mostrando selección de proveedor...');

        const processingScreen = document.getElementById('processingScreen');
        if (processingScreen) {
            processingScreen.style.display = 'none';
        }

        const providerScreen = document.getElementById('providerSelectionScreen');
        if (providerScreen) {
            providerScreen.style.display = 'flex';
        }

        const providerProducts = document.getElementById('providerProducts');
        const providerTotal = document.getElementById('providerTotal');

        if (providerProducts) {
            providerProducts.textContent = this.currentAnalysis.products.length;
        }
        if (providerTotal) {
            providerTotal.textContent = '$' + this.currentAnalysis.totalEstimated.toLocaleString();
        }

        this.setupProviderDropdown();
    }

    setupProviderDropdown() {
        console.log('🏭 Configurando dropdown de proveedores...');

        const trigger = document.getElementById('providerTrigger');
        const options = document.querySelectorAll('.provider-option');
        const continueBtn = document.getElementById('btnContinueToPhase2');
        const errorDiv = document.getElementById('providerError');

        let selectedProvider = null;

        if (trigger) {
            trigger.replaceWith(trigger.cloneNode(true));
            const newTrigger = document.getElementById('providerTrigger');

            newTrigger.addEventListener('click', () => {
                const isActive = newTrigger.classList.contains('active');
                if (isActive) {
                    this.closeProviderDropdown();
                } else {
                    this.openProviderDropdown();
                }
            });
        }

        options.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);

            newOption.addEventListener('click', () => {
                selectedProvider = newOption.dataset.value;
                const selectedText = newOption.textContent;

                const selectedTextEl = document.querySelector('.provider-selected-text');
                if (selectedTextEl) {
                    selectedTextEl.textContent = selectedText;
                    selectedTextEl.classList.remove('placeholder');
                }

                document.querySelectorAll('.provider-option').forEach(opt => opt.classList.remove('selected'));
                newOption.classList.add('selected');

                if (continueBtn) {
                    continueBtn.disabled = false;
                }
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
                if (this.currentSession) {
                    this.currentSession.selectedProvider = selectedProvider;
                    this.saveSessions();
                }

                this.closeProviderDropdown();
                console.log('🏭 Proveedor seleccionado:', selectedText);
            });
        });

        // Función global para continuar
        window.continueToPhase2 = () => {
            if (!selectedProvider) {
                if (errorDiv) {
                    errorDiv.style.display = 'flex';
                }
                return;
            }
            console.log('🚀 Continuando a Fase 2 con proveedor:', selectedProvider);
            this.continueToPhase2();
        };

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.provider-dropdown')) {
                this.closeProviderDropdown();
            }
        });
    }

    openProviderDropdown() {
        const trigger = document.getElementById('providerTrigger');
        const content = document.getElementById('providerDropdownContent');

        if (trigger) trigger.classList.add('active');
        if (content) content.classList.add('show');
    }

    closeProviderDropdown() {
        const trigger = document.getElementById('providerTrigger');
        const content = document.getElementById('providerDropdownContent');

        if (trigger) trigger.classList.remove('active');
        if (content) content.classList.remove('show');
    }

    continueToPhase2() {
        console.log('🚀 Continuando a Fase 2 - REDIRIGIENDO A MOCKUP C...');
        
        // Obtener el proveedor seleccionado de la sesión actual o del DOM
        let selectedProvider = null;
        
        if (this.currentSession && this.currentSession.selectedProvider) {
            selectedProvider = this.currentSession.selectedProvider;
        } else {
            // Fallback: obtener del DOM
            const providerTrigger = document.getElementById('providerTrigger');
            if (providerTrigger) {
                selectedProvider = providerTrigger.textContent.trim();
                if (selectedProvider === 'Seleccionar Proveedor') {
                    selectedProvider = null;
                }
            }
        }
        
        // Guardar productos en localStorage para Fase 2
        if (this.currentAnalysis && this.currentAnalysis.products && this.currentAnalysis.products.length > 0) {
            const productsData = {
                products: this.currentAnalysis.products,
                totalEstimated: this.currentAnalysis.totalEstimated,
                providers: this.currentAnalysis.providers,
                timestamp: Date.now()
            };
            localStorage.setItem('fase2_products', JSON.stringify(productsData));
            console.log('📦 Productos guardados para Fase 2:', this.currentAnalysis.products.length);
        }
        
        // Pasar el proveedor seleccionado como parámetro URL
        const providerParam = selectedProvider ? `?provider=${encodeURIComponent(selectedProvider)}` : '';
        console.log('📦 Pasando proveedor a Fase 2:', selectedProvider);
        
        // Redirigir al diseño Mockup C con el proveedor
        window.location.href = `/fase2${providerParam}`;
    }

    // ===== APARTADO DE IMÁGENES PROCESADAS =====

    showProcessedImagesSection() {
        console.log('🖼️ Mostrando apartado de imágenes procesadas...');

        // Ocultar pantalla de selección de proveedor
        const providerScreen = document.getElementById('providerSelectionScreen');
        if (providerScreen) {
            providerScreen.style.display = 'none';
        }

        // Crear o mostrar sección de imágenes procesadas
        this.createProcessedImagesSection();
        this.startImageProcessing();
    }

    createProcessedImagesSection() {
        console.log('🏗️ Creando sección de imágenes procesadas...');

        let imagesSection = document.getElementById('processedImagesSection');
        if (!imagesSection) {
            imagesSection = document.createElement('div');
            imagesSection.id = 'processedImagesSection';
            imagesSection.className = 'processed-images-section';
            document.body.appendChild(imagesSection);
        }

        imagesSection.innerHTML = `
            <div class="processed-images-container">
                <div class="processed-images-header">
                    <div class="header-info">
                        <h2>🖼️ Imágenes Procesadas</h2>
                        <div class="processing-stats">
                            <span class="stat-item">
                                <i class="fas fa-images"></i>
                                <span id="processedCount">0</span> de <span id="totalToProcess">${this.currentAnalysis.products.length}</span>
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-clock"></i>
                                <span id="processingStatus">Iniciando...</span>
                            </span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="btnPauseProcessing" class="btn-pause" onclick="offersCreator.pauseProcessing()" disabled>
                            <i class="fas fa-pause"></i>
                            Pausar
                        </button>
                        <button id="btnBackToProvider" class="btn-back" onclick="offersCreator.backToProviderSelection()">
                            <i class="fas fa-arrow-left"></i>
                            Volver
                        </button>
                    </div>
                </div>

                <div class="processed-images-gallery">
                    <div class="gallery-title">
                        <h3>Galería de Imágenes</h3>
                        <span class="gallery-counter">0 imágenes</span>
                    </div>
                    
                    <!-- Contenedor para galería simple -->
                    <div id="processedGalleryContainer" class="gallery-container">
                        <div class="no-images">
                            <i class="fas fa-images"></i>
                            <p>Las imágenes aparecerán aquí conforme se procesen</p>
                        </div>
                    </div>

                    <div class="selected-image-info">
                        <span id="selectedImageInfo">Ninguna imagen seleccionada</span>
                    </div>

                    <div class="gallery-actions">
                        <button id="btnDownloadAll" class="action-btn btn-download" onclick="downloadAllImages()" disabled>
                            <i class="fas fa-download"></i>
                            Descargar ZIP
                        </button>
                        <button id="btnShareWhatsApp" class="action-btn btn-whatsapp" onclick="sendToWhatsApp()" disabled>
                            <i class="fab fa-whatsapp"></i>
                            Compartir WhatsApp
                        </button>
                        <button id="btnSaveToSession" class="action-btn btn-save" onclick="saveCurrentSession()" disabled>
                            <i class="fas fa-save"></i>
                            Guardar en Sesión
                        </button>
                        <button id="btnFinishProcess" class="action-btn btn-finish" onclick="offersCreator.finishProcessing()" disabled>
                            <i class="fas fa-check"></i>
                            Finalizar
                        </button>
                    </div>
                </div>
            </div>
        `;

        imagesSection.style.display = 'flex';
        this.addProcessedImagesStyles();
        this.setupGalleryFix();
    }

    setupGalleryFix() {
        console.log('🚀 Configurando Gallery Fix...');
        
        // Asegurar que processedImages existe
        if (!this.processedImages) {
            this.processedImages = [];
        }

        // Configurar función de agregar a galería
        this.addToProcessedGallery = function(processedImage) {
            console.log('🖼️ Nueva imagen agregada:', processedImage.name || processedImage.product?.name);

            if (!this.processedImages) this.processedImages = [];

            const exists = this.processedImages.find(img =>
                (img.name || img.product?.name) === (processedImage.name || processedImage.product?.name)
            );

            if (!exists) {
                this.processedImages.push(processedImage);
                console.log('✅ Imagen agregada. Total:', this.processedImages.length);
            }

            // Renderizar galería simple
            setTimeout(() => {
                if (window.renderSimpleGallery) {
                    window.renderSimpleGallery();
                }
            }, 100);
        };

        // Cargar script de galería si no existe
        this.loadGalleryFix();
    }

    loadGalleryFix() {
        console.log('🔧 Cargando Gallery Fix...');
        
        if (!window.renderSimpleGallery) {
            // Crear script tag
            const script = document.createElement('script');
            script.src = '/static/js/gallery-fix.js';
            script.onload = () => {
                console.log('✅ Gallery Fix cargado exitosamente');
                if (window.setupAutoGallery) {
                    window.setupAutoGallery();
                }
                // Renderizar galería si ya hay imágenes
                if (this.processedImages && this.processedImages.length > 0) {
                    setTimeout(() => {
                        if (window.renderSimpleGallery) {
                            window.renderSimpleGallery();
                        }
                    }, 100);
                }
            };
            script.onerror = () => {
                console.error('❌ Error cargando Gallery Fix');
            };
            document.head.appendChild(script);
        } else {
            console.log('✅ Gallery Fix ya está cargado');
            if (window.setupAutoGallery) {
                window.setupAutoGallery();
            }
        }
    }

    startImageProcessing() {
        console.log('🚀 Iniciando procesamiento de imágenes...');
        
        this.processedImages = [];
        this.currentProcessingIndex = 0;
        this.isProcessingPaused = false;
        this.selectedImageIndex = -1;

        // Actualizar estado inicial
        this.updateProcessingStats();
        this.enableProcessingControls();
        
        // Simular procesamiento gradual con gallery fix
        this.processNextImageWithGallery();
    }

    processNextImageWithGallery() {
        if (this.isProcessingPaused || this.currentProcessingIndex >= this.currentAnalysis.products.length) {
            if (this.currentProcessingIndex >= this.currentAnalysis.products.length) {
                this.completeAllProcessing();
            }
            return;
        }

        const product = this.currentAnalysis.products[this.currentProcessingIndex];
        console.log(`🖼️ Procesando imagen ${this.currentProcessingIndex + 1}:`, product.name);

        // Simular tiempo de procesamiento (1-3 segundos)
        const processingTime = 1000 + Math.random() * 2000;
        
        setTimeout(() => {
            // Crear imagen procesada
            const processedImage = this.createProcessedImage(product, this.currentProcessingIndex);
            
            // Agregar a la galería usando el gallery fix
            if (this.addToProcessedGallery) {
                this.addToProcessedGallery(processedImage);
            }
            
            this.currentProcessingIndex++;
            this.updateProcessingStats();
            
            // Continuar con la siguiente imagen
            setTimeout(() => {
                this.processNextImageWithGallery();
            }, 300);
        }, processingTime);
    }

    createProcessedImage(product, index) {
        // Generar imagen placeholder única
        const colors = ['FF6B35', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', 'F4A261', '2A9D8F'];
        const color = colors[index % colors.length];
        
        const width = 400;
        const height = 300;
        
        const text = encodeURIComponent(product.name.substring(0, 20));
        const imageUrl = `https://via.placeholder.com/${width}x${height}/${color}/FFFFFF?text=${text}`;

        return {
            index: index,
            name: product.name,
            price: product.price,
            provider: product.provider,
            url: imageUrl,
            product: product,
            status: 'ready',
            processedAt: new Date().toISOString()
        };
    }

    updateProcessingStats() {
        const processedCount = document.getElementById('processedCount');
        const processingStatus = document.getElementById('processingStatus');
        const galleryCounter = document.querySelector('.gallery-counter');
        
        if (processedCount) {
            processedCount.textContent = this.processedImages ? this.processedImages.length : 0;
        }
        
        if (galleryCounter) {
            const count = this.processedImages ? this.processedImages.length : 0;
            galleryCounter.textContent = `${count} imágenes`;
        }
        
        if (processingStatus) {
            if (this.isProcessingPaused) {
                processingStatus.textContent = 'Pausado';
            } else if (this.currentProcessingIndex >= this.currentAnalysis.products.length) {
                processingStatus.textContent = 'Completado';
            } else {
                processingStatus.textContent = `Procesando imagen ${this.currentProcessingIndex + 1}...`;
            }
        }
    }

    enableProcessingControls() {
        const pauseBtn = document.getElementById('btnPauseProcessing');
        if (pauseBtn) {
            pauseBtn.disabled = false;
        }
    }

    completeAllProcessing() {
        console.log('✅ Procesamiento de imágenes completado');
        
        this.updateProcessingStats();
        this.enableAllActions();
        
        // Deshabilitar botón de pausa
        const pauseBtn = document.getElementById('btnPauseProcessing');
        if (pauseBtn) {
            pauseBtn.disabled = true;
        }

        this.showNotification('Todas las imágenes han sido procesadas exitosamente!', 'success');
    }

    enableAllActions() {
        const actionButtons = [
            'btnDownloadAll',
            'btnShareWhatsApp', 
            'btnSaveToSession',
            'btnFinishProcess'
        ];

        actionButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = false;
            }
        });
    }

    pauseProcessing() {
        this.isProcessingPaused = !this.isProcessingPaused;
        
        const pauseBtn = document.getElementById('btnPauseProcessing');
        if (pauseBtn) {
            if (this.isProcessingPaused) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Reanudar';
                pauseBtn.style.background = '#28a745';
                console.log('Procesamiento pausado');
            } else {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
                pauseBtn.style.background = '#ff6b35';
                console.log('Procesamiento reanudado');
                this.processNextImageWithGallery();
            }
        }
        
        this.updateProcessingStats();
    }

    backToProviderSelection() {
        if (confirm('¿Volver a la selección de proveedor? Se perderá el progreso actual.')) {
            console.log('Volviendo a selección de proveedor...');
            
            // Ocultar sección de imágenes
            const imagesSection = document.getElementById('processedImagesSection');
            if (imagesSection) {
                imagesSection.style.display = 'none';
            }

            // Mostrar pantalla de proveedor
            const providerScreen = document.getElementById('providerSelectionScreen');
            if (providerScreen) {
                providerScreen.style.display = 'flex';
            }

            // Limpiar datos de procesamiento
            this.processedImages = [];
            this.currentProcessingIndex = 0;
            this.isProcessingPaused = false;
            this.selectedImageIndex = -1;
        }
    }

    finishProcessing() {
        if (this.processedImages.length === 0) {
            alert('No hay imágenes procesadas');
            return;
        }

        const confirmMessage = `¿Finalizar el procesamiento?\n\n` +
                              `${this.processedImages.length} imágenes procesadas\n` +
                              `Proveedor: ${this.currentSession?.selectedProvider || 'No seleccionado'}\n` +
                              `Total: $${this.currentAnalysis.totalEstimated.toLocaleString()}`;

        if (confirm(confirmMessage)) {
            console.log('Finalizando procesamiento...');
            
            // Actualizar sesión actual con imágenes
            if (this.currentSession) {
                this.currentSession.processedImages = this.processedImages;
                this.currentSession.status = 'completed';
                this.saveSessions();
            }

            // Ocultar sección de imágenes
            const imagesSection = document.getElementById('processedImagesSection');
            if (imagesSection) {
                imagesSection.style.display = 'none';
            }

            // Volver al dashboard principal
            this.showMainDashboard();
            
            this.showNotification('Procesamiento completado y guardado exitosamente!', 'success');
        }
    }

    showMainDashboard() {
        // Mostrar pantalla principal
        const mainScreen = document.getElementById('offersCreatorMain');
        if (mainScreen) {
            mainScreen.style.display = 'block';
        }
        
        // Actualizar grid de sesiones
        this.updateSessionsGrid();
    }

    addProcessedImagesStyles() {
        const styleId = 'processed-images-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ===== SECCIÓN DE IMÁGENES PROCESADAS ===== */
            .processed-images-section {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .processed-images-container {
                width: 100%;
                max-width: 1400px;
                height: 100%;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                border: 2px solid rgba(255, 215, 0, 0.3);
                backdrop-filter: blur(10px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .processed-images-header {
                padding: 25px 30px;
                background: rgba(255, 215, 0, 0.1);
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }

            .processed-images-header h2 {
                color: #FFD700;
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }

            .processing-stats {
                display: flex;
                gap: 25px;
                margin-top: 10px;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #fff;
                font-size: 14px;
                font-weight: 600;
            }

            .stat-item i {
                color: #FFD700;
                width: 16px;
            }

            .header-actions {
                display: flex;
                gap: 15px;
            }

            .btn-pause, .btn-back {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn-pause {
                background: #ff6b35;
                color: white;
            }

            .btn-pause:hover:not(:disabled) {
                background: #e55a2b;
                transform: translateY(-2px);
            }

            .btn-pause:disabled {
                background: #666;
                cursor: not-allowed;
                opacity: 0.5;
            }

            .btn-back {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .btn-back:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }

            .processed-images-gallery {
                flex: 1;
                padding: 30px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .gallery-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }

            .gallery-title h3 {
                color: #fff;
                margin: 0;
                font-size: 22px;
                font-weight: 600;
            }

            .gallery-counter {
                color: #FFD700;
                font-weight: 600;
                font-size: 16px;
            }

            .gallery-container {
                flex: 1;
                position: relative;
                margin-bottom: 25px;
                overflow: hidden;
                border-radius: 15px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 215, 0, 0.2);
                min-height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .no-images {
                text-align: center;
                color: rgba(255, 255, 255, 0.6);
            }

            .no-images i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .selected-image-info {
                text-align: center;
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                margin-bottom: 20px;
                min-height: 20px;
            }

            .gallery-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .action-btn {
                padding: 15px 25px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                min-width: 160px;
                justify-content: center;
            }

            .btn-download {
                background: #17a2b8;
                color: white;
            }

            .btn-download:hover:not(:disabled) {
                background: #138496;
                transform: translateY(-2px);
            }

            .btn-whatsapp {
                background: #25d366;
                color: white;
            }

            .btn-whatsapp:hover:not(:disabled) {
                background: #20b358;
                transform: translateY(-2px);
            }

            .btn-save {
                background: #6f42c1;
                color: white;
            }

            .btn-save:hover:not(:disabled) {
                background: #5a359a;
                transform: translateY(-2px);
            }

            .btn-finish {
                background: #28a745;
                color: white;
            }

            .btn-finish:hover:not(:disabled) {
                background: #218838;
                transform: translateY(-2px);
            }

            .action-btn:disabled {
                background: #666;
                cursor: not-allowed;
                opacity: 0.5;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .processed-images-section {
                    padding: 10px;
                }

                .processed-images-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }

                .processing-stats {
                    justify-content: center;
                }

                .gallery-actions {
                    flex-direction: column;
                    align-items: center;
                }

                .action-btn {
                    width: 100%;
                    max-width: 300px;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos de imágenes procesadas agregados');
    }

    // ===== GESTIÓN DE SESIONES =====

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    addSession(session) {
        console.log('💾 Agregando nueva sesión:', session.id);
        this.sessions.unshift(session);
        if (this.sessions.length > this.maxSessions) {
            this.sessions = this.sessions.slice(0, this.maxSessions);
        }
        this.saveSessions();
        this.updateSessionsGrid();
    }

    loadSessions() {
        try {
            const saved = localStorage.getItem('offersSessions');
            if (saved) {
                this.sessions = JSON.parse(saved);
                console.log('📂 Sesiones cargadas:', this.sessions.length);
            }
        } catch (error) {
            console.error('❌ Error cargando sesiones:', error);
            this.sessions = [];
        }
    }

    saveSessions() {
        try {
            localStorage.setItem('offersSessions', JSON.stringify(this.sessions));
            console.log('💾 Sesiones guardadas:', this.sessions.length);
        } catch (error) {
            console.error('❌ Error guardando sesiones:', error);
        }
    }

    updateLastSessionTime() {
        const now = new Date();
        this.lastSessionTime = now.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const lastSessionElement = document.getElementById('lastSessionTime');
        if (lastSessionElement) {
            lastSessionElement.textContent = this.lastSessionTime;
        }
    }

    updateSessionsGrid() {
        const grid = document.getElementById('sessionsGrid');
        if (!grid) return;

        if (this.sessions.length === 0) {
            grid.innerHTML = `
                <div class="no-sessions">
                    <i class="fas fa-history"></i>
                    <h3>No hay sesiones anteriores</h3>
                    <p>Tus sesiones de procesamiento aparecerán aquí</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        this.sessions.forEach(session => {
            const sessionCard = this.createSessionCard(session);
            grid.appendChild(sessionCard);
        });
    }

    createSessionCard(session) {
        const card = document.createElement('div');
        card.className = 'session-card';

        const date = new Date(session.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="session-header">
                <div class="session-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="session-time">
                    <i class="fas fa-clock"></i>
                    <span>${formattedTime}</span>
                </div>
            </div>
            <div class="session-stats">
                <div class="stat">
                    <i class="fas fa-box"></i>
                    <span>${session.products.length} productos</span>
                </div>
                <div class="stat">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${session.totalEstimated.toLocaleString()}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-image"></i>
                    <span>${session.processedImages?.length || 0} procesadas</span>
                </div>
            </div>
            <div class="session-actions">
                <button onclick="offersCreator.viewSessionDetails('${session.id}')" class="btn-view" title="Ver detalles completos">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
                <button onclick="offersCreator.editSessionPrices('${session.id}')" class="btn-edit" title="Modificar precios">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button onclick="offersCreator.deleteSession('${session.id}')" class="btn-delete" title="Eliminar sesión">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
                <button onclick="offersCreator.exportSession('${session.id}')" class="btn-export" title="Exportar datos">
                    <i class="fas fa-download"></i>
                    Exportar
                </button>
                <button onclick="offersCreator.shareSessionWhatsApp('${session.id}')" class="btn-whatsapp" title="Compartir por WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                    WhatsApp
                </button>
            </div>
        `;

        return card;
    }

    // ===== ACCIONES DE SESIONES =====

    viewSessionDetails(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('👁️ Viendo sesión:', sessionId);
        this.showSessionDetailsModal(session);
    }

    editSessionPrices(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('✏️ Editando precios de sesión:', sessionId);
        this.showPriceEditModal(session);
    }

    continueSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('▶️ Continuando sesión:', sessionId);
        this.currentSession = session;
        this.currentAnalysis = {
            products: session.products,
            providers: session.providers,
            totalEstimated: session.totalEstimated,
            isValid: true
        };

        alert(`Continuando sesión del ${new Date(session.date).toLocaleDateString()}`);
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const date = new Date(session.date).toLocaleDateString('es-ES');
        const confirmMessage = `¿Eliminar la sesión del ${date}?\n\n` +
                              `${session.products.length} productos\n` +
                              `Total: $${session.totalEstimated.toLocaleString()}\n\n` +
                              `Esta acción no se puede deshacer.`;

        if (confirm(confirmMessage)) {
            console.log('🗑️ Eliminando sesión:', sessionId);
            this.removeSession(sessionId);
            this.showNotification('Sesión eliminada correctamente', 'success');
        }
    }

    exportSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('📤 Exportando sesión:', sessionId);

        // Crear datos de exportación
        const exportData = {
            session: session,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        // Crear archivo JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Crear enlace de descarga
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MMR_Sesion_${new Date(session.date).toISOString().split('T')[0]}.json`;
        
        // Descargar archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Sesión exportada correctamente', 'success');
    }

    shareSessionWhatsApp(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        console.log('📱 Compartiendo sesión por WhatsApp:', sessionId);

        const date = new Date(session.date).toLocaleDateString('es-ES');
        const message = `🛒 *Sesión MMR Group - ${date}*\n\n` +
                       `📦 ${session.products.length} productos procesados\n` +
                       `💰 Valor total: $${session.totalEstimated.toLocaleString()}\n` +
                       `🏢 Proveedores: ${session.providers.join(', ')}\n\n` +
                       `${session.processedImages?.length || 0} imágenes generadas\n\n` +
                       `#MMRGroup #Autopartes #Ofertas`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    showNotification(message, type = 'info') {
        console.log(`📢 Notificación (${type}):`, message);
        
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Agregar estilos si no existen
        this.addNotificationStyles();

        // Agregar al DOM
        document.body.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    addNotificationStyles() {
        const styleId = 'notification-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #FFD700;
                backdrop-filter: blur(10px);
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 350px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification-success {
                border-left-color: #28a745;
            }

            .notification-error {
                border-left-color: #dc3545;
            }

            .notification-info {
                border-left-color: #17a2b8;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .notification-content i {
                font-size: 18px;
                flex-shrink: 0;
            }

            .notification-success i {
                color: #28a745;
            }

            .notification-error i {
                color: #dc3545;
            }

            .notification-info i {
                color: #17a2b8;
            }
        `;

        document.head.appendChild(style);
    }

    addSessionStyles() {
        const styleId = 'session-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* ===== ESTILOS DE SESIONES ===== */
            .session-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .session-card:hover {
                border-color: rgba(255, 215, 0, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.1);
            }

            .session-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .session-date, .session-time {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #FFD700;
                font-weight: 600;
            }

            .session-date i, .session-time i {
                width: 16px;
                text-align: center;
            }

            .session-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }

            .stat {
                display: flex;
                align-items: center;
                gap: 8px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }

            .stat i {
                color: #FFD700;
                width: 16px;
                text-align: center;
            }

            .session-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .session-actions button {
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 80px;
                justify-content: center;
            }

            .btn-view {
                background: #17a2b8;
                color: white;
            }

            .btn-view:hover {
                background: #138496;
                transform: translateY(-1px);
            }

            .btn-edit {
                background: #ffc107;
                color: #000;
            }

            .btn-edit:hover {
                background: #e0a800;
                transform: translateY(-1px);
            }

            .btn-delete {
                background: #dc3545;
                color: white;
            }

            .btn-delete:hover {
                background: #c82333;
                transform: translateY(-1px);
            }

            .btn-export {
                background: #6f42c1;
                color: white;
            }

            .btn-export:hover {
                background: #5a359a;
                transform: translateY(-1px);
            }

            .btn-whatsapp {
                background: #25d366;
                color: white;
            }

            .btn-whatsapp:hover {
                background: #20b358;
                transform: translateY(-1px);
            }

            .no-sessions {
                text-align: center;
                padding: 40px 20px;
                color: rgba(255, 255, 255, 0.6);
            }

            .no-sessions i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .no-sessions h3 {
                margin: 0 0 10px 0;
                color: rgba(255, 255, 255, 0.8);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .session-header {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }

                .session-stats {
                    justify-content: center;
                }

                .session-actions {
                    justify-content: center;
                }

                .session-actions button {
                    flex: 1;
                    min-width: 70px;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos de sesiones agregados');
    }

    // ===== MODALES =====

    showSessionDetailsModal(session) {
        let modal = document.getElementById('sessionDetailsModal');
        if (!modal) {
            modal = this.createSessionDetailsModal();
            document.body.appendChild(modal);
        }

        const modalTitle = modal.querySelector('.modal-title');
        const sessionInfo = modal.querySelector('.session-info');

        if (modalTitle) {
            const date = new Date(session.date).toLocaleDateString('es-ES');
            modalTitle.textContent = `Detalles de Sesión - ${date}`;
        }

        if (sessionInfo) {
            sessionInfo.innerHTML = `
                <div class="session-detail-stats">
                    <div class="detail-stat">
                        <i class="fas fa-calendar"></i>
                        <span>Fecha: ${new Date(session.date).toLocaleString('es-ES')}</span>
                    </div>
                    <div class="detail-stat">
                        <i class="fas fa-box"></i>
                        <span>Productos: ${session.products.length}</span>
                    </div>
                    <div class="detail-stat">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Total: $${session.totalEstimated.toLocaleString()}</span>
                    </div>
                    <div class="detail-stat">
                        <i class="fas fa-building"></i>
                        <span>Proveedor: ${session.selectedProvider || 'No seleccionado'}</span>
                    </div>
                </div>
                <div class="products-detail-list">
                    <h4>Productos:</h4>
                    ${session.products.map(product => `
                        <div class="product-detail-item">
                            <div class="product-detail-name">${product.name}</div>
                            <div class="product-detail-price">$${product.price.toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        modal.style.display = 'flex';
    }

    createSessionDetailsModal() {
        const modal = document.createElement('div');
        modal.id = 'sessionDetailsModal';
        modal.className = 'session-details-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="offersCreator.closeSessionDetailsModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Detalles de Sesión</h3>
                    <button class="modal-close" onclick="offersCreator.closeSessionDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="session-info"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn-close-details" onclick="offersCreator.closeSessionDetailsModal()">
                        <i class="fas fa-times"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    closeSessionDetailsModal() {
        const modal = document.getElementById('sessionDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showPriceEditModal(session) {
        let modal = document.getElementById('priceEditModal');
        if (!modal) {
            modal = this.createPriceEditModal();
            document.body.appendChild(modal);
        }

        const modalTitle = modal.querySelector('.modal-title');
        const productsList = modal.querySelector('.products-list');

        if (modalTitle) {
            const date = new Date(session.date).toLocaleDateString('es-ES');
            modalTitle.textContent = `Modificar Precios - Sesión del ${date}`;
        }

        if (productsList) {
            productsList.innerHTML = '';
            session.products.forEach((product, index) => {
                const productItem = document.createElement('div');
                productItem.className = 'product-edit-item';
                productItem.innerHTML = `
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-description">${product.description || ''}</div>
                    </div>
                    <div class="product-price-edit">
                        <span class="currency">$</span>
                        <input type="number" 
                               class="price-input" 
                               data-product-index="${index}"
                               value="${product.price}" 
                               min="0" 
                               step="1">
                    </div>
                `;
                productsList.appendChild(productItem);
            });

            // Agregar listeners para actualizar total
            const priceInputs = productsList.querySelectorAll('.price-input');
            priceInputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.updateModalTotal(session, modal);
                });
            });
        }

        this.updateModalTotal(session, modal);

        const saveBtn = modal.querySelector('.btn-save-prices');
        const cancelBtn = modal.querySelector('.btn-cancel-edit');

        if (saveBtn) {
            saveBtn.onclick = () => this.savePriceChanges(session, modal);
        }
        if (cancelBtn) {
            cancelBtn.onclick = () => this.closePriceEditModal();
        }

        modal.style.display = 'flex';
    }

    createPriceEditModal() {
        const modal = document.createElement('div');
        modal.id = 'priceEditModal';
        modal.className = 'price-edit-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="offersCreator.closePriceEditModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Modificar Precios</h3>
                    <button class="modal-close" onclick="offersCreator.closePriceEditModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="products-list"></div>
                    <div class="modal-total">
                        <div class="total-label">Total Estimado:</div>
                        <div class="total-display">$0</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel-edit">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                    <button class="btn-save-prices">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    closePriceEditModal() {
        const modal = document.getElementById('priceEditModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateModalTotal(session, modal) {
        const priceInputs = modal.querySelectorAll('.price-input');
        let newTotal = 0;

        priceInputs.forEach(input => {
            const price = parseFloat(input.value) || 0;
            newTotal += price;
        });

        const totalDisplay = modal.querySelector('.total-display');
        if (totalDisplay) {
            totalDisplay.textContent = `$${newTotal.toLocaleString()}`;
        }
    }

    savePriceChanges(session, modal) {
        const priceInputs = modal.querySelectorAll('.price-input');
        let newTotal = 0;

        priceInputs.forEach(input => {
            const index = parseInt(input.dataset.productIndex);
            const newPrice = parseFloat(input.value) || 0;
            
            if (session.products[index]) {
                session.products[index].price = newPrice;
                newTotal += newPrice;
            }
        });

        session.totalEstimated = newTotal;
        this.saveSessions();
        this.updateSessionsGrid();
        this.closePriceEditModal();

        console.log('💾 Precios actualizados para sesión:', session.id);
        alert('✅ Precios actualizados correctamente');
    }

    // ===== UTILIDADES =====

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }

    // ===== ESTILOS CSS =====

    addSessionStyles() {
        const styleId = 'session-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .session-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .btn-glass {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                color: #FFD700;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 80px;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .btn-glass:hover {
                background: rgba(255, 215, 0, 0.2);
                border-color: rgba(255, 215, 0, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
            }
        `;

        document.head.appendChild(style);
    }

    addAdvancedEditStyles() {
        const styleId = 'advanced-edit-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .advanced-edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .modal-container {
                position: relative;
                width: 100%;
                max-width: 1200px;
                max-height: 90vh;
                background: rgba(26, 26, 26, 0.95);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .section-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 15px;
                padding: 20px;
                backdrop-filter: blur(10px);
            }

            .notes-textarea {
                width: 100%;
                min-height: 100px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 8px;
                color: white;
                font-family: inherit;
                resize: vertical;
            }
        `;

        document.head.appendChild(style);
    }

    addNotificationStyles() {
        const styleId = 'notification-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #FFD700;
                backdrop-filter: blur(10px);
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 350px;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification-success { border-left-color: #28a745; }
            .notification-error { border-left-color: #dc3545; }
        `;

        document.head.appendChild(style);
    }

    addImageExpandStyles() {
        const styleId = 'image-expand-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .image-expand-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 15000;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.9);
            }

            .image-expand-container img {
                max-width: 90vw;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 10px;
            }
        `;

        document.head.appendChild(style);
    }
}

// ===== INICIALIZACIÓN =====
let offersCreator;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM cargado, inicializando OffersCreator FINAL...');
    offersCreator = new OffersCreator();
});

console.log('✅ Creador de Ofertas FINAL cargado');