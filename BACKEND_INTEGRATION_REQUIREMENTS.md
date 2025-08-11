# 🔗 REQUISITOS PARA INTEGRACIÓN BACKEND - FASE 2

## 📋 INFORMACIÓN NECESARIA PARA CONECTAR SIN ERRORES

### 🗂️ **ESTRUCTURA DE DATOS**

#### 1. **Producto Actual**
```python
# ¿Cómo llega la información del producto a la Fase 2?
product_data = {
    "name": "Kit Transmisión Honda",
    "price": 8900,
    "provider": "Herman Repuestos",
    "id": "producto_123",
    "category": "repuestos",
    # ¿Hay más campos?
}
```

#### 2. **Sesión de Productos**
```python
# ¿Cómo se estructura la sesión completa?
session_data = {
    "session_id": "session_456",
    "products": [
        {"name": "Producto 1", "price": 2450, "processed": True},
        {"name": "Producto 2", "price": 8900, "processed": False},
        # ¿Más productos?
    ],
    "provider": "Herman Repuestos",
    "total_products": 25,
    "processed_count": 8,
    # ¿Más campos de sesión?
}
```

### 🎨 **TEMPLATES**

#### Ruta confirmada: `C:\Users\CHAMP\Desktop\mmr_saas\processing\product_templates`

**NECESITO SABER:**
1. **¿Qué formato tienen los templates?** (.png, .jpg, .psd, etc.)
2. **¿Cómo se nombran?** (template1.png, plantilla_1.png, etc.)
3. **¿Hay subcarpetas por categoría?**
4. **¿Tienen metadatos?** (nombre, descripción, categoría)

```python
# Ejemplo de estructura esperada:
templates = [
    {
        "id": "template1",
        "name": "Clásico",
        "filename": "template1.png",
        "path": "/processing/product_templates/template1.png",
        "description": "Template clásico para productos",
        "category": "general",
        "icon": "fas fa-trophy"
    }
]
```

### 🖼️ **PROCESAMIENTO DE IMÁGENES**

**NECESITO SABER:**
1. **¿Qué librería usas?** (Pillow, OpenCV, etc.)
2. **¿Cómo se aplica el template?** (overlay, merge, etc.)
3. **¿Dónde se guardan las imágenes procesadas?**
4. **¿Qué formato de salida?** (.png, .jpg, calidad, etc.)

```python
# Ejemplo de función de procesamiento:
def process_image(image_file, template_id, product_data):
    # ¿Cómo funciona internamente?
    processed_image = apply_template(image_file, template_id, product_data)
    # ¿Dónde se guarda?
    # ¿Qué se retorna?
    return {
        "success": True,
        "processed_image_url": "/static/processed/image_123.png",
        "processing_time": 2.3,
        "quality_score": 85
    }
```

### 🗄️ **BASE DE DATOS**

**NECESITO SABER:**
1. **¿Qué base de datos usas?** (SQLite, PostgreSQL, etc.)
2. **¿Cómo se guardan las sesiones?**
3. **¿Se guardan las imágenes procesadas en BD?**
4. **¿Hay tabla de templates?**

```sql
-- Ejemplo de estructura esperada:
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    session_data JSON,
    created_at TIMESTAMP,
    -- ¿Más campos?
);

CREATE TABLE processed_images (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    original_image_path TEXT,
    processed_image_path TEXT,
    template_used TEXT,
    -- ¿Más campos?
);
```

### 🌐 **RUTAS Y ENDPOINTS**

#### **RUTAS PRINCIPALES NECESARIAS:**

1. **Ruta de la Fase 2:**
```python
@app.route('/fase2')
@app.route('/fase2/<session_id>')
@app.route('/fase2/<session_id>/<product_index>')
# ¿Cuál es la estructura correcta?
```

