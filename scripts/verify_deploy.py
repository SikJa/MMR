#!/usr/bin/env python3
"""
Script para verificar que todos los archivos necesarios para deploy estén presentes
"""
import os
import sys

def check_file_exists(filepath, description):
    """Verificar si un archivo existe"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ FALTANTE {description}: {filepath}")
        return False

def check_directory_exists(dirpath, description):
    """Verificar si un directorio existe"""
    if os.path.exists(dirpath) and os.path.isdir(dirpath):
        print(f"✅ {description}: {dirpath}")
        return True
    else:
        print(f"❌ FALTANTE {description}: {dirpath}")
        return False

def verify_requirements():
    """Verificar requirements.txt"""
    if not os.path.exists('requirements.txt'):
        return False
    
    required_packages = [
        'Flask',
        'Pillow',
        'rembg',
        'numpy',
        'gunicorn',
        'psycopg2-binary'
    ]
    
    with open('requirements.txt', 'r') as f:
        content = f.read()
    
    missing = []
    for package in required_packages:
        if package not in content:
            missing.append(package)
    
    if missing:
        print(f"❌ Paquetes faltantes en requirements.txt: {', '.join(missing)}")
        return False
    
    print("✅ requirements.txt contiene todos los paquetes necesarios")
    return True

def main():
    """Función principal de verificación"""
    print("🔍 Verificando archivos para deploy en Render...\n")
    
    all_good = True
    
    # Archivos de configuración obligatorios
    config_files = [
        ('requirements.txt', 'Dependencias Python'),
        ('render.yaml', 'Configuración de Render'),
        ('Procfile', 'Comando de inicio'),
        ('runtime.txt', 'Versión de Python'),
        ('.gitignore', 'Archivos a ignorar'),
        ('.env.example', 'Plantilla de variables de entorno')
    ]
    
    print("📋 Archivos de configuración:")
    for filepath, description in config_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    # Archivos de aplicación
    print("\n🐍 Archivos de aplicación:")
    app_files = [
        ('app/app.py', 'Aplicación principal'),
        ('app/config.py', 'Configuración'),
        ('app/database.py', 'Base de datos')
    ]
    
    for filepath, description in app_files:
        if not check_file_exists(filepath, description):
            all_good = False
    
    # Directorios necesarios
    print("\n📁 Directorios:")
    directories = [
        ('static', 'Archivos estáticos'),
        ('templates', 'Templates HTML'),
        ('processing/product_templates', 'Templates de productos'),
        ('scripts', 'Scripts de utilidad')
    ]
    
    for dirpath, description in directories:
        if not check_directory_exists(dirpath, description):
            all_good = False
    
    # Verificar requirements.txt
    print("\n📦 Dependencias:")
    if not verify_requirements():
        all_good = False
    
    # Verificar que .env no esté en git
    print("\n🔒 Seguridad:")
    if os.path.exists('.env'):
        # Verificar si .env está en git
        import subprocess
        try:
            result = subprocess.run(['git', 'ls-files', '.env'], 
                                  capture_output=True, text=True)
            if result.stdout.strip():
                print("❌ PELIGRO: .env está en el repositorio git")
                all_good = False
            else:
                print("✅ .env existe pero no está en git")
        except:
            print("⚠️  No se pudo verificar estado de git para .env")
    else:
        print("✅ .env no existe (correcto para producción)")
    
    # Resultado final
    print("\n" + "="*50)
    if all_good:
        print("🎉 ¡TODO LISTO PARA DEPLOY!")
        print("📝 Próximos pasos:")
        print("   1. git add .")
        print("   2. git commit -m 'Ready for deploy'")
        print("   3. git push origin main")
        print("   4. Configurar en render.com")
    else:
        print("❌ HAY PROBLEMAS QUE RESOLVER ANTES DEL DEPLOY")
        print("📝 Revisa los archivos marcados como faltantes")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())