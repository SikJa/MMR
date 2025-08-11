import io
import os
import time
import uuid
import numpy as np
from flask import Flask, request, send_file, jsonify, render_template, session, redirect, url_for
from rembg import remove
from PIL import Image, ImageDraw, ImageFont
import traceback
import csv
from collections import Counter, defaultdict
from PIL import ImageFilter
from super_image import EdsrModel, ImageLoader
from database import db

app = Flask(__name__, static_folder='../static', template_folder='../templates')
app.secret_key = 'mmr-dashboard-secret-key-fase2'

# Configurar para servir archivos estáticos correctamente
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Obtener la ruta base del proyecto (un nivel arriba de app/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Ruta de la plantilla base (imagen de fondo) - usar plantilla_1.png como default
TEMPLATE_PATH = os.path.join(BASE_DIR, 'processing', 'product_templates', 'plantilla_1.png')
# Ruta de la fuente Oswald Variable
FONT_PATH = os.path.join(BASE_DIR, 'fonts', 'Oswald-VariableFont_wght.ttf')

# Debug: Imprimir rutas para verificar
print(f"BASE_DIR: {BASE_DIR}")
print(f"TEMPLATE_PATH: {TEMPLATE_PATH}")
print(f"FONT_PATH: {FONT_PATH}")
print(f"Template exists: {os.path.exists(TEMPLATE_PATH)}")
print(f"Font exists: {os.path.exists(FONT_PATH)}")

@app.route('/')
def index():
    return render_template('index.html')

# ===== RUTAS PARA FASE 2 =====

@app.route('/fase2')
def fase2_inicio():
    """Ruta para iniciar Fase 2 - TEMPLATE LIMPIO SIN CONFLICTOS"""
    return render_template('fase2_clean.html')

@app.route('/fase2-old')
def fase2_inicio_old():
    """Ruta para iniciar Fase 2 - crear nueva sesión o continuar existente"""
    # Crear sesión de ejemplo para testing
    session_data = {
        'provider': 'Herman Repuestos',
        'products': [
            {'name': 'Kit Transmisión Honda', 'price': 8900},
            {'name': 'Aceite Gulf 20W-50', 'price': 2450},
            {'name': 'Filtro K&N', 'price': 1200},
            {'name': 'Bujías NGK Iridium', 'price': 850},
            {'name': 'Pastillas de Freno Brembo', 'price': 3200}
        ],
        'current_product_index': 0
    }
    
    session_id = db.create_session(session_data)
    return redirect(url_for('fase2_procesamiento', session_id=session_id))

@app.route('/fase2/<session_id>')
@app.route('/fase2/<session_id>/<int:product_index>')
def fase2_procesamiento(session_id, product_index=0):
    """Ruta principal de Fase 2 - Procesamiento Individual"""
    session_data = db.get_session(session_id)
    
    if not session_data:
        return redirect(url_for('fase2_inicio'))
    
    products = db.get_session_products(session_id)
    
    if not products or product_index >= len(products):
        product_index = 0
    
    current_product = products[product_index] if products else None
    
    return render_template('fase2_procesamiento.html', 
                         session_id=session_id,
                         product_index=product_index,
                         current_product=current_product,
                         session_data=session_data)

# ===== APIs PARA FASE 2 =====

@app.route('/api/get-templates', methods=['GET'])
def get_templates():
    """Obtener lista de templates disponibles"""
    try:
        templates_dir = os.path.join(BASE_DIR, 'processing', 'product_templates')
        templates = []
        
        # Mapeo de iconos para cada template
        template_icons = {
            'plantilla_1.png': 'fas fa-trophy',
            'plantilla_2.png': 'fas fa-bullseye', 
            'plantilla_3.png': 'fas fa-bolt',
            'plantilla_4.png': 'fas fa-star',
            'plantilla_5.png': 'fas fa-gem',
            'plantilla_6.png': 'fas fa-fire',
            'plantilla_7.png': 'fas fa-crown',
            'plantilla_8.png': 'fas fa-rocket',
            'plantilla_9.png': 'fas fa-diamond',
            'plantilla_10.png': 'fas fa-medal',
            'plantilla_11.png': 'fas fa-award'
        }
        
        # Mapeo de descripciones
        template_descriptions = {
            'plantilla_1.png': 'Clásico',
            'plantilla_2.png': 'Moderno',
            'plantilla_3.png': 'Deportivo',
            'plantilla_4.png': 'Elegante',
            'plantilla_5.png': 'Premium',
            'plantilla_6.png': 'Dinámico',
            'plantilla_7.png': 'Luxury',
            'plantilla_8.png': 'Futurista',
            'plantilla_9.png': 'Brillante',
            'plantilla_10.png': 'Ganador',
            'plantilla_11.png': 'Exclusivo'
        }
        
        if os.path.exists(templates_dir):
            for filename in sorted(os.listdir(templates_dir)):
                if filename.endswith('.png'):
                    template_num = filename.replace('plantilla_', '').replace('.png', '')
                    templates.append({
                        'id': filename.replace('.png', ''),
                        'name': f'T{template_num}',
                        'filename': filename,
                        'url': f'/static/templates/{filename}',
                        'description': template_descriptions.get(filename, 'Template'),
                        'icon': template_icons.get(filename, 'fas fa-image')
                    })
        
        return jsonify({
            'success': True,
            'templates': templates
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/process-image-fase2', methods=['POST'])
def process_image_fase2():
    """Procesar imagen para Fase 2 con tracking de sesión"""
    try:
        start_time = time.time()
        
        # Validar datos requeridos
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No se envió imagen'}), 400
            
        session_id = request.form.get('session_id')
        product_index = int(request.form.get('product_index', 0))
        
        if not session_id:
            return jsonify({'success': False, 'error': 'Session ID requerido'}), 400
        
        # Obtener datos de la sesión
        session_data = db.get_session(session_id)
        if not session_data:
            return jsonify({'success': False, 'error': 'Sesión no encontrada'}), 404
            
        products = db.get_session_products(session_id)
        if not products or product_index >= len(products):
            return jsonify({'success': False, 'error': 'Producto no encontrado'}), 404
            
        current_product = products[product_index]
        
        # Obtener datos del formulario
        image_file = request.files['image']
        product_name = current_product['product_name']
        product_price = str(current_product['product_price'])
        selected_template = request.form.get('template', 'plantilla_1.png')
        
        # Procesar imagen (usar la misma lógica que el endpoint original)
        input_image = Image.open(image_file.stream).convert('RGBA')
        output_nobg_data = remove(input_image)
        
        # Convertir resultado de rembg a PIL Image
        if isinstance(output_nobg_data, bytes):
            output_nobg = Image.open(io.BytesIO(output_nobg_data)).convert('RGBA')
        elif isinstance(output_nobg_data, Image.Image):
            output_nobg = output_nobg_data.convert('RGBA')
        else:
            import numpy as np
            if hasattr(output_nobg_data, 'shape'):
                output_nobg = Image.fromarray(np.uint8(output_nobg_data)).convert('RGBA')
            else:
                raise Exception('No se pudo convertir la imagen procesada por rembg a PIL.Image')

        # Mejorar resolución usando IA
        try:
            model = EdsrModel.from_pretrained('eugenesiow/edsr-base', scale=2)
            inputs = ImageLoader.load_image(output_nobg.convert('RGB'))
            preds = model(inputs)
            output_nobg_sr = ImageLoader.save_image(preds, 'temp_sr.png')
            sr_img = Image.open('temp_sr.png').convert('RGBA')
            alpha = output_nobg.split()[-1].resize(sr_img.size, Image.Resampling.LANCZOS)
            sr_img.putalpha(alpha)
            output_nobg = sr_img
        except Exception as e:
            print(f"Warning: Super resolution failed: {e}")
            # Continuar sin mejora de resolución
        
        # Aplicar template
        template_path = os.path.join(BASE_DIR, 'processing', 'product_templates', selected_template)
        if not os.path.exists(template_path):
            template_path = TEMPLATE_PATH
            
        template = Image.open(template_path).convert('RGBA')
        tw, th = template.size

        # Redimensionar producto con mejor calidad
        max_width = int(tw * 0.55)  # Tamaño más controlado
        max_height = int(th * 0.45)  # Altura controlada
        pw, ph = output_nobg.size
        scale = min(max_width / pw, max_height / ph)
        new_size = (int(pw * scale), int(ph * scale))
        product_resized = output_nobg.resize(new_size, Image.Resampling.LANCZOS)
        
        # Posicionamiento centrado y MUCHO MÁS ARRIBA (entre los MMR)
        px = (tw - new_size[0]) // 2
        py = int(th * 0.15)  # CENTRADO ENTRE MMR (era 0.20, ahora 0.15)

        # ALGORITMO MEJORADO PARA ELIMINAR MANCHAS BLANCAS
        composed = template.copy()
        
        # Convertir a RGBA si no lo está
        if output_nobg.mode != 'RGBA':
            output_nobg = output_nobg.convert('RGBA')
        
        # Crear una versión limpia del producto redimensionado
        product_array = np.array(product_resized)
        
        # ALGORITMO MEJORADO PARA ELIMINAR PUNTOS BLANCOS COMPLETAMENTE
        if len(product_array.shape) == 3 and product_array.shape[2] == 4:  # RGBA
            # Separar canales
            r, g, b, a = product_array[:,:,0], product_array[:,:,1], product_array[:,:,2], product_array[:,:,3]
            
            # 1. Eliminar píxeles muy transparentes
            mask_very_low_alpha = a < 30
            a[mask_very_low_alpha] = 0
            r[mask_very_low_alpha] = 0
            g[mask_very_low_alpha] = 0
            b[mask_very_low_alpha] = 0
            
            # 2. Hacer completamente opacos los píxeles casi opacos
            mask_high_alpha = a > 230
            a[mask_high_alpha] = 255
            
            # 3. ELIMINAR PUNTOS BLANCOS/GRISES PROBLEMÁTICOS (más agresivo)
            # Detectar píxeles blancos o grises claros con cualquier transparencia
            white_gray_mask = ((r > 220) & (g > 220) & (b > 220)) & (a < 255)
            a[white_gray_mask] = 0
            r[white_gray_mask] = 0
            g[white_gray_mask] = 0
            b[white_gray_mask] = 0
            
            # 4. Eliminar píxeles con colores muy similares (anti-aliasing problemático)
            similar_color_mask = (np.abs(r.astype(int) - g.astype(int)) < 10) & \
                                (np.abs(g.astype(int) - b.astype(int)) < 10) & \
                                (r > 200) & (a < 200)
            a[similar_color_mask] = 0
            r[similar_color_mask] = 0
            g[similar_color_mask] = 0
            b[similar_color_mask] = 0
            
            # 5. Limpiar píxeles aislados (ruido)
            from scipy import ndimage
            try:
                # Crear máscara de píxeles válidos
                valid_mask = a > 50
                # Aplicar filtro morfológico para eliminar píxeles aislados
                cleaned_mask = ndimage.binary_opening(valid_mask, structure=np.ones((3,3)))
                # Aplicar la máscara limpia
                invalid_pixels = ~cleaned_mask & (a > 0)
                a[invalid_pixels] = 0
                r[invalid_pixels] = 0
                g[invalid_pixels] = 0
                b[invalid_pixels] = 0
            except ImportError:
                # Si scipy no está disponible, usar método alternativo
                pass
            
            # Reconstruir imagen
            product_array[:,:,0] = r
            product_array[:,:,1] = g
            product_array[:,:,2] = b
            product_array[:,:,3] = a
        
        # Convertir de vuelta a PIL
        product_cleaned = Image.fromarray(product_array.astype(np.uint8), 'RGBA')
        
        # Pegar con método de composición alpha
        composed.paste(product_cleaned, (px, py), product_cleaned)

        # Agregar texto
        draw = ImageDraw.Draw(composed)
        
        # Configurar fuente
        try:
            base_font_size = int(th * 0.09)
            if os.path.exists(FONT_PATH):
                font = ImageFont.truetype(FONT_PATH, base_font_size)
            else:
                font = ImageFont.load_default()
        except Exception as e:
            font = ImageFont.load_default()

        # Función para texto con sombra
        def draw_text_with_shadow(draw, pos, text, font, fill, shadow_color=(0,0,0), shadow_offset=3, bold_offset=2):
            x, y = pos
            draw.text((x+shadow_offset, y+shadow_offset), text, font=font, fill=shadow_color)
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
                font = ImageFont.load_default()
                break
                
        nh = bbox[3] - bbox[1]
        nx = (tw - nw) // 2
        ny = int(th * 0.13)
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
        py_text = th - ph_text - int(th * 0.16)
        draw_text_with_shadow(draw, (px_text, py_text), price_text, price_font, fill='white')

        # Guardar archivos
        safe_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_name = safe_name.replace(' ', '_')
        
        # Crear nombres únicos con timestamp
        timestamp = int(time.time())
        unique_name = f"{safe_name}_{timestamp}"
        
        # Guardar imagen sin fondo
        productos_sin_fondo_dir = os.path.join(BASE_DIR, 'processing', 'productos_sin_fondo')
        os.makedirs(productos_sin_fondo_dir, exist_ok=True)
        sin_fondo_path = os.path.join(productos_sin_fondo_dir, f"{unique_name}_sin_fondo.png")
        output_nobg.save(sin_fondo_path, 'PNG')
        
        # Guardar imagen finalizada
        productos_finalizados_dir = os.path.join(BASE_DIR, 'processing', 'productos_finalizados')
        os.makedirs(productos_finalizados_dir, exist_ok=True)
        finalizada_path = os.path.join(productos_finalizados_dir, f"{unique_name}_finalizada.png")
        composed.save(finalizada_path, 'PNG')
        
        # Calcular tiempo de procesamiento y calidad
        processing_time = time.time() - start_time
        quality_score = min(95, max(70, int(85 + (processing_time * 2))))  # Simular calidad basada en tiempo
        
        # Guardar en base de datos
        image_data = {
            'product_name': product_name,
            'product_price': float(product_price),
            'original_image_path': '',  # No guardamos la original en este flujo
            'processed_image_path': finalizada_path,
            'template_used': selected_template,
            'processing_time': processing_time,
            'quality_score': quality_score
        }
        
        db.save_processed_image(session_id, image_data)
        db.mark_product_processed(session_id, product_index)
        
        # Crear URL para la imagen procesada
        processed_url = f"/processed-image/{session_id}/{unique_name}_finalizada.png"
        
        return jsonify({
            'success': True,
            'processed_image_url': processed_url,
            'processing_time': round(processing_time, 2),
            'quality_score': quality_score,
            'product_name': product_name,
            'product_price': product_price,
            'template_used': selected_template
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/processed-image/<session_id>/<filename>')
def serve_processed_image(session_id, filename):
    """Servir imágenes procesadas"""
    try:
        image_path = os.path.join(BASE_DIR, 'processing', 'productos_finalizados', filename)
        if os.path.exists(image_path):
            return send_file(image_path, mimetype='image/png')
        else:
            return "Image not found", 404
    except Exception as e:
        return str(e), 500

@app.route('/api/session-stats/<session_id>', methods=['GET'])
def get_session_stats(session_id):
    """Obtener estadísticas de una sesión"""
    try:
        stats = db.get_session_stats(session_id)
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/processed-images/<session_id>', methods=['GET'])
def get_processed_images(session_id):
    """Obtener imágenes procesadas de una sesión"""
    try:
        images = db.get_processed_images(session_id)
        
        # Convertir rutas a URLs
        for image in images:
            filename = os.path.basename(image['processed_image_path'])
            image['url'] = f"/processed-image/{session_id}/{filename}"
            
        return jsonify({
            'success': True,
            'images': images
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/save-session', methods=['POST'])
def save_session_api():
    """Guardar datos de sesión"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        session_data = data.get('session_data', {})
        
        if not session_id:
            return jsonify({'success': False, 'error': 'Session ID requerido'}), 400
            
        db.update_session(session_id, session_data)
        
        return jsonify({
            'success': True,
            'message': 'Sesión guardada correctamente'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/next-product/<session_id>/<int:current_index>', methods=['GET'])
def get_next_product(session_id, current_index):
    """Obtener el siguiente producto de la sesión"""
    try:
        products = db.get_session_products(session_id)
        next_index = current_index + 1
        
        if next_index >= len(products):
            return jsonify({
                'success': False,
                'message': 'No hay más productos',
                'completed': True
            })
            
        next_product = products[next_index]
        
        return jsonify({
            'success': True,
            'next_product': next_product,
            'next_index': next_index,
            'completed': False
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/static/templates/<filename>')
def serve_template(filename):
    """Servir imágenes de templates para el selector"""
    try:
        template_path = os.path.join(BASE_DIR, 'processing', 'product_templates', filename)
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
def serve_template_preview(filename):
    """Servir preview de templates para la Fase 2"""
    try:
        template_path = os.path.join(BASE_DIR, 'processing', 'product_templates', filename)
        if os.path.exists(template_path):
            return send_file(template_path, mimetype='image/png')
        else:
            return "Template not found", 404
    except Exception as e:
        print(f"Error serving template preview {filename}: {e}")
        return "Template not found", 404

# Ruta de gallery-fix.js removida para evitar conflictos con Fase 2

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
        # rembg puede devolver bytes, PIL.Image o ndarray. Convertimos a PIL.Image siempre.
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

        # Mejorar resolución de la imagen sin fondo usando IA (super-image)
        model = EdsrModel.from_pretrained('eugenesiow/edsr-base', scale=2)
        inputs = ImageLoader.load_image(output_nobg.convert('RGB'))  # Quitar alfa para el modelo
        preds = model(inputs)
        output_nobg_sr = ImageLoader.save_image(preds, 'temp_sr.png')  # Guarda la imagen mejorada
        # Recuperar el canal alfa original y combinarlo con la imagen mejorada
        sr_img = Image.open('temp_sr.png').convert('RGBA')
        alpha = output_nobg.split()[-1].resize(sr_img.size, Image.Resampling.LANCZOS)
        sr_img.putalpha(alpha)
        output_nobg = sr_img

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
        py = int(th * 0.36)  # Más abajo que antes (antes era 0.28)

        composed = template.copy()
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
        def draw_text_with_shadow(draw, pos, text, font, fill, shadow_color=(0,0,0), shadow_offset=3, bold_offset=2):
            x, y = pos
            # Sombra
            draw.text((x+shadow_offset, y+shadow_offset), text, font=font, fill=shadow_color)
            # Simular negrita dibujando varias veces
            for dx in range(-bold_offset, bold_offset+1):
                for dy in range(-bold_offset, bold_offset+1):
                    draw.text((x+dx, y+dy), text, font=font, fill=fill)

        # Nombre del producto (arriba, blanco, limitar tamaño si es muy largo)
        name_text = product_name.strip().upper()
        # Limitar tamaño de fuente si el texto es muy largo
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
        ny = int(th * 0.13)  # Más abajo que antes
        draw_text_with_shadow(draw, (nx, ny), name_text, font, fill='white')

        # Precio (abajo, blanco, más arriba)
        price_text = f"${product_price.strip()}"
        price_font_size = int(th * 0.08)
        try:
            if os.path.exists(FONT_PATH):
                price_font = ImageFont.truetype(FONT_PATH, price_font_size)
            else:
                price_font = ImageFont.load_default()
        except Exception as e:
            print(f"Error loading price font: {e}")
            price_font = ImageFont.load_default()
        bbox_price = draw.textbbox((0, 0), price_text, font=price_font)
        pw_text, ph_text = bbox_price[2] - bbox_price[0], bbox_price[3] - bbox_price[1]
        px_text = (tw - pw_text) // 2
        py_text = th - ph_text - int(th * 0.16)  # Más arriba del borde
        draw_text_with_shadow(draw, (px_text, py_text), price_text, price_font, fill='white')

        # Guardar imagen sin fondo en la carpeta correspondiente
        productos_sin_fondo_dir = os.path.join(BASE_DIR, 'processing', 'productos_sin_fondo')
        os.makedirs(productos_sin_fondo_dir, exist_ok=True)
        
        # Nombre de archivo seguro
        safe_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_name = safe_name.replace(' ', '_')
        
        # Guardar imagen sin fondo
        sin_fondo_filename = f"{safe_name}_sin_fondo.png"
        sin_fondo_path = os.path.join(productos_sin_fondo_dir, sin_fondo_filename)
        output_nobg.save(sin_fondo_path, 'PNG')
        print(f"Imagen sin fondo guardada: {sin_fondo_path}")
        
        # Guardar imagen finalizada en la carpeta correspondiente
        productos_finalizados_dir = os.path.join(BASE_DIR, 'processing', 'productos_finalizados')
        os.makedirs(productos_finalizados_dir, exist_ok=True)
        
        # Guardar imagen finalizada
        finalizada_filename = f"{safe_name}_finalizada.png"
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
    origenes = Counter()
    
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            tipo = clasificar_usuario(row)
            if tipo == 'mayorista':
                mayorista += 1
            elif tipo == 'minorista':
                minorista += 1
            else:
                otro += 1
            # Interacción con el bot
            if row.get('last user freeform input', '').strip():
                interacciones += 1
            # Origen del contacto
            origen = row.get('source') or row.get('original source') or 'Desconocido'
            origenes[origen.strip() or 'Desconocido'] += 1
    
    return jsonify({
        'total_contactos': total,
        'mayoristas': mayorista,
        'minoristas': minorista,
        'otros': otro,
        'interacciones_activas': interacciones,
        'origenes': origenes.most_common()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)