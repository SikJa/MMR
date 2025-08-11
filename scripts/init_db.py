#!/usr/bin/env python3
"""
Script para inicializar la base de datos en producción
"""
import os
import sys

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.app import app
from app.database import db

def init_database():
    """Inicializar base de datos"""
    with app.app_context():
        try:
            # Crear todas las tablas
            db.create_all()
            print("✅ Base de datos inicializada correctamente")
            
            # Verificar conexión
            result = db.engine.execute("SELECT 1")
            print("✅ Conexión a base de datos verificada")
            
        except Exception as e:
            print(f"❌ Error inicializando base de datos: {e}")
            return False
    
    return True

def create_directories():
    """Crear directorios necesarios"""
    directories = [
        'processing/uploads',
        'processing/productos_sin_fondo', 
        'processing/productos_finalizados',
        'logs'
    ]
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    for directory in directories:
        dir_path = os.path.join(base_dir, directory)
        os.makedirs(dir_path, exist_ok=True)
        print(f"✅ Directorio creado: {directory}")

if __name__ == '__main__':
    print("🚀 Inicializando MMR SaaS...")
    
    # Crear directorios
    create_directories()
    
    # Inicializar base de datos
    if init_database():
        print("🎉 Inicialización completada exitosamente")
    else:
        print("❌ Error en la inicialización")
        sys.exit(1)