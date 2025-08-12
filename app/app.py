import io
import os
import time
import uuid
import numpy as np
import logging
from flask import Flask, request, send_file, jsonify, render_template, session, redirect, url_for
# Rembg es opcional para remover fondos
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    print("⚠️ rembg no disponible, usando imagen original")
from PIL import Image, ImageDraw, ImageFont
import traceback
import csv
from collections import Counter, defaultdict
from PIL import ImageFilter
# Super-image es opcional para mejora de resolución
try:
    from super_image import EdsrModel, ImageLoader
    SUPER_IMAGE_AVAILABLE = True
except ImportError:
    SUPER_IMAGE_AVAILABLE = False
    print("⚠️ super-image no disponible, usando resolución original")
# Database es opcional para funcionalidades avanzadas
try:
    from .database import db
    DATABASE_AVAILABLE = True
except ImportError:
    try:
        from database import db
        DATABASE_AVAILABLE = True
    except ImportError:
        DATABASE_AVAILABLE = False
        print("⚠️ Database no disponible, funcionalidades básicas activas")

# Crear aplicación Flask
app = Flask(__name__, static_folder='../static', template_folder='../templates')

# Configuración básica
app.secret_key = os.environ.get('SECRET_KEY', 'mmr-dashboard-secret-key-fase2')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Configurar logging para producción
if os.environ.get('FLASK_ENV') == 'production':
    logging.basicConfig(level=logging.INFO)
    app.logger.setLevel(logging.INFO)
    app.logger.info('MMR SaaS startup')

# Configuración de rutas - compatible con desarrollo y producción
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(BASE_DIR, 'processing', 'product_templates')

# Ruta de la plantilla base (imagen de fondo) - usar plantilla_1.png como default
TEMPLATE_PATH = os.path.join(TEMPLATES_DIR, 'plantilla_1.png')
# Ruta de la fuente Oswald Variable
FONT_PATH = os.path.join(BASE_DIR, 'static', 'assets', 'fonts', 'Oswald-VariableFont_wght.ttf')

# Debug: Imprimir rutas para verificar
print(f"🔍 BASE_DIR: {BASE_DIR}")
print(f"🔍 TEMPLATES_DIR: {TEMPLATES_DIR}")
print(f"🔍 TEMPLATE_PATH: {TEMPLATE_PATH}")
print(f"🔍 Template exists: {os.path.exists(TEMPLATE_PATH)}")
print(f"🔍 Templates dir exists: {os.path.exists(TEMPLATES_DIR)}")

if os.path.exists(TEMPLATES_DIR):
    files = os.listdir(TEMPLATES_DIR)
    print(f"🔍 Files in templates dir: {files}")
