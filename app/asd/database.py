import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class SessionDatabase:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Usar la misma estructura que el proyecto
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_path = os.path.join(base_dir, 'data', 'sessions.db')
            
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Inicializar la base de datos con las tablas necesarias"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    session_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'active'
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS processed_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    product_price REAL NOT NULL,
                    original_image_path TEXT,
                    processed_image_path TEXT NOT NULL,
                    template_used TEXT NOT NULL,
                    processing_time REAL,
                    quality_score INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions (id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS session_products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    product_price REAL NOT NULL,
                    provider TEXT,
                    processed BOOLEAN DEFAULT FALSE,
                    product_index INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions (id)
                )
            ''')
            
            conn.commit()
    
    def create_session(self, session_data: Dict) -> str:
        """Crear una nueva sesión"""
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO sessions (id, session_data)
                VALUES (?, ?)
            ''', (session_id, json.dumps(session_data)))
            
            # Agregar productos a la sesión si existen
            if 'products' in session_data:
                for i, product in enumerate(session_data['products']):
                    conn.execute('''
                        INSERT INTO session_products 
                        (session_id, product_name, product_price, provider, product_index)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        session_id,
                        product.get('name', ''),
                        product.get('price', 0),
                        session_data.get('provider', ''),
                        i
                    ))
            
            conn.commit()
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Obtener datos de una sesión"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT * FROM sessions WHERE id = ?
            ''', (session_id,))
            
            row = cursor.fetchone()
            if row:
                session_data = json.loads(row['session_data'])
                session_data['id'] = row['id']
                session_data['created_at'] = row['created_at']
                session_data['updated_at'] = row['updated_at']
                session_data['status'] = row['status']
                return session_data
        
        return None
    
    def update_session(self, session_id: str, session_data: Dict):
        """Actualizar datos de una sesión"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE sessions 
                SET session_data = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (json.dumps(session_data), session_id))
            conn.commit()
    
    def get_session_products(self, session_id: str) -> List[Dict]:
        """Obtener productos de una sesión"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT * FROM session_products 
                WHERE session_id = ? 
                ORDER BY product_index
            ''', (session_id,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def mark_product_processed(self, session_id: str, product_index: int):
        """Marcar un producto como procesado"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE session_products 
                SET processed = TRUE 
                WHERE session_id = ? AND product_index = ?
            ''', (session_id, product_index))
            conn.commit()
    
    def save_processed_image(self, session_id: str, image_data: Dict):
        """Guardar información de imagen procesada"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO processed_images 
                (session_id, product_name, product_price, original_image_path, 
                 processed_image_path, template_used, processing_time, quality_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                session_id,
                image_data.get('product_name', ''),
                image_data.get('product_price', 0),
                image_data.get('original_image_path', ''),
                image_data.get('processed_image_path', ''),
                image_data.get('template_used', ''),
                image_data.get('processing_time', 0),
                image_data.get('quality_score', 0)
            ))
            conn.commit()
    
    def get_processed_images(self, session_id: str) -> List[Dict]:
        """Obtener imágenes procesadas de una sesión"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT * FROM processed_images 
                WHERE session_id = ? 
                ORDER BY created_at DESC
            ''', (session_id,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def get_session_stats(self, session_id: str) -> Dict:
        """Obtener estadísticas de una sesión"""
        with sqlite3.connect(self.db_path) as conn:
            # Contar productos procesados
            cursor = conn.execute('''
                SELECT COUNT(*) as processed_count 
                FROM session_products 
                WHERE session_id = ? AND processed = TRUE
            ''', (session_id,))
            processed_count = cursor.fetchone()[0]
            
            # Contar productos totales
            cursor = conn.execute('''
                SELECT COUNT(*) as total_count 
                FROM session_products 
                WHERE session_id = ?
            ''', (session_id,))
            total_count = cursor.fetchone()[0]
            
            # Calcular total de precios procesados
            cursor = conn.execute('''
                SELECT SUM(product_price) as total_value 
                FROM session_products 
                WHERE session_id = ? AND processed = TRUE
            ''', (session_id,))
            total_value = cursor.fetchone()[0] or 0
            
            return {
                'processed_count': processed_count,
                'pending_count': total_count - processed_count,
                'total_count': total_count,
                'total_value': total_value,
                'completion_percentage': (processed_count / total_count * 100) if total_count > 0 else 0
            }

# Instancia global de la base de datos
db = SessionDatabase()