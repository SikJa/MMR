#!/usr/bin/env python3
"""
Verificación final de archivos para deploy
"""
import os

def verificar_archivos():
    print("🔍 VERIFICANDO ARCHIVOS PARA RENDER DEPLOY\n")
    
    archivos_obligatorios = [
        'requirements.txt',
        'render.yaml', 
        'Procfile',
        'runtime.txt',
        '.gitignore',
        '.env.example',
        'app/app.py',
        'app/config.py',
        'app/database.py',
        'DEPLOY.md'
    ]
    
    archivos_opcionales = [
        'Dockerfile',
        'scripts/init_db.py',
        'scripts/deploy.sh',
        'scripts/verify_deploy.py'
    ]
    
    directorios_necesarios = [
        'static',
        'templates', 
        'processing/product_templates',
        'scripts'
    ]
    
    todo_ok = True
    
    print("📋 ARCHIVOS OBLIGATORIOS:")
    for archivo in archivos_obligatorios:
        if os.path.exists(archivo):
            print(f"✅ {archivo}")
        else:
            print(f"❌ FALTANTE: {archivo}")
            todo_ok = False
    
    print("\n📋 ARCHIVOS OPCIONALES:")
    for archivo in archivos_opcionales:
        if os.path.exists(archivo):
            print(f"✅ {archivo}")
        else:
            print(f"⚠️  OPCIONAL: {archivo}")
    
    print("\n📁 DIRECTORIOS:")
    for directorio in directorios_necesarios:
        if os.path.exists(directorio):
            print(f"✅ {directorio}")
        else:
            print(f"❌ FALTANTE: {directorio}")
            todo_ok = False
    
    print("\n🔒 SEGURIDAD:")
    if os.path.exists('.env'):
        print("⚠️  .env existe - ASEGURATE de que esté en .gitignore")
    else:
        print("✅ .env no existe (correcto para deploy)")
    
    if os.path.exists('.gitignore'):
        with open('.gitignore', 'r') as f:
            gitignore_content = f.read()
        if '.env' in gitignore_content:
            print("✅ .env está en .gitignore")
        else:
            print("❌ .env NO está en .gitignore")
            todo_ok = False
    
    print("\n" + "="*50)
    if todo_ok:
        print("🎉 ¡TODO LISTO PARA DEPLOY EN RENDER!")
        print("\n📝 PRÓXIMOS PASOS:")
        print("1. git add .")
        print("2. git commit -m 'Ready for Render deploy'")
        print("3. git push origin main")
        print("4. Ir a render.com y crear Web Service")
        print("5. Conectar tu repositorio GitHub")
        print("6. Render detectará render.yaml automáticamente")
    else:
        print("❌ HAY ARCHIVOS FALTANTES")
        print("📝 Revisa los archivos marcados como faltantes")
    
    return todo_ok

if __name__ == '__main__':
    verificar_archivos()