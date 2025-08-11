// SOLUCIÓN SÚPER SIMPLE PARA LA GALERÍA
// Copia y pega esto en la consola del navegador (F12)

// Función simple para mostrar imágenes
function showImageInGallery(imageUrl, productName, price) {
    const gallery = document.getElementById('processedGalleryContainer');
    const counter = document.getElementById('processedImageCounter');
    
    if (!gallery) {
        alert('No se encontró la galería');
        return;
    }
    
    // Si es la primera imagen, limpiar el placeholder
    if (gallery.innerHTML.includes('Las imágenes procesadas aparecerán aquí')) {
        gallery.innerHTML = '';
    }
    
    // Crear HTML simple para la imagen
    const imageHTML = `
        <div style="display: inline-block; margin: 10px; padding: 10px; background: #444; border-radius: 8px; text-align: center; width: 150px;">
            <img src="${imageUrl}" style="width: 130px; height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer;" 
                 onclick="window.open('${imageUrl}', '_blank')">
            <div style="color: white; font-size: 12px; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${productName}</div>
            <div style="color: #FFD700; font-size: 11px; font-weight: bold;">$${price.toLocaleString()}</div>
        </div>
    `;
    
    // Agregar la imagen a la galería
    gallery.innerHTML += imageHTML;
    
    // Actualizar contador
    if (counter) {
        const currentCount = parseInt(counter.textContent) || 0;
        counter.textContent = currentCount + 1;
    }
}

// Función de prueba
function testSimpleGallery() {
    showImageInGallery(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNENBRjUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPklNQUdFTiBURVNUPC90ZXh0Pjwvc3ZnPg==',
        'Producto Test',
        1500
    );
    alert('Imagen agregada a la galería');
}

// Ejecutar test automáticamente
testSimpleGallery();

console.log('✅ Solución simple cargada. Usa testSimpleGallery() para probar.');