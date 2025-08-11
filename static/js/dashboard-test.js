// Test simple para verificar carga de scripts
console.log('🧪 [TEST] Dashboard test script loaded successfully');

class DashboardControllerTest {
    constructor() {
        console.log('🧪 [TEST] DashboardControllerTest constructor called');
    }
}

// Crear instancia inmediatamente
console.log('🧪 [TEST] Creating test instance...');
window.testController = new DashboardControllerTest();
console.log('🧪 [TEST] Test instance created:', !!window.testController);