2. **API Endpoints necesarios:**
```python
# ¿Estas rutas ya existen o las creo?
@app.route('/api/get-templates', methods=['GET'])
@app.route('/api/process-image', methods=['POST'])
@app.route('/api/save-session', methods=['POST'])
@app.route('/api/get-product-data/<product_id>', methods=['GET'])
@app.route('/api/upload-image', methods=['POST'])
```

### 📁 **ESTRUCTURA DE ARCHIVOS**

**NECESITO CONFIRMAR:**
```
mmr_saas/
├── app.py (¿archivo principal?)
├── static/
│   ├── css/ ✅ (ya creados)
│   ├── js/ ✅ (ya creados)
│   ├── processed/ (¿existe? ¿para imágenes procesadas?)
│   └── uploads/ (¿existe? ¿para imágenes subidas?)
├── templates/ ✅ (ya creados)
├── processing/
│   └── product_templates/ ✅ (confirmado)
└── ¿más carpetas?
```

### 🔄 **FLUJO DE DATOS**

**NECESITO ENTENDER:**

1. **¿Cómo llega el usuario a la Fase 2?**
   - ¿Desde el dashboard?
   - ¿Con qué parámetros?
   - ¿Con sesión activa?

2. **¿Cómo se pasa de producto en producto?**
   - ¿Se recarga la página?
   - ¿AJAX para siguiente producto?
   - ¿Se mantiene la sesión?

3. **¿Cómo se guardan las imágenes?**
   - ¿En qué carpeta?
   - ¿Con qué nombre?
   - ¿Se limpian automáticamente?

### 🔐 **SEGURIDAD Y VALIDACIONES**

**NECESITO SABER:**
1. **¿Hay límites de tamaño de imagen?**
2. **¿Qué formatos de imagen se aceptan?**
3. **¿Hay validación de tipos de archivo?**
4. **¿Se requiere autenticación?**

### 📊 **ESTADÍSTICAS Y MÉTRICAS**

**NECESITO SABER:**
1. **¿Cómo se calculan las estadísticas?**
2. **¿Se guardan métricas de velocidad?**
3. **¿Hay analytics de uso de templates?**

### 🔧 **CONFIGURACIÓN ACTUAL**

**NECESITO VER:**
1. **Tu archivo `app.py` actual**
2. **Estructura de carpetas existente**
3. **Librerías instaladas** (requirements.txt)
4. **Configuración de Flask**

---

## 🚨 PREGUNTAS CRÍTICAS PARA EVITAR ERRORES:

### 1. **¿Cómo está estructurado tu `app.py` actual?**
- ¿Usas Blueprints?
- ¿Hay rutas existentes que deba respetar?
- ¿Qué librerías ya tienes importadas?

### 2. **¿Cómo funciona tu sistema actual de procesamiento?**
- ¿Ya tienes código para aplicar templates?
- ¿Cómo se manejan las imágenes actualmente?

### 3. **¿Qué datos tienes disponibles en el contexto?**
- ¿Session de Flask?
- ¿Variables globales?
- ¿Base de datos activa?

### 4. **¿Hay restricciones o dependencias?**
- ¿Código existente que no puedo modificar?
- ¿Estructura específica que debo mantener?

---

## 📝 ARCHIVOS QUE NECESITO VER:

1. **`app.py`** - Para entender la estructura actual
2. **Carpeta `processing/`** - Para ver cómo funciona el procesamiento
3. **Cualquier archivo de configuración** existente
4. **Estructura actual de carpetas** completa

---

## 🎯 PLAN DE INTEGRACIÓN:

Una vez que tengas esta información, podré:

1. **Crear las rutas Flask** necesarias
2. **Adaptar el JavaScript** para llamadas reales
3. **Implementar el procesamiento** de imágenes
4. **Configurar el manejo** de archivos
5. **Integrar con tu sistema** existente
6. **Testing completo** sin errores

**¿Puedes proporcionarme esta información para hacer la integración perfecta?** 🚀