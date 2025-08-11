// MMR Group - Creador de Ofertas CON BACKEND COMPLETO
// Mantiene toda la lógica de procesamiento pero sin frontend de galería
console.log('🎨 Cargando Creador de Ofertas con BACKEND COMPLETO...');

class OffersCreator {
    constructor() {
        console.log('🏗️ Construyendo OffersCreator...');

        this.currentSession = null;
        this.sessions = [];
        this.maxSessions = 10;
        this.isProcessing = false;

        this.currentAnalysis = {
            products: [],
            totalEstimated: 0,
            providers: [],
            isValid: false
        };

        this.currentProcessingIndex = 0;
        this.processedImages = []; // ✅ MANTENER - Backend necesita esto
        this.selectedTemplate = 'plantilla_1.png';
        this.currentImageFile = null;
        this.lastSessionTime =