else:
    print(f"❌ Templates directory not found: {TEMPLATES_DIR}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health_check():
    """Health check endpoint para Render"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'version': '1.0.0'
    })

# ===== RUTAS PARA FASE 2 =====

@app.route('/fase2')
def fase2_inicio():
    """Ruta para iniciar Fase 2 - TEMPLATE LIMPIO SIN CONFLICTOS"""
    return render_template('fase2_clean.html')

@app.route('/fase2-old')
def fase2_inicio_old():
    """Ruta para la versión antigua de Fase 2"""
    return render_template('fase2_procesamiento.html')

@app.route('/static/templates/<filename>')
def serve_template(filename):
    """Servir imágenes de templates para el selector"""
    try:
        template_path = os.path.join(TEMPLATES_DIR, filename)
        if os.path.exists(template_path):
            return send_file(template_path, mimetype='image/png')
        else:
            # Retornar imagen placeholder si no existe
            return send_file(os.path.join(BASE_DIR, 'static', 'images', 'template-placeholder.png'), 
                           mimetype='image/png')
    except Exception as e:
        print(f"Error serving template {filename}: {e}")
        return "Template not found", 404

@app.route('/template-preview/<filename>')
def template_preview(filename):
    """Servir previews de templates para el selector"""
    try:
        template_path = os.path.join(TEMPLATES_DIR, filename)
        if os.path.exists(template_path):
            return send_file(template_path, mimetype='image/png')
        else:
            return "Template not found", 404
    except Exception as e:
        print(f"Error serving template preview {filename}: {e}")
        return "Template not found", 404

@app.route('/api/templates')
def get_templates():
    """API para obtener lista de templates disponibles"""
    try:
        templates = []
        
        print(f"🎨 Buscando templates en: {TEMPLATES_DIR}")
        print(f"🎨 Directorio existe: {os.path.exists(TEMPLATES_DIR)}")
        
        if os.path.exists(TEMPLATES_DIR):
            files = os.listdir(TEMPLATES_DIR)
            print(f"🎨 Archivos encontrados: {files}")
            
            for filename in files:
                if filename.endswith('.png'):
                    template_name = filename.replace('plantilla_', 'T').replace('.png', '')
                    templates.append({
                        'filename': filename,
                        'name': template_name,
                        'preview_url': f'/template-preview/{filename}'
                    })
        
        print(f"🎨 Templates procesados: {templates}")
        
        response_data = {
            'success': True,
            'templates': templates,
            'count': len(templates)
        }
        print(f"🚀 Enviando respuesta: {response_data}")
        
        return jsonify(response_data)
    except Exception as e:
        print(f"❌ Error getting templates: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'templates': []
        }), 500

@app.route('/process', methods=['POST'])
def process():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No se envió imagen'}), 400
        image_file = request.files['image']
        product_name = request.form.get('name', '')
        product_price = request.form.get('price', '')

        # Abrir imagen correctamente desde FileStorage
        input_image = Image.open(image_file.stream).convert('RGBA')
        
        # Remover fondo usando rembg (opcional)
        if REMBG_AVAILABLE:
            try:
                output_nobg_data = remove(input_image)
                output_nobg = None
                if isinstance(output_nobg_data, bytes):
                    output_nobg = Image.open(io.BytesIO(output_nobg_data)).convert('RGBA')
                elif isinstance(output_nobg_data, Image.Image):
                    output_nobg = output_nobg_data.convert('RGBA')
                else:
                    # Si es ndarray (por ejemplo, numpy array), convertir a PIL.Image
                    import numpy as np
                    if hasattr(output_nobg_data, 'shape'):
                        output_nobg = Image.fromarray(np.uint8(output_nobg_data)).convert('RGBA')
                    else:
                        raise Exception('No se pudo convertir la imagen procesada por rembg a PIL.Image')
                print("✅ Fondo removido con rembg")
            except Exception as e:
                print(f"⚠️ Error con rembg, usando imagen original: {e}")
                output_nobg = input_image
        else:
            print("⚠️ rembg no disponible, usando imagen original")
            output_nobg = input_image

        # Mejorar resolución de la imagen sin fondo usando IA (super-image) - OPCIONAL
        if SUPER_IMAGE_AVAILABLE:
            try:
                model = EdsrModel.from_pretrained('eugenesiow/edsr-base', scale=2)
                inputs = ImageLoader.load_image(output_nobg.convert('RGB'))
                preds = model(inputs)
                output_nobg_sr = ImageLoader.save_image(preds, 'temp_sr.png')
                sr_img = Image.open('temp_sr.png').convert('RGBA')
                alpha = output_nobg.split()[-1].resize(sr_img.size, Image.Resampling.LANCZOS)
                sr_img.putalpha(alpha)
                output_nobg = sr_img
                print("✅ Resolución mejorada con super-image")
            except Exception as e:
                print(f"⚠️ Error con super-image, usando resolución original: {e}")
        else:
            print("⚠️ Super-image no disponible, usando resolución original")

        # Obtener el template seleccionado o usar el por defecto
        selected_template = request.form.get('template', 'plantilla_1.png')
        template_path = os.path.join(BASE_DIR, 'processing', 'product_templates', selected_template)
        
        print(f"Template seleccionado: {selected_template}")
        print(f"Ruta del template: {template_path}")
        
        # Verificar que el template seleccionado existe
        if not os.path.exists(template_path):
            print(f"Template {selected_template} not found, trying default")
            template_path = TEMPLATE_PATH
            
            # Si el template por defecto tampoco existe, buscar cualquier plantilla disponible
            if not os.path.exists(template_path):
                print(f"Default template not found at {template_path}")
                templates_dir = os.path.join(BASE_DIR, 'processing', 'product_templates')
                available_templates = [f for f in os.listdir(templates_dir) if f.endswith('.png')]
                if available_templates:
                    template_path = os.path.join(templates_dir, available_templates[0])
                    print(f"Using fallback template: {template_path}")
                else:
                    raise FileNotFoundError(f"No se encontró ninguna plantilla en: {templates_dir}")
        else:
            print(f"Template {selected_template} found successfully")
        
        template = Image.open(template_path).convert('RGBA')
        tw, th = template.size

        # Hacer la imagen del producto más chica y más abajo
        max_width = int(tw * 0.60)
        max_height = int(th * 0.40)
        pw, ph = output_nobg.size
        scale = min(max_width / pw, max_height / ph)
        new_size = (int(pw * scale), int(ph * scale))
        product_resized = output_nobg.resize(new_size, Image.Resampling.LANCZOS)
        px = (tw - new_size[0]) // 2
        py = int(th * 0.35)  # CENTRADO - Entre el nombre arriba y precio abajo

        # ALGORITMO MEJORADO PARA ELIMINAR PUNTOS BLANCOS
        composed = template.copy()
        
        # Limpiar el producto antes de pegarlo
        if product_resized.mode == 'RGBA':
            # Convertir a array para procesamiento
            import numpy as np
            product_array = np.array(product_resized)
            
            if len(product_array.shape) == 3 and product_array.shape[2] == 4:
                # Separar canales RGBA
                r, g, b, a = product_array[:,:,0], product_array[:,:,1], product_array[:,:,2], product_array[:,:,3]
                
                # 1. Eliminar píxeles muy transparentes (ruido)
                very_transparent = a < 25
                a[very_transparent] = 0
                r[very_transparent] = 0
                g[very_transparent] = 0
                b[very_transparent] = 0
                
                # 2. ELIMINAR PUNTOS BLANCOS/GRISES PROBLEMÁTICOS
                # Detectar píxeles blancos o grises claros
                white_pixels = (r > 230) & (g > 230) & (b > 230) & (a < 255)
                gray_pixels = (np.abs(r.astype(int) - g.astype(int)) < 15) & \
                             (np.abs(g.astype(int) - b.astype(int)) < 15) & \
                             (r > 200) & (a < 220)
                
                # Eliminar estos píxeles problemáticos
                problematic = white_pixels | gray_pixels
                a[problematic] = 0
                r[problematic] = 0
                g[problematic] = 0
                b[problematic] = 0
                
                # 3. Hacer completamente opacos los píxeles casi opacos
                almost_opaque = a > 240
                a[almost_opaque] = 255
                
                # Reconstruir imagen limpia
                product_array[:,:,0] = r
                product_array[:,:,1] = g
                product_array[:,:,2] = b
                product_array[:,:,3] = a
                
                product_cleaned = Image.fromarray(product_array.astype(np.uint8), 'RGBA')
                composed.paste(product_cleaned, (px, py), product_cleaned)
            else:
                composed.paste(product_resized, (px, py), product_resized)
        else:
            composed.paste(product_resized, (px, py), product_resized)

        draw = ImageDraw.Draw(composed)
        # Usar fuente Oswald Variable
        try:
            base_font_size = int(th * 0.09)
            if os.path.exists(FONT_PATH):
                font = ImageFont.truetype(FONT_PATH, base_font_size)
            else:
                print(f"Warning: Font not found at {FONT_PATH}, using default")
                font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading font: {e}")
            font = ImageFont.load_default()

        # Función para dibujar texto con sombra y simular negrita
        def draw_text_with_shadow(draw, pos, text, font, fill, shadow_color=(0,0,0), shadow_offset=4, bold_offset=3):
            x, y = pos
            # Sombra más pronunciada
            draw.text((x+shadow_offset, y+shadow_offset), text, font=font, fill=shadow_color)
            draw.text((x+shadow_offset-1, y+shadow_offset-1), text, font=font, fill=shadow_color)
            
            # Texto principal con efecto negrita más fuerte
            for dx in range(-bold_offset, bold_offset+1):
                for dy in range(-bold_offset, bold_offset+1):
                    draw.text((x+dx, y+dy), text, font=font, fill=fill)

        # Nombre del producto
        name_text = product_name.strip().upper()
        max_name_width = int(tw * 0.92)
        font_size = base_font_size
        
        while True:
            try:
                if os.path.exists(FONT_PATH):
                    font_temp = ImageFont.truetype(FONT_PATH, font_size)
                else:
                    font_temp = ImageFont.load_default()
                bbox = draw.textbbox((0, 0), name_text, font=font_temp)
                nw = bbox[2] - bbox[0]
                if nw <= max_name_width or font_size <= 24:
                    font = font_temp
                    break
                font_size -= 2
            except Exception as e:
                print(f"Error with font size {font_size}: {e}")
                font = ImageFont.load_default()
                break
                
        nh = bbox[3] - bbox[1]
        nx = (tw - nw) // 2
        ny = int(th * 0.15)  # Más abajo según solicitud
        draw_text_with_shadow(draw, (nx, ny), name_text, font, fill='white')

        # Precio
        price_text = f"${product_price.strip()}"
        price_font_size = int(th * 0.08)
        try:
            if os.path.exists(FONT_PATH):
                price_font = ImageFont.truetype(FONT_PATH, price_font_size)
            else:
                price_font = ImageFont.load_default()
        except Exception as e:
            price_font = ImageFont.load_default()
            
        bbox_price = draw.textbbox((0, 0), price_text, font=price_font)
        pw_text, ph_text = bbox_price[2] - bbox_price[0], bbox_price[3] - bbox_price[1]
        px_text = (tw - pw_text) // 2
        py_text = th - ph_text - int(th * 0.12)  # Más abajo para mejor visibilidad
        draw_text_with_shadow(draw, (px_text, py_text), price_text, price_font, fill='white')

        # Guardar archivos
        safe_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_name = safe_name.replace(' ', '_')
        
        # Crear nombres únicos con timestamp
        timestamp = str(int(time.time()))
        
        # Guardar imagen sin fondo
        productos_sin_fondo_dir = os.path.join(BASE_DIR, 'processing', 'productos_sin_fondo')
        os.makedirs(productos_sin_fondo_dir, exist_ok=True)
        sin_fondo_filename = f"{safe_name}_{timestamp}_sin_fondo.png"
        sin_fondo_path = os.path.join(productos_sin_fondo_dir, sin_fondo_filename)
        output_nobg.save(sin_fondo_path, 'PNG')
        print(f"Imagen sin fondo guardada: {sin_fondo_path}")
        
        # Guardar imagen finalizada
        productos_finalizados_dir = os.path.join(BASE_DIR, 'processing', 'productos_finalizados')
        os.makedirs(productos_finalizados_dir, exist_ok=True)
        finalizada_filename = f"{safe_name}_{timestamp}_finalizada.png"
        finalizada_path = os.path.join(productos_finalizados_dir, finalizada_filename)
        composed.save(finalizada_path, 'PNG')
        print(f"Imagen finalizada guardada: {finalizada_path}")

        # Retornar la imagen procesada
        img_io = io.BytesIO()
        composed.save(img_io, 'PNG')
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png', as_attachment=False)
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Utilidad para clasificar tipo de usuario
def clasificar_usuario(row):
    texto = (row.get('last user freeform input', '') + ' ' + row.get('contact name', '')).lower()
    if any(x in texto for x in ['emprendedor', 'emprender']):
        return 'mayorista'
    if any(x in texto for x in ['local', 'mecánico', 'mecanico', 'taller']):
        return 'minorista'
    return 'otro'

# Endpoint para analíticas rápidas del CSV
@app.route('/api/analytics', methods=['GET'])
def analytics():
    csv_path = os.path.join(BASE_DIR, 'e60ee88c-a85f-437c-8dec-be09151d41f1.csv')
    if not os.path.exists(csv_path):
        return jsonify({'error': 'No se encontró el archivo CSV'}), 404
    
    total = 0
    mayorista = 0
    minorista = 0
    otro = 0
    interacciones = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                total += 1
                tipo = clasificar_usuario(row)
                if tipo == 'mayorista':
                    mayorista += 1
                elif tipo == 'minorista':
                    minorista += 1
                else:
                    otro += 1
                
                if row.get('last user freeform input', '').strip():
                    interacciones += 1
        
        return jsonify({
            'total_contactos': total,
            'mayorista': mayorista,
            'minorista': minorista,
            'otro': otro,
            'interacciones': interacciones,
            'porcentaje_mayorista': round((mayorista/total)*100, 1) if total > 0 else 0,
            'porcentaje_minorista': round((minorista/total)*100, 1) if total > 0 else 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Configuración para producción
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    if not debug:
        # Configuración para producción
        app.logger.info(f'Starting MMR SaaS on port {port}')
    
    app.run(host='0.0.0.0', port=port, debug=debug)