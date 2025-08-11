// ULTRA SIMPLE TEST - Just the basics
console.log('🚀 ULTRA SIMPLE SCRIPT LOADED');

// Test if we can create a simple object
window.testController = {
    ready: true,
    openChatGPT: function() {
        console.log('✅ Opening ChatGPT...');
        window.open('https://chat.openai.com/', '_blank');
    },
    testProcessing: function() {
        console.log('✅ Testing processing...');
        const input = document.getElementById('productListInput');
        if (input) {
            console.log('✅ Found input element');
            alert('¡Funciona! Input encontrado');
        } else {
            console.log('❌ Input not found');
            alert('Error: Input no encontrado');
        }
    }
};

console.log('✅ Test controller created');

// Global functions
function openChatGPTVision() {
    console.log('🌐 Global function called');
    if (window.testController) {
        window.testController.openChatGPT();
    }
}

function startProcessing() {
    console.log('🌐 Start processing called');
    if (window.testController) {
        window.testController.testProcessing();
    }
}

// Test when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded');
    console.log('✅ Controller ready:', window.testController ? 'YES' : 'NO');
    
    // Set as appController for compatibility
    window.appController = window.testController;
    console.log('✅ appController set');
});

console.log('🏁 Ultra simple script complete');