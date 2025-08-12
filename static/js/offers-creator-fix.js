// SOLUCIÓN RÁPIDA PARA EL ERROR "message port closed"
console.log('🔧 Cargando solución rápida...');

// Función global simple sin conflictos
window.startProcessingFix = function () {
    console.log('🚀 startProcessingFix llamada');

    // Verificar que existe la instancia
    if (!window.offersCreator) {
        console.log('⚠️ Creando nueva instancia...');
        window.offersCreator = new OffersCreator();

        // Esperar un poco y reintentar
        setTimeout(() => {
            if (window.offersCreator && window.offersCreator.startProcessing) {
                window.offersCreator.startProcessing();
            }
        }, 500);
        return;
    }

    // Llamar directamente al método
    if (window.offersCreator.startProcessing) {
        window.offersCreator.startProcessing();
    } else {
        console.error('❌ Método startProcessing no encontrado');
    }
};

// Sobrescribir la función problemática
window.startProcessing = window.startProcessingFix;

console.log('✅ Solución aplicada - usar startProcessing() normalmente');